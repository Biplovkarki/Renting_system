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
        return res.status(401).json({ message: 'No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token is invalid or expired.' });
        }
        req.user = decoded;
        next();
    });
};
// Function to blacklist a token
export const blacklistToken = (userToken) => {
    tokenBlacklist.add(userToken);
};
