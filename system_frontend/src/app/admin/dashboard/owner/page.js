"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import {jwtDecode} from 'jwt-decode'; 
import axios from 'axios';
import { TrashIcon } from "@heroicons/react/24/solid";

export default function OwnerList() {
    const router = useRouter();
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false);

    // Check if the admin token is valid and exists
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
            router.push('/admin/loginAdmin');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                localStorage.removeItem('adminToken');
                window.alert("Your session has expired. Please log in again.");
                router.push('/admin/loginAdmin');
                return;  // Ensure to stop further execution and redirect immediately
            }
        } catch (error) {
            // If the token is invalid, remove it and redirect to login
            localStorage.removeItem('adminToken');
            window.alert("Your session is invalid. Please log in again.");
            router.push('/admin/loginAdmin');
            return;  // Prevent further execution after redirection
        }

        // Fetch owner data after token validation
        fetchOwners();
    }, [router, refresh]);

    // Fetch all owners
    const fetchOwners = async () => {
        try {
            const response = await axios.get('http://localhost:5000/fetch/owner', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                }
            });
            setOwners(response.data);
        } catch (error) {
            setError('Failed to fetch owners.');
            console.error('Error fetching owners:', error);
        } finally {
            setLoading(false);
        }
    };

    // Delete owner
    const deleteOwner = async (ownerId) => {
        try {
            await axios.delete(`http://localhost:5000/fetch/owner/${ownerId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                }
            });
            setRefresh(!refresh);  // Trigger re-fetch of owners
            alert('Owner deleted successfully');
        } catch (error) {
            console.error('Error deleting owner:', error);
            alert('Failed to delete owner');
        }
    };

    if (loading) {
        return <p className="text-gray-700">Loading owners...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="shadow-lg p-6 rounded-2xl bg-white">
            {owners.length === 0 ? (
                <p className="text-center text-gray-500">No owners found.</p>
            ) : (
                <table className="w-full bg-white border border-gray-200 rounded-2xl shadow-md">
                    <thead className="bg-gray-100 rounded-2xl">
                        <tr>
                            <th className="py-3 px-4 border-b text-gray-600">Owner Name</th>
                            <th className="py-3 px-4 border-b text-gray-600">Email</th>
                            <th className="py-3 px-4 border-b text-gray-600">Phone</th>
                            <th className="py-3 px-4 border-b text-gray-600">Address</th>
                            <th className="py-3 px-4 border-b text-gray-600">Image</th>
                            <th className="py-3 px-4 border-b text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {owners.map((owner) => (
                            <tr key={owner.owner_id || Math.random()} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-gray-700">{owner.ownername}</td>
                                <td className="py-3 px-4 text-gray-700">{owner.own_email}</td>
                                <td className="py-3 px-4 text-gray-700">{owner.own_phone}</td>
                                <td className="py-3 px-4 text-gray-700">{owner.own_address || 'N/A'}</td>
                                <td className="py-3 px-4">
                                    {owner.own_image ? (
                                        <img
                                            src={`http://localhost:5000/uploads/owner/${owner.own_image}`}
                                            alt="Owner"
                                            className="h-16 w-16 rounded object-cover shadow-sm"
                                        />
                                    ) : (
                                        <span className="text-gray-500">No image</span>
                                    )}
                                </td>
                                <td className="py-3 px-4 flex items-center justify-center space-x-2">
                                    <TrashIcon
                                        className="h-5 w-5 text-red-600 cursor-pointer hover:text-red-800 transition-colors"
                                        onClick={() => deleteOwner(owner.owner_id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
