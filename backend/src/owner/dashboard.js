import express from 'express';
import { db } from '../db.js';
import { verifyJwt } from './jwtOwner.js';
import dotenv from 'dotenv';

dotenv.config();

const orderDetailsForOwner = express.Router();

// Middleware to validate owner access
const validateOwnerAccess = async (req, res, next) => {
    const { owner_id, vehicle_id } = req.params;
    
    try {
        // Verify vehicle belongs to the owner
        const [vehicles] = await db.promise().query(
            "SELECT * FROM vehicle WHERE owner_id = ? AND vehicle_id = ?",
            [owner_id, vehicle_id]
        );

        if (vehicles.length === 0) {
            return res.status(403).json({ 
                message: "Unauthorized access to vehicle details" 
            });
        }
        
        next();
    } catch (error) {
        console.error("Access validation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET owner's vehicles
orderDetailsForOwner.get('/:owner_id', verifyJwt, async (req, res) => {
    const { owner_id } = req.params;

    try {
        const [vehicles] = await db.promise().query(
            "SELECT vehicle_id, vehicle_name, model, fuel_type, transmission FROM vehicle WHERE owner_id = ?",
            [owner_id]
        );

        if (vehicles.length === 0) {
            return res.status(404).json({ 
                message: "No vehicles found for this owner" 
            });
        }

        res.json(vehicles);
    } catch (error) {
        console.error("Vehicle fetch error:", error);
        res.status(500).json({ 
            message: "Error fetching vehicle details" 
        });
    }
});

// Rental overview endpoint
orderDetailsForOwner.get('/:owner_id/:vehicle_id/rental-overview', 
    [verifyJwt, validateOwnerAccess], 
    async (req, res) => {
    const { owner_id, vehicle_id } = req.params;

    try {
        const queries = {
            totalRentals: `
                SELECT COUNT(*) AS count 
                FROM orders o
                JOIN vehicle v ON o.vehicle_id = v.vehicle_id
                WHERE v.owner_id = ? AND o.vehicle_id = ?
            `,
            currentlyRented: `
                SELECT COUNT(*) AS count 
                FROM orders o
                JOIN vehicle v ON o.vehicle_id = v.vehicle_id
                WHERE v.owner_id = ? AND o.vehicle_id = ? 
                AND CURDATE() BETWEEN o.rent_start_date AND o.rent_end_date
            `,
            upcomingRentals: `
                SELECT COUNT(*) AS count 
                FROM orders o
                JOIN vehicle v ON o.vehicle_id = v.vehicle_id
                WHERE v.owner_id = ? AND o.vehicle_id = ? 
                AND o.rent_start_date > CURDATE()
            `,
            pastRentals: `
                SELECT COUNT(*) AS count 
                FROM orders o
                JOIN vehicle v ON o.vehicle_id = v.vehicle_id
                WHERE v.owner_id = ? AND o.vehicle_id = ? 
                AND o.rent_end_date < CURDATE()
            `
        };

        const results = {};
        for (const [key, query] of Object.entries(queries)) {
            const [rows] = await db.promise().query(query, [owner_id, vehicle_id]);
            results[key] = rows[0].count;
        }

        res.json({
            totalRentals: results.totalRentals,
            currentlyRented: results.currentlyRented,
            upcomingRentals: results.upcomingRentals,
            pastRentals: results.pastRentals,
        });
    } catch (error) {
        console.error("Rental overview error:", error);
        res.status(500).json({ message: "Error fetching rental overview" });
    }
});

// Common rental details query function
const getRentalDetails = async (owner_id, vehicle_id, dateCondition) => {
    const query = `
        SELECT 
            o.order_id,
            o.rent_start_date, 
            o.rent_end_date, 
            v.vehicle_name, 
            v.model, 
            v.fuel_type, 
            v.transmission, 
            o.grand_total, 
            o.paid_status,
            u.username,
            u.user_phone
        FROM orders o
        JOIN vehicle v ON o.vehicle_id = v.vehicle_id 
        JOIN users u ON o.User_id = u.User_id
        WHERE o.vehicle_id = ? AND v.owner_id = ? 
        ${dateCondition}
        ORDER BY o.rent_start_date DESC
    `;

    return await db.promise().query(query, [vehicle_id, owner_id]);
};

// Current rental details
orderDetailsForOwner.get('/:owner_id/:vehicle_id/current-rental-details', 
    [verifyJwt, validateOwnerAccess], 
    async (req, res) => {
    try {
        const { owner_id, vehicle_id } = req.params;
        const [results] = await getRentalDetails(
            owner_id, 
            vehicle_id, 
            'AND CURDATE() BETWEEN o.rent_start_date AND o.rent_end_date'
        );

        res.json(results);
    } catch (error) {
        console.error("Current rentals error:", error);
        res.status(500).json({ message: "Error fetching current rentals" });
    }
});

// Upcoming rental details
orderDetailsForOwner.get('/:owner_id/:vehicle_id/upcoming-rental-details', 
    [verifyJwt, validateOwnerAccess], 
    async (req, res) => {
    try {
        const { owner_id, vehicle_id } = req.params;
        const [results] = await getRentalDetails(
            owner_id, 
            vehicle_id, 
            'AND o.rent_start_date > CURDATE()'
        );

        res.json(results);
    } catch (error) {
        console.error("Upcoming rentals error:", error);
        res.status(500).json({ message: "Error fetching upcoming rentals" });
    }
});

// Past rental details
orderDetailsForOwner.get('/:owner_id/:vehicle_id/past-rental-details', 
    [verifyJwt, validateOwnerAccess], 
    async (req, res) => {
    try {
        const { owner_id, vehicle_id } = req.params;
        const [results] = await getRentalDetails(
            owner_id, 
            vehicle_id, 
            'AND o.rent_end_date < CURDATE()'
        );

        res.json(results);
    } catch (error) {
        console.error("Past rentals error:", error);
        res.status(500).json({ message: "Error fetching past rentals" });
    }
});

// Optional: Detailed rental statistics
orderDetailsForOwner.get('/:owner_id/:vehicle_id/rental-statistics', 
    [verifyJwt, validateOwnerAccess], 
    async (req, res) => {
    const { owner_id, vehicle_id } = req.params;

    try {
        const statisticsQuery = `
            SELECT 
                COUNT(*) as total_rentals,
                SUM(grand_total) as total_revenue,
                AVG(grand_total) as average_rental_price,
                MIN(rent_start_date) as first_rental,
                MAX(rent_end_date) as last_rental
            FROM orders o
            JOIN vehicle v ON o.vehicle_id = v.vehicle_id
            WHERE v.owner_id = ? AND o.vehicle_id = ?
        `;

        const [statistics] = await db.promise().query(statisticsQuery, [owner_id, vehicle_id]);

        res.json(statistics[0]);
    } catch (error) {
        console.error("Rental statistics error:", error);
        res.status(500).json({ message: "Error fetching rental statistics" });
    }
});

// API route to fetch distinct rented vehicles categorized by time
orderDetailsForOwner.get('/:ownerId/rented-vehicles', async (req, res) => {
    const { ownerId } = req.params;

    // SQL query to count distinct vehicles in current, past, and future rentals
    const query = `
        SELECT
            o.owner_id,
            COUNT(DISTINCT CASE 
                WHEN CURDATE() BETWEEN ord.rent_start_date AND ord.rent_end_date THEN ord.vehicle_id 
                ELSE NULL 
            END) AS current_rentals,
            COUNT(DISTINCT CASE 
                WHEN ord.rent_end_date < CURDATE() THEN ord.vehicle_id 
                ELSE NULL 
            END) AS past_rentals,
            COUNT(DISTINCT CASE 
                WHEN ord.rent_start_date > CURDATE() THEN ord.vehicle_id 
                ELSE NULL 
            END) AS future_rentals
        FROM
            owners o
        JOIN
            vehicle v ON o.owner_id = v.owner_id
        JOIN
            orders ord ON v.vehicle_id = ord.vehicle_id
        WHERE
            o.owner_id = ?
            AND ord.paid_status = 'Paid'
        GROUP BY
            o.owner_id;
    `;

    try {
        const [rows] = await db.promise().query(query, [ownerId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No rental data found for this owner' });
        }

        res.status(200).json(rows[0]); // Return the rental data
    } catch (error) {
        console.error('Error fetching rental data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default orderDetailsForOwner;