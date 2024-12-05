import express from "express";
import { db } from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const search = express.Router();

/**
 * Algorithm to build the SQL query dynamically based on filters.
 */
const buildSearchQuery = (searchText, selectedFilter, category, vehicleId) => {
    const params = [];
    let sql = `
    SELECT v.*, vd.*, vs.*, d.discount_percentage, 
           (vs.final_price - (vs.final_price * d.discount_percentage / 100)) AS discounted_price,
           r.rating_value AS ratings
    FROM vehicle v
    LEFT JOIN vehicle_document vd ON v.vehicle_id = vd.vehicle_id
    INNER JOIN vehicle_status vs ON v.vehicle_id = vs.vehicle_id
    LEFT JOIN discounts d ON v.category_id = d.category_id AND d.is_enabled = 1
    LEFT JOIN ratings r ON v.vehicle_id = r.vehicle_id
    WHERE vs.status = 'approve'
 `;
    let whereConditions = [];

    // Apply Vehicle ID filter
    if (vehicleId) {
        whereConditions.push(`v.vehicle_id = ?`);
        params.push(vehicleId);
    }

    // Handle searchable fields (vehicle_name, model, color, cc)
    const searchableFields = ["vehicle_name", "model", "color", "cc"];
    if (searchText && selectedFilter && searchableFields.includes(selectedFilter)) {
        // Handle numeric fields (cc, model)
        if (selectedFilter === "cc" || selectedFilter === "model") {
            const numValue = parseInt(searchText, 10); // Convert to integer
            if (isNaN(numValue)) {
                throw new Error(`Invalid input for ${selectedFilter}. Only integer values are allowed.`);
            }
            whereConditions.push(`${selectedFilter} = ?`);
            params.push(numValue); // Ensure it's treated as an integer
        }
        // Handle rating_value as float (allow decimals)
        else if (selectedFilter === "ratings") {
            const numValue = parseFloat(searchText); // Convert to float to handle decimals
            if (isNaN(numValue)) {
                throw new Error(`Invalid input for ${selectedFilter}. Only numeric values are allowed.`);
            }
            whereConditions.push(`CAST(r.rating_value AS DECIMAL(10,2)) = ?`);
            params.push(numValue); // Ensure it's treated as a number
        } else {
            whereConditions.push(`${selectedFilter} LIKE ?`);
            params.push(`%${searchText}%`);
        }
    } else if (searchText) {
        // Default search across multiple fields if no specific filter is chosen
        whereConditions.push(`(vehicle_name LIKE ? OR model LIKE ? OR color LIKE ? OR cc LIKE ?)`); 
        params.push(`%${searchText}%`, `%${searchText}%`, `%${searchText}%`, `%${searchText}%`);
    }

    // Filter by category
    if (category && category !== 'all') {
        whereConditions.push(`v.category_id = ?`);
        params.push(category);
    }

    // Add WHERE conditions to the query
    if (whereConditions.length > 0) {
        sql += ` AND (${whereConditions.join(' AND ')})`;
    }

    return { sql, params };
};


/**
 * Algorithm to fetch vehicle data based on search parameters.
 */
const fetchVehicles = async (req, res) => {
    const { searchText, selectedFilter, category, vehicleId } = req.query;

    // Validate category
    if (category && category !== 'all' && isNaN(category)) {
        return res.status(400).json({ error: 'Invalid category. Category must be a valid number or "all".' });
    }

    // Build the search query based on the filters
    try {
        const { sql, params } = buildSearchQuery(searchText, selectedFilter, category, vehicleId);

        // Execute the query
        db.query(sql, params, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error executing query:", error);
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Fetch categories - This part remains mostly unchanged, but we can still consider it a separate algorithm.
 */
const fetchCategories = async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT category_id, category_name FROM categories');
        if (rows.length === 0) {
            return res.status(204).json({ message: 'No categories found.' });
        }
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories list:', error);
        res.status(500).json({ message: 'Internal server error.', details: error.message });
    }
};

// Route to handle vehicle search
search.get('/', fetchVehicles);

// Route to handle fetching categories
search.get('/categories', fetchCategories);

export default search;
