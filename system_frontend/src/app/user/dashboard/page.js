"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import RentalOverview from './rental_status';
import CurrentRentalDetails from './current-rent';
import UpcomingRentalDetails from './upcoming-rental';

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [userDetails, setUserDetails] = useState(null);
    const [token, setToken] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserDetails = async () => {
            const userToken = localStorage.getItem('userToken');
            if (!userToken) {
                router.push('/vehicles');
                return;
            }

            try {
                const decoded = jwtDecode(userToken);
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    localStorage.removeItem('userToken');
                    alert("Your session has expired. Please log in again.");
                    router.push('/vehicles');
                    return;
                }

                const response = await axios.get(`http://localhost:5000/userDetails/${decoded.id}`, {
                    headers: { Authorization: `Bearer ${userToken}` },
                });

                setUserDetails(response.data); // Store user details
                setToken(userToken); // Set token state
            } catch (error) {
                console.error('Error fetching user details:', error);
                alert('Unable to fetch user details. Please try again.');
                router.push('/vehicles');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, [router]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-start pt-10 text-gray-800 px-6">
            {userDetails ? (
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-semibold mb-2">
                        Welcome, {userDetails.username}!
                    </h1>
                    <p className="text-lg">We're happy to see you again.</p>
                </div>
            ) : (
                <p className="text-xl">User details not available.</p>
            )}

            {/* Left-aligned rental overview and current rental details in the same row */}
            <div className="w-full flex justify-between gap-6 mt-6">
                {userDetails ? (
                    <>
                        <div className="w-1/2">
                            <RentalOverview userId={userDetails.User_id} token={token} />
                        </div>
                        <div className="w-1/2">
                            <CurrentRentalDetails userId={userDetails.User_id} token={token} />
                        </div>
                        
                    </>
                ) : (
                    <p>Loading rental details...</p>
                )}
            </div>
            <div className="w-full  mt-6">
                {userDetails ? (
                    <>
                        <div className="">
                            <UpcomingRentalDetails userId={userDetails.User_id} token={token} />
                        </div>
                      
                        
                    </>
                ) : (
                    <p>Loading rental details...</p>
                )}
            </div>
        </div>
    );
}
