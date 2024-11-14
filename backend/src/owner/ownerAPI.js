import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { verifyJwt, blacklistToken } from './jwtOwner.js';
import dotenv from 'dotenv';

dotenv.config();
const routerOwner = express.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY;

// Registration route
routerOwner.post('/register', async (req, res) => {
    const { ownername, email, password, phone } = req.body;

    if (!ownername || !email || !password || !phone) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.promise().query(
            'INSERT INTO owners (ownername, own_email, own_pass, own_phone) VALUES (?, ?, ?, ?)',
            [ownername, email, hashedPassword, phone]
        );
        res.status(201).json({ message: 'Owner registered successfully!' });
    } catch (error) {
        console.error('Error registering owner:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Login route
routerOwner.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.promise().query('SELECT * FROM owners WHERE own_email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const owner = rows[0];
        const isMatch = await bcrypt.compare(password, owner.own_pass);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Create the token with owner ID
        const token = jwt.sign({ id: owner.Owner_id, ownername: owner.ownername }, JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Fetch Owner Profile
routerOwner.get('/profile', verifyJwt, async (req, res) => {
    const ownerID = req.owner.id;

    console.log('Request Owner ID:', ownerID); // Log the owner ID from the request

    try {
        const [rows] = await db.promise().query('SELECT * FROM owners WHERE Owner_id = ?', [ownerID]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Owner not found.' });
        }

        const owner = rows[0];
        res.json({
            ownerID: owner.Owner_id,
            ownername: owner.ownername,
            own_email: owner.own_email,
            own_phone: owner.own_phone,
            own_image: owner.own_image || '',
            own_address: owner.own_address || '',
            created_at: owner.created_at,
        });
    } catch (error) {
        console.error('Error fetching owner profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update Owner Profile
routerOwner.put('/update', verifyJwt, async (req, res) => {
    const ownerID = req.owner.id;
    const { ownername, own_email, own_phone, own_address } = req.body;

    if (!ownername || !own_email || !own_phone || !own_address) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        await db.promise().query(
            'UPDATE owners SET ownername = ?, own_email = ?, own_phone = ?, own_address = ? WHERE Owner_id = ?',
            [ownername, own_email, own_phone, own_address, ownerID]
        );

        res.json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Logout route
routerOwner.post('/logout', verifyJwt, (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    blacklistToken(token);
    res.json({ message: 'Logged out successfully.' });
});

export default routerOwner;
