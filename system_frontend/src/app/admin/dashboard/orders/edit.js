"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const UpdateOrderForm = ({ orderId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    rent_start_date: "",
    rent_end_date: "",
    status: "",
    paid_status: "",
    delivered_status: "",
    grand_total: 0,
    rental_days: 0,
  });
  const [pricePerDay, setPricePerDay] = useState(0); // To store price per day
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); // To manage error messages

  // Fetch order and price details on component mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/manage-orders/${orderId}`
        );
        const order = response.data;

        // Safely update state with fetched order data
        setFormData((prev) => ({
          ...prev,
          rent_start_date: order.rent_start_date || "",
          rent_end_date: order.rent_end_date || "",
          status: order.status || "",
          paid_status: order.paid_status || "",
          delivered_status: order.delivered_status || "",
          grand_total: order.grand_total || 0,
          rental_days: order.rental_days || 0,
        }));

        // Set the price per day based on discount logic
        const price = order.discounted_price || order.final_price;
        setPricePerDay(price && !isNaN(price) ? parseFloat(price) : 0); // Default to 0 if price is invalid
      } catch (error) {
        console.error("Error fetching order details:", error);
        setMessage("Failed to load order details.");
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Calculate rental days and grand total when dates change
  useEffect(() => {
    if (formData.rent_start_date && formData.rent_end_date) {
      const startDate = new Date(formData.rent_start_date);
      const endDate = new Date(formData.rent_end_date);

      const diffTime = endDate - startDate;
      const days = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

      // Update only derived state
      setFormData((prev) => ({
        ...prev,
        rental_days: days,
        grand_total: days * pricePerDay,
      }));
    }
  }, [formData.rent_start_date, formData.rent_end_date, pricePerDay]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(""); // Reset error message

    // Validate dates
    const today = new Date().toISOString().split("T")[0]; // Get today's date in 'yyyy-mm-dd'
    // if (formData.rent_start_date < today) {
    //   setError("Rent start date cannot be in the past.");
    //   setLoading(false);
    //   return;
    // }

    if (formData.rent_end_date <= formData.rent_start_date) {
      setError("Rent end date cannot be earlier than or the same as rent start date.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/manage-orders/${orderId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
  
      setMessage(response.data.message || "Order updated successfully.");
    
      onSuccess("Order updated successfully.");
      onClose()
    } catch (error) {
      // console.error("Error updating order:", error);
      setError(error.response?.data?.message || "Failed to update order. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Update Order</h2>

      {message && <p className="mb-4 text-sm text-center text-gray-700 bg-gray-100 p-2 rounded">{message}</p>}
      {error && <p className="mb-4 text-sm text-center text-red-600 bg-red-100 p-2 rounded">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-gray-700">Rent Start Date:</span>
          <input
            type="date"
            name="rent_start_date"
            value={formData.rent_start_date}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1 focus:ring focus:ring-blue-200"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Rent End Date:</span>
          <input
            type="date"
            name="rent_end_date"
            value={formData.rent_end_date}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1 focus:ring focus:ring-blue-200"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Rental Days:</span>
          <input
            type="number"
            name="rental_days"
            value={formData.rental_days}
            readOnly
            className="w-full p-2 border rounded mt-1 bg-gray-100 cursor-not-allowed"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Price Per Day:</span>
          <input
            type="text"
            value={pricePerDay && !isNaN(pricePerDay) ? pricePerDay.toFixed(2) : "0.00"} // Ensure price is a number
            readOnly
            className="w-full p-2 border rounded mt-1 bg-gray-100 cursor-not-allowed"
          />

        </label>

        <label className="block">
          <span className="text-gray-700">Status:</span>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="approval_pending">Approval Pending</option>
            <option value="completed">Completed</option>
            <option value="aborted">Aborted</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-700">Paid Status:</span>
          <select
            name="paid_status"
            value={formData.paid_status}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-700">Delivered Status:</span>
          <select
            name="delivered_status"
            value={formData.delivered_status}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="not_delivered">Not Delivered</option>
            <option value="delivered">Delivered</option>
            <option value="returned">returned</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-700">Grand Total:</span>
          <input
            type="number"
            name="grand_total"
            value={formData.grand_total}
            readOnly
            className="w-full p-2 border rounded mt-1 bg-gray-100 cursor-not-allowed"
          />
        </label>

        <div className="flex flex-row mt-4">
  <button
    type="submit"
    className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition duration-300 ease-in-out disabled:bg-blue-300 disabled:cursor-not-allowed"
    disabled={loading}
  >
    {loading ? "Updating..." : "Update "}
  </button>
</div>

<div className="flex justify-end mt-4">
  <button
    onClick={onClose}
    className=" w-full bg-red-500 text-white-500 hover:bg-red-500 hover:text-white  rounded-lg transition duration-300 ease-in-out"
    title="Close"
    disabled={loading}
  
  >
    {loading ? "cancelling..." : "cancel "}
  </button>
</div>

      </form>
    </div>
  );
};

export default UpdateOrderForm;
