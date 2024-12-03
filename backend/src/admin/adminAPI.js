import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { verifyJwtAdmin, blacklistToken } from './jwtAdmin.js';
import dotenv from 'dotenv';

dotenv.config();
const routerAdmin = express.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY;
// Registration route
routerAdmin.post('/register', async (req, res) => {
    const { adminname, email, password, phone } = req.body;

    if (!adminname || !email || !password || !phone) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Check if email, adminname, or phone already exists
        const [existingAdmin] = await db.promise().query(
            'SELECT * FROM admin WHERE ad_email = ? OR ad_name = ? OR ad_phone = ?', 
            [email, adminname, phone]
        );

        if (existingAdmin.length > 0) {
            // Check which field already exists
            const existingField = [];
            if (existingAdmin.some(admin => admin.ad_email === email)) {
                existingField.push("email");
            }
            if (existingAdmin.some(admin => admin.ad_name === adminname)) {
                existingField.push("admin name");
            }
            if (existingAdmin.some(admin => admin.ad_phone === phone)) {
                existingField.push("phone number");
            }

            return res.status(409).json({ message: `Admin with this ${existingField.join(", ")} already exists.` });
        }

        // If no duplicates, proceed with registration
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.promise().query(
            'INSERT INTO admin (ad_name, ad_email, ad_pass, ad_phone) VALUES (?, ?, ?, ?)',
            [adminname, email, hashedPassword, phone]
        );
        res.status(201).json({ message: 'Admin registered successfully!' });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// Login route
routerAdmin.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.promise().query('SELECT * FROM admin WHERE ad_email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.ad_pass);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: admin.admin_id, Adminname: admin.ad_name }, JWT_SECRET, { expiresIn: '1h' });
        console.log(token);
        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Logout route
routerAdmin.post('/logout', verifyJwtAdmin, (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    blacklistToken(token);
    res.json({ message: 'Logged out successfully.' });
});

export default routerAdmin;
