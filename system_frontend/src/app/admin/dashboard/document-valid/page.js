"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VehicleDetails = () => {
  const [vehicleDetails, setVehicleDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch vehicle details from API
    const fetchVehicleDetails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/ratedetails/vehicle-details');
        setVehicleDetails(response.data); // Set the fetched data
      } catch (err) {
        setError('Failed to fetch vehicle details');
      } finally {
        setLoading(false); // Hide loading when request completes
      }
    };
    fetchVehicleDetails();
  }, []);

  // Function to check if the date is expired
  const checkDateValidity = (date) => {
    const currentDate = new Date();
    const expiryDate = new Date(date);
    return expiryDate < currentDate;
  };

  // Function to format dates to YY:MM:DD
  const formatDate = (date) => {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear().toString().slice(-2);
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = formattedDate.getDate().toString().padStart(2, '0');
    return `${year}:${month}:${day}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full table-auto bg-white border border-gray-300 rounded-lg shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">Vehicle Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">Model</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">Tax Paid Until</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">Insurance Expiry</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700">
          {vehicleDetails.map((vehicle, index) => {
            const taxValid = !checkDateValidity(vehicle.tax_paid_until);
            const insuranceValid = !checkDateValidity(vehicle.insurance_expiry);
            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">{vehicle.vehicle_name}</td>
                <td className="px-6 py-4 border-b">{vehicle.model}</td>
                <td className="px-6 py-4 border-b">{formatDate(vehicle.tax_paid_until)}</td>
                <td className="px-6 py-4 border-b">{formatDate(vehicle.insurance_expiry)}</td>
                <td className="px-6 py-4 border-b">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      taxValid && insuranceValid ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {taxValid && insuranceValid ? 'Valid' : 'Invalid'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleDetails;