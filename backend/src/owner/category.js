import express from 'express';
import dotenv from 'dotenv';
import { db } from '../db.js';
import { verifyJwt } from '../owner/jwtOwner.js';
dotenv.config();
export const cat_owner = express.Router();
cat_owner.get('/categories', verifyJwt, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM categories');
        
        if (rows.length === 0) {
            return res.status(204).json({ message: 'No categories found.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories list:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
//discounts
// Discounts
cat_owner.get('/discount/:category_id',verifyJwt, async (req, res) => {
    const { category_id } = req.params;
    try {
        // Modify the query to fetch discounts based on category_id
        const [discounts] = await db.promise().query('SELECT * FROM discounts WHERE category_id = ?', [category_id]);

        if (discounts.length === 0) {
            return res.status(404).json({ message: 'No discounts found for this category.' });
        }
        res.json(discounts[0]); // Assuming you want to return the first discount object
    } catch (error) {
        console.error('Error fetching discounts:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


