"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PencilIcon, TrashIcon ,Clipboard} from "lucide-react";
import UpdateOrderForm from "./edit"; // Import the child component
import ManageUserOrder from "./user"; // Import the child component
import {jwtDecode} from 'jwt-decode';
import { Dialog } from "@headlessui/react"; // Make sure to import Dialog component
import RentalCalendar from "./Calendar";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Manage modal visibility
  const [isModalUserOpen, setIsModalUserOpen] = useState(false); // Manage modal visibility
  const [selectedOrderId, setSelectedOrderId] = useState(null); // Track selected order
  const [deliveredCount, setDeliveredCount] = useState(null);
  const [isCalenderModalOpen, setIsCalenderModalOpen] = useState(false); // Edit modal state
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const router = useRouter();


  useEffect(() => {
      const token = localStorage.getItem('adminToken');
  
      if (!token) {
          router.push('/admin/loginAdmin');
      } else {
          try {
              const decoded = jwtDecode(token);
              const currentTime = Date.now() / 1000; // Current time in seconds
              if (decoded.exp < currentTime) {
                  localStorage.removeItem('adminToken');
                  alert("Your session has expired. Please log in again.");
                  router.push('/admin/loginAdmin');
                  return;
              }
          } catch (error) {
              console.error('Invalid token:', error);
              localStorage.removeItem('adminToken');
              alert("Your session is invalid. Please log in again.");
              router.push('/admin/loginAdmin');
          }
      }
  }, [router]);
  
  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    if (token) {
      const fetchOrders = async () => {
        setLoading(true);
        try {
          const response = await axios.get("http://localhost:5000/manage-orders/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setOrders(response.data.data);
          } else {
            setMessage(response.data.message);
            setMessageType("error");
          }
        } catch (error) {
          setMessage("Error fetching orders.");
          setMessageType("error");
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();

      const fetchDeliveredCount = async () => {
        try {
          const response = await fetch('http://localhost:5000/counts/deliveredvehicles', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, // Assuming JWT token is stored
            },
          });
    
          if (!response.ok) {
            throw new Error('Failed to fetch delivered vehicle count');
          }
    
          const data = await response.json();
          setDeliveredCount(data.count);
        } catch (err) {
            setMessage(response.data.message);
            setMessageType("error");
        }
      };
      fetchDeliveredCount();

    }
  }, [token]);

  const handleDeleteOrder = async (orderId) => {
    const token = localStorage.getItem('adminToken');

    if (confirm("Are you sure you want to delete this order?")) {
      try {
        const response = await axios.delete(`http://localhost:5000/manage-orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setOrders((prevOrders) => prevOrders.filter(order => order.order_id !== orderId));
          setMessage("Order deleted successfully.");
          setMessageType("success");
        } else {
          setMessage(response.data.message);
          setMessageType("error");
        }
      } catch (error) {
        setMessage("Error deleting order.");
        setMessageType("error");
      }
    }
  };

  const handleEditOrder = (orderId) => {
    setSelectedOrderId(orderId); // Set selected order ID
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };
  const handleviewUserOrder = (orderId) => {
    setSelectedOrderId(orderId); // Set selected order ID
    setIsModalUserOpen(true); // Open the modal
  };

  const handleCloseUserModal = () => {
    setIsModalUserOpen(false); // Close the modal
  };

  if (loading) {
    return <div className="text-center text-lg font-semibold mt-4">Loading orders...</div>;
  }


  const handleSuccessMessage = (message) => {
    setMessage(message);
    setMessageType("success");   
  };
  const openCalenderModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsCalenderModalOpen(true);
  };

  const closeCalenderModal = () => {
    setIsCalenderModalOpen(false);
  };
  

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <span className="flex flex-row items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Manage Orders</h2>
      {deliveredCount &&  (
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Delivered Vehicles : {deliveredCount}</h2>
        )}
        </span>
        
      {message && (
        <div
          className={`p-2 rounded-lg mb-4 ${messageType === "error" ? "bg-red-500" : "bg-green-500"} text-white text-sm`}
        >
          {message}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-2 py-2 text-left">Dates</th>
              <th className="px-2 py-2 text-left">Vehicle</th>
              <th className="px-2 py-2 text-left">Rented By</th>
              <th className="px-2 py-2 text-left">Payment</th>
              <th className="px-2 py-2 text-left">Paid</th>
              <th className="px-2 py-2 text-left">Delivered</th>
              <th className="px-2 py-2 text-left">Total</th>
              <th className="px-2 py-2 text-left">Days</th>
              <th className="px-2 py-2 text-left">Status</th>
              <th className="px-2 py-2 text-left">Start</th>
              <th className="px-2 py-2 text-left">End</th>
              <th className="px-2 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <tr
                  key={order.order_id}
                  className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                >
                  <td className="px-4 py-2 cursor-pointer hover:scale-125" 
                   onClick={() => openCalenderModal(order)}>📅 </td>
                  <td className="px-2 py-2">{order.vehicle_name} {order.model}</td>
                  <td className="px-2 py-2">{order.username}</td>
                  <td className="px-2 py-2">{order.payment_method}</td>
                  <td className="px-2 py-2">{order.paid_status}</td>
                  <td className="px-2 py-2">{order.delivered_status}</td>
                  <td className="px-2 py-2">{order.grand_total}</td>
                  <td className="px-2 py-2">{order.rental_days}</td>
                  <td className="px-2 py-2">{order.status}</td>
                  <td className="px-2 py-2">{new Date(order.rent_start_date).toLocaleDateString()}</td>
                  <td className="px-2 py-2">{new Date(order.rent_end_date).toLocaleDateString()}</td>
                  <td className="px-2 py-2 flex justify-center space-x-1">
                    <button
                      onClick={() => handleEditOrder(order.order_id)}
                      className="text-blue-500 hover:text-blue-700 p-1 rounded transition duration-200"
                      title="Edit Order"
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.order_id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition duration-200"
                      title="Delete Order"
                    >
                      <TrashIcon size={16} />
                    </button>
                    <button
                      onClick={() => handleviewUserOrder(order.order_id)}
                      className="text-green-500 hover:text-green-700 p-1 rounded transition duration-200"
                      title="Delete Order"
                    >
                      <Clipboard size={16} />
                    </button>
                 
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center px-2 py-2 text-gray-500">
                  No orders available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          
            <UpdateOrderForm orderId={selectedOrderId} onClose={handleCloseModal}
                          onSuccess={handleSuccessMessage} // Pass success message handler

            />
          </div>
        </div>
      )}


      {isModalUserOpen && (
        <div className="fixed inset-0 bg-gray-700  bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
          
            <ManageUserOrder orderId={selectedOrderId} onClose={handleCloseUserModal}
                 // Pass success message handler

            />
          </div>
        </div>
      )}
      {/* //calendar mode */}
       <Dialog open={isCalenderModalOpen} onClose={closeCalenderModal} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="relative bg-white rounded-lg shadow-lg w-96 p-6">
          <Dialog.Title className="text-2xl font-bold mb-4">Dates booked for {selectedVehicle?.vehicle_name}</Dialog.Title>
          <div>
          {selectedVehicle &&(
           <RentalCalendar vehicleId={selectedVehicle.vehicle_id} onClose={closeCalenderModal}/>)}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ManageOrders;
