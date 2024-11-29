import express from 'express';
import axios from 'axios';
import moment from 'moment';
import { db } from '../db.js'; // Database connection
import { verifyUserJwt } from '../user/jwtUser.js'; // JWT middleware
import dotenv from 'dotenv';

dotenv.config();

const khaliRoutes = express.Router();

// Initialize Payment
khaliRoutes.post('/initialize-khali/:order_id', verifyUserJwt, async (req, res) => {
  try {
    const { order_id } = req.params;

    // Retrieve order details
    const [order] = await db.promise().query(
      `SELECT 
          orders.*, 
          vehicle.vehicle_name, 
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
    const grand_total = order[0].grand_total;
    if (!order || order.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (isNaN(grand_total) || grand_total <= 0) {
      return res.status(400).json({ message: 'Invalid grand total' });
    }
    
    // Convert grand_total to paisa (integer)
    const amountInPaisa = Math.round(grand_total * 100); 
    // Khalti Payment Initialization
    const paymentRequestBody = {
      return_url: `${process.env.FRONTEND_URL}/successpage`, // URL for success redirection
      website_url: process.env.FRONTEND_URL, // Your website URL
      amount: amountInPaisa, // Amount in paisa
      purchase_order_id: order_id, // Order ID
      purchase_order_name: order[0].vehicle_name, // Order name
      customer_info: {
        name: order[0].username,
        email: order[0].user_email,
        phone: order[0].user_phone,
      },
    };

    const paymentResponse = await axios.post(
      `${process.env.KHALTI_GATEWAY_URL}/epayment/initiate/`,
      paymentRequestBody,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update order status
    await db.promise().query(
      `UPDATE orders 
       SET transaction_uuid = ?, 
           paid_status = ?, 
           status = ?, 
           payment_method = ?, 
           updated_at = ? 
       WHERE order_id = ?`,
      [
        paymentResponse.data.pidx, // Unique transaction ID
        'payment_pending',
        'payment_pending',
        'khalti',
        moment().format('YYYY-MM-DD HH:mm:ss'),
        order_id,
      ]
    );

    res.json({
      success: true,
      payment_url: paymentResponse.data.payment_url, // Khalti's payment URL
      order_id,
    });
  } catch (error) {
    console.error('Error in /initialize-khali route:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});
khaliRoutes.post('/complete-khali-payment', async (req, res) => {
  console.log('Received request body:', req.body);
  const { pidx, order_id } = req.body;

  if (!pidx || !order_id) {
    console.error('Missing pidx or order_id');
    return res.status(400).json({ 
      success: false, 
      message: 'Payment ID (pidx) and order ID are required',
      receivedData: req.body
    });
  }

  try {
    const verifyResponse = await axios.post(
      `${process.env.KHALTI_GATEWAY_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Verify response from Khalti:', verifyResponse.data);

    const paymentDetails = verifyResponse.data;

    // Directly check payment status
    console.log('Payment Status:', paymentDetails.status);

    if (paymentDetails.status === 'Completed') {
      // Handle successful payment (same as before)
      const [updateResult] = await db.promise().query(
        `UPDATE orders 
         SET 
           transaction_uuid = ?, 
           paid_status = ?, 
           status = ?, 
           payment_method = ?, 
           updated_at = ? 
         WHERE order_id = ?`,
        [
          paymentDetails.transaction_id,
          'paid',
          'completed', 
          'khalti', 
          moment().format('YYYY-MM-DD HH:mm:ss'),
          order_id,
        ]
      );
      console.log('Order status updated:', updateResult);

      // Fetch Vehicle ID
      const [vehicleResult] = await db.promise().query(
        `SELECT vehicle_id FROM orders WHERE order_id = ?`,
        [order_id]
      );
      const vehicleId = vehicleResult[0].vehicle_id;
      console.log('Fetched Vehicle ID:', vehicleId);

      // Update availability in vehicle_status table to 1
      const [vehicleStatusUpdateResult] = await db.promise().query(
        `UPDATE vehicle_status 
         SET availability = 1
         WHERE vehicle_id = ?`,
        [ vehicleId]
      );
      console.log('Vehicle availability updated:', vehicleStatusUpdateResult);

      res.json({ 
        success: true, 
        message: 'Payment verified successfully', 
        vehicleId, 
      });
    } else if (paymentDetails.status === 'Cancelled' || paymentDetails.status === 'Failed') {
      // Handle cancelled or failed payment
      console.log('Payment was cancelled or failed');
      
      // Remove transaction_uuid by setting it to null
      await db.promise().query(
        `UPDATE orders 
         SET 
           transaction_uuid = NULL, 
           paid_status = ?, 
           status = ?, 
           updated_at = ? 
         WHERE order_id = ?`,
        ['payment_failed', 'cancelled', moment().format('YYYY-MM-DD HH:mm:ss'), order_id]
      );

      res.status(400).json({ 
        success: false, 
        message: 'Payment was cancelled or failed', 
        paymentDetails 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment not completed', 
        paymentDetails 
      });
    }
  } catch (error) {
    console.error('Error in /complete-khali-payment route:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default khaliRoutes;