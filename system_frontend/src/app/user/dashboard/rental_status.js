"use client";
import React, { useEffect, useState } from 'react';

const RentalOverview = ({ userId, token }) => {
    const [rentalOverview, setRentalOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("User ID:", userId);

        const fetchRentalOverview = async () => {
            try {
                const response = await fetch(`http://localhost:5000/userDetails/${userId}/rental-overview`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Properly setting the Authorization header
                    }
                });
                const data = await response.json();
                setRentalOverview(data);
            } catch (error) {
                console.error("Error fetching rental overview:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId && token) {
            fetchRentalOverview();
        }
    }, [userId, token]);

    if (loading) {
        return <div className="text-center text-gray-600">Loading rental overview...</div>;
    }

    if (!rentalOverview) {
        return <div className="text-center text-gray-600">No rental data available.</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="text-2xl font-semibold text-center text-gray-800 mb-2">Vehicle Overview</h3>
            
            <div className="space-y-3 mb-6 p-4 rounded-md shadow-sm">
                <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-700">Total Rentals:</span>
                    <span className="text-lg text-gray-900">{rentalOverview.totalRentals}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-700">Currently Rented:</span>
                    <span className="text-lg text-gray-900">{rentalOverview.currentlyRented}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-700">Upcoming Rentals:</span>
                    <span className="text-lg text-gray-900">{rentalOverview.upcomingRentals ? rentalOverview.upcomingRentals.length : 0}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-700">Past Rentals:</span>
                    <span className="text-lg text-gray-900">{rentalOverview.pastRentals}</span>
                </div>
            </div>
        </div>
    );
};

export default RentalOverview;
