"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const RentalStats = ({ ownerId, token }) => {
  const [rentalData, setRentalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentalData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/dashboardforowner/${ownerId}/rented-vehicles`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Fixed Authorization syntax
            },
          }
        );
        setRentalData(response.data);
      } catch (err) {
        // Check if the error is from the response or from network issues
        const errorMessage =
          err.response?.data?.message || err.message || "Error fetching data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalData();
  }, [ownerId, token]); // Added `token` as a dependency to rerun if token changes

  if (loading) {
    return <p className="text-center text-gray-600 text-lg">Loading...</p>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Rental Statistics</h2>
        {/* Displaying only the error message */}
        <p className="text-center text-gray-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!rentalData) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Rental Statistics</h2>
        <p className="text-center text-gray-600 text-lg">No rental data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Rental Statistics
      </h2>
      <div className="text-gray-700 space-y-2">
        <p>
          <span className="font-medium">Current Rentals:</span>{" "}
          {rentalData.current_rentals}
        </p>
        <p>
          <span className="font-medium">Past Rentals:</span>{" "}
          {rentalData.past_rentals}
        </p>
        <p>
          <span className="font-medium">Future Rentals:</span>{" "}
          {rentalData.future_rentals}
        </p>
      </div>
    </div>
  );
};

export default RentalStats;
