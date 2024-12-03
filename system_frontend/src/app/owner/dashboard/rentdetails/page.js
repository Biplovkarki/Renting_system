"use client"
import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

const RentalDetails = () => {
    const router = useRouter();
    const [ownerId, setOwnerId] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [currentRentals, setCurrentRentals] = useState([]);
    const [upcomingRentals, setUpcomingRentals] = useState([]);
    const [pastRentals, setPastRentals] = useState([]);
    const [rentalOverview, setRentalOverview] = useState({
        totalRentals: 0,
        currentlyRented: 0,
        upcomingRentals: [],
        pastRentals: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    // Validate environment variable
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboardforowner` 
        : 'http://localhost:5000/dashboardforowner';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/owner/loginOwner');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                localStorage.removeItem('token');
                alert('Session expired. Please log in again.');
                router.push('/owner/loginOwner');
                return;
            }

            setOwnerId(decoded.id);
            fetchVehicles(decoded.id, token);
        } catch (error) {
            console.error('Token validation error:', error);
            localStorage.removeItem('token');
            router.push('/owner/loginOwner');
        }
    }, [router]);

    const fetchVehicles = async (ownerId, token) => {
        try {
            const response = await axios.get(`${apiBaseUrl}/${ownerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVehicles(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setError(error.response?.data?.message || 'Failed to fetch vehicles');
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (selectedVehicleId && ownerId && token) {
            fetchRentalData(ownerId, selectedVehicleId, token);
        }
    }, [selectedVehicleId, ownerId]);

    const fetchRentalData = async (ownerId, vehicleId, token) => {
        try {
            setLoading(true);
            // Parallel data fetching for efficiency
            const [overview, current, upcoming, past] = await Promise.all([
                axios.get(`${apiBaseUrl}/${ownerId}/${vehicleId}/rental-overview`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${apiBaseUrl}/${ownerId}/${vehicleId}/current-rental-details`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${apiBaseUrl}/${ownerId}/${vehicleId}/upcoming-rental-details`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${apiBaseUrl}/${ownerId}/${vehicleId}/past-rental-details`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);
    
            console.log('Rental Overview:', overview.data);
            console.log('Current Rentals:', current.data);
            console.log('Upcoming Rentals:', upcoming.data);
            console.log('Past Rentals:', past.data);
    
            // Set state for rental counts
            setRentalOverview({
                totalRentals: overview.data.totalRentals || 0,
                currentlyRented: current.data || [],  // current rentals as an array
                upcomingRentals: upcoming.data || [], // upcoming rentals as an array
                pastRentals: past.data || []  // past rentals as an array
            });
    
            setCurrentRentals(current.data);
            setUpcomingRentals(upcoming.data);
            setPastRentals(past.data);
    
            setLoading(false);
        } catch (error) {
            console.error('Error fetching rental data:', error);
            setError(error.response?.data?.message || 'Failed to fetch rental details');
            setLoading(false);
        }
    };


    const renderRentals = (rentals) => {
        if (!rentals || rentals.length === 0) {
            return (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-500 text-lg font-medium">
                        No rentals found for this category.
                    </p>
                </div>
            );
        }

        return rentals.map((rental, index) => (
            <div 
                key={index} 
                className="bg-white border border-gray-200 shadow-sm rounded-lg p-5 mb-4 transition-all duration-300 hover:shadow-md"
            >
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                            Vehicle Details
                        </h3>
                        <div className="text-gray-700">
                            <p><span className="font-medium">Name:</span> {rental.vehicle_name} - {rental.model}</p>
                            <p><span className="font-medium">Fuel:</span> {rental.fuel_type}</p>
                            <p><span className="font-medium">Transmission:</span> {rental.transmission}</p>
                            <p><span className="font-medium">Renter Name:</span> {rental.username}</p> {/* Added username */}
                            </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                            Rental Period
                        </h3>
                        <div className="text-gray-700">
                            <p><span className="font-medium">Start:</span> {new Date(rental.rent_start_date).toLocaleDateString()}</p>
                            <p><span className="font-medium">End:</span> {new Date(rental.rent_end_date).toLocaleDateString()}</p>
                            <p><span className="font-medium">Total:</span> ${rental.grand_total}</p>
                            <p>
                                <span className="font-medium">Status:</span> 
                                <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                                    rental.paid_status 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {rental.paid_status ? 'Paid' : 'Pending'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        ));
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg shadow-md">
                <p className="font-medium">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r  text-center bg-gray-20 p-6">
                    <h2 className="text-3xl font-bold text-black">Vehicle Rental Details</h2>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <label 
                            htmlFor="vehicleSelect" 
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Select Vehicle
                        </label>
                        <select
                            id="vehicleSelect"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                            value={selectedVehicleId || ''}
                        >
                            <option value="" disabled>Select a vehicle</option>
                            {vehicles.map((vehicle) => (
                                <option 
                                    key={vehicle.vehicle_id} 
                                    value={vehicle.vehicle_id}
                                >
                                    {vehicle.vehicle_name} - {vehicle.model}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedVehicleId && (
                        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                            <Tab.List className="flex space-x-2 bg-gray-100 p-1 rounded-lg mb-6">
                                {['Current', 'Upcoming', 'Past'].map((category, index) => (
                                    <Tab
                                        key={category}
                                        className={({ selected }) => `
                                            w-full py-2.5 text-sm leading-5 font-medium rounded-lg
                                            focus:outline-none focus:ring-2 ring-offset-2 ring-blue-400
                                            ${selected 
                                                ? 'bg-white shadow text-blue-700' 
                                                : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-900'}
                                            transition-all duration-300
                                        `}
                                    >
                                        {category} Rentals (
                                            {index === 0 ? rentalOverview.currentlyRented.length :
                                            index === 1 ? rentalOverview.upcomingRentals.length :
                                            rentalOverview.pastRentals.length}
                                        )
                                    </Tab>
                                ))}
                            </Tab.List>
                            <Tab.Panels>
                                <Tab.Panel>{renderRentals(currentRentals)}</Tab.Panel>
                                <Tab.Panel>{renderRentals(upcomingRentals)}</Tab.Panel>
                                <Tab.Panel>{renderRentals(pastRentals)}</Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RentalDetails;