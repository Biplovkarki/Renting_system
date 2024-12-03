"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IncomeBreakdown = ({ ownerId, token }) => {
  const [incomeByVehicle, setIncomeByVehicle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/vehicledescriptionrouter/${ownerId}/income-breakdown`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Handle potential NULL values from the database
        const processedData = response.data.map(item => ({
          ...item,
          earnings: item.earnings === null ? 0 : parseFloat(item.earnings) // Convert to Number and handle nulls
        }));
        setIncomeByVehicle(processedData);
        console.log("Fetched income by vehicle:", processedData);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching income breakdown');
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, [ownerId, token]);

  if (loading) return <p className="text-center text-xl font-semibold">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const formatCurrency = (amount) => {
    if (isNaN(amount)) return 'Rs. 0';
    return `Rs. ${Math.round(amount).toLocaleString('en-NP')}`; // Round the number and format it
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Income Breakdown</h2>
      {incomeByVehicle.length === 0 ? (
        <p className="text-center text-lg text-gray-500">No income data available</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Vehicle Name</th>
              <th className="text-right p-2">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {incomeByVehicle.map((income, index) => (
              <tr key={index}>
                <td className="p-2">{income.vehicle_name} {income.model}</td>
                <td className="text-right p-2">{formatCurrency(income.earnings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default IncomeBreakdown;
