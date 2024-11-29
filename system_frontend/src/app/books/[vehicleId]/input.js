"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Modal Component
const PaymentModal = ({ isOpen, onClose, onPaymentSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Select Payment Method</h2>
        <div className="flex justify-around space-x-4">
          <button
            onClick={() => onPaymentSelect("COD")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            COD
          </button>
          <button
            onClick={() => onPaymentSelect("Esewa")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Pay with Esewa
          </button>
          <button
            onClick={() => onPaymentSelect("Khalti")}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Pay with Khalti
          </button>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const RentalForm = ({ userId, vehicleId, orderId, onSubmit, onClose }) => {
  const [rentStartDate, setRentStartDate] = useState("");
  const [rentEndDate, setRentEndDate] = useState("");
  const [terms, setTerms] = useState(false);
  const [licenseImage, setLicenseImage] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rentalDays, setRentalDays] = useState(0);
  const [orderStatus, setOrderStatus] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false); // State to control modal visibility
  const [selectedPayment, setSelectedPayment] = useState(null); // Selected payment method
  const [messageType, setMessageType] = useState(""); // Message type (success or error)

  const router = useRouter();
  const token = localStorage.getItem("userToken");

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price);
    return !isNaN(numericPrice) ? numericPrice.toFixed(2) : "0.00";
  };

  const getPricePerDay = () => {
    if (vehicle) {
      return vehicle.discounted_price && vehicle.discounted_price < vehicle.final_price
        ? vehicle.discounted_price
        : vehicle.final_price;
    }
    return 0;
  };

  const calculateTotalPrice = () => {
    if (rentStartDate && rentEndDate && rentalDays > 0) {
      const pricePerDay = getPricePerDay();
      return rentalDays * pricePerDay;
    }
    return 0;
  };

  const validateDates = () => {
    if (new Date(rentStartDate) > new Date(rentEndDate)) {
      setMessage("End date must be after the start date.");
      setMessageType("error"); // Set message type to error
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setMessage("");
    setMessageType(""); // Reset message type

    if (!rentStartDate || !rentEndDate || !terms || !licenseImage) {
      setMessage("All fields are required.");
      setMessageType("error"); // Set message type to error
      return;
    }

    if (!validateDates()) return;

    const formData = new FormData();
    formData.append("rent_start_date", rentStartDate);
    formData.append("rent_end_date", rentEndDate);
    formData.append("terms", terms ? "true" : "false"); // Ensuring the value sent is "true" or "false"
    formData.append("grand_total", JSON.stringify({ value: calculateTotalPrice(), type: "float" }));

    if (licenseImage) {
      formData.append("licenseImage", licenseImage);
    }

    try {
      const response = await axios.patch(
        `http://localhost:5000/rent/${userId}/${vehicleId}/${orderId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(response.data.message);
      setMessageType("success"); // Set message type to success
      setModalOpen(true); // Open the payment modal after successful submission
    } catch (error) {
      setMessage(error.response?.data?.message || "Error updating rental details.");
      setMessageType("error"); // Set message type to error
    }
  };

  const calculateRentalDays = () => {
    if (rentStartDate && rentEndDate) {
      const start = new Date(rentStartDate);
      const end = new Date(rentEndDate);
      const duration = (end - start) / (1000 * 3600 * 24);
      setRentalDays(duration >= 0 ? duration : 0);
    }
  };

  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/fetchdetails/vehicle/${vehicleId}`
        );
        setVehicle(response.data);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching vehicle details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleDetails();
  }, [vehicleId]);

  useEffect(() => {
    calculateRentalDays();
  }, [rentStartDate, rentEndDate]);

  const handlePaymentSelect = async (paymentMethod) => {
    setSelectedPayment(paymentMethod);
    console.log(`Selected Payment Method: ${paymentMethod}`);
    setModalOpen(false); // Close modal after selection

    if (paymentMethod === "COD") {
      try {
        // Handle COD payment (already implemented)
        const response = await axios.patch(
          `http://localhost:5000/rent/cod/${orderId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessage(response.data.message);
        setMessageType("success"); // Set message type to success
      } catch (error) {
        setMessage(error.response?.data?.message || "Error processing COD payment.");
        setMessageType("error"); // Set message type to error
        console.error("Error during COD payment:", error);
      }
    } else if (paymentMethod === "Khalti") {
      try {
        // Example of API call to initiate Khalti payment
        const response = await axios.post(
          `http://localhost:5000/khalti/initialize-khali/${orderId}`,
          { amount: calculateTotalPrice() }, // Send the calculated total price
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const khaltiPaymentUrl = response.data.payment_url; // Assume the URL for payment is returned

        // Redirect user to Khalti payment gateway (or use Khalti's SDK for modal integration)
        window.location.href = khaltiPaymentUrl;

        setMessage("Redirecting to Khalti for payment...");
        setMessageType("success");

      } catch (error) {
        setMessage(error.response?.data?.message || "Error processing Khalti payment.");
        setMessageType("error"); // Set message type to error
        console.error("Error during Khalti payment:", error);
      }
    }
  };


  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Rental Form</h2>
      {loading && <p className="text-blue-600">Loading vehicle details...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Rent Start Date:</label>
          <input
            type="date"
            value={rentStartDate}
            onChange={(e) => setRentStartDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rent End Date:</label>
          <input
            type="date"
            value={rentEndDate}
            onChange={(e) => setRentEndDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Driving License Image:</label>
          <input
            type="file"
            onChange={(e) => setLicenseImage(e.target.files[0])}
            accept="image/*"
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        {vehicle && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm">Vehicle: {vehicle.vehicle_name}</p>
            <p className="text-sm">
              Price per Day: Rs.{" "}
              {vehicle.discounted_price && vehicle.discounted_price < vehicle.final_price
                ? formatPrice(vehicle.discounted_price)  // Show discounted price
                : formatPrice(vehicle.final_price)}   
                
            </p>
            <p className="text-sm">Total Rental Days: {rentalDays}</p>
            <p className="text-sm font-bold">Total Amount: Rs. {formatPrice(calculateTotalPrice())}</p>
          </div>
        )}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={terms}
            onChange={() => setTerms(!terms)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">I agree to the terms and conditions</label>
        </div>
        {message && (
          <p className={`text-sm font-medium mt-2 ${messageType === "success" ? "text-green-500" : "text-red-500"}`}>
            {message}
          </p>
        )}
        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>

      <PaymentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onPaymentSelect={handlePaymentSelect} />
    </div>
  );
};

export default RentalForm;
