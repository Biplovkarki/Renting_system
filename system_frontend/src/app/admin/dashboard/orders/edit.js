"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UpdateOrderForm = ({ orderId ,  onClose }) => {
  const [formData, setFormData] = useState({
    rent_start_date: '',
    rent_end_date: '',
    status: '',
    paid_status: false,
    delivered_status: false,
    grand_total: '',
    rental_days: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch order details on component mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/manage-order/${orderId}`);
        const order = response.data;

        setFormData({
          rent_start_date: order.rent_start_date || '',
          rent_end_date: order.rent_end_date || '',
          status: order.status || '',
          paid_status: order.paid_status || false,
          delivered_status: order.delivered_status || false,
          grand_total: order.grand_total || '',
          rental_days: order.rental_days || '',
        });
      } catch (error) {
        console.error('Error fetching order details:', error);
        setMessage('Failed to load order details.');
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.put(`http://localhost:5000/manage-order/${orderId}`, formData);
      setMessage(response.data.message || 'Order updated successfully.');
    } catch (error) {
      console.error('Error updating order:', error);
      setMessage('Failed to update order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Update Order</h2>
      {message && <p className="mb-4 text-sm text-gray-700">{message}</p>}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Rent Start Date:
          <input
            type="date"
            name="rent_start_date"
            value={formData.rent_start_date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-2">
          Rent End Date:
          <input
            type="date"
            name="rent_end_date"
            value={formData.rent_end_date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-2">
          Status:
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>

        <label className="block mb-2">
          Paid Status:
          <input
            type="checkbox"
            name="paid_status"
            checked={formData.paid_status}
            onChange={handleChange}
            className="ml-2"
          />
        </label>

        <label className="block mb-2">
          Delivered Status:
          <input
            type="checkbox"
            name="delivered_status"
            checked={formData.delivered_status}
            onChange={handleChange}
            className="ml-2"
          />
        </label>

        <label className="block mb-2">
          Grand Total:
          <input
            type="number"
            name="grand_total"
            value={formData.grand_total}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-2">
          Rental Days:
          <input
            type="number"
            name="rental_days"
            value={formData.rental_days}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded mt-4"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Order'}
        </button>
      </form>
    </div>
  );
};

export default UpdateOrderForm;
