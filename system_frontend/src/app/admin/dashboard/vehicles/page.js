"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit modal state
  const [status, setStatus] = useState('');
  const [availability, setAvailability] = useState(''); // State for availability
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Please login as an admin');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/vehicleApi/vehicles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        alert('Failed to fetch vehicles. Please try again later.');
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

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
    if (status === '' || availability === '') {
        alert('Please select both status and availability.');
        return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
        alert('Please login as an admin');
        return;
    }

    setLoading(true);

    try {
        const currentVehicle = selectedVehicle;

        // Create an object containing only the fields to update (status and availability)
        const updatedVehicleStatus = {};

        if (status) updatedVehicleStatus.status = status;
        if (availability !== undefined) updatedVehicleStatus.availability = availability;

        // Send only the updated fields in the PUT request
        await axios.put(
            `http://localhost:5000/vehicleApi/vehicles/${currentVehicle.vehicle_id}`,
            updatedVehicleStatus,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update the frontend state for status and availability only
        setVehicles(prevVehicles =>
            prevVehicles.map(vehicle =>
                vehicle.vehicle_id === currentVehicle.vehicle_id
                    ? { ...vehicle, ...updatedVehicleStatus }
                    : vehicle
            )
        );

        alert('Vehicle status and availability updated successfully');
        closeEditModal();
    } catch (error) {
        console.error('Error updating vehicle status:', error);
        alert('Failed to update vehicle status and availability. Please try again later.');
    } finally {
        setLoading(false);
    }
};
  
  const deleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Please login as an admin');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/vehicleApi/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVehicles(vehicles.filter(vehicle => vehicle.vehicle_id !== vehicleId));
      alert('Vehicle deleted successfully.');
    } catch (error) {
      alert('Failed to delete the vehicle. Please try again later.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return <div className="text-center py-4">Loading vehicles...</div>;
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
          {(Array.isArray(vehicles) ? vehicles : []).map(vehicle => (
            <tr key={vehicle.vehicle_id} className="border-t">
              <td className="px-4 py-2">{vehicle.vehicle_name}</td>
              <td className="px-4 py-2">{vehicle.model}</td>
              <td className="px-4 py-2">{vehicle.owner_name}</td>
              <td className="px-4 py-2">{vehicle.category_name}</td>
              <td className="px-4 py-2">{vehicle.status}</td>
              <td className="px-4 py-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${vehicle.availability === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {vehicle.availability === 0 ? 'Unavailable' : 'Available'}
                </span>
              </td>
              <td className="px-4 py-2">{vehicle.final_price}</td>
              <td className="px-4 py-2">{vehicle.discounted_price}</td>
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

      {/* Modal for Vehicle Details */}
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
        <div className="relative bg-white rounded-lg shadow-lg w-96 p-6">
          <Dialog.Title className="text-2xl font-bold mb-4">Edit Vehicle Status</Dialog.Title>
          <div>
            <label className="block font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            >
              <option value="pending">Pending</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="block font-medium">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            >
              <option value="0">Unavailable</option>
              <option value="1">Available</option>
            </select>
          </div>
          <div className="mt-6">
            <button
              onClick={handleSaveChanges}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              Save Changes
            </button>
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
