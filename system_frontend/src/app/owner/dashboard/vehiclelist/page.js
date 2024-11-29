"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit modal state
  const [status, setStatus] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [availability, setAvailability] = useState(""); // State for availability
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null); // Notification state
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Check if the token has expired
        const currentTime = Date.now() / 1000; // Current time in seconds
        if (decoded.exp < currentTime) {
          // Token has expired, log the user out
          localStorage.removeItem("token"); // Clear expired token
          setNotification({
            message: "Your session has expired. Please log in again.",
            type: "error",
          });
          router.push("/owner/loginOwner"); // Redirect to login
          return;
        }

        setOwnerId(decoded.id);
      } catch (error) {
        console.error("Error decoding token:", error);
        setNotification({
          message: "Invalid token. Please log in again.",
          type: "error",
        });
        localStorage.removeItem("token");
        router.push("/owner/loginOwner");
      }
    } else {
      setNotification({ message: "No token found. Please log in.", type: "error" });
      router.push("/owner/loginOwner");
    }
  }, [router]);

  useEffect(() => {
    const fetchVehicles = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/vehicle/vehicles/${ownerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        alert("Failed to fetch vehicles. Please try again later.");
        setLoading(false);
      }
    };

    if (ownerId) {
      fetchVehicles();
    }
  }, [ownerId]);

  const openModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setStatus(vehicle.status); // Set current status
    setAvailability(vehicle.availability); // Set current availability
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveChanges = async () => {
    if (status === "" || availability === "") {
      alert("Please select both status and availability.");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("Please login as an admin");
      return;
    }

    setLoading(true);

    try {
      const currentVehicle = selectedVehicle;

      const updatedVehicleStatus = {
        status,
        availability,
      };

      await axios.put(
        `http://localhost:5000/vehicle/vehicles/${currentVehicle.vehicle_id}`,
        updatedVehicleStatus,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
          vehicle.vehicle_id === currentVehicle.vehicle_id
            ? { ...vehicle, ...updatedVehicleStatus }
            : vehicle
        )
      );

      alert("Vehicle status and availability updated successfully");
      closeEditModal();
    } catch (error) {
      console.error("Error updating vehicle status:", error);
      alert("Failed to update vehicle status and availability. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (vehicleId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login");
      return;
    }

    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await axios.delete(`http://localhost:5000/vehicle/vehicles/${vehicleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setVehicles((prevVehicles) =>
          prevVehicles.filter((vehicle) => vehicle.vehicle_id !== vehicleId)
        );

        alert("Vehicle deleted successfully");
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle. Please try again later.");
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  };

  if (loading) {
    return <div className="text-center py-4">Loading vehicles...</div>;
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-4">
        <h1 className="text-lg font-semibold">No vehicles found for this owner.</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Vehicle List</h1>
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Vehicle Name</th>
            <th className="px-4 py-2">Model</th>
            <th className="px-4 py-2">Owner</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Availability</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Discounted Price</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.vehicle_id} className="border-t">
              <td className="px-4 py-2">{vehicle.vehicle_name}</td>
              <td className="px-4 py-2">{vehicle.model}</td>
              <td className="px-4 py-2">{vehicle.owner_name}</td>
              <td className="px-4 py-2">{vehicle.category_name}</td>
              <td className="px-4 py-2">{vehicle.status}</td>
              <td className="px-4 py-2">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    vehicle.availability === 0
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {vehicle.availability === 0 ? "Unavailable" : "Available"}
                </span>
              </td>
              <td className="px-4 py-2">Rs.{parseInt(vehicle.final_price, 10)}</td>
              <td className="px-4 py-2">
                Rs.{vehicle.discounted_price ? parseInt(vehicle.discounted_price, 10) : "N/A"}
              </td>
              <td className="px-4 py-2 flex space-x-4">
                <PencilIcon
                  className="h-5 w-5 text-blue-500 cursor-pointer"
                  onClick={() => openEditModal(vehicle)}
                />
                <TrashIcon
                  className="h-5 w-5 text-red-500 cursor-pointer"
                  onClick={() => deleteVehicle(vehicle.vehicle_id)}
                />
                <button
                  className="text-green-500 font-semibold"
                  onClick={() => openModal(vehicle)}
                >
                  More Info
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modals go here */}
    </div>
  );
};

export default VehicleList;
