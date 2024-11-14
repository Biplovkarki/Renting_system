import express from 'express';
import { db } from '../db.js';
import { verifyJwtAdmin } from './jwtAdmin.js';

const vehicleRoutes = express.Router();

// Fetch data from vehicle, vehicle_status, vehicle_document, owners, and categories tables
vehicleRoutes.get('/vehicles', verifyJwtAdmin, async (req, res) => {
    try {
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
        `);

        if (rows.length === 0) {
            return res.status(204).json({ message: 'No vehicles found.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching vehicle data:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// DELETE vehicle by vehicle_id
vehicleRoutes.delete('/vehicles/:vehicle_id', verifyJwtAdmin, async (req, res) => {
    const { vehicle_id } = req.params;

    try {
        await db.promise().query('START TRANSACTION');

        // Delete from related tables in order
        await db.promise().query('DELETE FROM vehicle_document WHERE vehicle_id = ?', [vehicle_id]);
        await db.promise().query('DELETE FROM vehicle_status WHERE vehicle_id = ?', [vehicle_id]);
        const [result] = await db.promise().query('DELETE FROM vehicle WHERE vehicle_id = ?', [vehicle_id]);

        await db.promise().query('COMMIT');

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }

        res.json({ message: 'Vehicle and related data deleted successfully.' });
    } catch (error) {
        await db.promise().query('ROLLBACK');
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});



// Route to update only the status and availability fields in vehicle_status
vehicleRoutes.put('/vehicles/:vehicle_id', verifyJwtAdmin, async (req, res) => {
    const { vehicle_id } = req.params;
    const { status, availability } = req.body;

    // Check if either 'status' or 'availability' field is provided
    if (status === undefined && availability === undefined) {
        return res.status(400).json({ message: 'Please provide at least one field to update.' });
    }

    try {
        // Start transaction
        await db.promise().query('START TRANSACTION');

        // Construct the update query conditionally
        let updateQuery = 'UPDATE vehicle_status SET ';
        const updateValues = [];
        let needsComma = false;

        if (status !== undefined) {
            updateQuery += 'status = ?';
            updateValues.push(status);
            needsComma = true;
        }

        if (availability !== undefined) {
            updateQuery += (needsComma ? ', ' : '') + 'availability = ?';
            updateValues.push(availability);
        }

        // Add WHERE clause to target the specific vehicle
        updateQuery += ' WHERE vehicle_id = ?';
        updateValues.push(vehicle_id);

        // Log final query and values
        console.log('Final Query:', updateQuery);
        console.log('Update Values:', updateValues);

        // Execute the update query
        await db.promise().query(updateQuery, updateValues);

        // Commit the transaction
        await db.promise().query('COMMIT');
        res.status(200).json({ message: 'Vehicle status and availability updated successfully.' });
    } catch (error) {
        // Rollback transaction in case of error
        await db.promise().query('ROLLBACK');
        console.error('Error updating vehicle status:', error);
        res.status(500).json({ message: 'Failed to update vehicle status and availability. Please try again later.' });
    }
});





export default vehicleRoutes;
