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
                console.log('API Response:', response.data);  // Log the response to inspect it

                if (response.data.success) {
                    setTotalVehicles(response.data.totalVehicles || 0);
                } else {
                    console.error("Failed to fetch vehicle count");
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

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <div>
                <p>Total Vehicles: {totalVehicles}</p>
                <p>Delivered Vehicles: {deliveredVehicles}</p>
                <p>Expired Documents: {expiredDocuments}</p>
                <p>Total Categories: {totalCategories}</p>
                <p>Pending Vehicles: {pendingVehicles}</p>
            </div>
        </div>
    );
};

export default Dashboard;
