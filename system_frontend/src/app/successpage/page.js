"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

export default function KhaltiSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Processing your payment...');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [vehicleId, setVehicleId] = useState(null);

  useEffect(() => {
    const completePayment = async () => {
      try {
        const pidx = searchParams.get('pidx');
        const status = searchParams.get('status');
        const order_id = searchParams.get('purchase_order_id');

        // Validate required parameters
        if (!pidx || !order_id || !status) {
          throw new Error('Missing parameters from Khalti response.');
        }

        // Only proceed if status is 'Completed'
        if (status !== 'Completed') {
          throw new Error('Payment was not completed successfully.');
        }

        const response = await axios.post(
          'http://localhost:5000/khalti/complete-khali-payment',
          { pidx, order_id },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Check if the response is successful and contains expected fields
        if (response.data.success && response.data.vehicleId) {
          setSuccess(true);
          setMessage('Payment successful!');
          setVehicleId(response.data.vehicleId);
          setTimeout(() => router.push(`/books/${response.data.vehicleId}`), 3000);
        } else {
          setError(response.data.message || 'Payment verification failed.');
          setMessage(response.data.message || 'Payment verification failed.');
        }
      } catch (error) {
        setError(error.message || 'An unexpected error occurred.');
        setMessage(error.message || 'An unexpected error occurred.');
        console.error('Payment completion error:', error);
      }
    };

    // Check if the required parameters exist and are valid
    if (searchParams.get('pidx') && searchParams.get('status') === 'Completed') {
      completePayment();
    } else {
      setMessage('Payment processing failed. Please check the URL or try again.');
    }
  }, [searchParams, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      {error && (
        <div className="text-center text-red-500">
          <p className="text-xl font-bold mb-2">Payment Error</p>
          <p>{error}</p>
          <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Go to Dashboard</button>
        </div>
      )}
      {success && (
        <div className="text-center text-green-500">
          <p className="text-xl font-bold mb-2">Payment Successful!</p>
          <p>{message}</p>
          <button onClick={() => router.push(`/books/${vehicleId}`)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Go to Vehicle</button>
        </div>
      )}
      {!error && !success && (
        <div className="text-center">
          <p className="text-xl">{message}</p>
        </div>
      )}
    </div>
  );
}
