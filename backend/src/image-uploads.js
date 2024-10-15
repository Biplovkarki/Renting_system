import multer from 'multer';
import path from 'path';
import { db } from './db.js';
import { verifyJwt } from './jwtOwner.js';
import express from 'express';

const imageOwner = express.Router();

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/owner'); // Make sure the 'uploads/owner' directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `ownerimage_${Date.now()}_${file.originalname}`); // Unique filename generation
    }
});

// Initialize the multer upload middleware
const upload = multer({ storage });

// Endpoint to handle image upload for the owner
imageOwner.post('/uploadOwner', verifyJwt, upload.single('OwnerImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const image = req.file.filename; // Uploaded image filename
    const ownerId = req.owner.id; // Extract owner ID from JWT

    const sql = "UPDATE owners SET own_image = ? WHERE Owner_id = ?";

    db.query(sql, [image, ownerId], (err) => {
        if (err) {
            return res.status(500).json({ message: "Error updating the image" });
        }
        return res.json({ status: "Success", image });
    });
});

// Endpoint to fetch owner image
imageOwner.get('/getOwnerimage', verifyJwt, (req, res) => {
    const ownerId = req.owner.id; // Extract owner ID from JWT
    const sql = 'SELECT own_image FROM owners WHERE Owner_id = ?';

    db.query(sql, [ownerId], (err, result) => {
        if (err) return res.status(500).json({ message: "Error fetching image" });
        return res.json(result);
    });
});

export default imageOwner;
