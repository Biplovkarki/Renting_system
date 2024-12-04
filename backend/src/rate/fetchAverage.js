import express from 'express';
import { db } from '../db.js';

const AverageRate = express.Router();

// Utility function to round to the nearest 0.5
const roundToHalf = (num) => {
    return Math.round(num * 2) / 2;
};

// Get average rating for a vehicle
AverageRate.get('/average-rating/:vehicle_id', async (req, res) => {
    const { vehicle_id } = req.params;

    try {
        // Fetch the average rating for the vehicle
        const [result] = await db.promise().query(`
            SELECT AVG(rating_value) AS average_rating 
            FROM ratings 
            WHERE vehicle_id = ?;
        `, [vehicle_id]);

        const averageRating = result[0].average_rating;

        if (averageRating === null) {
            return res.status(404).json({ message: 'No ratings' });
        }

        // Round the average rating to the nearest 0.5
        const roundedRating = roundToHalf(averageRating);

        return res.status(200).json({ 
            average_rating: roundedRating // Return the rounded rating
        });
    } catch (error) {
        console.error('Error fetching average rating:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

export default AverageRate;
