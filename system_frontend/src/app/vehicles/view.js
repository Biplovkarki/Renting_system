"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InformationCircleIcon, CogIcon, StarIcon, BanknotesIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import VehicleSearch from './serach';

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [userId, setUserId] = useState(null);
    const [focusedVehicleId, setFocusedVehicleId] = useState(null);
    const [sortBy, setSortBy] = useState('final_price');
    const [order, setOrder] = useState('asc');
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
    }, [selectedCategory, focusedVehicleId]);

    useEffect(() => {
        const fetchSortedVehicles = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/sort/vehicles', {
                    params: { category_id: selectedCategory,sortBy, order},
                });
                setVehicles(response.data);
            } catch (error) {
                setError(`Failed to load sorted vehicles: ${error.message}`);
                console.error('Error fetching sorted vehicles:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSortedVehicles();
    }, [ selectedCategory,sortBy, order]);
    console.log("Fetched vehicles:", vehicles);

    console.log("SortBy:", sortBy, "Order:", order);


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
    
            // Send the request to create an order
            const response = await axios.post(
                'http://localhost:5000/order/create',
                { user_id: userId, vehicle_id: vehicleId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            console.log("Order created:", response.data);
    
            // If order is successfully created, proceed
            alert('Your order has been created. You have 5 minutes to complete the rental process.');
            localStorage.setItem('orderId', response.data.order_id);
            localStorage.setItem('orderTimeout', Date.now() + 10 * 60 * 1000);
    
            router.push(`/books/${vehicleId}`);
        } catch (error) {
            if (error.response && error.response.data.message) {
                // If the backend sends an error message (e.g., missing fields in user profile)
                alert(`Error: ${error.response.data.message}`);
            } else {
                console.error('Error creating order:', error);
                alert('An error occurred while creating the order. Please try again.');
            }
        }
    };    
    

    const handleVehicleSelect = (vehicleId) => {
        setFocusedVehicleId(vehicleId);
    };

    const formatPrice = (price) => `Rs. ${Math.round(price).toLocaleString()}`;

    if (loading) return <div className="text-center text-gray-500">Loading... <span className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-gray-500"></span></div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;
    if (vehicles.length === 0) return <div className="text-center text-gray-500">No vehicles found matching your selection.</div>;

    const groupedVehicles = vehicles.reduce((groups, vehicle) => {
        const categoryName = vehicle.category_name;
        if (!groups[categoryName]) groups[categoryName] = [];
        groups[categoryName].push(vehicle);
        return groups;
    }, {});

    const getSortedVehicles = (vehicles) => {
        let vehiclesCopy = [...vehicles];
        const focusedIndex = vehiclesCopy.findIndex((v) => v.vehicle_id === focusedVehicleId);
        if (focusedIndex !== -1) {
            const [focusedVehicle] = vehiclesCopy.splice(focusedIndex, 1);
            vehiclesCopy.unshift(focusedVehicle);
        }
        return vehiclesCopy;
    };

    return (
        <div>
            <VehicleSearch onVehicleSelect={handleVehicleSelect} />

            <div className="container mx-auto max-w-screen-xl p-4">
                <div className="flex justify-between mb-6">
                    <div className="flex gap-3">
                        <CategoryButton selected={selectedCategory === null} onClick={() => setSelectedCategory(null)}>All Categories</CategoryButton>
                        {categories.map((category) => (
                            <CategoryButton key={category.category_id} selected={selectedCategory === category.category_id} onClick={() => setSelectedCategory(category.category_id)}>
                                {category.category_name}
                            </CategoryButton>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <select
                                onChange={(e) => setSortBy(e.target.value)}
                                value={sortBy}
                                className="p-2 border rounded-md pr-8"
                            >
                                <option value="final_price">Price</option>
                                <option value="cc">CC</option>
                                <option value="rating_value">Rating</option>
                                <option value="availability">Availability</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                {sortBy === "final_price" && <BanknotesIcon className="w-5 h-5" />}
                                {sortBy === "cc" && <CogIcon className="w-5 h-5" />}
                                {sortBy === "rating_value" && <StarIcon className="w-5 h-5" />}
                                {sortBy === "availability" && <FunnelIcon className="w-5 h-5" />}
                            </div>
                        </div>

                        <div className="relative">
                            <select
                                onChange={(e) => setOrder(e.target.value)}
                                value={order}
                                className="p-2 border rounded-md pr-8">
                                <option value="asc">Low to High</option>
                                <option value="desc">High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    {selectedCategory === null ? (
                        Object.keys(groupedVehicles).map((categoryName) => (
                            <VehicleCategory
                                key={categoryName}
                                categoryName={categoryName}
                                vehicles={getSortedVehicles(groupedVehicles[categoryName])}
                                handleCreateOrder={handleCreateOrder}
                                openModal={openModal}
                                focusedVehicleId={focusedVehicleId}
                            />
                        ))
                    ) : (
                        <VehicleCategory
                            vehicles={getSortedVehicles(vehicles)}
                            handleCreateOrder={handleCreateOrder}
                            openModal={openModal}
                            focusedVehicleId={focusedVehicleId}
                        />
                    )}
                </div>
                {showModal && selectedVehicle && <VehicleModal vehicle={selectedVehicle} closeModal={closeModal} />}
            </div>
        </div>
    );
};




const VehicleCategory = ({ vehicles, handleCreateOrder, openModal, focusedVehicleId }) => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vehicles.map((vehicle) => (
                    <VehicleCard
                        key={vehicle.vehicle_id}
                        vehicle={vehicle}
                        handleCreateOrder={handleCreateOrder}
                        openModal={openModal}
                        focusedVehicleId={focusedVehicleId}
                    />
                ))}
            </div>
        </div>
    );
};

const VehicleCard = ({ vehicle, handleCreateOrder, openModal, focusedVehicleId }) => {
    const formatPrice = (price) => `Rs. ${Math.round(price).toLocaleString()}`;
    const focused = vehicle.vehicle_id === focusedVehicleId;

    return (
        <div className={`relative border rounded-lg shadow-lg p-4 ${focused ? 'border-blue-500' : ''}`}>
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
            <img src={`http://localhost:5000/${vehicle.image_front}`} alt={vehicle.vehicle_name} className="w-full h-48 object-contain rounded-md" />
            <div className="mt-4">
                <p className="font-medium text-red-800"><strong>{vehicle.vehicle_name}, {vehicle.model}</strong></p>
                <p className="text-gray-700 font-semibold">
                    Price:
                    {vehicle.discounted_price && vehicle.discounted_price < vehicle.final_price ? (
                        <>
                            <span className="line-through mr-2">{formatPrice(vehicle.final_price)}</span>
                            <span className="text-green-600">{formatPrice(vehicle.discounted_price)}</span>
                        </>
                    ) : (
                        <span>{formatPrice(vehicle.final_price)}</span>
                    )}
                </p>
                <button
                    onClick={() => handleCreateOrder(vehicle.vehicle_id)}
                    className={`w-full px-4 py-2 mt-4 text-white font-semibold rounded-lg ${vehicle.availability === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                    disabled={vehicle.availability === 0}
                >
                    {vehicle.availability === 0 ? 'Unavailable' : 'Book Now'}
                </button>
            </div>
        </div>
    );
};

const CategoryButton = ({ selected, onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-md ${selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} transition`}
        >
            {children}
        </button>
    );
};

const VehicleModal = ({ vehicle, closeModal }) => {
    const formatPrice = (price) => `Rs. ${Math.round(price).toLocaleString()}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
            <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 focus:outline-none"
                    aria-label="Close Modal"
                >
                    ✕
                </button>

                <p className="font-semibold text-lg">{vehicle.vehicle_name},{vehicle.model}</p>
             
                <p className="font-medium text-gray-700">Fuel Type: {vehicle.fuel_type}</p>
                <p className="font-medium text-gray-700">Transmission: {vehicle.transmission}</p>
                
                <p className="font-medium text-gray-600">CC: {vehicle.cc}</p>
                <p className="font-medium text-gray-600">Color: {vehicle.color}</p>
               
                <p className="text-gray-700 font-semibold">
                    Price:
                    {vehicle.discounted_price && vehicle.discounted_price < vehicle.final_price ? (
                        <>
                            <span className="line-through mr-2">{formatPrice(vehicle.final_price)}</span>
                            <span className="text-black">{formatPrice(vehicle.discounted_price)}</span>
                        </>
                    ) : (
                        <span>{formatPrice(vehicle.final_price)}</span>
                    )}
                </p>
                <p
                    className={`font-medium ${vehicle.availability === 0 ? "text-red-500" : "text-green-500"
                        }`}
                >
                    {vehicle.availability === 0 ? "Unavailable" : "Available"}
                </p>
            </div>


        </div>

    );
};

export default VehicleList;