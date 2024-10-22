import express from 'express';
import { verifyJwtAdmin } from './jwtAdmin.js';
import dotenv from 'dotenv';
import { db } from '../db.js';

dotenv.config();
const AdminAPI = express.Router();

// Create a new category
AdminAPI.post('/categories', verifyJwtAdmin, async (req, res) => {
    const { categoryName, description } = req.body;

    if (!categoryName || !description) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const [existingCategory] = await db.promise().query(
            'SELECT * FROM categories WHERE category_name = ?',
            [categoryName]
        );

        if (existingCategory.length > 0) {
            return res.status(409).json({ message: "Category already exists." });
        }

        await db.promise().query(
            'INSERT INTO categories (category_name, cat_description) VALUES (?, ?)', 
            [categoryName, description]
        );

        res.status(201).json({ message: "Category created successfully." });
    } catch (error) {
        console.error("Error while creating category:", error);
        res.status(500).json({ message: "An error occurred while creating the category." });
    }
});

// Get all categories
AdminAPI.get('/categories', verifyJwtAdmin, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM categories');
        
        if (rows.length === 0) {
            return res.status(204).json({ message: 'No categories found.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories list:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update a category
AdminAPI.put('/categories/:id', verifyJwtAdmin, async (req, res) => {
    const { id } = req.params;
    const { categoryName, description } = req.body;

    if (!categoryName || !description) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const [existingCategory] = await db.promise().query(
            'SELECT * FROM categories WHERE category_id = ?',
            [id]
        );

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "Category not found." });
        }

        await db.promise().query(
            'UPDATE categories SET category_name = ?, cat_description = ? WHERE category_id = ?',
            [categoryName, description, id]
        );

        res.status(200).json({ message: "Category updated successfully." });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "An error occurred while updating the category." });
    }
});

// Delete a category
AdminAPI.delete('/categories/:id', verifyJwtAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const [existingCategory] = await db.promise().query(
            'SELECT * FROM categories WHERE category_id = ?',
            [id]
        );

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "Category not found." });
        }

        await db.promise().query(
            'DELETE FROM categories WHERE category_id = ?',
            [id]
        );

        res.status(204).json({ message: "Category deleted successfully." });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "An error occurred while deleting the category." });
    }
});

export default AdminAPI;
