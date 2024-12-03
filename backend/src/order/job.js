import cron from 'node-cron';
import { db } from "../db.js";

async function checkAndInsertTransactions() {
    const query = `
      SELECT 
        o.order_id,
        o.vehicle_id,
        o.grand_total,
        v.owner_id,          -- Fetching owner_id from vehicle table
        v.vehicle_name,
        v.model
      FROM orders o
      INNER JOIN vehicle v ON o.vehicle_id = v.vehicle_id
      WHERE o.status = 'completed'
        AND o.paid_status = 'paid'`;

    try {
        // Fetch completed and paid orders with owner details
        const [orders] = await db.promise().query(query);

        // Check if there are no orders found
        if (orders.length === 0) {
           // console.log('No successful orders found.');
            return;
        }

        // Loop through each order to insert into transactions table
        for (let order of orders) {
            const { order_id, vehicle_id, grand_total, owner_id } = order;

            // Check if the transaction already exists
            const checkQuery = `SELECT * FROM transactions WHERE order_id = ?`;
            const [existingTransaction] = await db.promise().query(checkQuery, [order_id]);

            if (existingTransaction.length > 0) {
                // If transaction already exists, skip to the next order
               // console.log(`Transaction already exists for order_id: ${order_id}`);
                continue;
            }

            // Calculate earnings (80% for owner, 20% for admin)
            let owner_earning = grand_total * 0.8; // 80% for owner
            let admin_earning = grand_total * 0.2; // 20% for admin

            // Round off the earnings to 2 decimal places
            owner_earning = Math.round(owner_earning * 100) / 100;  // Round to 2 decimal places
            admin_earning = Math.round(admin_earning * 100) / 100;  // Round to 2 decimal places

            // Insert the new transaction into the transactions table
            const insertQuery = `
                INSERT INTO transactions (Owner_id, vehicle_id, order_id, owner_earning, admin_earning, payment_status)
                VALUES (?, ?, ?, ?, ?, 'due')`;

            await db.promise().execute(insertQuery, [owner_id, vehicle_id, order_id, owner_earning, admin_earning]);
            //console.log(`Transaction inserted for order_id: ${order_id}`);
        }
    } catch (error) {
        console.error('Error processing transactions:', error);
    }
}

// Schedule the function to run every 10 seconds
cron.schedule('*/10 * * * * ', async () => {
//console.log('Checking and inserting transactions...');
    await checkAndInsertTransactions();
});
