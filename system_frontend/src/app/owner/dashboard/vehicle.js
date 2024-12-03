"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VehicleOverview = ({ ownerId, token }) => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/vehicledescriptionrouter/${ownerId}/vehicle-overview`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOverview(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching vehicle overview');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [ownerId, token]);

  if (loading) {
    return <p className="text-center text-xl font-semibold">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!overview) {
    return <p className="text-center text-gray-500">No data available</p>; //Handle the initial null state
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Vehicle Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-lg font-semibold">Total Vehicles</p>
          <p className="text-2xl font-bold">{overview.totalVehicles}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-lg font-semibold">Available Vehicles</p>
          <p className="text-2xl font-bold">{overview.availableVehicles}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-lg font-semibold">Pending Approvals</p>
          <p className="text-2xl font-bold">{overview.pendingApprovals}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-lg font-semibold">Rejected Approvals</p>
          <p className="text-2xl font-bold">{overview.rejectApprovals}</p>
        </div>
      </div>
    </div>
  );
};

export default VehicleOverview;