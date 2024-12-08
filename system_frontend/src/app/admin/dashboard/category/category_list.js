"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

const CategoryList=()=> {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [editCategory, setEditCategory] = useState(null);
    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false); // Track loading state

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get("http://localhost:5000/adminAPI/categories", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCategories(response.data);
            setError(null);
        } catch (err) {
          //  console.error("Error fetching categories:", err);
            if (err.response) {
                setError(`Server error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`);
            } else if (err.request) {
                setError("No response received from server. Please check your network connection.");
            } else {
                setError("An unexpected error occurred. Please try again later.");
            }
            setCategories([]);
        }
    };

    const deleteCategory = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`http://localhost:5000/adminAPI/categories/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchCategories();
        } catch (err) {
            //console.error("Error deleting category:", err);
            setError("Failed to delete category. Please try again.");
        }
    };

    const openEditDialog = (category) => {
        setEditCategory(category);
        setCategoryName(category.category_name);
        setDescription(category.cat_description);
        setShowDialog(true);
    };

    const updateCategory = async () => {
        try {
            setIsUpdating(true); // Set loading state
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/adminAPI/categories/${editCategory.category_id}`, {
                categoryName,
                description,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchCategories();
            setShowDialog(false);
        } catch (err) {
            //console.error("Error updating category:", err);
            setError("Failed to update category. Please try again.");
        } finally {
            setIsUpdating(false); // Reset loading state
        }
    };

    useEffect(() => {
        fetchCategories();
        const intervalId = setInterval(fetchCategories, 5000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Category List</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {categories.length === 0 ? (
                <p className="text-gray-500">No categories available.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Category Name</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Description</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.category_id} className="hover:bg-gray-100">
                                    <td className="py-3 px-4 border-b border-gray-300">{category.category_name}</td>
                                    <td className="py-3 px-4 border-b border-gray-300">{category.cat_description}</td>
                                    <td className="py-4 px-4 border-b border-gray-300 flex space-x-4">
                                        <PencilIcon
                                            className="h-5 w-5 text-blue-500 cursor-pointer"
                                            onClick={() => openEditDialog(category)}
                                        />
                                        <TrashIcon
                                            className="h-5 w-5 text-red-500 cursor-pointer"
                                            onClick={() => deleteCategory(category.category_id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Dialog */}
            {showDialog && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
                        <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
                        <label className="block mb-2">Category Name:</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 p-2 mb-4 rounded"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                        />
                        <label className="block mb-2">Description:</label>
                        <textarea
                            className="w-full border border-gray-300 p-2 mb-4 rounded"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end">
                            <button
                                className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
                                onClick={updateCategory}
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Updating...' : 'Update'}
                            </button>
                            <button
                                className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
                                onClick={() => setShowDialog(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default CategoryList;