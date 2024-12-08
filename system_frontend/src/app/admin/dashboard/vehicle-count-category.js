"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VehicleCategoryCountTable = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    axios
      .get('http://localhost:5000/counts/vehiclespercategory')
      .then((response) => {
        setCategoryData(response.data.vehicles_per_category);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center text-lg">Loading...</div>;
  if (error) return <div className="text-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-fit">
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">Category Dashboard</h1>
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 font-medium">Category ID</th>
              <th className="px-6 py-3 text-left text-gray-700 font-medium">Total Vehicles</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map((category) => (
              <tr key={category.category_id} className="hover:bg-gray-100">
                <td className="px-6 py-4 text-gray-800">{category.category_name}</td>
                <td className="px-6 py-4 text-gray-800">{category.total_vehicles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleCategoryCountTable;
