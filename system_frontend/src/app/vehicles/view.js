"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [userId, setUserId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserId = async () => {
            const token = localStorage.getItem('userToken');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    setUserId(decoded.id);
                } catch (error) {
                    console.error('Error decoding token:', error);
                    router.push('/user/loginuser');
                }
            }
        };
        fetchUserId();
    }, []);

    useEffect(() => {
        const fetchVehiclesAndCategories = async () => {
            try {
                setLoading(true);
                const [categoriesResult, vehiclesResult] = await Promise.all([
                    axios.get('http://localhost:5000/fetchdetails/categories'),
                    axios.get('http://localhost:5000/fetchdetails/vehicle', { params: { categoryId: selectedCategory } }),
                ]);
                setCategories(categoriesResult.data);
                setVehicles(vehiclesResult.data);
            } catch (error) {
                setError(`Failed to load data: ${error.message}`);
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVehiclesAndCategories();
    }, [selectedCategory]);

    const openModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedVehicle(null);
        setShowModal(false);
    };

    const handleCreateOrder = async (vehicleId) => {
        console.log('handleCreateOrder called');
        console.log('Vehicle ID:', vehicleId);
        try {
            const token = localStorage.getItem('userToken');
            if (!userId) {
                alert('User not logged in');
                return;
            }
    
            console.log('User ID:', userId);  
            const response = await axios.post(
                'http://localhost:5000/order/create',
                { user_id: userId, vehicle_id: vehicleId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,  // Ensure this token is valid
                    },
                }
            );
    
            console.log("Order created:", response.data);
            alert('Your order has been created. You have 5 minutes to complete the rental process.');
            localStorage.setItem('orderId', response.data.order_id); // Store orderId
            localStorage.setItem('orderTimeout', Date.now() + 10 * 60 * 1000);
        
            // Optionally, redirect to the vehicle details page or another relevant page
            router.push(`/books/${vehicleId}`);
        } catch (error) {
            console.error('Error creating order:', error);
            alert('An error occurred while creating the order. Please try again.');
        }
    };
    

    if (loading) return <div className="text-center text-gray-500">Loading... <span className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-gray-500"></span></div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;
    if (vehicles.length === 0) return <div className="text-center text-gray-500">No vehicles found matching your selection.</div>;

    const formatPrice = (price) => `Rs. ${Math.round(price).toLocaleString()}`;

    const groupedVehicles = vehicles.reduce((groups, vehicle) => {
        const categoryName = vehicle.category_name;
        if (!groups[categoryName]) groups[categoryName] = [];
        groups[categoryName].push(vehicle);
        return groups;
    }, {});

    return (
        <div className="container mx-auto max-w-screen-xl p-4">
            <div className="flex justify-center border-b border-gray-200 mb-6">
                <CategoryButton selected={selectedCategory === null} onClick={() => setSelectedCategory(null)}>All Categories</CategoryButton>
                {categories.map((category) => (
                    <CategoryButton key={category.category_id} selected={selectedCategory === category.category_id} onClick={() => setSelectedCategory(category.category_id)}>
                        {category.category_name}
                    </CategoryButton>
                ))}
            </div>
            <div className="space-y-6">
                {selectedCategory === null ? (
                    Object.keys(groupedVehicles).map((categoryName) => (
                        <VehicleCategory key={categoryName} categoryName={categoryName} vehicles={groupedVehicles[categoryName]} handleCreateOrder={handleCreateOrder} openModal={openModal} />
                    ))
                ) : (
                    <VehicleCategory vehicles={vehicles} handleCreateOrder={handleCreateOrder} openModal={openModal} />
                )}
            </div>
            {showModal && selectedVehicle && (
                <VehicleModal vehicle={selectedVehicle} closeModal={closeModal} />
            )}
        </div>
    );
};

const VehicleCategory = ({ vehicles, handleCreateOrder, openModal }) => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.vehicle_id} vehicle={vehicle} handleCreateOrder={handleCreateOrder} openModal={openModal} />
                ))}
            </div>
        </div>
    );
};

const VehicleCard = ({ vehicle, handleCreateOrder, openModal }) => {
    const formatPrice = (price) => `Rs. ${Math.round(price).toLocaleString()}`;

    return (
        <div className="relative border rounded-lg shadow-lg p-4">
            <button onClick={() => openModal(vehicle)} className="absolute top-2 right-2 text-blue-500 hover:text-blue-700">
                <InformationCircleIcon className="w-6 h-6" />
            </button>
            <div className="absolute top-2 left-2 inline-flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${vehicle.availability === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {vehicle.availability === 0 ? 'Unavailable' : 'Available'}
                </span>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {vehicle.fuel_type}
                </span>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    {vehicle.transmission}
                </span>
            </div>
            <img src={`http://localhost:5000/${vehicle.image_front}`} alt={vehicle.vehicle_name} className="w-full h-48 object-cover rounded-md" />
            <div className="mt-4">
                <p className="font-medium text-red-800"><strong>{vehicle.vehicle_name}, {vehicle.model}</strong></p>
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
            <button
                onClick={() => handleCreateOrder(vehicle.vehicle_id)} 
                className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded w-full flex justify-center items-center ${vehicle.availability === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={vehicle.availability === 0}
            >
                Book Now
            </button>
        </div>
    );
};

const CategoryButton = ({ selected, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md text-sm font-medium ${selected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
    >
        {children}
    </button>
);

const VehicleModal = ({ vehicle, closeModal }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                    X
                </button>
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">{vehicle.vehicle_name}</h3>
                    <p>{vehicle.category_name}</p>
                    <p>Model: {vehicle.model}</p>
                    <p>CC: {vehicle.cc}</p>
                    <p>Color: {vehicle.color}</p>
                    <p>Fuel Type: {vehicle.fuel_type}</p>
                    <p>Transmission: {vehicle.transmission}</p>
                    <p className="text-red-500">{vehicle.availability === 0 ? 'Unavailable' : 'Available'}</p>
                    <p className="font-medium text-gray-700">Price: {vehicle.final_price}</p>
                </div>
            </div>
        </div>
    );
};

export default VehicleList;
