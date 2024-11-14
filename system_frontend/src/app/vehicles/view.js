"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';  // Import useRouter from next/router

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const router = useRouter();  // Initialize useRouter

    useEffect(() => {
        const fetchVehiclesAndCategories = async () => {
            try {
                // Fetch categories first
                const categoriesResponse = await axios.get('http://localhost:5000/fetchdetails/categories');
                setCategories(categoriesResponse.data);

                // Fetch vehicles for selected category (or all vehicles if none is selected)
                const vehiclesResponse = await axios.get('http://localhost:5000/fetchdetails/vehicle', {
                    params: { categoryId: selectedCategory }
                });

                setVehicles(vehiclesResponse.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load vehicles or categories.');
                setLoading(false);
            }
        };

        fetchVehiclesAndCategories();
    }, [selectedCategory]);  // Run again when selectedCategory changes

    const openModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedVehicle(null);
        setShowModal(false);
    };

    const handleBookNow = (vehicleId) => {
        // Navigate to the booking page, passing the vehicleId
        router.push(`/books/${vehicleId}`);
    };

    if (loading) return <div className="text-center text-gray-500">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;
    if (vehicles.length === 0) return <div className="text-center text-gray-500">No approved vehicles found.</div>;

    // Function to format price to Nepali Rupees (NPR) with rounding
    const formatPrice = (price) => {
        return `Rs. ${Math.round(price).toLocaleString()}`;  // Convert to NPR and round the value
    };

    // Group vehicles by category
    const groupedVehicles = vehicles.reduce((groups, vehicle) => {
        const categoryName = vehicle.category_name;
        if (!groups[categoryName]) {
            groups[categoryName] = [];
        }
        groups[categoryName].push(vehicle);
        return groups;
    }, {});

    return (
        <div className="container mx-auto max-w-screen-xl p-4"> {/* Adjusted width here */}
            {/* <h1 className="text-2xl font-semibold text-center mb-4">Available Vehicles</h1> */}

            {/* Category Tabs */}
            <div className="flex justify-center border-b border-gray-200 mb-6">
                <div
                    onClick={() => setSelectedCategory(null)}
                    className={`cursor-pointer px-4 py-2 text-center transition-all duration-300 ease-in-out ${selectedCategory === null ? 'border-b-4 border-blue-500 text-blue-500 font-semibold' : 'text-gray-500'
                        }`}
                >
                    All Categories
                </div>
                {categories.map(category => (
                    <div
                        key={category.category_id}
                        onClick={() => setSelectedCategory(category.category_id)}
                        className={`cursor-pointer px-4 py-2 text-center transition-all duration-300 ease-in-out ${selectedCategory === category.category_id ? 'border-b-4 border-blue-500 text-blue-500 font-semibold' : 'text-gray-500'
                            }`}
                    >
                        {category.category_name}
                    </div>
                ))}
            </div>

            {/* Vehicle List */}
            <div className="space-y-6 ">
                {/* Show vehicles by category when "All Categories" is selected */}
                {selectedCategory === null ? (
                    Object.keys(groupedVehicles).map(categoryName => (
                        <div key={categoryName}>
                            <h2 className="text-xl font-semibold mb-4">{categoryName}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* Adjusted grid for larger screens */}
                                {groupedVehicles[categoryName].map(vehicle => (
                                    <div key={vehicle.vehicle_id} className="relative border rounded-lg shadow-lg p-4">
                                        <button
                                            onClick={() => openModal(vehicle)}
                                            className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
                                        >
                                            <InformationCircleIcon className="w-6 h-6" />
                                        </button>

                                        {/* Availability, Fuel Type, and Transmission badges */}
                                        <div className="absolute top-2 left-2 inline-flex items-center space-x-2">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${vehicle.availability === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                                            >
                                                {vehicle.availability === 0 ? 'Unavailable' : 'Available'}
                                            </span>

                                            <span
                                                className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                                            >
                                                {vehicle.fuel_type}
                                            </span>

                                            <span
                                                className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                                            >
                                                {vehicle.transmission}
                                            </span>
                                        </div>

                                        <img
                                            src={`http://localhost:5000/${vehicle.image_front}`}
                                            alt={vehicle.vehicle_name}
                                            className="w-full h-48 object-cover rounded-md"
                                        />

                                        <div className="mt-4">
                                       <p
                                                className="font-medium text-red-800"
                                            ><strong>
                                               {vehicle.vehicle_name}, {vehicle.model}
                                               </strong> </p>
                                            <p className="text-gray-700 font-semibold">
                                                Price:
                                                {vehicle.discounted_price && vehicle.discounted_price < vehicle.final_price ? (
                                                    <>
                                                        <span className="line-through mr-2 text-red-500">{formatPrice(vehicle.final_price)}</span>
                                                        <span className="text-green-600">{formatPrice(vehicle.discounted_price)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-green-600">{formatPrice(vehicle.final_price)}</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Book Now Button */}
                                        <button
                                            onClick={() => handleBookNow(vehicle.vehicle_id)}
                                            className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded w-full flex justify-center hover:bg-blue-700 ${vehicle.availability === 0 ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : ''
                                                }`}
                                            disabled={vehicle.availability === 0} // Disable the button when unavailable
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    // Render vehicles for a specific selected category
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* Adjusted grid for larger screens */}
                        {vehicles.map(vehicle => (
                            <div key={vehicle.vehicle_id} className="relative border rounded-lg shadow-lg p-4">
                                <button
                                    onClick={() => openModal(vehicle)}
                                    className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
                                >
                                    <InformationCircleIcon className="w-6 h-6" />
                                </button>

                                {/* Availability, Fuel Type, and Transmission badges */}
                                <div className="absolute top-2 left-2 inline-flex items-center space-x-2">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${vehicle.availability === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                                    >
                                        {vehicle.availability === 0 ? 'Unavailable' : 'Available'}
                                    </span>

                                    <span
                                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                                    >
                                        {vehicle.fuel_type}
                                    </span>

                                    <span
                                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800"
                                    >
                                        {vehicle.transmission}
                                    </span>
                                </div>

                                <img
                                    src={`http://localhost:5000/${vehicle.image_front}`}
                                    alt={vehicle.vehicle_name}
                                    className="w-full h-48 object-cover rounded-md"
                                />

                                <div className="mt-4">
                                <p
                                                className="font-medium text-red-800"
                                            ><strong>
                                               {vehicle.vehicle_name}, {vehicle.model}
                                               </strong> </p>
                                    <p className="text-gray-700 font-semibold">
                                        Price:
                                        {vehicle.discounted_price && vehicle.discounted_price < vehicle.final_price ? (
                                            <>
                                                <span className="line-through mr-2 text-red-500">{formatPrice(vehicle.final_price)}</span>
                                                <span className="text-green-600">{formatPrice(vehicle.discounted_price)}</span>
                                            </>
                                        ) : (
                                            <span className="text-green-600">{formatPrice(vehicle.final_price)}</span>
                                        )}
                                    </p>
                                </div>

                                {/* Book Now Button */}
                                <button
                                    onClick={() => handleBookNow(vehicle.vehicle_id)}
                                    className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded w-full flex justify-center hover:bg-blue-700 ${vehicle.availability === 0 ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : ''
                                        }`}
                                    disabled={vehicle.availability === 0} // Disable the button when unavailable
                                >
                                    Book Now
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for showing vehicle details */}
            {showModal && selectedVehicle && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg w-11/12 md:w-1/2">
                        <h2 className="text-2xl font-semibold mb-4">{selectedVehicle.vehicle_name}</h2>
                        <p className="text-gray-700 mb-4"><strong>Model:</strong> {selectedVehicle.model}</p>
                        <p className="text-gray-700 mb-4"><strong>Category:</strong> {selectedVehicle.category_name}</p>
                        <p className="text-gray-700 mb-4"><strong>Engine:</strong> {selectedVehicle.cc} CC</p>
                        <p className="text-gray-700 mb-4"><strong>Color:</strong> {selectedVehicle.color}</p>
                        <p className="text-gray-700 mb-4"><strong>Fuel Type:</strong> {selectedVehicle.fuel_type}</p>
                        <p className="text-gray-700 mb-4"><strong>Transmission:</strong> {selectedVehicle.transmission}</p>
                        <p className="text-gray-700 mb-4"><strong>Availability:</strong> {selectedVehicle.availability === 1 ? 'Available' : 'Not Available'}</p>
                        <div className="flex justify-end">
                            <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleList;
