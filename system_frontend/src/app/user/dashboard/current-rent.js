"use client";
import React, { useEffect, useState } from 'react';

const CurrentRentalDetails = ({ userId, token }) => {
    const [rentalDetails, setRentalDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurrentRentalDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/userDetails/current-rental-details/${userId}`, {
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
        return <div className="text-center py-4 text-lg">Loading current rental details...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-lg text-red-500">{error}</div>;
    }

    if (!rentalDetails || rentalDetails.length === 0) {
        return <div className="text-center py-4 text-lg text-gray-500">No current rental details available.</div>;
    }

    return (
        <div className="current-rental-details py-8 px-4 bg-white shadow-md rounded-lg">
            <h3 className="text-2xl font-semibold text-center mb-6">Current Rental Details</h3>
            {rentalDetails.map((rental, index) => (
                <div key={index} className="rental-item mb-6 p-4 rounded-md shadow-sm">
                    <div className='flex flex-row gap-4 mb-2'>
                    <p className="text-lg"><strong>{rental.vehicle_name}, {rental.model}</strong> </p>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-400 text-yellow-800">
                    {rental.fuel_type}
                </span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    {rental.transmission}
                </span>
                </div>
                    <p className="text"><strong>From:</strong> {new Date(rental.rent_start_date).toLocaleDateString()}  - <strong>To:</strong> {new Date(rental.rent_end_date).toLocaleDateString()}</p>
                   
                    <p className="text-lg"><strong>Total Cost:</strong> Rs.{rental.grand_total}</p>
                    <p className="text-lg"><strong>Payment Status:</strong> 
                        <span className={rental.paid_status === 1 ? "text-green-600" : "text-red-600"}>
                            {rental.paid_status === 1 ? "Paid" : "Pending"}
                        </span>
                    </p>
                </div>
            ))}
        </div>
    );
};

export default CurrentRentalDetails;
