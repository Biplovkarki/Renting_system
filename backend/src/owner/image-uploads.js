import multer from 'multer';
import path from 'path';
import { db } from '../db.js';
import { verifyJwt } from './jwtOwner.js';
import express from 'express';

const imageOwner = express.Router();

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/owner'); // Ensure the 'uploads/owner' directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `ownerimage_${Date.now()}_${file.originalname}`); // Unique filename generation
    }
});

// Initialize the multer upload middleware with file type filtering
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|jfif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (jpeg, jpg, png, gif, jfif) are allowed!'));
        }
    }
});

// Endpoint to handle image upload for the owner
imageOwner.post('/uploadOwner', verifyJwt, (req, res) => {
    upload.single('OwnerImage')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: "Multer error during file upload" });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

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
