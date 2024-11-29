import express from "express";
import { db } from "../db.js";
import { verifyUserJwt } from "../user/jwtUser.js";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const routerRent = express.Router();

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/rent_driving_license"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `licenseImage${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|jfif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpeg, jpg, png, gif, jfif) are allowed!"));
    }
  },
});

// Route to update rental details
// Route to update rental details
routerRent.patch(
  "/:user_id/:vehicle_id/:order_id",
  verifyUserJwt,
  upload.single("licenseImage"),
  async (req, res) => {
    const { user_id, vehicle_id, order_id } = req.params;
    const { rent_start_date, rent_end_date, terms } = req.body;
    const licenseImage = req.file ? req.file.path : null;

    // Ensure terms is a boolean
    const isTermsAccepted = terms === "true" || terms === true;

    // Validation for required fields
    if (!rent_start_date || !rent_end_date || !isTermsAccepted) {
      return res.status(400).json({ message: "All rental details are required." });
    }

    if (typeof isTermsAccepted !== "boolean") {
      return res.status(400).json({ message: "Invalid value for terms." });
    }

    try {
      await db.promise().beginTransaction();

      // Fetch the current order details
      const [orderDetails] = await db.promise().query(
        `SELECT rent_start_date, rent_end_date, terms, licenseImage, status FROM orders WHERE order_id = ?`,
        [order_id]
      );

      if (!orderDetails.length) {
        return res.status(404).json({ message: "Order not found." });
      }

      // Check if the order status is 'draft' or 'payment_pending'
      const { rent_start_date: orderStart, rent_end_date: orderEnd, terms: orderTerms, licenseImage: orderLicense, status } =
        orderDetails[0];

      if (status !== 'draft' && status !== 'payment_pending' && status !== 'expires') {
        return res.status(400).json({
          message: "Order cannot be updated unless the status is 'draft', 'payment_pending', or 'expires'.",
        });
      }

      // If the order already has rental details, reject the update
      if (orderStart && orderEnd && orderTerms && orderLicense) {
        return res.status(400).json({
          message: "Order already has rental details. Cannot update finalized order.",
        });
      }

      // Validate rental dates - cannot be in the past
      const currentDate = new Date();
      if (new Date(rent_start_date) < currentDate || new Date(rent_end_date) < currentDate) {
        return res.status(400).json({ message: "Rental dates cannot be in the past." });
      }

      // Calculate rental days
      const rentalDays =
        Math.ceil(
          (new Date(rent_end_date).getTime() - new Date(rent_start_date).getTime()) / (1000 * 60 * 60 * 24)
        );

      if (rentalDays <= 0) {
        return res.status(400).json({ message: "Invalid rental period." });
      }

      // Check if the vehicle is already rented during the requested period
      const [existingOrders] = await db.promise().query(
        `SELECT rent_start_date, rent_end_date, status FROM orders WHERE vehicle_id = ? AND status NOT IN ('canceled', 'expires') AND status IN ('completed', 'payment_pending', 'draft', 'expires') AND (
          (rent_start_date BETWEEN ? AND ?) OR 
          (rent_end_date BETWEEN ? AND ?) OR 
          (? BETWEEN rent_start_date AND rent_end_date) OR 
          (? BETWEEN rent_start_date AND rent_end_date)
        )`,
        [
          vehicle_id,
          rent_start_date, rent_end_date,
          rent_start_date, rent_end_date,
          rent_start_date, rent_end_date,
        ]
      );

      if (existingOrders.length > 0) {
        const conflictingOrder = existingOrders[0];
        
        // Allow updating the same dates for draft, payment_pending, or expires orders
        if (conflictingOrder.status === 'draft' || conflictingOrder.status === 'payment_pending' || conflictingOrder.status === 'expires') {
          // If it's the same date and the order is draft, payment_pending, or expires, no conflict
          if (conflictingOrder.rent_start_date === rent_start_date && conflictingOrder.rent_end_date === rent_end_date) {
            // No conflict, proceed with the update
          } else {
            return res.status(400).json({
              message: "Vehicle is already rented during the requested period.",
              conflictingDates: existingOrders,
            });
          }
        } else {
          return res.status(400).json({
            message: "Vehicle is already rented during the requested period.",
            conflictingDates: existingOrders,
          });
        }
      }

      // Fetch vehicle pricing details
      const [priceDetails] = await db.promise().query(
        `SELECT final_price, discounted_price FROM vehicle_status WHERE vehicle_id = ?`,
        [vehicle_id]
      );

      if (!priceDetails.length) {
        return res.status(404).json({ message: "Vehicle pricing details not found." });
      }

      const { final_price, discounted_price } = priceDetails[0];

      // Check if the discount is enabled
      const [discountDetails] = await db.promise().query(
        `SELECT is_enabled FROM discounts WHERE category_id = (SELECT category_id FROM vehicle WHERE vehicle_id = ?)`,
        [vehicle_id]
      );

      const isDiscountEnabled = discountDetails.length > 0 && discountDetails[0].is_enabled === 1;

      const dailyPrice = isDiscountEnabled ? discounted_price : final_price;

      // Calculate the grand total
      const grandTotal = parseFloat((dailyPrice * rentalDays).toFixed(2));

      // Update the orders table with new rental details
      await db.promise().query(
        `UPDATE orders SET rent_start_date = ?, rent_end_date = ?, terms = ?, licenseImage = ?, status = 'payment_pending', rental_days = ?, grand_total = ? WHERE order_id = ?`,
        [rent_start_date, rent_end_date, isTermsAccepted, licenseImage, rentalDays, grandTotal, order_id]
      );

      await db.promise().commit();

      res.status(200).json({
        message: "Rental details updated successfully.",
        rentalDetails: {
          order_id,
          user_id,
          vehicle_id,
          rent_start_date,
          rent_end_date,
          rental_days: rentalDays,
          terms: isTermsAccepted,
          licenseImage,
          status: "payment_pending",
          grand_total: grandTotal,
        },
      });
    } catch (error) {
      await db.promise().rollback();
      console.error("Error updating rental details:", error);
      res.status(500).json({ message: "Error updating rental details.", error: error.message });
    }
  }
);


// Route to handle COD (Cash on Delivery) payment
routerRent.patch("/cod/:order_id", verifyUserJwt, async (req, res) => {
  const { order_id } = req.params;

  try {
    await db.promise().beginTransaction();

    // Fetch the current order details
    const [orderDetails] = await db.promise().query(
      `SELECT status, paid_status, transaction_uuid, vehicle_id FROM orders WHERE order_id = ?`,
      [order_id]
    );

    if (!orderDetails.length) {
      return res.status(404).json({ message: "Order not found." });
    }

    const { status, paid_status, transaction_uuid, vehicle_id } = orderDetails[0];

    // Check if the order is already paid or completed
    if (status === 'completed' || paid_status === 1) {
      return res.status(400).json({ message: "Order is already completed or paid." });
    }

    // Update the order to reflect COD status
    await db.promise().query(
      `UPDATE orders
       SET status = 'completed', paid_status = 'pending', delivered_status='not_delivered', transaction_uuid = 'N/A',payment_method = 'COD'
       WHERE order_id = ?`,
      [order_id]
    );

    // Update the vehicle status availability to 1 (available)
    await db.promise().query(
      `UPDATE vehicle_status
       SET availability = 1
       WHERE vehicle_id = ?`,
      [vehicle_id]
    );

    await db.promise().commit();

    res.status(200).json({
      message: "Order updated successfully with COD payment, and vehicle is now available.",
      order_id,
      status: "completed",
      paid_status: 0,
      transaction_uuid: "N/A",
    });
  } catch (error) {
    await db.promise().rollback();
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Error processing COD payment.", error: error.message });
  }
});

export default routerRent;