"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

const VehicleEditForm = ({ vehicleId }) => {
    const [formData, setFormData] = useState({
        final_price: '',
        discounted_price: '',
        last_renewed: '',
        tax_paid_until: '',
        insurance_expiry: '',
        image_right: null,
        image_left: null,
        image_back: null,
        image_front: null,
        category_id: '',
    });

    const [imagePreviews, setImagePreviews] = useState({
        image_right: null,
        image_left: null,
        image_back: null,
        image_front: null
    });

    const [categoryName, setCategoryName] = useState('');
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (vehicleId) {
            fetchVehicleData(vehicleId);
        }
    }, [vehicleId]);

    const fetchVehicleData = async (vehicleId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Unauthorized');
            }

            const response = await axios.get(`http://localhost:5000/update/vehicle/${vehicleId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const vehicleData = response.data;
            setFormData({
                ...vehicleData,
                image_right: vehicleData.image_right,
                image_left: vehicleData.image_left,
                image_back: vehicleData.image_back,
                image_front: vehicleData.image_front,
            });

            // Set image previews if existing images exist
            const imageFields = ['image_right', 'image_left', 'image_back', 'image_front'];
            const previews = {};
            imageFields.forEach(field => {
                if (vehicleData[field]) {
                    previews[field] = `http://localhost:5000/uploads/vehicle/${vehicleData[field]}`;
                }
            });
            setImagePreviews(previews);

            setCategoryName(vehicleData.category_name);
            setMinPrice(vehicleData.min_price);
            setMaxPrice(vehicleData.max_price);

            // Fetch discount percentage
            if (vehicleData.discount_id) {
                const discountResponse = await axios.get(
                    `http://localhost:5000/cat_owner/discount/${vehicleData.category_id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setDiscountPercentage(discountResponse.data.discount_percentage || 0);
            }
        } catch (error) {
            setNotification({
                message: error.response?.data?.message || error.message,
                type: 'error'
            });
            console.error('Error fetching vehicle data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (e) => {
        const { name, value, type, files } = e.target;

        // Handle file uploads with preview and validation
        if (type === 'file') {
            const file = files[0];

            // Validate file type and size
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (file) {
                if (!allowedTypes.includes(file.type)) {
                    setNotification({
                        message: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.',
                        type: 'error'
                    });
                    return;
                }

                if (file.size > maxSize) {
                    setNotification({
                        message: 'File size exceeds 5MB limit.',
                        type: 'error'
                    });
                    return;
                }

                // Create file preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => ({
                        ...prev,
                        [name]: reader.result
                    }));
                };
                reader.readAsDataURL(file);

                // Update form data with file
                setFormData(prevData => ({
                    ...prevData,
                    [name]: file
                }));
            }
        } else {
            // Handle other input types
            setFormData(prevData => ({
                ...prevData,
                [name]: type === "checkbox"
                    ? (e.target.checked ? 1 : 0)
                    : (name === 'final_price' ? Math.round(parseInt(value, 10) || 0) : value)
            }));
        }

        // Existing category and discount logic
        if (name === 'category_id' && value) {
            try {
                const token = localStorage.getItem('token');
                const discountResponse = await axios.get(
                    `http://localhost:5000/cat_owner/discount/${value}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const activeDiscount = discountResponse.data;
                setDiscountPercentage(activeDiscount?.discount_percentage || null);

                // Set the discount_id in the form data
                setFormData(prev => ({
                    ...prev,
                    discount_id: activeDiscount?.discount_id || null
                }));
            } catch (error) {
                console.error('Error fetching discount:', error);
                setDiscountPercentage(null);
                setFormData(prev => ({ ...prev, discount_id: null }));
            }
        }
    };

    // Calculate discounted price effect
    useEffect(() => {
        if (formData.final_price && discountPercentage !== null) {
            const discountedPrice = Math.round(
                parseFloat(formData.final_price) -
                (parseFloat(formData.final_price) * discountPercentage) / 100
            );
            setFormData(prev => ({ ...prev, discounted_price: discountedPrice }));
        } else {
            setFormData(prev => ({ ...prev, discounted_price: '' }));
        }
    }, [discountPercentage, formData.final_price]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ message: '', type: '' });

        // Validate price range
        const finalPrice = parseFloat(formData.final_price);
        if (finalPrice < minPrice || finalPrice > maxPrice) {
            setNotification({
                message: `Price must be between ${minPrice} and ${maxPrice}`,
                type: 'error'
            });
            return;
        }

        const formDataToSubmit = new FormData();

        // Append all form fields
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                formDataToSubmit.append(key, formData[key]);
            }
        });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/update/vehicles/${vehicleId}`,
                formDataToSubmit,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            // Success handling
            setNotification({
                message: response.data.message || 'Vehicle updated successfully!',
                type: 'success'
            });

            // Optional: Refresh data after successful update
            fetchVehicleData(vehicleId);

            // Auto-hide notification
            setTimeout(() => setNotification({ message: '', type: '' }), 5000);
        } catch (error) {
            // Error handling
            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong.';
            setNotification({ message: errorMessage, type: 'error' });
            console.error('Error updating vehicle:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl p-6 bg-white shadow-2xl rounded-xl">
            {/* Notification Display */}
            {notification.message && (
                <div
                    className={`p-4 mb-4 rounded-lg  ${notification.type === 'error' ? 'text-red-500' : 'text-green-500'
                        }`}
                >
                    {notification.message}
                </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-2">
                <div className="flex items-center space-x-4 mb-2">
                    <h2 className="text-3xl font-extrabold text-gray-800">Update Vehicle Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Category Information */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            Category Name
                        </label>
                        <input
                            type="text"
                            value={categoryName}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        />
                    </div>

                    {/* Price Range */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            Price Range
                        </label>
                        <input
                            type="text"
                            value={`${minPrice} - ${maxPrice}`}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        />
                    </div>

                    {/* Final Price */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700 mb-2">
                            Final Price
                        </label>
                        <input
                            type="number"
                            name="final_price"
                            value={formData.final_price}
                            onChange={handleChange}
                            min={minPrice}
                            max={maxPrice}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Discounted Price */}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700 mb-2">
                            Discounted Price
                        </label>
                        <input
                            type="text"
                            name="discounted_price"
                            value={formData.discounted_price || ''}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        />
</div>
                        {/* Last Renewed Date */}
                       
                    {/* Date Inputs */}
                    <div className="relative">
                        <label htmlFor="last_renewed" className="block text-sm font-medium text-gray-700 mb-2">
                            Last Renewed
                        </label>
                        <input
                            type="date"
                            name="last_renewed"
                            id="last_renewed"
                            value={formData.last_renewed}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-md text-gray-700 bg-white"
                        />
                    </div>

                    <div className="relative">
                        <label htmlFor="insurance_expiry" className="block text-sm font-medium text-gray-700 mb-2">
                            Insurance Expiry
                        </label>
                        <input
                            type="date"
                            name="insurance_expiry"
                            id="insurance_expiry"
                            value={formData.insurance_expiry}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-md text-gray-700 bg-white"
                        />
                    </div>

                    <div className="relative">
                        <label htmlFor="tax_paid_until" className="block text-sm font-medium text-gray-700 mb-2">
                            Tax Paid Until
                        </label>
                        <input
                            type="date"
                            name="tax_paid_until"
                            id="tax_paid_until"
                            value={formData.tax_paid_until}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-md text-gray-700 bg-white"
                        />
                    </div>
                
                


                    {/* Image Upload Sections */}
                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {['image_right', 'image_left', 'image_back', 'image_front'].map((imageField) => (
                            <div key={imageField} className="relative flex flex-col items-center justify-center">
                                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                    {imageField.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </label>
                                <input
                                    type="file"
                                    name={imageField}
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleChange}
                                    className="w-full text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 hover:file:bg-blue-100 file:px-4 file:py-2 file:cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>



                    {/* Submit Button */}
                    <div className="md:col-span-2 flex justify-center mt-6">
                        <button
                            type="submit"
                            className="w-full md:w-1/2 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                        >
                            Update Vehicle
                        </button>
                    </div>
                </div>
            </form>
            </div>
    );
};

export default VehicleEditForm;