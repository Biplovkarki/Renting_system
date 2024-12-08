"use client";
import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import axios from 'axios';

export default function DiscountForm() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [discountName, setDiscountName] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

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
              //  console.error('Error fetching categories:', err);
                setError('Failed to load categories.');
            }
        };

        fetchCategories();
    }, []);

    // Clear success and error messages after a timeout
    useEffect(() => {
        let timeoutId;
        if (success) {
            timeoutId = setTimeout(() => {
                setSuccess('');
            }, 3000); // Clear success message after 3 seconds
        }
        if (error) {
            timeoutId = setTimeout(() => {
                setError('');
            }, 3000); // Clear error message after 3 seconds
        }
        return () => clearTimeout(timeoutId); // Clean up the timeout on component unmount
    }, [success, error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Reset error state before submission

        // Validate discount percentage
        if (discountPercentage < 0 || discountPercentage > 100) {
            setError('Discount percentage must be between 0 and 100.');
            setLoading(false);
            return;
        }

        const discountData = {
            category_id: selectedCategory,
            discount_name: discountName,
            discount_percentage: discountPercentage,
            is_enabled: isEnabled,
        };

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post('http://localhost:5000/discountAPI/discount', discountData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccess(response.data.message);
            setSelectedCategory('');
            setDiscountName('');
            setDiscountPercentage('');
            setIsEnabled(false);
            setError('');
            setIsModalOpen(false); // Close modal on success
        } catch (error) {
           // console.error('Error adding discount:', error);
            if (error.response && error.response.data) {
                // Check if the error is due to an existing discount
                if (error.response.data.message === 'A discount offer for this category already exists.') {
                    setError('This category already has an existing discount.'); // Show specific error message
                } else {
                    setError('Error adding discount.'); // Generic error message
                }
            } else {
                setError('An unknown error occurred.'); // Fallback for unexpected errors
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Reset form state
        setSelectedCategory('');
        setDiscountName('');
        setDiscountPercentage('');
        setIsEnabled(false);
        setSuccess('');
        setError('');
    };

    return (
        <div>
            {/* Small Add Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
            >
                Add Discount
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <form onSubmit={handleSubmit} className="p-4 w-[600px] mx-auto bg-white shadow-md rounded-lg">
                        <h2 className="text-xl font-bold mb-4">Add Discount</h2>

                        {error && <p className="text-red-500">{error}</p>}
                        {success && <p className="text-green-500">{success}</p>}

                        <div className="mb-4">
                            <label className="block mb-1">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1">Discount Name</label>
                            <input
                                type="text"
                                value={discountName}
                                onChange={(e) => setDiscountName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Enter Discount Name"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1">Discount Percentage</label>
                            <input
                                type="number"
                                value={discountPercentage}
                                onChange={(e) => setDiscountPercentage(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Enter Discount Percentage"
                                required
                            />
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                            <span>Enable Discount</span>
                            <Switch
                                checked={isEnabled}
                                onChange={setIsEnabled}
                                className={`${isEnabled ? 'bg-green-500' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
                            >
                                <span
                                    className={`${isEnabled ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                                />
                            </Switch>
                        </div>
                        <div className='flex flex-row gap-2 justify-end'>
                            <button
                                type="submit"
                                className={`p-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Discount'}
                            </button>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className=" p-4 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
