import express from 'express';
import { db } from '../db.js';
import { verifyJwt } from './jwtOwner.js';
import dotenv from 'dotenv';

dotenv.config();

export const vehicledescriptionrouter = express.Router();


// Get vehicle maintenance & document alerts
vehicledescriptionrouter.get('/:owner_id/alerts', verifyJwt, async (req, res) => {
    const ownerId = req.params.owner_id;
    try {
        // Document expiry alerts for 'insurance_expiry' and 'tax_paid_until'
        const [documentAlerts] = await db.promise().query(
            `SELECT v.vehicle_name, v.model, 'Document Expiry' AS alert_type, 
            CASE 
                WHEN vd.insurance_expiry <= NOW() THEN 'Insurance Expiry Due'
                WHEN vd.tax_paid_until <= NOW() THEN 'Tax Expiry Due'
            END AS document_alert_type,
            vd.insurance_expiry, vd.tax_paid_until
            FROM vehicle_document vd
            JOIN vehicle v ON v.vehicle_id = vd.vehicle_id
            WHERE v.owner_id = ? 
            AND (vd.insurance_expiry <= NOW() OR vd.tax_paid_until <= NOW())`, [ownerId]
        );

        // Map the response to format the date into yy:mm:dd format
        const formattedAlerts = documentAlerts.map(alert => ({
            ...alert,
            formatted_insurance_expiry: formatDate(alert.insurance_expiry),
            formatted_tax_paid_until: formatDate(alert.tax_paid_until),
        }));

        res.json({
            documentAlerts: formattedAlerts
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching alerts' });
    }
});

// Helper function to format date in yy:mm:dd
const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear().toString().slice(2); // Get last two digits of the year
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero to month if necessary
    const day = d.getDate().toString().padStart(2, '0'); // Add leading zero to day if necessary
    return `${year}:${month}:${day}`;
};



// Get income breakdown by vehicle for the owner
vehicledescriptionrouter.get('/:owner_id/income-breakdown', verifyJwt, async (req, res) => {
    const ownerId = req.params.owner_id;
    try {
        const [incomeByVehicle] = await db.promise().query(
            `SELECT v.vehicle_name,v.model, SUM(t.owner_earning) AS earnings
            FROM transactions t
            JOIN vehicle v ON t.vehicle_id = v.vehicle_id
            WHERE v.owner_id = ?
            GROUP BY v.vehicle_id`, [ownerId]
        );

        res.json(incomeByVehicle);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching income breakdown' });
    }
});

// Get vehicle overview (Total vehicles, Available, Pending Approvals)
vehicledescriptionrouter.get('/:owner_id/vehicle-overview', verifyJwt, async (req, res) => {
    const ownerId = req.params.owner_id;
    try {
        const [vehicleOverview] = await db.promise().query(
            `SELECT 
                COUNT(*) AS totalVehicles, 
                SUM(CASE WHEN vs.status = 'approve' THEN 1 ELSE 0 END) AS approvalVehicles,
                SUM(CASE WHEN vs.status = 'pending' THEN 1 ELSE 0 END) AS pendingApprovals,
                SUM(CASE WHEN vs.status = 'reject' THEN 1 ELSE 0 END) AS rejectedApprovals
             FROM vehicle v
             LEFT JOIN vehicle_status vs ON v.vehicle_id = vs.vehicle_id
             WHERE v.owner_id = ?`,
            [ownerId]
        );

        res.json({
            totalVehicles: vehicleOverview[0].totalVehicles,
            availableVehicles: vehicleOverview[0].approvalVehicles,
            pendingApprovals: vehicleOverview[0].pendingApprovals,
            rejectApprovals: vehicleOverview[0].rejectedApprovals
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching vehicle overview' });
    }
});





