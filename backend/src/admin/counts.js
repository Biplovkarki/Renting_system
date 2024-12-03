import express from 'express';
import { db } from '../db.js';
import { verifyJwtAdmin } from './jwtAdmin.js';

const counts = express.Router();

// Endpoint to count total vehicles
counts.get('/vehicles', verifyJwtAdmin, async (req, res) => {
    try {
        const countQuery = 'SELECT COUNT(vehicle_id) AS totalVehicles FROM vehicle';  // Counting based on vehicle_id
        const result = await db.promise().query(countQuery);

        console.log('Result from database:', result);  // Log the result here for debugging

        if (result && result[0] && result[0].length > 0) {
            res.status(200).json({
                success: true,
                totalVehicles: result[0][0].totalVehicles  // Corrected access
            });
        } else {
            res.status(200).json({
                success: true,
                totalVehicles: 0  // Return 0 if no vehicles are found
            });
        }
    } catch (error) {
        console.error('Error counting vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Error counting vehicles'
        });
    }
});

// Endpoint to count vehicles with 'delivered' status in orders
counts.get('/deliveredvehicles', verifyJwtAdmin, async (req, res) => {
    try {
        const countQuery = `
            SELECT COUNT(o.vehicle_id) AS count
            FROM orders o
            WHERE o.delivered_status = 'delivered';
        `;
        const result = await db.promise().query(countQuery);

        if (result[0] && result[0].length > 0) {
            res.status(200).json({
                success: true,
                count: result[0][0].count
            });
        } else {
            res.status(200).json({
                success: true,
                count: 0
            });
        }
    } catch (error) {
        console.error('Error counting delivered vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Error counting delivered vehicles'
        });
    }
});

// Endpoint to fetch rental dates for a specific vehicle
counts.get('/:vehicle_id/rental-dates', async (req, res) => {
    const { vehicle_id } = req.params;

    try {
        const query = `
            SELECT rent_start_date, rent_end_date 
            FROM orders 
            WHERE vehicle_id = ?;
        `;
        const [rows] = await db.promise().query(query, [vehicle_id]);

        if (rows.length > 0) {
            res.status(200).json({
                success: true,
                rentalDates: rows
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No rental dates found for the specified vehicle ID'
            });
        }
    } catch (error) {
        console.error('Error fetching rental dates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching rental dates'
        });
    }
});

// Endpoint to count expired vehicle documents (tax or insurance expired)
// Endpoint to count expired documents (tax or insurance expired)
counts.get("/expired-documents", async (req, res) => {
  try {
      const query = `
          SELECT COUNT(*) AS expired_count
          FROM vehicle_document
          WHERE 
              (tax_paid_until < CURDATE() OR insurance_expiry < CURDATE());
      `;
      console.log('Executing query for expired documents:', query); // Log query for debugging
      const [result] = await db.promise().query(query);

      console.log('Query result for expired documents:', result); // Log the result

      res.status(200).json({
          success: true,
          expired_count: result[0]?.expired_count || 0, // Ensure default to 0 if result is empty
      });
  } catch (error) {
      console.error("Error fetching expired documents:", error);
      res.status(500).json({
          success: false,
          message: "Failed to fetch expired documents",
      });
  }
});

// Endpoint to count total categories
counts.get("/categories-total", async (req, res) => {
  try {
      const query = `
          SELECT COUNT(*) AS total_categories
          FROM categories;
      `;
      console.log('Executing query for total categories:', query); // Log query for debugging
      const [result] = await db.promise().query(query);

      console.log('Query result for total categories:', result); // Log the result

      res.status(200).json({
          success: true,
          total_categories: result[0]?.total_categories || 0, // Ensure default to 0 if result is empty
      });
  } catch (error) {
      console.error("Error fetching total categories:", error);
      res.status(500).json({
          success: false,
          message: "Failed to fetch total categories",
      });
  }
});

// Endpoint to count vehicles with status = 'pending'
counts.get("/status-pending", async (req, res) => {
  try {
      const query = `
          SELECT COUNT(*) AS pending_vehicles
          FROM vehicle_status
          WHERE status = 'pending';
      `;
      console.log('Executing query for pending vehicles:', query); // Log query for debugging
      const [result] = await db.promise().query(query);

      console.log('Query result for pending vehicles:', result); // Log the result

      res.status(200).json({
          success: true,
          pending_vehicles: result[0]?.pending_vehicles || 0, // Ensure default to 0 if result is empty
      });
  } catch (error) {
      console.error("Error fetching pending vehicles:", error);
      res.status(500).json({
          success: false,
          message: "Failed to fetch pending vehicles count",
      });
  }
});

export default counts;
