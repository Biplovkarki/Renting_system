import express from 'express';
import { db } from '../db.js';

const commentRouter = express.Router();

// Fetch comments and ratings for a specific vehicle
commentRouter.get('/:vehicle_id', async (req, res) => {
    const { vehicle_id } = req.params;

    try {
        // Query to fetch user details, comments, and ratings
        const [results] = await db.promise().query(`
            SELECT 
                users.username AS user_name,
                users.user_image,
                comments.comment_text,
                COALESCE(ratings.rating_value, NULL) AS rating_value, -- Include rating if available
                comments.created_at
            FROM 
                comments
            INNER JOIN 
                users ON comments.user_id = users.user_id
            LEFT JOIN 
                ratings ON comments.user_id = ratings.user_id AND comments.vehicle_id = ratings.vehicle_id
            WHERE 
                comments.vehicle_id = ?
            ORDER BY 
                comments.created_at DESC; -- Newest comments first
        `, [vehicle_id]);

        // Send the fetched data as JSON
        res.status(200).json({ comments: results });
    } catch (error) {
        console.error('Error fetching comments and ratings:', error);
        res.status(500).json({ error: 'Failed to fetch comments and ratings. Please try again later.' });
    }
});

export default commentRouter;
