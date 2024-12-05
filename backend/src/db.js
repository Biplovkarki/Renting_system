import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Explicit connection configuration with checks
export const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',       // Ensure host is correct
  user: process.env.DB_USER || 'root',           // Ensure user is 'root'
  password: process.env.DB_PASSWORD || '',       // Handle empty password
  database: process.env.DB_NAME || 'online_vehicle_renting',  // Ensure DB name is correct
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});
