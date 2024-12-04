"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [ownerId, setOwnerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null); 
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);

        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          setNotification({
            message: "Your session has expired. Please log in again.",
            type: "error",
          });
          router.push("/owner/loginOwner");
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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  };

  const viewOrderDetails = (vehicleId) => {
    router.push(`/owner/dashboard/orderdetails/${vehicleId}`);  // Redirect to the order details page for the selected vehicle
  };

  if (loading) {
    return <div className="text-center py-4">Loading vehicles...</div>;
  }

  // Filter for approved vehicles
  const approvedVehicles = vehicles.filter(vehicle => vehicle.status === "approve");

  if (approvedVehicles.length === 0) {
    return (
      <div className="text-center py-4">
        <h1 className="text-lg font-semibold">No approved vehicles found for this owner.</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {approvedVehicles.map((vehicle) => (
        <div
          key={vehicle.vehicle_id}
          className="vehicle-item flex gap-6 border-t py-4 cursor-pointer"
          // Handle the click to view order details
        >
          {/* Vehicle Image */}
          <div className="vehicle-image w-fit">
            <img
              src={`http://localhost:5000/${vehicle.image_front}`}
              alt={`${vehicle.vehicle_name} front`}
              className="w-32 h-32 rounded-md aspect-video shadow-md"
            />
          </div>

          {/* Vehicle Info */}
          <div className="vehicle-info w-2/3">
            <h2 className="text-2xl font-semibold mb-2">{vehicle.vehicle_name}, {vehicle.model}</h2>
            <p className="text-lg"><strong>CC:</strong> {vehicle.cc}</p>
            <p className="text-lg"><strong>Fuel Type:</strong> {vehicle.fuel_type}</p>
            <p className="text-lg"><strong>Transmission:</strong> {vehicle.transmission}</p>
          </div>

          {/* Ellipsis Icon at the rightmost side */}
          <div className="ml-auto flex items-center">
            <EllipsisVerticalIcon className="w-10 h-10 text-gray-500 cursor-pointer" onClick={() => viewOrderDetails(vehicle.vehicle_id)} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleList;
