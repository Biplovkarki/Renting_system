"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TotalEarnings = ({ ownerId }) => {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch earnings data
    axios.get(`http://localhost:5000/details/earnings/${ownerId}`)
      .then(response => {
        const earningsData = response.data.data;

        // Calculate total earnings and round off
        const total = earningsData.reduce((sum, item) => {
          const numericEarning = parseFloat(item.owner_earnings.replace('RS.', '').trim()); // Remove currency symbol and parse
          return sum + numericEarning;
        }, 0);

        setTotalEarnings(Math.round(total)); // Round to the nearest integer
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching earnings:', err);
        setError('Failed to fetch earnings');
        setLoading(false);
      });
  }, [ownerId]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 flex flex-row  gap-2 rounded-xl w-80 text-center ">
      <h3 className="text-xl font-semibold text-gray-800">Total Earnings:</h3>
      <p className="text-xl font-bold text-green-700 ">
        Rs. {totalEarnings}
      </p>
    </div>
  );
};

export default TotalEarnings;
