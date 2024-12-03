"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const RentalSummaryTable = () => {
  const [rentalData, setRentalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminToken, setAdminToken] = useState(null);
  const router = useRouter();

  // Get the admin token from localStorage or redirect to login
  useEffect(() => {
    const storedAdminToken = localStorage.getItem("adminToken");
    if (storedAdminToken) {
      setAdminToken(storedAdminToken);
    } else {
      router.push("/admin/loginAdmin");
    }
  }, [router]);

  // Fetch rental summary data when the adminToken is available
  useEffect(() => {
    if (!adminToken) return; // Do not fetch until adminToken is set

    const fetchRentalSummary = async () => {
      try {
        setLoading(true); // Show loading when starting the request
        const response = await axios.get('http://localhost:5000/ratedetails/rental-summary', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setRentalData(response.data); // Set the fetched data
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch rental data');
      } finally {
        setLoading(false); // Hide loading after request completes
      }
    };

    fetchRentalSummary();
  }, [adminToken]); // Run this effect when adminToken changes

  if (loading) {
    return <div className="text-center py-4 text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  // Function to safely format numbers to whole numbers
  const formatNumber = (value) => {
    const numValue = parseInt(value, 10);
    return isNaN(numValue) ? '0' : numValue.toString();
  };

  return (
    <div className="overflow-x-auto p-6 bg-gray-50 rounded-3xl shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Rental Summary</h1>
      <table className="min-w-full table-auto bg-white   rounded-3xl shadow-md">
        <thead className="bg-gray-300 rounded-3xl">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">Vehicle Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">Total Revenue</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">Rented Count</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">Average Rent Price</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">Average Rental Days</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700">
          {rentalData.map((item) => (
            <tr key={item.vehicle_name} className="hover:bg-gray-50 transition-all ease-in-out duration-200">
              <td className="px-6 py-4 border-b">{item.vehicle_name}</td>
              <td className="px-6 py-4 border-b font-medium">Rs.{formatNumber(item.total_revenue)}</td>
              <td className="px-6 py-4 border-b font-medium">{formatNumber(item.rented_count)}</td>
              <td className="px-6 py-4 border-b  font-medium">Rs.{formatNumber(item.avg_rent_price)}</td>
              <td className="px-6 py-4 border-b font-medium">{formatNumber(item.avg_rental_days)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RentalSummaryTable;
