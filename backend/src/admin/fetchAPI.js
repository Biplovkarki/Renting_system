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
fetchRouter.get('/user', verifyJwtAdmin, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM users');
        
        if (rows.length === 0) {
            return res.status(204).json({ message: 'No owners found.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching owners list:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// Delete owner
fetchRouter.delete('/user/:id', verifyJwtAdmin, async (req, res) => {
    const userId = req.params.id;  // Get the owner_id from the URL parameter

    try {
        // Delete owner from the database
        const [result] = await db.promise().query(
            'DELETE FROM users WHERE User_id = ?',
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'user not found.' });
        }

        res.json({ message: 'user deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default fetchRouter;
