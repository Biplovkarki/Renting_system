import express from "express";
import { db } from "../db.js";  
import fs from "fs";
import multer from "multer";
import { verifyJwt } from "./jwtOwner.js";

// Define the upload directory
const filepath = 'uploads/vehicle';

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(filepath)) {
            fs.mkdirSync(filepath, { recursive: true });
        }
        cb(null, filepath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extensionArray = file.originalname.split('.');
        const extension = extensionArray[extensionArray.length - 1];
        cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
    },
});

const upload = multer({ storage });
const vehicleRouter = express.Router();

// API route to add vehicle, vehicle documents, and vehicle status
vehicleRouter.post('/add-vehicle', verifyJwt, upload.fields([
    { name: 'image_right', maxCount: 1 },
    { name: 'image_left', maxCount: 1 },
    { name: 'image_back', maxCount: 1 },
    { name: 'image_front', maxCount: 1 },
    { name: 'bluebook_image', maxCount: 1 },
    { name: 'identity_image', maxCount: 1 }
]), async (req, res) => {
    const {
        owner_id,
        category_id,
        vehicle_name,
        model,
        cc,
        color,
        transmission,
        fuel_type,
        bluebook_number,
        last_renewed,
        tax_paid_until,
        insurance_expiry,
        vin_number,
        registration_number,
        final_price,
        discount_id,
        terms,
        rent_start_date,
        rent_end_date,
        status = 'pending'
    } = req.body;

    // Validate fields
    const validStatuses = ['approve', 'pending', 'reject'];
    const validTransmissions = ['Automatic', 'Manual'];
    const validFuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
    
    if (!validStatuses.includes(status) || !validTransmissions.includes(transmission) || !validFuelTypes.includes(fuel_type)) {
        return res.status(400).json({ message: "Invalid status, transmission, or fuel type value" });
    }

    // Retrieve file paths if files were uploaded
    const image_right = req.files?.image_right?.[0]?.path ?? null;
    const image_left = req.files?.image_left?.[0]?.path ?? null;
    const image_back = req.files?.image_back?.[0]?.path ?? null;
    const image_front = req.files?.image_front?.[0]?.path ?? null;
    const bluebook_image = req.files?.bluebook_image?.[0]?.path ?? null;
    const identity_image = req.files?.identity_image?.[0]?.path ?? null;

    try {
        // Retrieve price information for the category
        const [priceRow] = await db.promise().query(`
            SELECT price_id, min_price, max_price 
            FROM prices 
            WHERE category_id = ?`, [category_id]);

        if (!priceRow.length) {
            return res.status(400).json({ message: "No price found for the specified category" });
        }

        const { price_id, min_price, max_price } = priceRow[0];

        // Check final_price is within the specified range
        const finalPriceNum = parseFloat(final_price);
        if (isNaN(finalPriceNum)) {
            return res.status(400).json({ message: "Invalid final price: Not a number" });
        }
        if (finalPriceNum < min_price || finalPriceNum > max_price) {
            return res.status(400).json({ message: `Final price must be between ${min_price} and ${max_price}` });
        }

        // Determine discounted price
        let discounted_price = final_price;

        if (discount_id) {
            // If specific discount is provided, use that
            const [discountRow] = await db.promise().query(`
                SELECT discount_percentage 
                FROM discounts 
                WHERE discount_id = ?`, [discount_id]);

            if (discountRow.length > 0) {
                discounted_price -= (final_price * discountRow[0].discount_percentage) / 100;
            } else {
                return res.status(400).json({ message: "Invalid discount ID" });
            }
        } else {
            // Check for category discount if no specific discount provided
            const [categoryDiscountRow] = await db.promise().query(`
                SELECT discount_percentage 
                FROM discounts 
                WHERE category_id = ?`, [category_id]);

            if (categoryDiscountRow.length > 0) {
                discounted_price -= (final_price * categoryDiscountRow[0].discount_percentage) / 100;
            }
        }

        // Safety check to ensure non-negative price
        if (discounted_price < 0) discounted_price = 0;

        // Insert vehicle data into the vehicle table
        const vehicleSql = `
            INSERT INTO vehicle 
            (owner_id, category_id, vehicle_name, model, cc, color, transmission, fuel_type, image_right, image_left, image_back, image_front)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const vehicleValues = [owner_id, category_id, vehicle_name, model, cc, color, transmission, fuel_type, image_right, image_left, image_back, image_front];
        const [vehicleResult] = await db.promise().query(vehicleSql, vehicleValues);
        const vehicle_id = vehicleResult.insertId;

        // Insert vehicle document data into vehicle_document table
        const documentSql = `
            INSERT INTO vehicle_document 
            (vehicle_id, bluebook_number, last_renewed, tax_paid_until, insurance_expiry, vin_number, registration_number, bluebook_image, identity_image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const documentValues = [vehicle_id, bluebook_number, last_renewed, tax_paid_until, insurance_expiry, vin_number, registration_number, bluebook_image, identity_image];
        await db.promise().query(documentSql, documentValues);

        // Insert data into vehicle_status table including rent start and end dates, status, terms, and default availability
        const statusSql = `
            INSERT INTO vehicle_status 
            (vehicle_id, price_id, final_price, discounted_price, status, terms, discount_id, rent_start_date, rent_end_date, availability)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const statusValues = [vehicle_id, price_id, final_price, discounted_price, status, terms, discount_id, rent_start_date, rent_end_date, 1]; // Default availability to 1
        await db.promise().query(statusSql, statusValues);

        res.status(201).json({ message: 'Vehicle, vehicle document, and vehicle status added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding vehicle and document', error: err });
    }
});

export default vehicleRouter;
