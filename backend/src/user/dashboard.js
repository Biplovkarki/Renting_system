import express from 'express';

import { db } from '../db.js'; // Assuming db.js is your database connection
import { verifyUserJwt, blacklistToken } from './jwtUser.js'; // Your JWT functions
import dotenv from 'dotenv';


dotenv.config();

const userDetails = express.Router();
userDetails.get("/:User_id", verifyUserJwt, async (req, res) => {
    const { User_id } = req.params;

    try {
        const [rows] = await db.promise().query(
            "SELECT User_id, username, user_email FROM users WHERE User_id = ?",
            [User_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Send user details back
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Error fetching user details", error });
    }
});

userDetails.get("/:User_id/rental-overview", verifyUserJwt, async (req, res) => {
    const userId = req.params.User_id; // Get user ID from URL params

    try {
        // Get total rentals
        const totalRentalsQuery = "SELECT COUNT(*) AS totalRentals FROM orders WHERE user_id = ?";
        const [totalRentals] = await db.promise().query(totalRentalsQuery, [userId]);

        // Get currently rented vehicles
        const currentlyRentedQuery = "SELECT COUNT(*) AS currentlyRented FROM orders WHERE user_id = ? AND CURDATE() BETWEEN rent_start_date AND rent_end_date";
        const [currentlyRented] = await db.promise().query(currentlyRentedQuery, [userId]);

        // Get upcoming rentals
        const upcomingRentalsQuery = "SELECT * FROM orders WHERE user_id = ? AND rent_start_date > CURDATE()";
        const [upcomingRentals] = await db.promise().query(upcomingRentalsQuery, [userId]);

        // Get past rentals
        const pastRentalsQuery = "SELECT COUNT(*) AS pastRentals FROM orders WHERE user_id = ? AND rent_end_date < CURDATE()";
        const [pastRentals] = await db.promise().query(pastRentalsQuery, [userId]);

        res.status(200).json({
            totalRentals: totalRentals[0].totalRentals,
            currentlyRented: currentlyRented[0].currentlyRented,
            upcomingRentals,
            pastRentals: pastRentals[0].pastRentals,
        });
    } catch (error) {
        console.error("Error fetching rental overview:", error);
        res.status(500).json({ message: "Error fetching rental overview", error });
    }
});
//current rental details
userDetails.get('/current-rental-details/:userId', verifyUserJwt,async (req, res) => {
    try {
        const userId = req.params.userId;
        const query = `SELECT 
    o.rent_start_date, o.rent_end_date,v.vehicle_name, v.model, v.fuel_type, v.transmission, 
    o.grand_total, o.paid_status 
FROM orders o
JOIN vehicle v ON o.vehicle_id = v.vehicle_id 
WHERE o.user_id = ? 
AND CURDATE() BETWEEN o.rent_start_date AND o.rent_end_date;
`;

        const [results] = await db.promise().query(query, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ message: "No current rentals found." });
        }

        res.json(results);
    } catch (error) {
        console.error("Error fetching current rentals:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

userDetails.get('/upcoming-rental-details/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const query = `SELECT 
             o.rent_start_date, o.rent_end_date,v.vehicle_id,v.vehicle_name, v.model, v.fuel_type, v.transmission, 
             o.grand_total, o.paid_status 
            FROM orders o
            JOIN vehicle v ON o.vehicle_id = v.vehicle_id
            WHERE o.user_id = ? AND o.rent_start_date > CURDATE()`;

        const [results] = await db.promise().query(query, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ message: "No upcoming rentals found." });
        }

        res.json(results);
    } catch (error) {
        console.error("Error fetching upcoming rentals:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

userDetails.get('/past-rental-details/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const query = `SELECT 
             o.rent_start_date, o.rent_end_date,v.vehicle_id,v.vehicle_name, v.model, v.fuel_type, v.transmission, 
             o.grand_total, o.paid_status 
            FROM orders o
            JOIN vehicle v ON o.vehicle_id = v.vehicle_id
            WHERE o.user_id = ? AND o.rent_end_date < CURDATE()`;

        const [results] = await db.promise().query(query, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ message: "No past rentals found." });
        }

        res.json(results);
    } catch (error) {
        console.error("Error fetching past rentals:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


export default userDetails;