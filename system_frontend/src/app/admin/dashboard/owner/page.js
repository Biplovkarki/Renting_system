"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Dialog } from "@headlessui/react";

export default function OwnerList() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false);

    // Modal states
    const [isOpen, setIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            router.push("/admin/loginAdmin");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                localStorage.removeItem('adminToken');
                window.alert("Your session has expired. Please log in again.");
                router.push("/admin/loginAdmin");
                return;
            }
        } catch (error) {
            localStorage.removeItem('adminToken');
            window.alert("Your session is invalid. Please log in again.");
            router.push("/admin/loginAdmin");
            return;
        }

        fetchUsers();
    }, [router, refresh]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/fetch/owner", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                },
            });
            setUsers(response.data);
        } catch (error) {
            setError("Failed to fetch owners.");
            // console.error("Error fetching owners:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (imagePath) => {
        if (imagePath) {
            setSelectedImage(imagePath);
            setIsOpen(true);
        }
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedImage("");
    };

    if (loading) {
        return <p className="text-gray-700 text-center mt-4">Loading users...</p>;
    }

    if (error) {
        return <p className="text-red-500 text-center mt-4">{error}</p>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Owner details</h2>
            {users.length === 0 ? (
                <p className="text-center text-gray-500">No owners found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Owner Name</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Phone</th>
                                <th className="px-4 py-3 text-left">Address</th>
                                <th className="px-4 py-3 text-center">Image</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((owner, index) => (
                                <tr
                                    key={owner.Owner_id || Math.random()}
                                    className={`border-b ${
                                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                    } hover:bg-gray-100`}
                                >
                                    <td className="px-4 py-3">{owner.ownername}</td>
                                    <td className="px-4 py-3">{owner.own_email}</td>
                                    <td className="px-4 py-3">{owner.own_phone}</td>
                                    <td className="px-4 py-3">{owner.own_address || "N/A"}</td>
                                    <td className="px-4 py-3 text-center">
                                        {owner.own_image ? (
                                            <img
                                                src={`http://localhost:5000/uploads/owner/${owner.own_image}`}
                                                alt="Owner"
                                                className="h-16 w-16 rounded-full object-cover shadow-sm cursor-pointer"
                                                onClick={() =>
                                                    openModal(`http://localhost:5000/uploads/owner/${owner.own_image}`)
                                                }
                                            />
                                        ) : (
                                            <span className="text-gray-500">No image</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Dialog
                open={isOpen}
                onClose={closeModal}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="owner"
                            className="max-w-full max-h-96 object-cover"
                        />
                    )}
                    <button
                        onClick={closeModal}
                        className="mt-4 w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                    >
                        Close
                    </button>
                </div>
            </Dialog>
        </div>
    );
}

//jkhkh