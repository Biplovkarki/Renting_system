"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import PriceForm from "./updateform"; // Ensure you have a PriceForm component for updating prices
import { XMarkIcon } from "@heroicons/react/24/outline";
export default function PriceList() {
    const [prices, setPrices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false); // Track loading state

    const fetchPrices = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get("http://localhost:5000/Adminprice/price", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPrices(response.data);
            setError("");
        } catch (err) {
            handleError(err);
            setPrices([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get("http://localhost:5000/adminAPI/categories", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCategories(response.data);
            setError("");
        } catch (err) {
            console.error("Error fetching categories:", err);
            handleError(err);
            setCategories([]);
        }
    };

    const handleError = (err) => {
        if (err.response) {
            setError(`Server error: ${err.response.status} - ${err.response.data.message || "Unknown error"}`);
        } else if (err.request) {
            setError("No response received from server. Please check your network connection.");
        } else {
            setError("An unexpected error occurred. Please try again later.");
        }
    };

    const deletePrice = async (priceId) => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.delete(`http://localhost:5000/Adminprice/price/${priceId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchPrices();
        } catch (err) {
            console.error("Error deleting price:", err);
            handleError(err);
        }
    };

    useEffect(() => {
        fetchPrices();
        fetchCategories();
    }, []);

    const categoryMap = {};
    categories.forEach((category) => {
        categoryMap[category.category_id] = category.category_name;
    });

    const handleEditPrice = (price) => {
        setSelectedPrice(price);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPrice(null);
    };

    const updatePrice = async (updatedPrice) => {
        try {
            setIsUpdating(true); // Set loading state
            const token = localStorage.getItem("adminToken");
            await axios.put(`http://localhost:5000/Adminprice/price/${updatedPrice.price_id}`, updatedPrice, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchPrices();
            closeModal();
        } catch (err) {
            console.error("Error updating price:", err);
            handleError(err);
        } finally {
            setIsUpdating(false); // Reset loading state
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Price List</h1>
            {loading && <p>Loading prices...</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {prices.length === 0 ? (
                <p className="text-gray-500">No prices available.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Category Name</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Min Price</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Max Price</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prices.map((price) => (
                                <tr key={price.price_id} className="hover:bg-gray-100">
                                    <td className="py-3 px-4 border-b border-gray-300">{categoryMap[price.category_id] || "Unknown Category"}</td>
                                    <td className="py-3 px-4 border-b border-gray-300">{Math.round(price.min_price)}</td>
                                    <td className="py-3 px-4 border-b border-gray-300">{Math.round(price.max_price)}</td>
                                    <td className="py-4 px-4 border-b border-gray-300 flex space-x-4">
                                        <PencilIcon
                                            className="h-5 w-5 text-blue-500 cursor-pointer"
                                            onClick={() => handleEditPrice(price)}
                                        />
                                        <TrashIcon
                                            className="h-5 w-5 text-red-500 cursor-pointer"
                                            onClick={() => deletePrice(price.price_id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for PriceForm */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-1/3 z-10">
                        <h2 className="text-xl font-bold mb-4">Edit Price</h2>
                        <PriceForm price={selectedPrice} onClose={closeModal} onPriceUpdated={updatePrice} isUpdating={isUpdating} />
                    </div>
                </div>
            )}
        </div>
    );
}
