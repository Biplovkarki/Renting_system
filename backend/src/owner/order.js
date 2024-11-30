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
        AND o.paid_status = 'paid'`;
  
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