"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const OrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const params = useParams();
  const vehicleId = params.vehicleId;
  const router = useRouter();

  // Check if the token is valid and decode it
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Check if the token has expired
        const currentTime = Date.now() / 1000; // Current time in seconds
        if (decoded.exp < currentTime) {
          // Token has expired, log the user out
          localStorage.removeItem('token'); // Clear expired token
          setNotification({
            message: "Your session has expired. Please log in again.",
            type: "error",
          });
          router.push("/owner/loginOwner"); // Redirect to login
          return;
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setNotification({
          message: "Invalid token. Please log in again.",
          type: "error",
        });
        localStorage.removeItem('token');
        router.push("/owner/loginOwner");
      }
    } else {
      setNotification({ message: "No token found. Please log in.", type: "error" });
      router.push("/owner/loginOwner");
    }
  }, [router]);

  // Fetch the order details for the specific vehicle
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');

        // Make an API call to fetch the order details
        const response = await axios.get(
          `http://localhost:5000/details/order-details/${vehicleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          // Set the fetched data into state
          setOrderDetails(response.data);
        } else {
          throw new Error("Failed to fetch order details. Please try again.");
        }
      } catch (err) {
        // console.error(err);

        // Handle specific HTTP error codes if the backend provides them
        if (err.response) {
          if (err.response.status === 404) {
            setError("No order details found for this vehicle.");
          } else if (err.response.status === 401) {
            setError("Unauthorized access. Please log in.");
          } else {
            setError(
              err.response.data.message || "An error occurred. Please try again."
            );
          }
        } else {
          setError("Failed to connect to the server. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch the order details when the component mounts
    if (vehicleId) {
      fetchOrderDetails();
    }
  }, [vehicleId]);

  // Display loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Handle error case
  if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Link href="/owner/dashboard/orderdetails">
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
              Back
            </button>
          </Link>
        </div>
      </div>
      
    );
  }

  // Display the order details if available
  if (orderDetails.length > 0) {
    return (
      <div className="p-8 bg-white shadow-md rounded-md">
        <span className="flex flex-row items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Details Report</h2>
          <Link href="/owner/dashboard/orderdetails">
            <ArrowLongLeftIcon className="w-10 h-10" />
          </Link>
        </span>
        {orderDetails.map((order, index) => (
          <div
            className="border border-gray-300 rounded-md p-4 mb-4 shadow-sm"
            key={index}
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <p>
                <span className="font-semibold">Vehicle Name:</span> {order.vehicle_name}
              </p>
              <p>
                <span className="font-semibold">Model:</span> {order.model}
              </p>
              <p>
                <span className="font-semibold">Rental Days:</span> {order.rental_days}
              </p>
              <p>
                <span className="font-semibold">Start Date:</span>{" "}
                {new Date(order.rent_start_date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">End Date:</span>{" "}
                {new Date(order.rent_end_date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Grand Total:</span> ${order.grand_total}
              </p>
              <p>
                <span className="font-semibold">Renter Username:</span> {order.username}
              </p>
              <p>
                <span className="font-semibold">Earnings:</span>{" "}
                ${Math.round(order.grand_total * 0.8 * 100) / 100}
              </p>
            </div>
            <hr className="border-t border-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  // No order details found
  return (
    <div className="m-auto text-center">
      <p className="text-gray-500">No details found for this vehicle.</p>
      <Link href="/owner/dashboard/orderdetails">
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Back
        </button>
      </Link>
    </div>
  );
};

export default OrderDetails;
