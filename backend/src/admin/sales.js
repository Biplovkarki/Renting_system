import express from 'express';
import { verifyJwtAdmin } from './jwtAdmin.js';
import { db } from '../db.js';

const salesRoutes = express.Router();
salesRoutes.get("/sales/daily", async (req, res) => {
    const { startDate, endDate } = req.query;
    
    const query = `
      SELECT
        DATE(rent_start_date) AS date,
        SUM(grand_total) AS total_sales,
        COUNT(order_id) AS total_orders,
        AVG(grand_total) AS avg_order_value
      FROM
        orders
      WHERE
        status = 'completed'
        AND paid_status = 'paid'
        AND delivered_status = 'delivered'
        ${startDate && endDate ? 'AND rent_start_date BETWEEN ? AND ?' : ''}
      GROUP BY
        DATE(rent_start_date)
      ORDER BY
        date;
    `;
  
    try {
      const params = startDate && endDate ? [startDate, endDate] : [];
      const [results] = await db.promise().query(query, params);
      res.json({ sales: results });
    } catch (error) {
      console.error("Error fetching daily sales:", error);
      res.status(500).send("Error fetching daily sales");
    }
  });
  
  // Monthly Sales Endpoint
  salesRoutes.get("/sales/monthly", async (req, res) => {
    const { year } = req.query;
    
    const query = `
      SELECT
        YEAR(rent_start_date) AS year,
        MONTH(rent_start_date) AS month,
        SUM(grand_total) AS total_sales,
        COUNT(order_id) AS total_orders,
        AVG(grand_total) AS avg_order_value
      FROM
        orders
      WHERE
        status = 'completed'
        AND paid_status = 'paid'
        AND delivered_status = 'delivered'
        ${year ? 'AND YEAR(rent_start_date) = ?' : ''}
      GROUP BY
        YEAR(rent_start_date),
        MONTH(rent_start_date)
      ORDER BY
        year, month;
    `;
  
    try {
      const params = year ? [year] : [];
      const [results] = await db.promise().query(query, params);
      res.json({ sales: results });
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
      res.status(500).send("Error fetching monthly sales");
    }
  });
  
  // Yearly Sales Endpoint
  salesRoutes.get("/sales/yearly", async (req, res) => {
    const query = `
      SELECT
        YEAR(rent_start_date) AS year,
        SUM(grand_total) AS total_sales,
        COUNT(order_id) AS total_orders,
        AVG(grand_total) AS avg_order_value
      FROM
        orders
      WHERE
        status = 'completed'
        AND paid_status = 'paid'
        AND delivered_status = 'delivered'
      GROUP BY
        YEAR(rent_start_date)
      ORDER BY
        year;
    `;
  
    try {
      const [results] = await db.promise().query(query);
      res.json({ sales: results });
    } catch (error) {
      console.error("Error fetching yearly sales:", error);
      res.status(500).send("Error fetching yearly sales");
    }
  });

 export default salesRoutes;
