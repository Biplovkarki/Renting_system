// VehicleList.js
"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InformationCircleIcon } from '@heroicons/react/24/solid'; // Import Heroicon

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get('http://localhost:5000/fetch/vehicle');
                setVehicles(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching vehicles:', err);
                setError('Failed to load vehicles.');
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    const openModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedVehicle(null);
        setShowModal(false);
    };

    if (loading) return <div className="text-center text-gray-500">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;
    if (vehicles.length === 0) return <div className="text-center text-gray-500">No approved vehicles found.</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold text-center mb-4">Available Vehicles</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
                    <div key={vehicle.vehicle_id} className="relative border rounded-lg shadow-lg p-4">
                        {/* Heroicons Info Icon */}
                        <button 
                            onClick={() => openModal(vehicle)}
                            className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
                        >
                            <InformationCircleIcon className="w-6 h-6" />
                        </button>

                        <img 
                            src={`http://localhost:5000/${vehicle.image_front} `}
                            alt={vehicle.vehicle_name} 
                            className="w-full h-48 object-cover rounded-md"
                        />
                        
                        <div className="mt-4">
                            <p className="text-gray-700 font-semibold">
                                Price: 
                                {vehicle.discounted_price ? (
                                    <span className="line-through mr-2 text-red-500">${vehicle.final_price}</span>
                                ) : null}
                                <span className="text-green-600">${vehicle.discounted_price || vehicle.final_price}</span>
                            </p>
                            <p className="text-gray-600">
                                Availability: {vehicle.availability === 1 ? 'Available' : 'Not Available'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && selectedVehicle && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">{selectedVehicle.vehicle_name} Details</h2>
                        <p><strong>Model:</strong> {selectedVehicle.model}</p>
                        <p><strong>Category:</strong> {selectedVehicle.category_name}</p>
                        <p><strong>Engine:</strong> {selectedVehicle.cc} CC</p>
                        <p><strong>Color:</strong> {selectedVehicle.color}</p>
                        <p><strong>Fuel Type:</strong> {selectedVehicle.fuel_type}</p>
                        <p><strong>Transmission:</strong> {selectedVehicle.transmission}</p>
                        <p><strong>Availability:</strong> {selectedVehicle.availability === 1 ? 'Available' : 'Not Available'}</p>
                        <button 
                            onClick={closeModal} 
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleList;
