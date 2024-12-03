import express from 'express';
import { db } from '../db.js';
import { verifyJwtAdmin } from './jwtAdmin.js';

const ManageUserOrder = express.Router();

ManageUserOrder.get('/:orderId', verifyJwtAdmin, async (req, res) => {
  const { orderId } = req.params;

  console.log('Order ID:', orderId); // Log the orderId from the request

  try {
    const query = `
      SELECT 
          o.order_id,
          o.User_id,
          o.licenseImage,
          u.username,
          u.user_email,
          u.user_phone,
          o.terms
      FROM orders o
      LEFT JOIN users u ON u.User_id = o.User_id
      WHERE o.order_id = ?;
    `;

    const [rows] = await db.promise().query(query, [orderId]);

    //console.log('Database Results:', rows); // Log the result from the database

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Order not found or vehicle not approved.' });
    }

    res.json(rows[0]); // Send the first row with order and user details
  } catch (error) {
    console.error('Error fetching order and user details:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export { ManageUserOrder };
