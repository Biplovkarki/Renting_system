import express from 'express';
import { db } from '../db.js';
import { verifyUserJwt } from '../user/jwtUser.js';

const routerRate = express.Router();

// Rate a vehicle (one rating per user per vehicle)
routerRate.post('/rate/:user_id/:vehicle_id', verifyUserJwt, async (req, res) => {
    const { user_id, vehicle_id } = req.params; // Extract user_id and vehicle_id from params
    const { rating_value } = req.body; // Rating value is still passed in the request body

    // Validate request data
    if (!vehicle_id || !rating_value || rating_value < 1 || rating_value > 5) {
        return res.status(400).json({ message: 'Vehicle ID and a valid rating value (1.0 - 5.0) are required.' });
    }

    try {
        // Check if the user has already rated this vehicle
        const [existingRating] = await db.promise().query(`
            SELECT * FROM ratings WHERE user_id = ? AND vehicle_id = ?
        `, [user_id, vehicle_id]);

        if (existingRating.length > 0) {
            // If the user has already rated the vehicle, update the rating
            await db.promise().query(`
                UPDATE ratings SET rating_value = ? WHERE user_id = ? AND vehicle_id = ?
            `, [rating_value, user_id, vehicle_id]);

            return res.status(200).json({ message: 'Rating updated successfully.' });
        }

        // If no existing rating, insert a new rating
        await db.promise().query(`
            INSERT INTO ratings (user_id, vehicle_id, rating_value) 
            VALUES (?, ?, ?)
        `, [user_id, vehicle_id, rating_value]);

        return res.status(200).json({ message: 'Rating added successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Comment on a vehicle (multiple comments allowed)
routerRate.post('/comment/:user_id/:vehicle_id', verifyUserJwt, async (req, res) => {
    const { user_id, vehicle_id } = req.params; // Extract user_id and vehicle_id from params
    const { comment_text } = req.body; // Comment text is passed in the request body

    // Validate request data
    if (!vehicle_id || !comment_text) {
        return res.status(400).json({ message: 'Vehicle ID and Comment Text are required.' });
    }

    try {
        // Insert the new comment
        await db.promise().query(`
            INSERT INTO comments (user_id, vehicle_id, comment_text) 
            VALUES (?, ?, ?)
        `, [user_id, vehicle_id, comment_text]);

        return res.status(200).json({ message: 'Comment added successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get existing rating for a user and vehicle
routerRate.get('/rate/:user_id/:vehicle_id', verifyUserJwt, async (req, res) => {
    const { user_id, vehicle_id } = req.params;

    try {
        const [existingRating] = await db.promise().query(`
            SELECT rating_value FROM ratings WHERE user_id = ? AND vehicle_id = ?
        `, [user_id, vehicle_id]);

        if (existingRating.length > 0) {
            return res.status(200).json(existingRating[0]); // Return the existing rating value
        }

        return res.status(404).json({ message: 'No rating' });
    } catch (error) {
        console.error('Error fetching rating:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update an existing rating for a user and vehicle
routerRate.put('/rate/:user_id/:vehicle_id', verifyUserJwt, async (req, res) => {
    const { user_id, vehicle_id } = req.params;
    const { rating_value } = req.body;

    // Validate the rating value
    if (!rating_value || rating_value < 1 || rating_value > 5) {
        return res.status(400).json({ message: 'Invalid rating value. Rating should be between 1.0 and 5.0.' });
    }

    try {
        // Check if a rating exists
        const [existingRating] = await db.promise().query(`
            SELECT * FROM ratings WHERE user_id = ? AND vehicle_id = ?
        `, [user_id, vehicle_id]);

        if (existingRating.length > 0) {
            // Update the existing rating
            await db.promise().query(`
                UPDATE ratings SET rating_value = ? WHERE user_id = ? AND vehicle_id = ?
            `, [rating_value, user_id, vehicle_id]);

            return res.status(200).json({ message: 'Rating updated successfully.' });
        }

        return res.status(404).json({ message: 'No rating found to update.' });
    } catch (error) {
        console.error('Error updating rating:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

;

export default routerRate;
