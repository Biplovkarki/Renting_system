import express from "express";
import { db } from "../db.js";

const fetchRoutes = express.Router();

fetchRoutes.get('/vehicle', async (req, res) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT 
                v.vehicle_id,
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
                vs.discounted_price,
                vs.availability,
                vs.rent_start_date,
                vs.rent_end_date,
                vs.terms
                
            FROM vehicle v
            LEFT JOIN vehicle_status vs ON v.vehicle_id = vs.vehicle_id
            LEFT JOIN categories c ON v.category_id = c.category_id
            WHERE vs.status = 'approve'
        `);

        if (rows.length === 0) {
            return res.status(204).json({ message: 'No approved vehicles found.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching vehicle data:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default fetchRoutes;
