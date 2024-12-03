import express from "express";
import { db } from "../db.js";
import { verifyJwt } from "./jwtOwner.js";
import dotenv from "dotenv"

dotenv.config();
export const detailsForOwner = express.Router()
detailsForOwner.get('/order-details/:vehicleId', verifyJwt, (req, res) => {
    const vehicleId = req.params.vehicleId;
    const ownerId = req.owner.id; // Assuming `id` is available from the decoded JWT
  
    // SQL query to fetch order details for the specific vehicle and owner
    const query = `
      SELECT 
        v.vehicle_name, 
        v.model, 
        o.rental_days, 
        o.rent_start_date, 
        o.rent_end_date, 
        o.vehicle_id, 
        o.order_id, 
        o.grand_total, 
        u.username,
        o.user_id,  
        v.owner_id  
      FROM orders o
      INNER JOIN vehicle v ON o.vehicle_id = v.vehicle_id
      INNER JOIN users u ON o.user_id = u.user_id
      WHERE o.vehicle_id = ? 
        AND v.owner_id = ? 
        AND o.status = 'completed' 
        AND o.paid_status = 'paid'
        ORDER BY o.created_at DESC `;
  
    // Execute the query to get the order details
    db.execute(query, [vehicleId, ownerId], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'Order not found or conditions not met' });
      }
  
      res.json(results); // Send the first result (there should only be one)
    });
  });

  detailsForOwner.get('/earnings/:owner_id', async (req, res) => {
    const ownerId = req.params.owner_id;

    try {
        const query = `
            SELECT 
                v.vehicle_name,
                v.image_front AS image,
                t.payment_status,
                SUM(o.rental_days) AS rental_days,
                o.rent_start_date,
                o.rent_end_date,
                SUM(t.owner_earning) AS owner_earnings
            FROM orders o
            INNER JOIN vehicle v ON o.vehicle_id = v.vehicle_id
            INNER JOIN transactions t ON o.order_id = t.order_id
            WHERE v.owner_id = ? 
              AND o.paid_status = 'paid'
              AND o.status = 'completed'
            GROUP BY v.vehicle_id
            ORDER BY o.rent_start_date DESC
        `;

        const [results] = await db.promise().execute(query, [ownerId]);

        // Explicit rounding after fetching data from the database
        const roundedResults = results.map(row => ({
            ...row,
            rental_days: Math.round(row.rental_days), // Round rental days
            owner_earnings: parseFloat(row.owner_earnings).toFixed(2), // Round to 2 decimal places for earnings
        }));

        res.status(200).json({
            success: true,
            data: roundedResults,
        });
    } catch (error) {
        console.error('Error fetching owner earnings:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
});

