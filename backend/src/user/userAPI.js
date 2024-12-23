import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js'; // Assuming db.js is your database connection
import { verifyUserJwt, blacklistToken } from './jwtUser.js'; // Your JWT functions
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';

dotenv.config();

const routerUser = express.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY; // Needs better secret management!

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/user'); // Ensure 'uploads/user' directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `userimage_${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only images are allowed.'));
        }
        cb(null, true);
    }
});

// Helper function for database queries
async function dbQuery(sql, params) {
    try {
        const [rows] = await db.promise().query(sql, params);
        return rows;
    } catch (error) {
        console.error("Database error:", error);
        throw error; // Re-throw for middleware to handle
    }
}


// Image upload route
routerUser.post('/uploaduser', verifyUserJwt, upload.single('UserImage'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const image = req.file.filename;
        const ownerId = req.user.id;

        await dbQuery("UPDATE users SET user_image = ? WHERE User_id = ?", [image, ownerId]);
        res.json({ status: "Success", image });
    } catch (error) {
        next(error);
    }
});

// Registration route
routerUser.post('/register', async (req, res, next) => {
    const { username, email, password, phone } = req.body;

    // Simplified validation (check for presence and basic email format)
    if (!username || !email || !password || !phone || !email.includes('@')) {
        return res.status(400).json({ message: "All fields are required. Email must contain '@'." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await dbQuery(
            'INSERT INTO users (username, user_email, user_pass, user_phone) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, phone]
        );
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        next(error);
    }
});

// Login route
routerUser.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const users = await dbQuery('SELECT * FROM users WHERE user_email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.user_pass);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const userToken = jwt.sign({ id: user.User_id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        console.log("Generated Token:", userToken); // Add logging here
        console.log("Complete Response:", { userToken }); // Log the entire response
        res.json({ userToken }); 
    } catch (error) {
        next(error);
    }
});

// Me route
// routerUser.get('/me', verifyUserJwt, async (req, res, next) => {
//     const userId = req.user.id;
//     try {
//         const user = await dbQuery('SELECT * FROM users WHERE User_id = ?', [userId]);
//         if (user.length === 0) {
//             return res.status(404).json({ message: 'User not found.' });
//         }
//         res.json({
//             userID: user[0].User_id,
//             username: user[0].username,
//             user_email: user[0].user_email,
//             user_phone: user[0].user_phone,
//             user_image: user[0].user_image || '',
//             user_address: user[0].user_address || '',
//             created_at: user[0].created_at,
//         });
//     } catch (error) {
//         next(error);
//     }
// });


// Profile route (same as /me for simplicity)
routerUser.get('/profile', verifyUserJwt, async (req, res) => {
    const userId = req.user.id;

    console.log('Request user ID:', userId); // Log the owner ID from the request

    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE User_id = ?', [userId]);

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
        console.log("user details:",user)
    } catch (error) {
        console.error('Error fetching owner profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
   
});


// Update Profile route
routerUser.put('/update', verifyUserJwt, async (req, res, next) => {
    const userID = req.user.id;
    const { username, user_email, user_phone, user_address } = req.body;

    // Simplified validation (check for presence)
    if (!username || !user_email || !user_phone || !user_address) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        await dbQuery(
            'UPDATE users SET username = ?, user_email = ?, user_phone = ?, user_address = ? WHERE User_id = ?',
            [username, user_email, user_phone, user_address, userID]
        );
        res.json({ message: 'Profile updated successfully!' });
    } catch (error) {
        next(error);
    }
});
routerUser.get('/image/:userId', async (req, res, next) => {
    const { userId } = req.params;

    try {
        const user = await dbQuery('SELECT user_image FROM users WHERE User_id = ?', [userId]);

        if (user.length === 0 || !user[0].user_image) {
            return res.status(404).json({ message: 'User image not found.' });
        }

        // File path for the user's image
        const imagePath = path.join(process.cwd(), 'uploads/user', user[0].user_image);

        // Check if the file exists and send it
        res.sendFile(imagePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).json({ message: 'Error fetching the image.' });
            }
        });
    } catch (error) {
        next(error);
    }
});

routerUser.put('/change-password', verifyUserJwt, async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Input Validation (essential for security)
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New passwords do not match.' });
    }
    if (newPassword.length < 8) { // Adjust minimum length as needed
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }


    try {
        console.log('Fetching user with ID:', userId);
        // Use parameterized query to prevent SQL injection
        const [userData] = await dbQuery('SELECT user_pass FROM users WHERE user_id = ?', [userId]);

        //Robust error handling for various scenarios
        if (!userData) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const currentHashedPassword = userData.user_pass;
        const isMatch = await bcrypt.compare(currentPassword, currentHashedPassword);

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        // Prevent reusing the same password
        if (await bcrypt.compare(newPassword, currentHashedPassword)) {
            return res.status(400).json({ message: 'New password cannot be the same as the current password.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Adjust salt rounds as needed

        // Update password in the database (parameterized query)
        await dbQuery('UPDATE users SET user_pass = ? WHERE user_id = ?', [hashedNewPassword, userId]);

        res.json({ message: 'Password updated successfully!' });

    } catch (error) {
        console.error('Error changing password:', error);
        // Generic error message for security; log details for debugging
        res.status(500).json({ message: 'Failed to update password. Please try again later.' });
    }
});



// Logout route
routerUser.post('/logout', verifyUserJwt, (req, res) => {
    const userToken = req.headers['authorization']?.split(' ')[1];
    if (!userToken) {
        return res.status(400).json({ message: 'Token is required.' });
    }
    blacklistToken(userToken);
    res.json({ message: 'Logged out successfully.' });
});

// Error handling middleware
routerUser.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
});


export default routerUser;