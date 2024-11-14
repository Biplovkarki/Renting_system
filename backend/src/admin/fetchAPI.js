import express from 'express';
import { db } from '../db.js';
import { verifyJwtAdmin } from './jwtAdmin.js';

const fetchRouter = express.Router();

// Get all owners
fetchRouter.get('/owner', verifyJwtAdmin, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM owners');
        
        if (rows.length === 0) {
            return res.status(204).json({ message: 'No owners found.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching owners list:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update owner details
fetchRouter.put('/owner/:id', verifyJwtAdmin, async (req, res) => {
    const ownerId = req.params.id;  // Get the owner_id from the URL parameter
    const { ownername, own_email, own_phone, own_address } = req.body;  // Get the updated data from the body

    if (!ownername || !own_email || !own_phone || !own_address) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Update owner in the database
        const [result] = await db.promise().query(
            'UPDATE owners SET ownername = ?, own_email = ?, own_phone = ?, own_address = ? WHERE owner_id = ?',
            [ownername, own_email, own_phone, own_address, ownerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        res.json({ message: 'Owner updated successfully.' });
    } catch (error) {
        console.error('Error updating owner:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Delete owner
fetchRouter.delete('/owner/:id', verifyJwtAdmin, async (req, res) => {
    const ownerId = req.params.id;  // Get the owner_id from the URL parameter

    try {
        // Delete owner from the database
        const [result] = await db.promise().query(
            'DELETE FROM owners WHERE owner_id = ?',
            [ownerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        res.json({ message: 'Owner deleted successfully.' });
    } catch (error) {
        console.error('Error deleting owner:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default fetchRouter;
