import express from "express";
import { db } from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const sortRouter = express.Router();

// Improved QuickSort with random pivot
function quickSort(arr, key, order = 'asc') {
    if (arr.length <= 1) return arr;

    const pivotIndex = Math.floor(Math.random() * arr.length);
    const pivot = arr[pivotIndex];
    const left = [];
    const right = [];
    const equals = [];

    for (let i = 0; i < arr.length; i++) {
        if (i === pivotIndex) continue;

        const compareResult = order === 'asc' ? arr[i][key] - pivot[key] : pivot[key] - arr[i][key];
        if (compareResult < 0) {
            left.push(arr[i]);
        } else if (compareResult > 0) {
            right.push(arr[i]);
        } else {
            equals.push(arr[i]);
        }
    }

    return quickSort(left, key, order).concat(equals, [pivot], quickSort(right, key, order));
}

sortRouter.get('/vehicles', async (req, res) => {
    const { category_id,sortBy, order } = req.query;
    const validSortFields = ['final_price', 'discounted_price', 'cc', 'rating_value', 'availability'];
    const validOrder = ['asc', 'desc'];

    // Input validation
    if (!sortBy || !validSortFields.includes(sortBy)) {
        return res.status(400).json({ error: 'Invalid or missing sortBy field. Choose from: final_price, discounted_price, cc, rating_value, availability' });
    }

    if (order && !validOrder.includes(order)) {
        return res.status(400).json({ error: 'Invalid order field. Choose from: asc, desc' });
    }

    try {
        // Build the SQL query with optional category_id filtering
        let query = `
            SELECT
                v.vehicle_id,
                v.vehicle_name,
                v.model,
                v.cc,
                v.color,
                v.transmission,
                v.fuel_type,
                vs.final_price,
                vs.discounted_price,
                vs.availability,
                AVG(r.rating_value) AS rating_value,
                v.image_front
            FROM
                vehicle AS v
            LEFT JOIN
                vehicle_status AS vs ON v.vehicle_id = vs.vehicle_id
            LEFT JOIN
                ratings AS r ON v.vehicle_id = r.vehicle_id
                LEFT JOIN
    categories AS c ON v.category_id = c.category_id
          
        `;

        // Add the category filter if category_id is provided
        if (category_id) {
            query += ` WHERE v.category_id = ?`;
        }
        query += `
    GROUP BY
        v.vehicle_id
`;
        
        // Execute the query with the category filter if needed
        const [vehicles] = await db.promise().execute(query, category_id ? [category_id] : []);

        // Sort the fetched data
        const sortedVehicles = quickSort(vehicles, sortBy, order);

        res.json(sortedVehicles);
    } catch (error) {
        console.error("Error fetching and sorting vehicles:", error);
        res.status(500).json({ error: "An error occurred while fetching and sorting vehicles." });
    }
});


export default sortRouter;
