"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const TransactionsTable = () => {
    const [transactions, setTransactions] = useState([]);
    const [totalAdminEarning, setTotalAdminEarning] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get("http://localhost:5000/transactions", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                });

                if (response.data.success) {
                    setTransactions(response.data.data);

                    // Calculate total admin earning as an integer
                    const totalEarning = response.data.data.reduce(
                        (sum, transaction) => sum + Math.round(Number(transaction.admin_earning || 0)),
                        0
                    );
                    setTotalAdminEarning(totalEarning);
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

    if (loading) return <p className="text-center py-4">Loading transactions...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-semibold text-gray-700 mb-6">Earning</h1>
            <div className="bg-white shadow-md rounded-lg p-6">
                <p className="text-xl font-medium mb-6">
                    <strong>Total Admin Earning:</strong> 
                    <span className="text-green-600"> Rs. {totalAdminEarning}</span>
                </p>
                {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-200 p-4 text-left text-gray-600 font-medium">
                                        Vehicle
                                    </th>
                                    <th className="border border-gray-200 p-4 text-right text-gray-600 font-medium">
                                        Admin Earning
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction, index) => (
                                    <tr
                                        key={transaction.transaction_id}
                                        className={`hover:bg-gray-50 ${
                                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                        }`}
                                    >
                                        <td className="border border-gray-200 p-4 text-gray-700">
                                            {transaction.vehicle_name}
                                        </td>
                                        <td className="border border-gray-200 p-4 text-right text-gray-700">
                                            Rs. {Math.round(Number(transaction.admin_earning || 0))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">No transactions found.</p>
                )}
            </div>
        </div>
    );
};

export default TransactionsTable;
