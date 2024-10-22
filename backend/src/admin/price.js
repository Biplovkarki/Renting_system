import express from 'express';
import { verifyJwtAdmin } from './jwtAdmin.js';
import { db } from '../db.js';

const priceRouter = express.Router();

// Fetch price range for a category dynamically
priceRouter.get('/price', verifyJwtAdmin, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM prices');

        if (rows.length === 0) {
            return res.status(204).json({ message: 'No price found.' });
        }

        res.json(rows);
       
    } catch (error) {
        console.error('Error fetching prices list:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Add price range dynamically based on selected category from frontend
priceRouter.post('/price', verifyJwtAdmin, async (req, res) => {
    const { category_id, min_price, max_price } = req.body;
    console.log(`Received request to add price range:`, { category_id, min_price, max_price });

    try {
        // Check if a price range already exists for the specified category
        const [existingPrices] = await db.promise().query('SELECT * FROM prices WHERE category_id = ?', [category_id]);

        if (existingPrices.length > 0) {
            return res.status(400).json({ message: 'A price range for this category already exists.' });
        }

        // Insert new price range if none exists
        await db.promise().query('INSERT INTO prices (category_id, min_price, max_price) VALUES (?, ?, ?)', [category_id, min_price, max_price]);
        res.status(201).json({ message: 'Price range added successfully.' });
    } catch (error) {
        console.error('Error adding price range:', error.message);
        res.status(500).json({ message: 'Error adding price range.', error: error.message });
    }
});

// Update price range
priceRouter.put('/price/:id', verifyJwtAdmin, async (req, res) => {
    const { id } = req.params;
    const { min_price, max_price } = req.body;

    try {
        await db.promise().query('UPDATE prices SET min_price = ?, max_price = ? WHERE price_id = ?', [min_price, max_price, id]);
        res.json({ message: 'Price range updated successfully.' });
    } catch (error) {
        console.error('Error updating price range:', error.message);
        res.status(500).json({ message: 'Error updating price range.', error: error.message });
    }
});

// Delete price range
priceRouter.delete('/price/:id', verifyJwtAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        await db.promise().query('DELETE FROM prices WHERE price_id = ?', [id]);
        res.json({ message: 'Price range deleted successfully.' });
    } catch (error) {
        console.error('Error deleting price range:', error.message);
        res.status(500).json({ message: 'Error deleting price range.', error: error.message });
    }
});

export default priceRouter;
