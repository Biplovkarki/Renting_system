"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";
import VehicleEditForm from "./edit";

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
    const token = localStorage.getItem('token');

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

        setOwnerId(decoded.id);
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

  useEffect(() => {
    const fetchVehicles = async () => {
      const token = localStorage.getItem('token');
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

    const token = localStorage.getItem('token');
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

  // const deleteVehicle = async (vehicleId) => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     alert("Please login");
  //     return;
  //   }

  //   if (window.confirm("Are you sure you want to delete this vehicle?")) {
  //     try {
  //       await axios.delete(`http://localhost:5000/vehicle/vehicles/${vehicleId}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       setVehicles((prevVehicles) =>
  //         prevVehicles.filter((vehicle) => vehicle.vehicle_id !== vehicleId)
  //       );

  //       alert("Vehicle deleted successfully");
  //     } catch (error) {
  //       console.error("Error deleting vehicle:", error);
  //       alert("Failed to delete vehicle. Please try again later.");
  //     }
  //   }
  // };

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
                  className="h-9 w-19 text-blue-500 cursor-pointer"
                  onClick={() => openEditModal(vehicle)}
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
      <Dialog open={isModalOpen} onClose={closeModal} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 overflow-y-auto max-h-[80vh]">
          <Dialog.Title className="text-2xl font-bold mb-6">Vehicle Details</Dialog.Title>
          {selectedVehicle && (
            <div className="space-y-4">
              <div>
                <p><strong>Vehicle Name:</strong> {selectedVehicle.vehicle_name}</p>
                <p><strong>Model:</strong> {selectedVehicle.model}</p>
                <p><strong>Owner:</strong> {selectedVehicle.owner_name}</p>
                <p><strong>Category:</strong> {selectedVehicle.category_name}</p>
                <p><strong>Status:</strong> {selectedVehicle.status}</p>
                <p><strong>Fuel Type:</strong> {selectedVehicle.fuel_type}</p>
                <p><strong>Transmission:</strong> {selectedVehicle.transmission}</p>
                <p><strong>Price:</strong> {selectedVehicle.final_price}</p>
                <p><strong>Discounted Price:</strong> {selectedVehicle.discounted_price || 'N/A'}</p>
                <p><strong>Terms:</strong> {selectedVehicle.terms ? 'Yes' : 'No'}</p>
                <p><strong>VIN Number:</strong> {selectedVehicle.vin_number}</p>
                <p><strong>Tax Paid Until:</strong> {selectedVehicle.tax_paid_until && formatDate(selectedVehicle.tax_paid_until)}</p>
                <p><strong>Insurance Expiry:</strong> {selectedVehicle.insurance_expiry && formatDate(selectedVehicle.insurance_expiry)}</p>
              </div>

              {/* Image Section */}
              <div className="space-y-4 mt-6">
  <div>
    <h3 className="text-xl font-semibold">Vehicle Images</h3>
    <div className="grid grid-cols-2 gap-4">
      {selectedVehicle.image_front && (
        <div className="image-container">
          <p><strong>Front Image:</strong></p>
          <img 
            src={`http://localhost:5000/${selectedVehicle.image_front}`} 
            alt="Front" 
            className="w-full h-40 object-contain rounded-md shadow-md" 
          />
        </div>
      )}
      {selectedVehicle.image_back && (
        <div className="image-container">
          <p><strong>Back Image:</strong></p>
          <img 
            src={`http://localhost:5000/${selectedVehicle.image_back}`} 
            alt="Back" 
            className="w-full h-40 object-contain rounded-md shadow-md" 
          />
        </div>
      )}
      {selectedVehicle.image_left && (
        <div className="image-container">
          <p><strong>Left Image:</strong></p>
          <img 
            src={`http://localhost:5000/${selectedVehicle.image_left}`} 
            alt="Left" 
            className="w-full h-40 object-contain rounded-md shadow-md" 
          />
        </div>
      )}
      {selectedVehicle.image_right && (
        <div className="image-container">
          <p><strong>Right Image:</strong></p>
          <img 
            src={`http://localhost:5000/${selectedVehicle.image_right}`} 
            alt="Right" 
            className="w-full h-40 object-contain rounded-md shadow-md" 
          />
        </div>
      )}
      {selectedVehicle.bluebook_image && (
        <div className="image-container">
          <p><strong>Bluebook Image:</strong></p>
          <img 
            src={`http://localhost:5000/${selectedVehicle.bluebook_image}`} 
            alt="Bluebook" 
            className="w-full h-40 object-contain rounded-md shadow-md" 
          />
        </div>
      )}
      {selectedVehicle.identity_image && (
        <div className="image-container">
          <p><strong>Identity Image:</strong></p>
          <img 
            src={`http://localhost:5000/${selectedVehicle.identity_image}`} 
            alt="Identity" 
            className="w-full h-40 object-contain rounded-md shadow-md" 
          />
        </div>
      )}
    </div>
  </div>
</div>


              <div className="mt-6 flex justify-end space-x-4">
                <button 
                  className="px-6 py-2 bg-red-500 text-white rounded-md" 
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Edit Vehicle Status Modal */}
      <Dialog open={isEditModalOpen} onClose={closeEditModal} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="relative bg-white rounded-lg shadow-lg w-fit h-fit p-6">
          <div>
          {selectedVehicle && (
           <VehicleEditForm vehicleId={selectedVehicle.vehicle_id} categoryId={selectedVehicle.category_id} />
          )}
          </div>
          <button
            onClick={closeEditModal}
            className="absolute top-2 right-2 text-gray-500"
          >
            X
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default VehicleList;
