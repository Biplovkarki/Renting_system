import express from 'express';
import { db } from '../db.js';
import { verifyJwtAdmin } from './jwtAdmin.js';

const counts = express.Router();

// Endpoint to count total vehicles
counts.get('/vehicles', verifyJwtAdmin, async (req, res) => {
    try {
        const countQuery = 'SELECT COUNT(vehicle_id) AS totalVehicles FROM vehicle';  // Counting based on vehicle_id
        const result = await db.promise().query(countQuery);


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
      const [result] = await db.promise().query(query);


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
      const [result] = await db.promise().query(query);


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
      const [result] = await db.promise().query(query);


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

counts.get('/vehiclespercategory', (req, res) => {
    const query = 
      `SELECT vehicle.category_id, c.category_name, COUNT(*) AS total_vehicles
FROM vehicle
JOIN categories c ON vehicle.category_id = c.category_id
GROUP BY vehicle.category_id, c.category_name;
`
    ;
  
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', message: err.message });
      }
  
      // Respond with the count of vehicles per category
      res.status(200).json({ vehicles_per_category: results });
    });
  }); 

export default counts;
