import express from "express";
import { db } from "../db.js";
import dotenv from "dotenv";
import ARIMA from 'arima';
dotenv.config();

const arimaRouter = express.Router();


// Query the database for monthly revenue data
arimaRouter.get("/forecast-revenue", (req, res) => {
    db.query(`SELECT 
          DATE_FORMAT(created_at, '%Y-%m') AS month, 
          SUM(grand_total) AS total_revenue
      FROM 
          orders
      WHERE 
          paid_status = 'paid' 
          AND status = 'completed'
          AND delivered_status IN ('delivered', 'returned')  -- Filter by delivered or returned
      GROUP BY 
          month
      ORDER BY 
          month;`, (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).json({ message: 'Error fetching data' });
      }
  
      try {
        // Validate results
        if (!results || results.length === 0) {
          return res.status(404).json({ message: 'No historical data found' });
        }
  
        const historicalData = results.map(row => row.total_revenue);
  
        // Check if historical data is sufficient
        if (historicalData.length < 12) {
          return res.status(400).json({ message: 'Insufficient historical data for forecasting' });
        }
  
        const arima = new ARIMA({
          p: 1,
          d: 1,
          q: 1,
          verbose: true
        });
  
        // Validate ARIMA training
        try {
          arima.train(historicalData);
        } catch (trainError) {
          console.error('ARIMA training error:', trainError);
          return res.status(500).json({ message: 'Failed to train forecasting model' });
        }
  
        // Predict with error handling
        try {
          const [predictions] = arima.predict(6);
          
          const forecastedRevenue = predictions.map((prediction, index) => {
            const futureMonth = new Date();
            futureMonth.setMonth(futureMonth.getMonth() + index + 1);
            return {
              month: futureMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
              predicted_revenue: Math.max(0, prediction.toFixed(2)) // Prevent negative predictions
            };
          });
  
          res.json({ 
            forecast: forecastedRevenue,
            historical_data_points: historicalData.length
          });
        } catch (predictionError) {
          console.error('Prediction error:', predictionError);
          return res.status(500).json({ message: 'Failed to generate revenue forecast' });
        }
      } catch (generalError) {
        console.error('Unexpected error:', generalError);
        res.status(500).json({ message: 'Unexpected error in revenue forecasting' });
      }
    });
  });

  export default arimaRouter;