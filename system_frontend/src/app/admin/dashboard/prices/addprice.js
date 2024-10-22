"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AddPriceRangeForm = () => {
    const [categories, setCategories] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); // New loading state

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.get("http://localhost:5000/adminAPI/categories", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCategories(response.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories.');
            }
        };

        fetchCategories();
    }, []);

    const handleAddPriceRange = async (e) => {
        e.preventDefault();

        // Basic validation for min and max prices
        if (minPrice >= maxPrice) {
            setError('Min Price must be less than Max Price.');
            return;
        }

        setLoading(true); // Set loading state to true

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post("http://localhost:5000/Adminprice/price", {
                category_id: selectedCategory,
                min_price: minPrice,
                max_price: maxPrice
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setSuccess(response.data.message);
            // Clear form fields
            setSelectedCategory('');
            setMinPrice('');
            setMaxPrice('');
            setError('');
        } catch (err) {
            console.error('Error adding price range:', err);
            setError(err.response?.data?.message || 'Failed to add price range.');
            setSuccess('');
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <form onSubmit={handleAddPriceRange} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Add Price Range</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                    Category
                </label>
                <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                        <option key={category.category_id} value={category.category_id}>
                            {category.category_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="minPrice">
                    Min Price
                </label>
                <input
                    type="number"
                    id="minPrice"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxPrice">
                    Max Price
                </label>
                <input
                    type="number"
                    id="maxPrice"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <button
                type="submit"
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading} // Disable button when loading
            >
                {loading ? 'Adding...' : 'Add Price Range'}
            </button>
        </form>
    );
};

export default AddPriceRangeForm;
