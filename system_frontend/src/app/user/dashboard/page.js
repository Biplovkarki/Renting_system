"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode'; // Correct import
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

                setUserDetails(response.data);
                setToken(userToken);
            } catch (error) {
                console.error('Error fetching user details:', error);
                alert('Unable to fetch user details. Redirecting to login.');
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
        <div className="flex flex-col items-center pt-10 text-gray-800 px-6">
            {userDetails && (
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-semibold mb-2">Welcome, {userDetails.username}!</h1>
                    <p className="text-lg">We're happy to see you again.</p>
                </div>
            )}
            <div className="w-full flex flex-col gap-6 mt-6">
                <div className="flex gap-6">
                    <div className="w-1/2">
                        <RentalOverview userId={userDetails?.User_id} token={token} />
                    </div>
                    <div className="w-1/2">
                        <CurrentRentalDetails userId={userDetails?.User_id} token={token} />
                    </div>
                </div>
                <div className="w-full">
                    <UpcomingRentalDetails userId={userDetails?.User_id} token={token} />
                </div>
            </div>
        </div>
    );
}
