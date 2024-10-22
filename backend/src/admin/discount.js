import express from 'express';
import { db } from '../db.js';
import { verifyJwtAdmin } from './jwtAdmin.js';

const discountApi = express.Router();

// POST: Add a new discount
// POST: Add a new discount
discountApi.post('/discount', verifyJwtAdmin, async (req, res) => {
    const { category_id, discount_name, discount_percentage, is_enabled } = req.body;

    // Validate input data
    if (!category_id || !discount_name || discount_percentage == null || is_enabled == null) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    
    // Check if category_id is a valid number
    if (isNaN(category_id) || category_id <= 0) {
        return res.status(400).json({ message: 'Invalid category ID.' });
    }

    // Check if discount_percentage is a valid number
    if (isNaN(discount_percentage) || discount_percentage < 0 || discount_percentage > 100) {
        return res.status(400).json({ message: 'Discount percentage must be between 0 and 100.' });
    }

    // Check if is_enabled is a boolean
    if (typeof is_enabled !== 'boolean') {
        return res.status(400).json({ message: 'is_enabled must be a boolean.' });
    }

    try {
        // Check if a discount for the given category already exists
        const [existingDiscount] = await db.promise().query(
            'SELECT * FROM discounts WHERE category_id = ?',
            [category_id]
        );

        if (existingDiscount.length > 0) {
            return res.status(400).json({ message: 'A discount offer for this category already exists.' });
        }

        // Insert the new discount into the database
        await db.promise().query(
            'INSERT INTO discounts (category_id, discount_name, discount_percentage, is_enabled) VALUES (?, ?, ?, ?)',
            [category_id, discount_name, discount_percentage, is_enabled]
        );

        res.status(201).json({ message: 'Discount added successfully.' });
    } catch (error) {
        console.error('Error adding discount:', error); // Log the entire error object for more context
        res.status(500).json({ message: 'Error adding discount.', error: error.message || 'An unknown error occurred.' });
    }
});


// GET: Fetch all discounts
discountApi.get('/discount', verifyJwtAdmin, async (req, res) => {
    try {
        const [discounts] = await db.promise().query('SELECT * FROM discounts');
        if (discounts.length === 0) {
            return res.status(204).json({ message: 'No discounts found.' });
        }
        res.json(discounts);
    } catch (error) {
        console.error('Error fetching discounts:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// PUT: Update an existing discount
// PUT: Update a discount by discount id
discountApi.put('/discount/:id', verifyJwtAdmin, async (req, res) => {
    const { discount_name, discount_percentage, category_id, is_enabled } = req.body;

    // Validate input data
    if (!discount_name || discount_percentage == null || !category_id || is_enabled == null) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if category_id is a valid number
    if (isNaN(category_id) || category_id <= 0) {
        return res.status(400).json({ message: 'Invalid category ID.' });
    }

    // Check if discount_percentage is a valid number
    if (isNaN(discount_percentage) || discount_percentage < 0 || discount_percentage > 100) {
        return res.status(400).json({ message: 'Discount percentage must be between 0 and 100.' });
    }

    // Check if is_enabled is a boolean
    if (typeof is_enabled !== 'boolean') {
        return res.status(400).json({ message: 'is_enabled must be a boolean.' });
    }

    try {
        // Fetch existing discount using discount_id
        const [existingDiscount] = await db.promise().query(
            'SELECT * FROM discounts WHERE discount_id = ?',
            [req.params.id] // Use req.params.id to match discount_id
        );

        if (existingDiscount.length === 0) {
            return res.status(404).json({ message: 'Discount not found.' });
        }

        // Update the discount with the new values
        await db.promise().query(
            'UPDATE discounts SET discount_name = ?, discount_percentage = ?, category_id = ?, is_enabled = ? WHERE discount_id = ?',
            [discount_name, discount_percentage, category_id, is_enabled, req.params.id] // Use discount_id
        );

        res.status(200).json({ message: 'Discount updated successfully.' });
    } catch (error) {
        console.error('Error updating discount:', error.message);
        res.status(500).json({ message: 'Error updating discount.', error: error.message });
    }
});


/// DELETE: Delete a discount by discount id
discountApi.delete('/discount/:id', verifyJwtAdmin, async (req, res) => {
    const { id } = req.params;

    // Validate discount id
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: 'Invalid discount ID.' });
    }

    try {
        const [existingDiscount] = await db.promise().query(
            'SELECT * FROM discounts WHERE discount_id = ?',
            [id]
        );

        if (existingDiscount.length === 0) {
            return res.status(404).json({ message: 'Discount not found.' });
        }

        // Use `id` instead of `category_id`
        await db.promise().query(
            'DELETE FROM discounts WHERE discount_id = ?',
            [id]
        );

        res.status(200).json({ message: 'Discount deleted successfully.' });
    } catch (error) {
        console.error('Error deleting discount:', error.message);
        res.status(500).json({ message: 'Error deleting discount.', error: error.message });
    }
});

export default discountApi;
