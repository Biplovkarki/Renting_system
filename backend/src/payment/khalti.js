import express from 'express';
import { db } from '../db.js';  // Assuming db.js is the module where your MySQL connection is set up
import { verifyUserJwt } from '../user/jwtUser.js'; // Assuming this is your JWT user verification middleware
import dotenv from 'dotenv';
import axios from 'axios';
import moment from 'moment'; // For date manipulation

dotenv.config();

const khaliRoutes = express.Router();

// Khalti Payment Initialization
async function initializeKhaltiPayment({
  amount,
  purchase_order_id,
  purchase_order_name,
  return_url,
}) {
  try {
    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };

    const body = {
      amount,  // amount in paisa
      purchase_order_id,
      purchase_order_name,
      return_url,
      website_url: process.env.WEBSITE_URL,
    };

    console.log('Initializing Khalti payment with amount:', amount);

    const response = await axios.post(
      `${process.env.KHALTI_GATEWAY_URL}/epayment/initiate/`,
      body,
      { headers }
    );

    return response.data; // This will return the payment URL to redirect the user
  } catch (error) {
    console.error('Error initializing Khalti payment:', error);
    throw error;
  }
}

// Khalti Payment Verification
async function verifyKhaltiPayment(pidx) {
  try {
    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };

    const body = { pidx };
    const response = await axios.post(
      `${process.env.KHALTI_GATEWAY_URL}/epayment/lookup/`,
      body,
      { headers }
    );

    return response.data; // This will contain the payment status and transaction details
  } catch (error) {
    console.error('Error verifying Khalti payment:', error);
    throw error;
  }
}

// Route to initialize the payment (user sends payment request)
khaliRoutes.post('/initialize-khali/:order_id', verifyUserJwt, async (req, res) => {
    try {
      const { order_id } = req.params;
  
      //Retrieve order details (using try...catch for error handling)
      const [order] = await db.promise().query(
        `SELECT 
          orders.*, 
          vehicle.vehicle_name, 
          vehicle.model, 
          users.username, 
          users.user_email, 
          users.user_phone 
        FROM 
          orders 
        JOIN vehicle ON orders.vehicle_id = vehicle.vehicle_id 
        JOIN users ON orders.user_id = users.user_id 
        WHERE 
          orders.order_id = ?`,
        [order_id]
      );
  
      if (!order || order.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      const grand_total = parseFloat(order[0].grand_total);
  
      if (isNaN(grand_total) || grand_total <= 0) {
        return res.status(400).json({ message: 'Invalid grand total' });
      }
  
      const paymentResponse = await initializeKhaltiPayment({
        amount: grand_total * 100,
        purchase_order_id: order_id,
        purchase_order_name: order[0].vehicle_name,
        return_url: `${process.env.BACKEND_URL}/khalti/complete-khalti-payment`,
      });
  
      // Update order status - corrected
      await db.promise().query(
        'UPDATE orders SET transaction_uuid = ?, paid_status = ?, status = ?, payment_method = ?, updated_at = ? WHERE order_id = ?',
        [
          paymentResponse.transaction_id,
          'payment_pending', // Corrected status
          'payment_pending', //Corrected status
          'khalti',
          moment().format('YYYY-MM-DD HH:mm:ss'),
          order_id,
        ]
      );
  
      res.json({ success: true, payment_url: paymentResponse.payment_url, order_id });
    } catch (error) {
      console.error('Error in /initialize-khali route:', error);
      res.status(500).json({ success: false, error: 'Server error' }); // Generic error message for security
    }
  });
  
  khaliRoutes.get('/complete-khalti-payment', async (req, res) => {
    const { transaction_id } = req.query; // Use transaction_id only
  
    try {
      const paymentInfo = await verifyKhaltiPayment(transaction_id);
  
  
      if (paymentInfo.status !== 'Completed') {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
  
      const [order] = await db.promise().query('SELECT * FROM orders WHERE order_id = ?', [req.query.purchase_order_id]);
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      await db.promise().query(
        'UPDATE orders SET status = ?, transaction_uuid = ?, paid_status = ?, delivered_status = ?, payment_method = ?, updated_at = ? WHERE order_id = ?',
        [
          'completed',
          transaction_id,
          'paid',
          'not_delivered',
          'Khalti',
          moment().format('YYYY-MM-DD HH:mm:ss'),
          req.query.purchase_order_id,
        ]
      );
  
      res.json({ success: true, message: 'Payment successful, order updated' });
    } catch (error) {
      console.error('Error in /complete-khalti-payment callback:', error);
      res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
  });
export default khaliRoutes;
