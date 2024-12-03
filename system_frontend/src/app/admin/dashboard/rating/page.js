"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";

const AdminDashboard = () => {
  const router = useRouter();
  const [adminToken, setAdminToken] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [mostRatedVehicle, setMostRatedVehicle] = useState(null);
  const [comments, setComments] = useState([]); // State to store comments
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [loadingMostRated, setLoadingMostRated] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true); // Loading state for comments
  const [errorRatings, setErrorRatings] = useState(null);
  const [errorMostRated, setErrorMostRated] = useState(null);
  const [errorComments, setErrorComments] = useState(null); // Error state for comments

  // Token validation and redirect if not valid
  useEffect(() => {
    const storedAdminToken = localStorage.getItem("adminToken");
    if (storedAdminToken) {
      setAdminToken(storedAdminToken);
    } else {
      router.push("/admin/loginAdmin");
    }
  }, [router]);

  // Fetch data for average ratings, most rated vehicle, and comments
  useEffect(() => {
    if (!adminToken) return;

    // Fetch ratings
    const fetchAverageRatings = async () => {
      try {
        const response = await axios.get("http://localhost:5000/ratedetails/vehicles/average-ratings", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setRatings(response.data.data);
        setLoadingRatings(false);
      } catch (err) {
        setErrorRatings("Error fetching ratings data");
        setLoadingRatings(false);
        console.error("Error fetching average ratings:", err);
      }
    };

    // Fetch most rated vehicle
    const fetchMostRatedVehicle = async () => {
      try {
        const response = await axios.get("http://localhost:5000/ratedetails/vehicles/most-rated", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setMostRatedVehicle(response.data.data);
        setLoadingMostRated(false);
      } catch (err) {
        setErrorMostRated("Error fetching most rated vehicle");
        setLoadingMostRated(false);
        console.error("Error fetching most rated vehicle:", err);
      }
    };

    // Fetch recent comments for all vehicles
    const fetchRecentComments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/ratedetails/comments/recent", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setComments(response.data); // Set the comments data
        setLoadingComments(false);
      } catch (err) {
        setErrorComments("Error fetching recent comments");
        setLoadingComments(false);
        console.error("Error fetching recent comments:", err);
      }
    };

    fetchAverageRatings();
    fetchMostRatedVehicle();
    fetchRecentComments();
  }, [adminToken]);

  if (!adminToken) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
        <p>Please log in as an admin to access this page.</p>
      </div>
    );
  }

  // Function to get the most recent comment for each vehicle
  const getMostRecentComment = (vehicleId) => {
    const vehicleComments = comments.filter(comment => comment.vehicle_id === vehicleId);
    if (vehicleComments.length > 0) {
      const sortedComments = vehicleComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return sortedComments[0]; // Return the most recent comment
    }
    return null; // If no comment found for this vehicle
  };

  return (
    <div className="space-y-3">
      {/* Most Rated Vehicle Section */}
      <div className="p-2 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Most Rated Vehicle</h2>
        {loadingMostRated ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg text-gray-500">Loading...</div>
          </div>
        ) : errorMostRated ? (
          <div className="text-red-500">{errorMostRated}</div>
        ) : mostRatedVehicle ? (
          <div className="flex justify-between bg-gray-100 p-2 rounded-lg shadow">
            <span className="font-medium">Vehicle name: {mostRatedVehicle.vehicle_name}</span>
            <div className="flex items-center">
              <Rating
                value={parseFloat(mostRatedVehicle.average_rating) || 0}
                precision={0.5}
                readOnly
                icon={<StarIcon fontSize="inherit" />}
                emptyIcon={<StarIcon fontSize="inherit" style={{ opacity: 0.3 }} />}
              />
              <span className="ml-2">{parseFloat(mostRatedVehicle.average_rating || 0).toFixed(1)}</span>
            </div>
          </div>
        ) : (
          <div className="text-red-500">No data available</div>
        )}
      </div>

      {/* Average Ratings Table */}
      <div className="p-2 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Revies & Ratings</h2>
        {loadingRatings ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg text-gray-500">Loading...</div>
          </div>
        ) : errorRatings ? (
          <div className="text-red-500">{errorRatings}</div>
        ) : (
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b text-left">Vehicle Name</th>
                <th className="py-2 px-4 border-b text-left">Average Rating</th>
                <th className="py-2 px-4 border-b text-left">Recent Comment</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((vehicle) => {
                const recentComment = getMostRecentComment(vehicle.vehicle_id); // Get the most recent comment for this vehicle
                return (
                  <tr key={vehicle.vehicle_id} className="border-b">
                    <td className="py-2 px-4">{vehicle.vehicle_name}</td>
                    <td className="py-2 px-4">
                      <div className="flex justify-start">
                        <Rating
                          value={parseFloat(vehicle.average_rating) || 0}
                          precision={0.5}
                          readOnly
                          icon={<StarIcon fontSize="inherit" />}
                          emptyIcon={<StarIcon fontSize="inherit" style={{ opacity: 0.3 }} />}
                        />
                        <span className="ml-2">{parseFloat(vehicle.average_rating).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      {recentComment ? (
                        <div className="text-lg text-black">
                          <p>{recentComment.comment_text}</p>
                          <span className="text-sm text-gray-500">
                            {new Date(recentComment.created_at).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">No comments available</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
