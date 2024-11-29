import express from 'express';
import { verifyUserJwt } from '../user/jwtUser.js';
import { db } from '../db.js';

const orderRouter = express.Router();

// Helper function to check if an order has expired (5 minutes)
const checkIfOrderExpired = (orderCreationTime) => {
    const expirationTimeMs = 10 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() - new Date(orderCreationTime).getTime() > expirationTimeMs;
};

// Route to create or handle existing orders
orderRouter.post('/create', verifyUserJwt, async (req, res) => {
    const { user_id, vehicle_id } = req.body;

    // Input validation
    if (!user_id || !vehicle_id || isNaN(parseInt(user_id)) || isNaN(parseInt(vehicle_id))) {
        return res.status(400).json({ message: 'User ID and Vehicle ID are required and must be numbers.' });
    }

    try {
        // Check if the user has required fields filled in
        const [userResult] = await db.promise().query(`
            SELECT username, user_email, user_phone, user_image, user_address 
            FROM users WHERE user_id = ?
        `, [user_id]);

        // If any required field is missing, return an error message
        const missingFields = [];
        if (!userResult[0].username) missingFields.push('Name');
        if (!userResult[0].user_email) missingFields.push('Email');
        if (!userResult[0].user_phone) missingFields.push('Phone');
        if (!userResult[0].user_image) missingFields.push('Image');
        if (!userResult[0].user_address) missingFields.push('Address');

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Please complete your profile. Missing fields: ${missingFields.join(', ')}.`,
            });
        }

        await db.promise().beginTransaction();

        // Check for existing expired or cancelled orders (allow creation if they exist)
        const [existingOrderResult] = await db.promise().query(`
            SELECT order_id, status, created_at
            FROM orders 
            WHERE user_id = ? AND vehicle_id = ? 
            AND status IN ('expires', 'cancelled')
        `, [user_id, vehicle_id]);

        // If an expired or cancelled order exists, allow creating a new order
        if (existingOrderResult.length > 0) {
            const existingOrder = existingOrderResult[0];

            // Handle expired orders: Change status to 'draft' and update vehicle availability
            if (checkIfOrderExpired(existingOrder.created_at)) {
                await db.promise().query(`
                    UPDATE orders SET status = 'expires' WHERE order_id = ? 
                `, [existingOrder.order_id]);

                // Optionally, update vehicle availability back to available if needed
                await db.promise().query(`
                    UPDATE vehicle_status SET availability = 1 WHERE vehicle_id = ? 
                `, [vehicle_id]);
            }

            // Handle cancelled orders: Keep them as cancelled or delete them, but allow new order
            if (existingOrder.status === 'cancelled') {
                await db.promise().query(`
                    DELETE FROM orders WHERE order_id = ? 
                `, [existingOrder.order_id]);

                // Optionally, update vehicle availability back to available
                await db.promise().query(`
                    UPDATE vehicle_status SET availability = 1 WHERE vehicle_id = ? 
                `, [vehicle_id]);
            }
        }

        // Check if an active order exists (to avoid creating a new order when there is already an active one)
        const [activeOrderResult] = await db.promise().query(`
            SELECT order_id, status 
            FROM orders 
            WHERE user_id = ? AND vehicle_id = ? 
            AND status IN ('draft', 'payment_pending')
        `, [user_id, vehicle_id]);

        if (activeOrderResult.length > 0) {
            return res.status(400).json({
                message: 'You already have an active order for this vehicle.',
                orderId: activeOrderResult[0].order_id,
                status: activeOrderResult[0].status
            });
        }

        // Create a new order with status 'draft'
        const [results] = await db.promise().query(`
            INSERT INTO orders (user_id, vehicle_id, status, created_at) 
            VALUES (?, ?, 'draft', NOW())
            ON DUPLICATE KEY UPDATE status = 'draft', created_at = NOW();
        `, [user_id, vehicle_id]);

        const orderId = results.insertId || results.affectedRows; // Handle both insert and update cases

        // Update vehicle availability to unavailable (since it's now reserved)
        await db.promise().query(`
            UPDATE vehicle_status SET availability = 0 WHERE vehicle_id = ?;
        `, [vehicle_id]);

        await db.promise().commit();

        // Set expiration time to 5 minutes from now
        const expirationDate = new Date(Date.now() + 10 * 60 * 1000);

        res.status(201).json({
            message: 'Order created successfully',
            orderId: orderId,
            alert: 'You have 5 minutes to complete the rental process.',
            expirationTime: expirationDate.toISOString()
        });
    } catch (error) {
        await db.promise().rollback();
        console.error('Error creating order:', error);
        return res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});


// Route to cancel an order
orderRouter.post('/cancel', verifyUserJwt, async (req, res) => {
    const { order_id, user_id } = req.body;

    // Input validation
    if (!order_id || !user_id || isNaN(parseInt(order_id)) || isNaN(parseInt(user_id))) {
        return res.status(400).json({ message: 'Order ID and User ID are required and must be valid numbers.' });
    }

    try {
        await db.promise().beginTransaction();

        // Check if the order exists and belongs to the user
        const [orderResult] = await db.promise().query(`
            SELECT vehicle_id, status FROM orders WHERE order_id = ? AND user_id = ?
        `, [order_id, user_id]);

        if (orderResult.length === 0) {
            return res.status(404).json({ message: 'Order not found or does not belong to the user.' });
        }

        const { vehicle_id, status } = orderResult[0];

        // Only allow cancelling if the order is in 'draft' or 'payment_pending' status
        if (!['draft', 'payment_pending'].includes(status)) {
            return res.status(400).json({
                message: `Order cannot be cancelled as its status is '${status}'.`
            });
        }

        // Update the order status to 'cancelled'
        await db.promise().query(`
            UPDATE orders SET status = 'cancelled' WHERE order_id = ?
        `, [order_id]);

        // Update the vehicle availability to available
        await db.promise().query(`
            UPDATE vehicle_status SET availability = 1 WHERE vehicle_id = ?
        `, [vehicle_id]);

        await db.promise().commit();

        res.status(200).json({ message: 'Order cancelled successfully.' });
    } catch (error) {
        await db.promise().rollback();
        console.error('Error cancelling order:', error);
        return res.status(500).json({ message: 'Error cancelling order.', error: error.message });
    }
});

// Route to get order details
orderRouter.get('/get-order/:user_id/:vehicle_id', (req, res) => {
    const { user_id, vehicle_id } = req.params;

    const query = `
        SELECT * FROM orders
        WHERE user_id = ? AND vehicle_id = ? AND (status = 'draft' OR status = 'payment_pending')
    `;
    
    db.query(query, [user_id, vehicle_id], (err, results) => {
        if (err) {
            console.error('Error fetching order:', err);
            return res.status(500).json({ message: 'Error fetching order details' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No draft or payment pending order found' });
        }

        res.json(results[0]);
    });
});

orderRouter.get('/status/:user_id/:vehicle_id/:order_id', verifyUserJwt, async (req, res) => {
    const { user_id, vehicle_id, order_id } = req.params;

    // Improved input validation using Number() instead of parseInt()
    if (isNaN(Number(user_id)) || isNaN(Number(vehicle_id)) || isNaN(Number(order_id))) {
        return res.status(400).json({ message: 'User ID, Vehicle ID, and Order ID are required and must be numbers.' });
    }

    try {
        // Query to fetch the order status for the specific user, vehicle, and order
        const [results] = await db.promise().query(`
            SELECT status FROM orders WHERE user_id = ? AND vehicle_id = ? AND order_id = ?
        `, [user_id, vehicle_id, order_id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No order found for the provided user, vehicle, and order ID.' });
        }

        res.json({ status: results[0].status, message: 'Order status fetched successfully.' });
    } catch (error) {
        console.error('Error fetching order status:', error);
        res.status(500).json({ message: 'Error fetching order status.', error: error.message });
    }
});


// Background check for expired and cancelled orders every second
const updateExpiredAndCancelledOrders = async () => {
    try {
        // Fetch both expired (draft) and cancelled orders
        const [expiredAndCancelledOrders] = await db.promise().query(`
            SELECT order_id, vehicle_id, status, created_at
            FROM orders
            WHERE status IN ('draft', 'cancelled', 'expires','payment_pending')
        `);

        for (const order of expiredAndCancelledOrders) {
            const { order_id, vehicle_id, status, created_at } = order;

            // Handle expired orders (draft or payment_pending)
            if (status === 'draft' || status === 'payment_pending') {
                if (checkIfOrderExpired(created_at)) {
                    // Update the order status to 'expires' and the vehicle availability to available
                    await db.promise().query(`
                        UPDATE orders SET status = 'expires' WHERE order_id = ?
                    `, [order_id]);

                    await db.promise().query(`
                        UPDATE vehicle_status SET availability = 1 WHERE vehicle_id = ?
                    `, [vehicle_id]);
                }
            }

            // Handle cancelled orders: delete them and update vehicle availability
            if (status === 'cancelled' || status === 'expires' ) {
                // Delete the cancelled order from the database
                await db.promise().query(`
                    DELETE FROM orders WHERE order_id = ?
                `, [order_id]);

                // Update the vehicle availability to available
                await db.promise().query(`
                    UPDATE vehicle_status SET availability = 1 WHERE vehicle_id = ?
                `, [vehicle_id]);
            }
        }
    } catch (error) {
        console.error('Error updating expired or cancelled orders:', error);
    }
};


// Set interval to check and update expired or cancelled orders every second
setInterval(updateExpiredAndCancelledOrders, 1000); // 1000 milliseconds = 1 second

export default orderRouter;
