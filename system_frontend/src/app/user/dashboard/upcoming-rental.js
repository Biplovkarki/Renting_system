"use client";
import React, { useEffect, useState } from 'react';

const UpcomingRentalDetails = ({ userId, token }) => {
    const [rentalDetails, setRentalDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurrentRentalDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/userDetails/upcoming-rental-details/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch current rental details.");
                }

                const data = await response.json();
                setRentalDetails(data); // Set the fetched rental data
            } catch (error) {
                setError(error.message);
                console.error('Error fetching current rental details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId && token) {
            fetchCurrentRentalDetails();
        }
    }, [userId, token]);

    if (loading) {
        return <div className="text-center py-4 text-lg text-gray-500">Loading upcoming rental details...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-lg text-red-500">{error}</div>;
    }

    if (!rentalDetails || rentalDetails.length === 0) {
        return <div className="text-center py-4 text-lg text-gray-500">No upcoming rental details available.</div>;
    }

    return (
        <div className="current-rental-details py-8 px-6 bg-white shadow-xl rounded-lg max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">Upcoming Rental Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rentalDetails.map((rental, index) => (
                    <div key={index} className="rental-item bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                       
                            <p className="text-xl font-semibold text-gray-800">{rental.vehicle_name}, {rental.model}</p>
                            <div className="flex gap-2">
                                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">{rental.fuel_type}</span>
                                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-200 text-yellow-800">{rental.transmission}</span>
                            </div>
                   
                        <p className="text-md text-gray-600 mb-2"><strong>From:</strong> {new Date(rental.rent_start_date).toLocaleDateString()} </p>
                        <p className="text-md text-gray-600 mb-2"><strong>From:</strong> {new Date(rental.rent_end_date).toLocaleDateString()} </p>
                   
                        <p className="text-lg font-semibold text-gray-700 mb-2"><strong>Total Cost:</strong> Rs.{rental.grand_total}</p>
                        <p className="text-lg">
                            <strong>Payment Status:</strong> 
                            <span className={rental.paid_status === "paid" ? "text-green-600" : "text-red-600"}>
                                {rental.paid_status === "paid" ? "Paid" : "Pending"}
                            </span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingRentalDetails;
