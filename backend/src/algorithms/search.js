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
               (vs.final_price - (vs.final_price * d.discount_percentage / 100)) AS discounted_price
        FROM vehicle v
        LEFT JOIN vehicle_document vd ON v.vehicle_id = vd.vehicle_id
        LEFT JOIN vehicle_status vs ON v.vehicle_id = vs.vehicle_id
        LEFT JOIN discounts d ON v.category_id = d.category_id AND d.is_enabled = 1
    `;
    let whereClause = "";

    // Apply Vehicle ID filter
    if (vehicleId) {
        whereClause += `v.vehicle_id = ?`;
        params.push(vehicleId);
    }

    // Handle searchable fields (vehicle_name, model, color, cc)
    const searchableFields = ["vehicle_name", "model", "color", "cc"];
    if (searchText && selectedFilter && searchableFields.includes(selectedFilter)) {
        whereClause += whereClause ? " AND " : "";
        // Handle numeric fields (cc, model)
        if (selectedFilter === "cc" || selectedFilter === "model") {
            whereClause += `${selectedFilter} = ?`;
            params.push(Number(searchText)); // Ensure it's treated as a number
        } else {
            whereClause += `${selectedFilter} LIKE ?`;
            params.push(`%${searchText}%`);
        }
    } else if (searchText) {
        // Default search across multiple fields if no specific filter is chosen
        whereClause += whereClause ? " AND " : "";
        whereClause += `(vehicle_name LIKE ? OR model LIKE ? OR color LIKE ? OR cc LIKE ?)`;
        params.push(`%${searchText}%`, `%${searchText}%`, `%${searchText}%`, `%${searchText}%`);
    }

    // Filter by category
    if (category && category !== 'all') {
        whereClause += whereClause ? " AND " : "";
        whereClause += `v.category_id = ?`;
        params.push(category);
    }

    // Add WHERE clause to the query
    if (whereClause.length > 0) {
        sql += ` WHERE ${whereClause}`;
    }

    return { sql, params };
};

/**
 * Algorithm to fetch vehicle data based on search parameters.
 */
const fetchVehicles = async (req, res) => {
    const { searchText, selectedFilter, category, vehicleId } = req.query;

    // Build the search query based on the filters
    const { sql, params } = buildSearchQuery(searchText, selectedFilter, category, vehicleId);

    try {
        db.query(sql, params, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ error: 'Internal error', details: error.message });
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
