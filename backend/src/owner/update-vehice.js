import express from "express";
import { db } from "../db.js";
import fs from "fs";
import multer from "multer";
import { verifyJwt } from "./jwtOwner.js";
import path from "path";

const uploadDir = 'uploads/vehicle'; // Define upload directory

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage with unique filenames
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const fileExt = path.extname(file.originalname); // Get file extension
        const timestamp = Date.now(); // Get current timestamp
        const randomString = Math.floor(Math.random() * 100000000); // Random string for uniqueness
        const uniqueName = `${file.fieldname}-${timestamp}-${randomString}${fileExt}`;
        cb(null, uniqueName); // Set the filename
    }
});

const upload = multer({ storage });

// Vehicle Update Route
const updateVehicle = async (req, res) => {
    const vehicleId = req.params.vehicle_id;
    const { 
        category_id, 
        final_price, 
        discount_id, 
        last_renewed,
        tax_paid_until,
        insurance_expiry
    } = req.body;

    const files = req.files;
    console.log('Uploaded files:', files);
    console.log('Request body:', req.body);

    try {
        // 1. Check if vehicle exists
        const [[existingVehicle]] = await db.promise().query(
            `SELECT * FROM vehicle WHERE vehicle_id = ?`,
            [vehicleId]
        );

        if (!existingVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        // 2. Validate category and price
        const [[categoryAndPrice]] = await db.promise().query(`SELECT p.price_id, p.min_price, p.max_price FROM prices p WHERE p.category_id = ?`, [category_id]);

        if (!categoryAndPrice) {
            return res.status(400).json({ message: "Invalid category ID or missing price data" });
        }

        const { price_id, min_price, max_price } = categoryAndPrice;

        // 3. Validate final price
        const finalPriceNum = parseFloat(final_price);
        if (isNaN(finalPriceNum) || finalPriceNum < min_price || finalPriceNum > max_price) {
            return res.status(400).json({
                message: `Final price must be between ${min_price} and ${max_price}`
            });
        }

        // 4. Calculate discounted price
        let discountedPrice = finalPriceNum;
        if (discount_id) {
            const [[discount]] = await db.promise().query(`SELECT discount_percentage FROM discounts WHERE discount_id = ?`, [discount_id]);
            if (discount) {
                discountedPrice -= (discount.discount_percentage / 100) * finalPriceNum;
            } else {
                return res.status(400).json({ message: "Invalid discount ID" });
            }
        }
        let updateDocumentFields = [];
        let updateValues = [];

        if (last_renewed) {
            updateDocumentFields.push("last_renewed = ?");
            updateValues.push(last_renewed);
        }

        if (tax_paid_until) {
            updateDocumentFields.push("tax_paid_until = ?");
            updateValues.push(tax_paid_until);
        }

        if (insurance_expiry) {
            updateDocumentFields.push("insurance_expiry = ?");
            updateValues.push(insurance_expiry);
        }

        // Only update the document if there are fields to update
        if (updateDocumentFields.length > 0) {
            await db.promise().query(
                `UPDATE vehicle_document SET ${updateDocumentFields.join(', ')} WHERE vehicle_id = ?`,
                [...updateValues, vehicleId]
            );
        }

        // 5. Prepare image updates
        const imageUpdates = {};
        const imageFields = ['image_right', 'image_left', 'image_back', 'image_front'];

        imageFields.forEach(field => {
            if (files && files[field] && files[field][0]) {
                // Store full file path in imageUpdates with unique filenames
                imageUpdates[field] = path.join(uploadDir, files[field][0].filename);
            }
        });

        

        // 7. Start transaction and update
        await db.promise().beginTransaction();

        try {
            // Update vehicle category and images
            await db.promise().query(
                `UPDATE vehicle SET category_id = ? 
                ${Object.keys(imageUpdates).length > 0 ? 
                    ', ' + Object.keys(imageUpdates).map(field => `${field} = ?`).join(', ') : ''} 
            WHERE vehicle_id = ?`,
            [
                category_id, 
                ...Object.keys(imageUpdates).map(field => imageUpdates[field]), // Pass full paths here
                vehicleId
            ]
        );

            // Update vehicle status
            await db.promise().query(
                `UPDATE vehicle_status 
                SET final_price = ?, 
                    discounted_price = ?, 
                    price_id = ?, 
                    availability = 1 
                WHERE vehicle_id = ?`,
                [finalPriceNum, discountedPrice, price_id, vehicleId]
            );

            // Commit the transaction
            await db.promise().commit();
            
            // Send the successful response
            return res.status(200).json({ 
                message: "Vehicle updated successfully",
                imageFiles: imageUpdates
            });
        } catch (updateError) {
            // If an error occurs, rollback the transaction
            await db.promise().rollback();
            console.error("Error updating vehicle:", updateError);
            return res.status(500).json({ 
                message: "Error during vehicle update process",
                error: updateError.message
            });
        }
    } catch (error) {
        console.error("Error updating vehicle:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

// Route with file upload middleware
const vehicleRouter = express.Router();
vehicleRouter.put('/vehicles/:vehicle_id', 
    verifyJwt, 
    upload.fields([
        { name: 'image_right', maxCount: 1 },
        { name: 'image_left', maxCount: 1 },
        { name: 'image_back', maxCount: 1 },
        { name: 'image_front', maxCount: 1 }
    ]), 
    updateVehicle
);

vehicleRouter.get('/vehicle/:vehicle_id', verifyJwt, async (req, res) => {
    try {
        const { vehicle_id } = req.params; // Get vehicle_id from the URL parameters
        // Fetch data from vehicle, vehicle_status, and vehicle_document tables
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
    c.category_name AS category_name,
    p.min_price,
    p.max_price
FROM vehicle v
LEFT JOIN vehicle_document vd ON v.vehicle_id = vd.vehicle_id
LEFT JOIN vehicle_status vs ON v.vehicle_id = vs.vehicle_id
LEFT JOIN owners o ON v.owner_id = o.owner_id
LEFT JOIN categories c ON v.category_id = c.category_id
LEFT JOIN prices p ON c.category_id = p.category_id
WHERE v.vehicle_id = ?`, [vehicle_id]);

        // If no data found for the specified vehicle_id
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }

        // Send the response with the vehicle data
        res.json(rows[0]); // Returning the first row since vehicle_id is unique
    } catch (error) {
        console.error('Error fetching vehicle data:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default vehicleRouter;
