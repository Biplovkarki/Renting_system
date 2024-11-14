import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// In-memory blacklist
const tokenBlacklist = new Set();

// Middleware to verify JWT and check blacklist
export const verifyJwt = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token required.' });
    }

    // Check if the token is blacklisted
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ message: 'Token has been blacklisted.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.user = decoded; // Set the owner object from the decoded token
        console.log('Decoded Token:', decoded); // Log the decoded token for debugging
        next();
    });
};

// Function to blacklist a token
export const blacklistToken = (token) => {
    tokenBlacklist.add(token);
};
