import express from "express";
import { db } from "../db.js";
import cron from "node-cron";

const cronRouter = express.Router();

// Function to check and update rental status
async function checkAndUpdateRentalStatus() {
  try {
    const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    // Query to find vehicles with expired rent_end_date and approved status
    const [expiredVehicles] = await db.promise().query(
      `SELECT vehicle_id FROM vehicle_status 
       WHERE rent_end_date < ? AND status = 'approve'`,
      [currentDate]
    );

    if (expiredVehicles.length > 0) {
      const vehicleIds = expiredVehicles.map((vehicle) => vehicle.vehicle_id);

      // Update status to 'end_rental' for all expired and approved vehicles
      await db.promise().query(
        `UPDATE vehicle_status 
         SET status = 'end_rental_date' 
         WHERE vehicle_id IN (?)`,
        [vehicleIds]
      );

    //   console.log(`Updated status to 'end_rental' for vehicles: ${vehicleIds.join(", ")}`);
    } else {
    //   console.log("No expired rentals with approved status to update.");
    }
  } catch (error) {
    // console.error("Error checking and updating rental status:", error.message);
  }
}

// Schedule the cron job to run every 24 hours at midnight
cron.schedule("*/10 * * * * ", checkAndUpdateRentalStatus);  //0 0 * * *

cronRouter.get("/run-check", async (req, res) => {
  try {
    await checkAndUpdateRentalStatus();
    res.status(200).json({ message: "Rental status check executed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error executing rental status check.", error: error.message });
  }
});

export default cronRouter;
