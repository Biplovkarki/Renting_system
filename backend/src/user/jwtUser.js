import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// In-memory blacklist
const tokenBlacklist = new Set();

export const verifyUserJwt = (req, res, next) => {
    const userToken = req.headers['authorization']?.split(' ')[1]; // renamed to userToken

    if (!userToken) {
        return res.status(403).json({ message: 'Token is required.' });
    }

    jwt.verify(userToken, JWT_SECRET, (err, decoded) => {  // Use userToken instead of token
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        req.user = decoded; // Attach decoded user data to the request object
        next();
    });
};

// Function to blacklist a token
export const blacklistToken = (userToken) => {
    tokenBlacklist.add(userToken);
};
