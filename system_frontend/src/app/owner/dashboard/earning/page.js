"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

const OwnerEarningsReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ownerId, setOwnerId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [totalEarnings, setTotalEarnings] = useState(0); // State to store total earnings

    const router=useRouter();
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000; // Current time in seconds
                if (decoded.exp < currentTime) {
                    localStorage.removeItem('token');
                    setNotification({ message: 'Your session has expired. Please log in again.', type: 'error' });
                    router.push('/owner/loginOwner');
                    return;
                }

                setOwnerId(decoded.id); // Set the ownerId from the decoded token
            } catch (error) {
                console.error('Error decoding token:', error);
                setNotification({ message: 'Invalid token. Please log in again.', type: 'error' });
                localStorage.removeItem('token');
                router.push('/owner/loginOwner');
            }
        } else {
            setNotification({ message: 'No token found. Please log in.', type: 'error' });
            router.push('/owner/loginOwner');
        }
    }, []);

    useEffect(() => {
        if (ownerId) { // Fetch earnings data only when ownerId is available
            const fetchEarningsData = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/details/earnings/${ownerId}`);
                    setData(response.data.data);

                    // Calculate total earnings for all vehicles
                    const total = response.data.data.reduce((sum, row) => sum + (parseFloat(row.owner_earnings) || 0), 0);
                    setTotalEarnings(total); // Set the total earnings
                } catch (err) {
                    setError('Failed to fetch earnings data.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };

            fetchEarningsData();
        }
    }, [ownerId]);

    if (loading) {
        return <div className="text-center">Loading report...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600">{error}</div>;
    }

    return (
        <div className="container mx-auto my-10 p-6 bg-white rounded shadow-lg">
            <h1 className="text-3xl font-semibold text-center mb-6">Owner Earnings Report</h1>

            {data.length === 0 ? (
                <p className="text-center text-xl">No earnings data available.</p>
            ) : (
                <div>
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold">Total Earnings: {totalEarnings.toFixed(2)}</h2>
                    </div>

                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2 border border-gray-200">Vehicle Name</th>
                                <th className="px-4 py-2 border border-gray-200">Image</th>
                                <th className="px-4 py-2 border border-gray-200">Payment Status</th>
                                <th className="px-4 py-2 border border-gray-200">Rental Days</th>
                                <th className="px-4 py-2 border border-gray-200">Rent Start Date</th>
                                <th className="px-4 py-2 border border-gray-200">Rent End Date</th>
                                <th className="px-4 py-2 border border-gray-200">Owner Earnings</th>
                                <th className="px-4 py-2 border border-gray-200">Total Earnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 border border-gray-200">{row.vehicle_name}</td>
                                    <td className="px-4 py-2 border border-gray-200">
                                        <img src={`http://localhost:5000/${row.image}`} alt={`http://localhost:5000/${row.image}`} className="w-16 h-16 object-cover" />
                                    </td>
                                    <td className="px-4 py-2 border border-gray-200">{row.payment_status}</td>
                                    <td className="px-4 py-2 border border-gray-200">{row.rental_days}</td>
                                    <td className="px-4 py-2 border border-gray-200">{new Date(row.rent_start_date).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 border border-gray-200">{new Date(row.rent_end_date).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 border border-gray-200">
                                        {isNaN(Number(row.owner_earnings)) ? '0.00' : Number(row.owner_earnings).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-200">
                                        {isNaN(Number(row.owner_earnings)) ? '0.00' : Number(row.owner_earnings).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OwnerEarningsReport;
