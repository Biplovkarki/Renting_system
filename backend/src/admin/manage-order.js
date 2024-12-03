import express from 'express';
import { db } from '../db.js';
import { verifyJwtAdmin } from './jwtAdmin.js';

const ManageOrderRouter = express.Router();

// Route to fetch all orders (you can customize based on the filters you want)
ManageOrderRouter.get('/', verifyJwtAdmin, async (req, res) => {
  try {
    // Query to fetch order details along with user and vehicle details
    const [orders] = await db.promise().execute(
      `SELECT 
    o.order_id, 
    o.User_id, 
    o.vehicle_id, 
    o.payment_method, 
    o.paid_status, 
    o.delivered_status, 
    o.status, 
    o.grand_total, 
    o.rent_start_date, 
    o.rent_end_date, 
    o.rental_days, 
    o.terms, 
    o.status, 
    o.transaction_uuid, 
    o.licenseImage, 
    o.created_at, 
    u.username, 
    v.model,
    v.vehicle_name
FROM 
    orders o
JOIN 
    users u ON o.User_id = u.User_id
JOIN 
    vehicle v ON o.vehicle_id = v.vehicle_id;
`
    );

    // Check if orders exist
    if (orders.length > 0) {
      return res.status(200).json({
        success: true,
        data: orders,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No orders found.',
      });
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});

//fetch by ordreid
ManageOrderRouter.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;

  console.log('Order ID:', orderId); // Log the orderId from the request

  try {
    const query = `
      SELECT 
          o.order_id,
          o.User_id,
          o.vehicle_id,
          o.payment_method,
          o.paid_status,
          o.delivered_status,
          o.status AS order_status,
          o.grand_total,
          o.rent_start_date AS order_rent_start_date,
          o.rent_end_date AS order_rent_end_date,
          o.rental_days,
          o.transaction_uuid,
          o.licenseImage,
          o.created_at AS order_created_at,
          
          v.vehicle_name,
          v.model,
          v.cc,
          v.color,
          v.transmission,
          v.fuel_type,
          v.image_right,
          v.image_left,
          v.image_back,
          v.image_front,
          c.category_name,
          vs.final_price,
          vd.registration_number,
          CASE 
              WHEN d.is_enabled = 1 THEN vs.final_price * (1 - d.discount_percentage / 100)
              ELSE vs.final_price 
          END AS discounted_price,
          d.discount_percentage,  -- Fetch discount percentage if enabled
          vs.availability,
          vs.rent_start_date AS vehicle_rent_start_date,
          vs.rent_end_date AS vehicle_rent_end_date,
          vs.terms AS vehicle_terms
      FROM orders o
      LEFT JOIN vehicle v ON o.vehicle_id = v.vehicle_id
      LEFT JOIN vehicle_status vs ON v.vehicle_id = vs.vehicle_id
      LEFT JOIN vehicle_document vd ON v.vehicle_id = vd.vehicle_id
      LEFT JOIN categories c ON v.category_id = c.category_id
      LEFT JOIN discounts d ON c.category_id = d.category_id
      WHERE o.order_id = ?;
    `;
    
    const [rows] = await db.promise().query(query, [orderId]);

    //console.log('Database Results:', rows); // Log the result from the database

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Order not found or vehicle not approved.' });
    }

    res.json(rows[0]); // Send the first row with order and vehicle details
  } catch (error) {
    console.error('Error fetching order and vehicle details:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});



ManageOrderRouter.get('/:category_id',verifyJwtAdmin, async (req, res) => {
  const { category_id } = req.params;
  try {
      // Modify the query to fetch discounts based on category_id
      const [discounts] = await db.promise().query('SELECT * FROM discounts WHERE category_id = ?', [category_id]);

      if (discounts.length === 0) {
          return res.status(404).json({ message: 'No discounts found for this category.' });
      }
      res.json(discounts[0]); // Assuming you want to return the first discount object
  } catch (error) {
      console.error('Error fetching discounts:', error.message);
      res.status(500).json({ message: 'Internal server error.' });
  }
});

// Update order details
ManageOrderRouter.put('/:orderId', verifyJwtAdmin, async (req, res) => {
  const { orderId } = req.params;
  const {
    rent_start_date,
    rent_end_date,
    status,
    paid_status,
    delivered_status,
    grand_total,
    rental_days,
  } = req.body;

  // Build dynamic query for updating only the provided fields
  const updates = [];
  const values = [];

  if (rent_start_date) {
    updates.push('rent_start_date = ?');
    values.push(rent_start_date);
  }
  if (rent_end_date) {
    updates.push('rent_end_date = ?');
    values.push(rent_end_date);
  }
  if (status) {
    updates.push('status = ?');
    values.push(status);
  }
  if (paid_status !== undefined) {
    updates.push('paid_status = ?');
    values.push(paid_status);
  }
  if (delivered_status !== undefined) {
    updates.push('delivered_status = ?');
    values.push(delivered_status);
  }
  if (grand_total) {
    updates.push('grand_total = ?');
    values.push(grand_total);
  }
  if (rental_days) {
    updates.push('rental_days = ?');
    values.push(rental_days);
  }

  // If no valid fields are provided
  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields provided for update.',
    });
  }

  values.push(orderId); // Add orderId as the last parameter for the WHERE clause

  try {
    // Construct the query dynamically
    const query = `
      UPDATE orders 
      SET ${updates.join(', ')} 
      WHERE order_id = ?;
    `;

    const [result] = await db.promise().query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or no changes made.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully.',
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});

export {ManageOrderRouter
  
}
