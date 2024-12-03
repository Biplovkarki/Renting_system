import express from 'express';
import { db } from '../db.js';
import { verifyJwtAdmin } from './jwtAdmin.js';

export const transactionsRouter = express.Router();

// Fetch all transactions with owner and vehicle details
transactionsRouter.get('/', verifyJwtAdmin, async (req, res) => {
    try {
        // SQL query to join transactions with owners and vehicles
        const query = `
            SELECT 
                t.transaction_id,
                t.Owner_id,
                t.vehicle_id,
                t.order_id,
                t.owner_earning,
                t.admin_earning,
                t.payment_status,
                t.created_at,
                t.payment_made_at,
                o.ownername,
                o.own_email,
                o.own_phone,
                v.vehicle_name,
                SUM(t.admin_earning) AS total_admin_earning  -- Sum of admin earnings
            FROM 
                transactions t
            LEFT JOIN 
                owners o ON t.Owner_id = o.owner_id
            LEFT JOIN 
                vehicle v ON t.vehicle_id = v.vehicle_id
            GROUP BY
                t.transaction_id, t.Owner_id, t.vehicle_id, t.order_id, t.owner_earning, t.admin_earning, 
                t.payment_status, t.created_at, t.payment_made_at, o.ownername, o.own_email, o.own_phone, v.vehicle_name
            ORDER BY 
                t.created_at DESC;
        `;

        // Execute the query
        const [results] = await db.promise().query(query);

        // Return the results
        res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions.',
        });
    }
});



// Delete a transaction using the order_id
transactionsRouter.delete('/:transactionId', verifyJwtAdmin, async (req, res) => {
    const { transactionId } = req.params;

    try {
        // SQL query to delete the transaction
        const query = `
            DELETE FROM transactions
            WHERE transaction_id = ?;
        `;

        // Execute the query
        const [result] = await db.promise().query(query, [transactionId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found.',
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete transaction.',
        });
    }
});

transactionsRouter.put('/:transactionId', verifyJwtAdmin, async (req, res) => {
    const { transactionId } = req.params; // Get transactionId from URL params
    const { payment_status } = req.body;

    // Log transactionId to verify it's being passed correctly
    console.log('Received transactionId:', transactionId);

    // Ensure that payment_status is provided
    if (payment_status === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Missing required field: payment_status.',
        });
    }

    try {
        // Construct the query to update payment_status and set payment_made_at to NOW()
        const query = `
            UPDATE transactions
            SET 
                payment_status = ?,
                payment_made_at = NOW()
            WHERE transaction_id = ?;
        `;
        
        // Execute the query
        const [result] = await db.promise().query(query, [payment_status, transactionId]);

        // If no rows were affected, the transaction_id was not found
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found.',
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully.',
        });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update transaction.',
        });
    }
});
