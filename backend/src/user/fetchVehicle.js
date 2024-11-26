import express from "express";
import { db } from "../db.js";

const fetchRoutes = express.Router();

// Fetch vehicles with approved status and show discounted price if enabled
fetchRoutes.get('/vehicle', async (req, res) => {
    const { categoryId } = req.query; // Assuming category ID is passed as query parameter

    try {
        let query = `
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
                CASE 
                    WHEN d.is_enabled = 1 THEN vs.final_price * (1 - d.discount_percentage / 100)  -- Apply discount calculation here
                    ELSE vs.final_price 
                END AS discounted_price,
                d.discount_percentage,  -- Fetch discount percentage if enabled
                vs.availability,
                vs.rent_start_date,
                vs.rent_end_date,
                vs.terms
            FROM vehicle v
            LEFT JOIN vehicle_status vs ON v.vehicle_id = vs.vehicle_id
            LEFT JOIN categories c ON v.category_id = c.category_id
            LEFT JOIN discounts d ON c.category_id = d.category_id  -- Join the discounts table
            WHERE vs.status = 'approve'
        `;

        // If categoryId is provided in the query parameters, filter by category
        if (categoryId) {
            query += ` AND v.category_id = ?`;
        }

        const [rows] = await db.promise().query(query, [categoryId]);

        if (rows.length === 0) {
            return res.status(204).json({ message: 'No approved vehicles found for this category.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching vehicle data:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Fetch all categories
fetchRoutes.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.promise().query(`
            SELECT 
                category_id, 
                category_name 
            FROM categories
        `);

        if (categories.length === 0) {
            return res.status(204).json({ message: 'No categories found.' });
        }

        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Fetch a single vehicle by vehicleId
fetchRoutes.get('/vehicle/:vehicleId', async (req, res) => {
    const { vehicleId } = req.params;

    console.log('Vehicle ID:', vehicleId); // Log the vehicleId from the request

    try {
        const query = `
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
                vd.registration_number,
                CASE 
                    WHEN d.is_enabled = 1 THEN vs.final_price * (1 - d.discount_percentage / 100)
                    ELSE vs.final_price 
                END AS discounted_price,
                d.discount_percentage,  -- Fetch discount percentage if enabled
                vs.availability,
                vs.rent_start_date,
                vs.rent_end_date,
                vs.terms
            FROM vehicle v
            LEFT JOIN vehicle_status vs ON v.vehicle_id = vs.vehicle_id
            LEFT JOIN vehicle_document vd ON v.vehicle_id = vd.vehicle_id
            LEFT JOIN categories c ON v.category_id = c.category_id
            LEFT JOIN discounts d ON c.category_id = d.category_id
            WHERE v.vehicle_id = ? AND vs.status = 'approve';
        `;
        
        const [rows] = await db.promise().query(query, [vehicleId]);

        console.log('Database Results:', rows); // Log the result from the database

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found or not approved.' });
        }

        res.json(rows[0]); // Send the first row with vehicle details
    } catch (error) {
        console.error('Error fetching vehicle details:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default fetchRoutes;
