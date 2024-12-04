"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import UpdatePaymentStatusForm from "./edit"

const TransactionsTable = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const validateToken = () => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            alert("Please log in to access the admin panel.");
            router.push("/admin/loginAdmin");
            return false;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000; 
            if (decoded.exp < currentTime) {
                localStorage.removeItem("adminToken");
                alert("Your session has expired. Please log in again.");
                router.push("/admin/loginAdmin");
                return false;
            }
            return true;
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("adminToken");
            alert("Your session is invalid. Please log in again.");
            router.push("/admin/loginAdmin");
            return false;
        }
    };

    useEffect(() => {
        if (!validateToken()) return;

        const fetchTransactions = async () => {
            try {
                const response = await axios.get("http://localhost:5000/transactions", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                });

                if (response.data.success) {
                    setTransactions(response.data.data);
                } else {
                    setError("Failed to fetch transactions.");
                }
            } catch (err) {
                setError("Error fetching transactions.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const handleEdit = (transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTransaction(null);
    };

    const handleDelete = (transactionId) => {
        if (window.confirm(`Are you sure you want to delete transaction with ID: ${transactionId}?`)) {
            axios.delete(`http://localhost:5000/transactions/${transactionId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                },
            })
                .then((response) => {
                    if (response.data.success) {
                        alert("Transaction deleted successfully!");
                        setTransactions(transactions.filter(transaction => transaction.transaction_id !== transactionId));
                    } else {
                        alert("Failed to delete transaction.");
                    }
                })
                .catch((err) => {
                    alert("Error deleting transaction.");
                    console.error(err);
                });
        }
    };

    if (loading) return <p>Loading transactions...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Transactions</h1>
            {transactions.length > 0 ? (
                <table className="w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2">Owner Name</th>
                            <th className="border border-gray-300 p-2">Email</th>
                            <th className="border border-gray-300 p-2">Phone</th>
                            <th className="border border-gray-300 p-2">Vehicle</th>
                            <th className="border border-gray-300 p-2">Owner Earning</th>
                            <th className="border border-gray-300 p-2">Payment Status</th>
                            <th className="border border-gray-300 p-2">Payment Made At</th>
                            <th className="border border-gray-300 p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.transaction_id} className="hover:bg-gray-100">
                                <td className="border border-gray-300 p-2">{transaction.ownername}</td>
                                <td className="border border-gray-300 p-2">{transaction.own_email}</td>
                                <td className="border border-gray-300 p-2">{transaction.own_phone}</td>
                                <td className="border border-gray-300 p-2">{transaction.vehicle_name}</td>
                                <td className="border border-gray-300 p-2 text-right">
    Rs.{Math.round(Number(transaction.owner_earning || 0))}
</td>

                                <td className={`border border-gray-300 p-2 text-center ${transaction.payment_status === "due" ? "text-red-500" : "text-green-500"}`}>
                                    {transaction.payment_status}
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                    {transaction.payment_made_at
                                        ? new Date(transaction.payment_made_at).toLocaleDateString()
                                        : "N/A"}
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                    <button 
                                        className="text-blue-500 hover:text-blue-700" 
                                        onClick={() => handleEdit(transaction)}
                                    >
                                        <PencilIcon className="w-5 h-5 inline-block" />
                                    </button>
                                    <button 
                                        className="text-red-500 hover:text-red-700 ml-2" 
                                        onClick={() => handleDelete(transaction.transaction_id)}
                                    >
                                        <TrashIcon className="w-5 h-5 inline-block" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No transactions found.</p>
            )}

            {/* Edit Modal using Headless UI */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                   
                                    <div className="mt-2">
                                    <UpdatePaymentStatusForm 
                                            transactionId={selectedTransaction?.transaction_id}
                                            Token={localStorage.getItem("adminToken")}
                                            onClose={closeModal}
                                        />
                                    </div>

                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default TransactionsTable;
