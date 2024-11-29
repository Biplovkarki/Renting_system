"use client"
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { Box, Typography, CircularProgress } from '@mui/material';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';

const labels = {
    0.5: 'Useless',
    1: 'Poor',
    1.5: 'Poor+',
    2: 'Ok',
    2.5: 'Ok+',
    3: 'Good',
    3.5: 'Good+',
    4: 'Excellent',
    4.5: 'Excellent+',
    5: 'Excellent'
};

function getLabelText(value) {
    return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

const UpcomingRentalsTable = () => {
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);
    const [upcomingRentals, setUpcomingRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ratings, setRatings] = useState({}); // Store ratings by vehicle_id
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
                const response = await fetch(`http://localhost:5000/userDetails/upcoming-rental-details/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const data = await response.json();
                setUpcomingRentals(data);
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

                for (let rental of upcomingRentals) {
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
                console.error('Error fetching existing ratings:', error);
            }
        };

        if (upcomingRentals.length > 0) {
            fetchExistingRatings();
        }
    }, [userId, token, upcomingRentals]);

    const handleRatingChange = async (event, newValue, vehicleId) => {
        setLoading(true);
        try {
            if (ratings[vehicleId]) {
                // Update existing rating
                await axios.put(
                    `http://localhost:5000/rating/rate/${userId}/${vehicleId}`,
                    { rating_value: parseFloat(newValue) },
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
            } else {
                // Create new rating
                await axios.post(
                    `http://localhost:5000/rating/rate/${userId}/${vehicleId}`,
                    { rating_value: parseFloat(newValue) },
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
            }
            setRatings((prevRatings) => ({
                ...prevRatings,
                [vehicleId]: newValue,
            }));
        } catch (error) {
            console.error('Error submitting rating:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-lg text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-3"></div>
                Loading upcoming rentals...
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg max-w-md mx-auto mt-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
            </div>
        );
    }

    if (upcomingRentals.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 text-gray-800 px-6 py-8 rounded-lg max-w-md mx-auto mt-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                No upcoming rentals found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="min-w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th className="px-6 py-3">Vehicle</th>
                        <th className="px-6 py-3">Rental Dates</th>
                        <th className="px-6 py-3">Rating</th>
                    </tr>
                </thead>
                <tbody>
                    {upcomingRentals.map((rental) => (
                      <tr key={rental.vehicle_id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{rental.vehicle_name}</td>
                      <td className="px-6 py-4">
                          {new Date(rental.rent_start_date).toLocaleDateString()} - {new Date(rental.rent_end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                          <Rating
                              name={`rating-${rental.vehicle_id}`}
                              value={ratings[rental.vehicle_id] || 2.5}
                              precision={0.5}
                              onChange={(event, newValue) => handleRatingChange(event, newValue, rental.vehicle_id)}  // Ensure rental.vehicle_id is passed here
                              icon={<StarIcon fontSize="inherit" />}
                              emptyIcon={<StarIcon fontSize="inherit" />}
                              getLabelText={getLabelText}
                          />
                      </td>
                  </tr>
                  
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UpcomingRentalsTable;
