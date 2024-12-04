import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
    const [totalVehicles, setTotalVehicles] = useState(0);
    const [deliveredVehicles, setDeliveredVehicles] = useState(0);
    const [expiredDocuments, setExpiredDocuments] = useState(0);
    const [totalCategories, setTotalCategories] = useState(0);
    const [pendingVehicles, setPendingVehicles] = useState(0);
    const adminToken = localStorage.getItem('adminToken'); // Replace with actual token

    // Fetch vehicle counts
    useEffect(() => {
        const fetchVehicleCounts = async () => {
            try {
                const response = await axios.get("http://localhost:5000/counts/vehicles", {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                    },
                });

                if (response.data.success) {
                    setTotalVehicles(response.data.totalVehicles || 0);
                }
            } catch (error) {
                console.error("Error fetching vehicle count:", error);
            }
        };
        fetchVehicleCounts();
    }, []);

     // Fetch delivered vehicle counts
     useEffect(() => {
        const fetchDeliveredVehicleCounts = async () => {
            try {
                const response = await axios.get("http://localhost:5000/counts/deliveredvehicles", {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                    },
                });

                if (response.data.success) {
                    setDeliveredVehicles(response.data.count || 0);
                }
            } catch (error) {
                console.error("Error fetching delivered vehicles count:", error);
            }
        };
        fetchDeliveredVehicleCounts();
    }, []);

    // Fetch expired documents count
    useEffect(() => {
        const fetchExpiredDocumentsCount = async () => {
            try {
                const response = await axios.get("http://localhost:5000/counts/expired-documents", {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                    },
                });

                if (response.data.success) {
                    setExpiredDocuments(response.data.expired_count || 0);
                }
            } catch (error) {
                console.error("Error fetching expired documents:", error);
            }
        };
        fetchExpiredDocumentsCount();
    }, []);

    // Fetch total categories count
    useEffect(() => {
        const fetchTotalCategories = async () => {
            try {
                const response = await axios.get("http://localhost:5000/counts/categories-total", {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                    },
                });

                if (response.data.success) {
                    setTotalCategories(response.data.total_categories || 0);
                }
            } catch (error) {
                console.error("Error fetching total categories:", error);
            }
        };
        fetchTotalCategories();
    }, []);

    // Fetch pending vehicle count
    useEffect(() => {
        const fetchPendingVehicleCount = async () => {
            try {
                const response = await axios.get("http://localhost:5000/counts/status-pending", {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                    },
                });

                if (response.data.success) {
                    setPendingVehicles(response.data.pending_vehicles || 0);
                }
            } catch (error) {
                console.error("Error fetching pending vehicles count:", error);
            }
        };
        fetchPendingVehicleCount();
    }, []);

    // Similar fetch functions for other data...

    return (
        <div className="p-6  bg-gray-100 min-h-fit">
            <h1 className="text-3xl text-center font-bold text-gray-800 mb-6">Vehicles Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="p-4 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Total Vehicles</h2>
                    <p className="text-2xl font-bold text-blue-600">{totalVehicles}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Recently Rented</h2>
                    <p className="text-2xl font-bold text-green-600">{deliveredVehicles}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Expired Documents</h2>
                    <p className="text-2xl font-bold text-red-600">{expiredDocuments}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Total Categories</h2>
                    <p className="text-2xl font-bold text-yellow-600">{totalCategories}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-600">Pending Vehicles</h2>
                    <p className="text-2xl font-bold text-orange-600">{pendingVehicles}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
