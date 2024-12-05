// import { db } from './db.js'; // Assuming you have a db.js file for your DB connection

// // Generate dummy data
// const generateDummyData = () => {
//   const data = [];
//   const startMonth = new Date('2024-10-29');  // Start date (12 months back from current date)

//   const userIds = [1, 2];  // User IDs will be either 1 or 2
//   const vehicleIds = [1, 2, 3, 21, 23, 24];  // Vehicle IDs will be repeated from this list
//   const paymentMethods = ['khalti', 'cod'];  // Only Khalti and COD as payment options

//   for (let i = 0; i < 7; i++) {
//     const currentMonth = new Date(startMonth);
//     currentMonth.setMonth(startMonth.getMonth() + i);  // Increment month by 1
//     const totalRevenue = Math.floor(Math.random() * (1000 - 60)) + 61;  // Random revenue between 61 and 999
//     const rentStartDate = new Date(currentMonth);
//     rentStartDate.setDate(1);  // Set rent start date to the 1st of the month
//     const rentEndDate = new Date(rentStartDate);
//     rentEndDate.setMonth(rentEndDate.getMonth() + 1);  // Rent ends 1 month after start

//     data.push({
//       user_id: userIds[i % userIds.length],  // Use user IDs 1 or 2
//       vehicle_id: vehicleIds[i % vehicleIds.length],  // Use vehicle IDs 1, 2, 3, 12, 14, 15 repeatedly
//       rent_start_date: rentStartDate.toISOString().slice(0, 10),  // Format YYYY-MM-DD
//       rent_end_date: rentEndDate.toISOString().slice(0, 10),  // Format YYYY-MM-DD
//       rental_days: Math.floor((rentEndDate - rentStartDate) / (1000 * 3600 * 24)),  // Calculate rental days
//       grand_total: totalRevenue,  // Ensure the total revenue is between 61 and 999
//       terms: 1,  // Terms set to true (1)
//       transaction_uuid: Math.random().toString(36).substring(2, 15),  // Random UUID
//       paid_status: 'paid',  // Example status
//       delivered_status: 'delivered',  // Example delivered status
//       status: 'completed',  // Example order status
//       licenseImage: 'image/path/to/license.jpg',  // Placeholder image path
//       payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],  // Randomly choose between 'khalti' and 'cod'
//       created_at: rentStartDate.toISOString().slice(0, 19).replace('T', ' '),  // Format to MySQL DATETIME
//       updated_at: rentStartDate.toISOString().slice(0, 19).replace('T', ' '),  // Format to MySQL DATETIME
//     });
//   }

//   return data;
// };

// // Insert dummy data into MySQL database
// const insertDummyData = () => {
//   const dummyData = generateDummyData();
  
//   dummyData.forEach(data => {
//     const {
//       user_id, vehicle_id, rent_start_date, rent_end_date, rental_days, grand_total, terms,
//       transaction_uuid, paid_status, delivered_status, status, licenseImage, payment_method, created_at, updated_at
//     } = data;

//     // Insert query
//     const query = `
//       INSERT INTO orders (
//         user_id, vehicle_id, rent_start_date, rent_end_date, rental_days, grand_total, terms, transaction_uuid,
//         paid_status, delivered_status, status, licenseImage, payment_method, created_at, updated_at
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
//     `;
    
//     // Execute the query
//     db.query(query, [
//       user_id, vehicle_id, rent_start_date, rent_end_date, rental_days, grand_total, terms,
//       transaction_uuid, paid_status, delivered_status, status, licenseImage, payment_method, created_at, updated_at
//     ], (err, results) => {
//       if (err) {
//         console.error('Error inserting data:', err);
//       } else {
//         console.log(`Inserted data for Order ID: ${results.insertId}`);
//       }
//     });
//   });
// };

// // Call function to insert the dummy data
// insertDummyData();
