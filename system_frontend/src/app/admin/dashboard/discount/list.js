"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Switch } from '@headlessui/react';

export default function DiscountList() {
    const [discounts, setDiscounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchDiscounts = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get("http://localhost:5000/discountAPI/discount", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDiscounts(response.data);
            setError("");
        } catch (err) {
           // console.error("Error fetching discounts:", err);
            handleError(err);
            setDiscounts([]);
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
            //console.error("Error fetching categories:", err);
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

    const deleteDiscount = async (discountId) => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.delete(`http://localhost:5000/discountAPI/discount/${discountId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchDiscounts();
        } catch (err) {
         //   console.error("Error deleting discount:", err);
            handleError(err);
        }
    };

    const updateDiscount = async (updatedDiscount) => {
        try {
            setIsUpdating(true);
            const token = localStorage.getItem("adminToken");
            const fullUpdateData = {
                discount_name: updatedDiscount.discount_name,
                discount_percentage: updatedDiscount.discount_percentage,
                category_id: updatedDiscount.category_id,
                is_enabled: Boolean(updatedDiscount.is_enabled)
            };
            await axios.put(`http://localhost:5000/discountAPI/discount/${updatedDiscount.discount_id}`, fullUpdateData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchDiscounts();
            closeModal();
        } catch (err) {
           // console.error("Error updating discount:", err);
            handleError(err);
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
        fetchCategories();
    }, []);

    const handleEditDiscount = (discount) => {
        setSelectedDiscount(discount);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDiscount(null);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Discount List</h1>
            {loading && <p>Loading discounts...</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {discounts.length === 0 ? (
                <p className="text-gray-500">No discounts available.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Category Name</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Discount Name</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Discount Percentage</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Enabled</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map((discount) => (
                                <tr key={discount.discount_id} className="hover:bg-gray-100">
                                    <td className="py-3 px-4 border-b border-gray-300">{categories.find(category => category.category_id === discount.category_id)?.category_name || "Unknown Category"}</td>
                                    <td className="py-3 px-4 border-b border-gray-300">{discount.discount_name}</td>
                                    <td className="py-3 px-4 border-b border-gray-300">{Math.round(discount.discount_percentage)}%</td>
                                    <td className="py-3 px-4 border-b border-gray-300">{discount.is_enabled ? 'Yes' : 'No'}</td>
                                    <td className="py-[15.5px] px-4  border-b border-gray-300 flex space-x-4">
                                        <PencilIcon
                                            className="h-5 w-5 text-blue-500 cursor-pointer"
                                            onClick={() => handleEditDiscount(discount)}
                                        />
                                        <TrashIcon
                                            className="h-5 w-5 text-red-500 cursor-pointer"
                                            onClick={() => deleteDiscount(discount.discount_id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-1/3 z-10">
                        <h2 className="text-xl font-bold mb-4">Edit Discount</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                updateDiscount(selectedDiscount);
                            }}
                        >
                            <div className="mb-4">
                                <label className="block text-gray-700" htmlFor="discountName">Discount Name</label>
                                <input
                                    type="text"
                                    id="discountName"
                                    value={selectedDiscount?.discount_name || ""}
                                    onChange={(e) => setSelectedDiscount({ ...selectedDiscount, discount_name: e.target.value })}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700" htmlFor="discountPercentage">Discount Percentage</label>
                                <input
                                    type="number"
                                    id="discountPercentage"
                                    value={selectedDiscount?.discount_percentage || ""}
                                    onChange={(e) => setSelectedDiscount({ ...selectedDiscount, discount_percentage: e.target.value })}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div className="mb-4 flex items-center">
                                <label className="mr-2 text-gray-700">Enabled</label>
                                <Switch
                                    checked={selectedDiscount?.is_enabled}
                                    onChange={(value) => setSelectedDiscount({ ...selectedDiscount, is_enabled: value })}
                                    className={`${selectedDiscount?.is_enabled ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11`}
                                >
                                    <span className={`${selectedDiscount?.is_enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full`} />
                                </Switch>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="mr-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                                    onClick={closeModal}
                                >
                                    <XMarkIcon className="h-5 w-5 inline-block" /> Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-white rounded ${isUpdating ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'}`}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Updating...' : 'Update Discount'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}