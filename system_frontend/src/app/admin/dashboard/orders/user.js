import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageUserOrder = ({ orderId, onClose }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch order details using the provided orderId
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/manage-user-orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        setOrderDetails(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div className="text-center text-lg font-semibold">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-2xl font-bold text-gray-800"
        title="Close"
        disabled={loading}
      >
        &times; {/* This is the 'X' symbol */}
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">User Details</h1>
      {orderDetails ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="text-gray-700">
            <p><strong>Name:</strong> {orderDetails.username}</p>
            <p><strong>Email:</strong> {orderDetails.user_email}</p>
          </div>

          <div className="text-gray-700">
            <p><strong>Phone:</strong> {orderDetails.user_phone}</p>
            <p><strong>Terms:</strong> {orderDetails.terms === 1 ? 'Yes' : 'No'}</p>
          </div>

          {/* License Image Section */}
          <div className="col-span-2">
            <p className="text-gray-700"><strong>License Image:</strong></p>
            <div className="mt-2">
              <img
                className="w-full max-w-md h-auto object-contain rounded-lg shadow-md mx-auto"
                src={`http://localhost:5000/${orderDetails.licenseImage}`}
                alt="License"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No user details available.</div>
      )}
    </div>
  );
};

export default ManageUserOrder;
