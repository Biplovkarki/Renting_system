"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const VehicleForm = () => {
    const [formData, setFormData] = useState({
        owner_id: '',
        category_id: '',
        vehicle_name: '',
        model: '',
        cc: '',
        color: '',
        transmission: '',
        fuel_type: '',
        bluebook_number: '',
        last_renewed: '',
        tax_paid_until: '',
        insurance_expiry: '',
        vin_number: '',
        registration_number: '',
        final_price: '',
        discounted_price: '',
        terms: 0,
        rent_start_date: '',
        rent_end_date: '',
        
    });

    const [discountPercentage, setDiscountPercentage] = useState(null);
    const [files, setFiles] = useState({
        image_right: null,
        image_left: null,
        image_back: null,
        image_front: null,
        bluebook_image: null,
        identity_image: null,
    });
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const fetchCategoriesAndOwnerId = async () => {
            const token = localStorage.getItem('token');
            console.log('Stored Token:', token); // Log the stored token
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    console.log('Decoded Token:', decoded); // Log the decoded token
    
                    if (decoded.id) { // Check for the presence of id
                        setFormData(prev => ({ ...prev, owner_id: decoded.id }));
                    } else {
                        console.error('ID is missing in the token');
                        setErrorMessage('Owner ID is not available. Please log in again.');
                    }
    
                    const categoryResponse = await axios.get('http://localhost:5000/cat_owner/categories', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setCategories(categoryResponse.data);
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    setErrorMessage('Failed to fetch data. Please try again.');
                }
            } else {
                console.error('Token is not available');
                setErrorMessage('User not logged in. Please log in.');
            }
        };
    
        fetchCategoriesAndOwnerId();
    }, []);

    useEffect(() => {
        // Ensure both final_price and discountPercentage are valid before calculation
        if (formData.final_price && discountPercentage !== null) {
            const discountedPrice = Math.round(parseFloat(formData.final_price) - (parseFloat(formData.final_price) * discountPercentage) / 100);
            setFormData(prev => ({ ...prev, discounted_price: discountedPrice }));
        } else {
            setFormData(prev => ({ ...prev, discounted_price: '' }));
        }
    }, [discountPercentage, formData.final_price]);
    




    console.log("Final Price:", parseFloat(formData.final_price));
    // if (parseFloat(formData.final_price) < 50 || parseFloat(formData.final_price) > 100) {
    //     alert('Final price must be between 50 and 100');
    //     return;
    // }
    
    // Ensure it's a number

    const handleChange = async (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
    
        if (name === 'category_id' && value) {
            try {
                const token = localStorage.getItem('token');
                const discountResponse = await axios.get(`http://localhost:5000/cat_owner/discount/${value}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const activeDiscount = discountResponse.data;
                console.log('Active Discount:', activeDiscount); // Log discount details
                setDiscountPercentage(activeDiscount?.discount_percentage || null);
                setFormData(prev => ({ ...prev, discount_id: activeDiscount?.discount_id || null }));
            } catch (error) {
                console.error('Error fetching discount:', error);
                setDiscountPercentage(null);
                setFormData(prev => ({ ...prev, discount_id: null }));
            }
        }
    };
    
    

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFiles(prevFiles => ({
            ...prevFiles,
            [name]: files[0],
        }));
        console.log('File Uploaded:', name, files[0]);
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true); // Set loading state
    
        const token = localStorage.getItem('token');
        const formDataToSubmit = new FormData();
        for (const key in formData) formDataToSubmit.append(key, formData[key]);
        for (const key in files) if (files[key]) formDataToSubmit.append(key, files[key]);
    
        try {
            const response = await axios.post('http://localhost:5000/vehicle/add-vehicle', formDataToSubmit, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            setSuccessMessage('Vehicle registered successfully!');
            console.log(response.data);
    
            // Reset form data
            setFormData({
                owner_id: '',
                category_id: '',
                vehicle_name: '',
                model: '',
                cc: '',
                color: '',
                transmission: '',
                fuel_type: '',
                bluebook_number: '',
                last_renewed: '',
                tax_paid_until: '',
                insurance_expiry: '',
                vin_number: '',
                registration_number: '',
                final_price: '',
                discounted_price: '',
                terms: 0,
                rent_start_date: '',
                rent_end_date: '',
                availability: 1, 
                discount_id: formData.discount_id,
            });
            setFiles({
                image_right: null,
                image_left: null,
                image_back: null,
                image_front: null,
                bluebook_image: null,
                identity_image: null,
            });
    
            window.alert("Vehicle registered successfully!");

            // Reload the page after the alert is acknowledged
            window.location.reload();

        } catch (error) {
            setErrorMessage('Error adding vehicle: ' + (error.response?.data?.message || error.message));
            console.error('Error adding vehicle:', error.response?.data || error.message);
        } finally {
            setLoading(false); // Reset loading state
        }
    };
    

    console.log('Form Data:', formData);

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg border border-gray-300">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Vehicle Registration Form</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && <div className="mb-4 text-red-600 font-semibold">{errorMessage}</div>}
                {successMessage && <div className="mb-4 text-green-600 font-semibold">{successMessage}</div>}
                {loading && <div className="mb-4 text-blue-600 font-semibold">Processing...</div>}

                {/* Physical Details */}
                <fieldset className="p-6 bg-gray-50 rounded-lg shadow">
                    <legend className="font-semibold text-lg text-gray-700 mb-4">Physical Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Select Category</span>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <option key={category.category_id} value={category.category_id}>
                                            {category.category_name}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No categories available</option>
                                )}
                            </select>
                        </label>

                        {['vehicle_name', 'model', 'cc', 'color'].map((field) => (
                            <label key={field} className="flex flex-col">
                                <span className="font-medium text-gray-700">{field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                                <input
                                    type="text"
                                    name={field}
                                    placeholder={`Enter ${field.replace('_', ' ')}`}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </label>
                        ))}

                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Transmission</span>
                            <select
                                name="transmission"
                                value={formData.transmission}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Transmission</option>
                                <option value="Automatic">Automatic</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </label>

                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Fuel Type</span>
                            <select
                                name="fuel_type"
                                value={formData.fuel_type}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Fuel Type</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </label>
                    </div>
                </fieldset>

                {/* Document Details */}
                <fieldset className="p-6 bg-gray-50 rounded-lg shadow">
                    <legend className="font-semibold text-lg text-gray-700 mb-4">Document Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Bluebook Number</span>
                            <input
                                type="text"
                                name="bluebook_number"
                                placeholder="Enter Bluebook Number"
                                value={formData.bluebook_number}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Last Renewed</span>
                            <input
                                type="date"
                                name="last_renewed"
                                value={formData.last_renewed}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Tax Paid Until</span>
                            <input
                                type="date"
                                name="tax_paid_until"
                                value={formData.tax_paid_until}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Insurance Expiry</span>
                            <input
                                type="date"
                                name="insurance_expiry"
                                value={formData.insurance_expiry}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">VIN Number</span>
                            <input
                                type="text"
                                name="vin_number"
                                placeholder="Enter VIN Number"
                                value={formData.vin_number}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Registration Number</span>
                            <input
                                type="text"
                                name="registration_number"
                                placeholder="Enter Registration Number"
                                value={formData.registration_number}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Final Price</span>
                            <input
                                type="number"
                                name="final_price"
                                placeholder="Enter Final Price"
                                value={formData.final_price}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Discounted Price</span>
                            <input
                                type="text"
                                name="discounted_price"
                                value={formData.discounted_price}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                readOnly
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Rent Start Date</span>
                            <input
                                type="date"
                                name="rent_start_date"
                                value={formData.rent_start_date}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </label>

                        <label className="flex flex-col">
                            <span className="font-medium text-gray-700">Rent End Date</span>
                            <input
                                type="date"
                                name="rent_end_date"
                                value={formData.rent_end_date}
                                onChange={handleChange}
                                className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </label>
                    </div>
                </fieldset>

                {/* File Uploads */}
                <fieldset className="p-6 bg-gray-50 rounded-lg shadow">
                    <legend className="font-semibold text-lg text-gray-700 mb-4">File Uploads</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['image_right', 'image_left', 'image_back', 'image_front', 'bluebook_image', 'identity_image'].map((fileKey) => (
                            <label key={fileKey} className="flex flex-col">
                                <span className="font-medium text-gray-700">{fileKey.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                                <input
                                    type="file"
                                    name={fileKey}
                                    onChange={handleFileChange}
                                    className="mt-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required={fileKey !== 'bluebook_image' && fileKey !== 'identity_image'} // Make some fields required, if needed
                                />
                            </label>
                        ))}
                    </div>
                </fieldset>

                {/* Terms and Conditions */}
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        name="terms"
                        checked={formData.terms === 1}
                        onChange={handleChange}
                        className="mr-2"
                        required
                    />
                    <span className="text-gray-700">I agree to the terms and conditions</span>
                </label>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    Register Vehicle
                </button>
            </form>
        </div>
    );
};

export default VehicleForm;
