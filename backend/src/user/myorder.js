import express from "express";
import { db } from "../db.js"; // Database connection
import { verifyUserJwt } from "./jwtUser.js"; 
import dotenv from "dotenv";

dotenv.config();

const userOrder = express.Router();

userOrder.get("/:User_id", verifyUserJwt, async (req, res) => {
    const { User_id } = req.params;

    try {
        // Validate the User_id
        if (!User_id) {
            return res.status(400).json({ error: "User ID is required." });
        }

        // Query to fetch orders for the user, along with user details
        const query = `
            SELECT 
                o.order_id, 
                o.grand_total, 
                o.terms, 
                o.transaction_uuid, 
                o.paid_status, 
                o.delivered_status, 
                o.rent_start_date,
                o.rent_end_date,
                o.status,
                o.rental_days,
                o.created_at, 
                v.vehicle_name, 
                v.model,
                u.username, 
                u.user_phone, 
                u.user_email, 
                u.user_address
            FROM 
                orders o
            INNER JOIN 
                vehicle v 
            ON 
                o.vehicle_id = v.vehicle_id
            INNER JOIN
                users u
            ON
                o.User_id = u.User_id
            WHERE 
                o.User_id = ?;
        `;

        // Execute the query
        const [rows] = await db.promise().execute(query, [User_id]);

        // Check if orders exist
        if (rows.length === 0) {
            return res.status(404).json({ message: "No orders found for this user." });
        }

        // Send the orders with user details
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching user orders:", error.message);
        res.status(500).json({ error: "An error occurred while fetching orders." });
    }
});

export default userOrder;
