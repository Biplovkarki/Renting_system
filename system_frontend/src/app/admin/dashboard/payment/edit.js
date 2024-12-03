"use client"
import React, { useState } from 'react';
import axios from 'axios';

const UpdatePaymentStatusForm = ({ transactionId, Token, onClose }) => {
    const [paymentStatus, setPaymentStatus] = useState('due'); // Default to 'due'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await axios.put(
                `http://localhost:5000/transactions/${transactionId}`,
                { payment_status: paymentStatus },
                {
                    headers: {
                        Authorization: `Bearer ${Token}`, // Use the passed authToken
                    },
                }
            );

            if (response.data.success) {
                setSuccessMessage('Transaction updated successfully.');
            } else {
                setErrorMessage('Failed to update transaction.');
            }
        } catch (error) {
            setErrorMessage('Error updating transaction.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Update Payment Status</h2>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold">Payment Status</label>
                    <select
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                        <option value="due">Due</option>
                        <option value="cleared">Cleared</option>
                    </select>
                </div>

                <div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Status'}
                    </button>
                    {/* Change this to type="button" to prevent form submission */}
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-600 text-white rounded-md ml-2"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdatePaymentStatusForm;
