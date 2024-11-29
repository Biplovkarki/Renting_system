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
        // rent_start_date,
        // rent_end_date,
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
        // Check if category exists before proceeding
        const [categoryCheck] = await db.promise().query(`
            SELECT 1 FROM categories WHERE category_id = ?`, [category_id]);

        if (!categoryCheck.length) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

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
        let discounted_price = finalPriceNum;

        if (discount_id) {
            // If specific discount is provided, use that
            const [discountRow] = await db.promise().query(`
                SELECT discount_percentage 
                FROM discounts 
                WHERE discount_id = ?`, [discount_id]);

            if (discountRow.length > 0) {
                discounted_price -= (finalPriceNum * discountRow[0].discount_percentage) / 100;
            } else {
                return res.status(400).json({ message: "Invalid discount ID" });
            }
        } else {
            // Apply category discount if no specific discount_id is provided
            const [categoryDiscountRow] = await db.promise().query(`
                SELECT discount_percentage 
                FROM discounts 
                WHERE category_id = ?`, [category_id]);

            if (categoryDiscountRow.length > 0) {
                discounted_price -= (finalPriceNum * categoryDiscountRow[0].discount_percentage) / 100;
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
            (vehicle_id, price_id, final_price, discounted_price, status, terms, discount_id,  availability)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const statusValues = [vehicle_id, price_id, finalPriceNum, discounted_price, status, terms, discount_id,  1]; // Default availability to 1
        await db.promise().query(statusSql, statusValues);

        res.status(201).json({ message: 'Vehicle, vehicle document, and vehicle status added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding vehicle and document', error: err });
    }
});

vehicleRouter.get('/vehicles/:owner_id', verifyJwt, async (req, res) => {
    try {
        const ownerId = req.params.owner_id; // Owner ID from the URL params


        // Ensure the owner is only accessing their data
        if (!ownerId) {
            return res.status(403).json({ message: 'Access denied. Unauthorized to view these vehicles.' });
        }

        const [rows] = await db.promise().query(`
            SELECT 
                v.vehicle_id,
                v.owner_id,
                v.category_id,
                v.vehicle_name,
                v.model,
                v.cc,
                v.color,
                v.transmission,
                v.fuel_type,
                v.image_right,
                v.image_left,
                v.image_back,
                v.image_front,
                v.created_at AS vehicle_created_at,
                
                vd.document_id,
                vd.bluebook_number,
                vd.last_renewed,
                vd.tax_paid_until,
                vd.insurance_expiry,
                vd.vin_number,
                vd.registration_number,
                vd.bluebook_image,
                vd.identity_image,
                vd.created_at AS document_created_at,
                
                vs.vehicle_status_id,
                vs.price_id,
                vs.final_price,
                vs.discounted_price,
                vs.status,
                vs.terms,
                vs.created_at AS status_created_at,
                vs.discount_id,
                vs.rent_start_date,
                vs.rent_end_date,
                vs.availability,
                
                o.ownername AS owner_name,
                c.category_name AS category_name
            FROM vehicle v
            LEFT JOIN vehicle_document vd ON v.vehicle_id = vd.vehicle_id
            LEFT JOIN vehicle_status vs ON v.vehicle_id = vs.vehicle_id
            LEFT JOIN owners o ON v.owner_id = o.owner_id
            LEFT JOIN categories c ON v.category_id = c.category_id
            WHERE v.owner_id = ?
        `, [ownerId]);

        if (rows.length === 0) {
            return res.status(204).json({ message: 'No vehicles found.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching vehicle data:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});



// Route to update only the status and availability fields in vehicle_status
// vehicleRoutes.put('/vehicles/:vehicle_id', verifyJwtAdmin, async (req, res) => {
//     const { vehicle_id } = req.params;
//     const { status, availability } = req.body;

//     // Check if either 'status' or 'availability' field is provided
//     if (status === undefined && availability === undefined) {
//         return res.status(400).json({ message: 'Please provide at least one field to update.' });
//     }

//     try {
//         // Start transaction
//         await db.promise().query('START TRANSACTION');

//         // Construct the update query conditionally
//         let updateQuery = 'UPDATE vehicle_status SET ';
//         const updateValues = [];
//         let needsComma = false;

//         if (status !== undefined) {
//             updateQuery += 'status = ?';
//             updateValues.push(status);
//             needsComma = true;
//         }

//         if (availability !== undefined) {
//             updateQuery += (needsComma ? ', ' : '') + 'availability = ?';
//             updateValues.push(availability);
//         }

//         // Add WHERE clause to target the specific vehicle
//         updateQuery += ' WHERE vehicle_id = ?';
//         updateValues.push(vehicle_id);

//         // Log final query and values
//         console.log('Final Query:', updateQuery);
//         console.log('Update Values:', updateValues);

//         // Execute the update query
//         await db.promise().query(updateQuery, updateValues);

//         // Commit the transaction
//         await db.promise().query('COMMIT');
//         res.status(200).json({ message: 'Vehicle status and availability updated successfully.' });
//     } catch (error) {
//         // Rollback transaction in case of error
//         await db.promise().query('ROLLBACK');
//         console.error('Error updating vehicle status:', error);
//         res.status(500).json({ message: 'Failed to update vehicle status and availability. Please try again later.' });
//     }
// });





export default vehicleRouter;
