"use client"
import React, { useEffect, useState, Fragment } from "react";
import {jwtDecode} from "jwt-decode";
import { useRouter } from "next/navigation";
import { Box, Typography, CircularProgress } from "@mui/material";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import { Dialog, Transition } from '@headlessui/react';
import axios from "axios";
import RatingAndComment from "./rate";

const labels = {
  0.5: "Useless",
  1: "Poor",
  1.5: "Poor+",
  2: "Ok",
  2.5: "Ok+",
  3: "Good",
  3.5: "Good+",
  4: "Excellent",
  4.5: "Excellent+",
  5: "Excellent",
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

const PastRentalsTable = () => {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [pastRentals, setPastRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const router = useRouter();

  // Token validation and userId extraction
  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");

    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          throw new Error("Token expired");
        }

        setUserId(decoded.id);
        setToken(storedToken);
      } catch (err) {
        console.error("Token validation error:", err);
        localStorage.removeItem("userToken");
        setError("Your session has expired. Please log in again.");
        router.push("/vehicles");
      }
    } else {
      setError("No token found. Please log in.");
      router.push("/vehicles");
    }
  }, [router]);

  // Fetch upcoming rentals
  useEffect(() => {
    const fetchUpcomingRentals = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/userDetails/past-rental-details/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();
        setPastRentals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchUpcomingRentals();
    }
  }, [userId, token]);

  // Fetch existing ratings
  useEffect(() => {
    const fetchExistingRatings = async () => {
      try {
        const ratingsData = {};

        for (let rental of pastRentals) {
          const response = await axios.get(
            `http://localhost:5000/rating/rate/${userId}/${rental.vehicle_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.rating_value) {
            ratingsData[rental.vehicle_id] = response.data.rating_value;
          }
        }

        setRatings(ratingsData);
      } catch (error) {
        console.error("Error fetching existing ratings:", error);
      }
    };

    if (pastRentals.length > 0) {
      fetchExistingRatings();
    }
  }, [userId, token, pastRentals]);

  const handleRatingChange = async (event, newValue, vehicleId) => {
    setLoading(true);
    try {
      if (ratings[vehicleId]) {
        // Update existing rating
        await axios.put(
          `http://localhost:5000/rating/rate/${userId}/${vehicleId}`,
          { rating_value: parseFloat(newValue) },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
      } else {
        // Create new rating
        await axios.post(
          `http://localhost:5000/rating/rate/${userId}/${vehicleId}`,
          { rating_value: parseFloat(newValue) },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
      }
      setRatings((prevRatings) => ({
        ...prevRatings,
        [vehicleId]: newValue,
      }));
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedVehicle(null);
    setComment("");
  };

 


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-lg text-gray-500">
        <CircularProgress />
        Loading upcoming rentals...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">{error}</div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      <table className="min-w-full text-sm text-left text-black ">
        <thead className="text-xs text-black uppercase bg-gray-100">
          <tr>
            <th className="px-6 py-3">Vehicle</th>
            <th className="px-6 py-3">Rental Dates</th>
            <th className="px-6 py-3">Rating</th>
            <th className="px-6 py-3">Comment</th>
          </tr>
        </thead>
        <tbody>
          {pastRentals.map((rental) => (
            <tr key={rental.vehicle_id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4"><strong>{rental.vehicle_name}</strong></td>
              <td className="px-6 py-4"><strong>
                {new Date(rental.rent_start_date).toLocaleDateString()} -{" "}
                {new Date(rental.rent_end_date).toLocaleDateString()}</strong>
              </td>
              <td className="px-6 py-4">
                <Rating
                  name={`rating-${rental.vehicle_id}`}
                  value={ratings[rental.vehicle_id] || 2.5}
                  precision={0.5}
                  onChange={(event, newValue) => handleRatingChange(event, newValue, rental.vehicle_id)}
                  icon={<StarIcon fontSize="inherit" />}
                  emptyIcon={<StarIcon fontSize="inherit" />}
                  getLabelText={getLabelText}
                />
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => openModal(rental)}
                  className="text-blue-500 hover:underline"
                >
                  Add Comment
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for adding comment */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal}>
          <div className="min-h-screen px-4 text-center">
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Add Comment for {selectedVehicle?.vehicle_name}
              </Dialog.Title>
              <div className="mt-4">
                    {selectedVehicle && (
                      <RatingAndComment
                        vehicleId={selectedVehicle.vehicle_id}
                        userId={userId}
                      />
                    )}
                  </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-200 rounded-md"
                >close
                
                </button>
                
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default PastRentalsTable;

