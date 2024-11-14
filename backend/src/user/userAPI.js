import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { verifyJwt, blacklistToken } from './jwtUser.js'; // Ensure correct JWT import for users
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';

dotenv.config();

const routerUser = express.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY;

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/user'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `userimage_${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage });

// Endpoint to handle image upload for the owner
routerUser.post('/uploaduser', verifyJwt, upload.single('UserImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const image = req.file.filename; // Uploaded image filename
    const ownerId = req.user.id; // Extract owner ID from JWT

    const sql = "UPDATE users SET user_image = ? WHERE User_id = ?";

    db.query(sql, [image, ownerId], (err) => {
        if (err) {
            return res.status(500).json({ message: "Error updating the image" });
        }
        return res.json({ status: "Success", image });
    });
});

// Registration route
routerUser.post('/register', async (req, res) => {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password || !phone) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.promise().query(
            'INSERT INTO users (username, user_email, user_pass, user_phone) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, phone]
        );
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email is already in use.' });
        }
        res.status(500).json({ message: 'Internal server error.' });
    }
});

routerUser.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE user_email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.user_pass);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Create the token with owner ID
        const token = jwt.sign({ id: user.User_id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// Fetch Owner Profile
routerUser.get('/profile', verifyJwt, async (req, res) => {
    const userID = req.user.id;

    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE User_id = ?', [userID]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = rows[0];
        res.json({
            userID: user.User_id,
            username: user.username,
            user_email: user.user_email,
            user_phone: user.user_phone,
            user_image: user.user_image || '',
            user_address: user.user_address || '',
            created_at: user.created_at,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update Owner Profile
routerUser.put('/update', verifyJwt, async (req, res) => {
    const userID = req.user.id;
    const { username, user_email, user_phone, user_address } = req.body;

    if (!username || !user_email || !user_phone || !user_address) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        await db.promise().query(
            'UPDATE users SET username = ?, user_email = ?, user_phone = ?, user_address = ? WHERE User_id = ?',
            [username, user_email, user_phone, user_address, userID]
        );

        res.json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Logout route
routerUser.post('/logout', verifyJwt, (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    blacklistToken(token);
    res.json({ message: 'Logged out successfully.' });
});

export default routerUser;
