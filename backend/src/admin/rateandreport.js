import express from 'express';
import { db } from '../db.js';
import { verifyJwtAdmin } from './jwtAdmin.js';

const ratedetails = express.Router();

// Endpoint to fetch average ratings for all vehicles
ratedetails.get('/vehicles/average-ratings', verifyJwtAdmin, async (req, res) => {
  try {
    const [results] = await db.promise().query(`
      SELECT 
        r.vehicle_id, 
        v.vehicle_name,  -- Include vehicle_name from vehicles table
        AVG(r.rating_value) AS average_rating
      FROM ratings r
      JOIN vehicle v ON r.vehicle_id = v.vehicle_id  -- Join with vehicles table
      GROUP BY r.vehicle_id
      ORDER BY average_rating DESC;  -- Optional, to sort by highest rating
    `);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No ratings found for vehicles.' });
    }

    res.status(200).json({
      success: true,
      data: results  // Returns the list of all vehicles with their average ratings and names
    });
  } catch (error) {
    console.error('Error fetching average ratings:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching the average ratings.' });
  }
});

// Endpoint to fetch the most rated vehicle (highest average rating)
ratedetails.get('/vehicles/most-rated', verifyJwtAdmin, async (req, res) => {
  try {
    const [results] = await db.promise().query(`
      SELECT 
        r.vehicle_id, 
        v.vehicle_name,  -- Include vehicle_name from vehicles table
        AVG(r.rating_value) AS average_rating
      FROM ratings r
      JOIN vehicle v ON r.vehicle_id = v.vehicle_id  -- Join with vehicles table
      GROUP BY r.vehicle_id
      ORDER BY average_rating DESC
      LIMIT 1;  -- Only fetch the top-rated vehicle
    `);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No ratings found.' });
    }

    res.status(200).json({
      success: true,
      data: results[0]  // Return the most rated vehicle (only one result)
    });
  } catch (error) {
    console.error('Error fetching most rated vehicle:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching the most rated vehicle.' });
  }
});

ratedetails.get('/comments/recent', async (req, res) => {
    const query = `
   SELECT 
    c.comment_id, 
    c.vehicle_id, 
    v.vehicle_name, 
    c.user_id, 
    c.comment_text, 
    c.created_at
FROM 
    comments c
JOIN 
    vehicle v
ON 
    c.vehicle_id = v.vehicle_id
JOIN 
    (SELECT 
        vehicle_id, 
        MAX(created_at) AS last_comment_time
    FROM 
        comments
    GROUP BY 
        vehicle_id) AS latest_comments
ON 
    c.vehicle_id = latest_comments.vehicle_id 
    AND c.created_at = latest_comments.last_comment_time
ORDER BY 
    v.vehicle_name;  -- Optional: You can order by vehicle name if needed


    `;
  
    try {
      // Use async/await to execute the query
      const [results] = await db.promise().query(query);  // db.promise() allows using async/await with MySQL
      res.status(200).json(results);
    } catch (err) {
      console.error("Database error:", err);  // Log detailed error
      res.status(500).json({ error: 'An error occurred while fetching the comments', details: err });
    }
  });
  
  ratedetails.get('/rental-summary', verifyJwtAdmin, async (req, res) => {
    try {
      // SQL query to get rental summary along with vehicle name
      const query = `
        SELECT
          v.vehicle_name,
          SUM(o.grand_total) AS total_revenue,
          COUNT(o.order_id) AS rented_count,
          AVG(o.grand_total) AS avg_rent_price,
          AVG(o.rental_days) AS avg_rental_days
        FROM
          orders o
        JOIN
          vehicle v ON o.vehicle_id = v.vehicle_id
        WHERE
          o.paid_status = 'paid'
          AND (o.delivered_status = 'delivered' OR o.delivered_status = 'returned')
        GROUP BY
          v.vehicle_name;
      `;
  
      // Execute the query asynchronously
      const [results] = await db.promise().execute(query);
  
      // If no results, return a message indicating no data
      if (results.length === 0) {
        return res.status(404).json({ message: 'No rental data available' });
      }
  
      // Send the calculated rental summary with vehicle name in the response
      return res.json(results);
    } catch (err) {
      // If any error occurs during the execution, handle it here
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
  });
  
  ratedetails.get('/vehicle-details', (req, res) => {
    const query = `
    SELECT 
    v.vehicle_name,
    v.model,
    vd.tax_paid_until,
    o.ownername AS owner_name,
    vd.insurance_expiry
FROM 
    vehicle_document vd
JOIN 
    vehicle v ON vd.vehicle_id = v.vehicle_id
JOIN 
    owners o ON v.owner_id = o.owner_id;

    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ message: 'Failed to fetch vehicle details' });
      }
  
      return res.json(results);
    });
  });
  
  

export default ratedetails;
