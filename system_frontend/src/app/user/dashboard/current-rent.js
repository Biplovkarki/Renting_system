"use client";
import React, { useEffect, useState } from "react";

const CurrentRentalDetails = ({ userId, token }) => {
    const [rentalDetails, setRentalDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurrentRentalDetails = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/userDetails/current-rental-details/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json(); // Attempt to extract error message from response
                    throw new Error(errorData.message || "Failed to fetch current rental details.");
                }

                const data = await response.json();
                if (!data || data.length === 0) {
                    throw new Error("No current rental details available.");
                }
                setRentalDetails(data); // Set the fetched rental data
            } catch (error) {
                setError(error.message); // Set only the error message for UI display
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
        return (
            <div className="bg-gray-50 border  text-black px-6 py-4 rounded-lg max-w-md mx-auto mt-8 text-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mx-auto mb-4 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <p className="text-lg font-semibold">{error}</p>
                <p className="text-sm mt-2">
                    Please try again or contact support if the issue persists.
                </p>
            </div>
        );
    }

    const rentals = Array.isArray(rentalDetails) ? rentalDetails : [rentalDetails];

    return (
        <div className="current-rental-details py-8 px-4 bg-white shadow-md rounded-lg">
            <h3 className="text-2xl font-semibold text-center mb-6">Current Rental Details</h3>
            {rentals.map((rental, index) => (
                <div
                    key={index}
                    className="rental-item mb-6 p-4 rounded-md shadow-sm bg-gray-100"
                >
                    <div className="flex flex-row gap-4 mb-2">
                        <p className="text-lg">
                            <strong>{rental.vehicle_name}, {rental.model}</strong>
                        </p>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-400 text-yellow-800">
                            {rental.fuel_type}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            {rental.transmission}
                        </span>
                    </div>
                    <p className="text">
                        <strong>From:</strong> {new Date(rental.rent_start_date).toLocaleDateString()} -{" "}
                        <strong>To:</strong> {new Date(rental.rent_end_date).toLocaleDateString()}
                    </p>
                    <p className="text-lg">
                        <strong>Total Cost:</strong> Rs.{rental.grand_total}
                    </p>
                    <p className="text-lg">
                        <strong>Payment Status:</strong>{" "}
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
