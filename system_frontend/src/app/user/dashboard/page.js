"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
   
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('userToken');

        if (!token) {
            // No token, redirect to login
            router.push('/vehicles');
        } else {
            try {
                const decoded = jwtDecode(token);

                // Check if the token has expired
                const currentTime = Date.now() / 1000; // Current time in seconds
                if (decoded.exp < currentTime) {
                    // Token has expired, log the user out
                    localStorage.removeItem('userToken'); // Clear expired token
                    alert("Your session has expired. Please log in again."); // Optional alert
                    router.push('/vehicles'); // Redirect to login
                    return;
                }

             
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('userToken'); // Clear invalid token
                alert("Your session is invalid. Please log in again."); // Optional alert
                router.push('/vehicles'); // Redirect to login
            } finally {
                setIsLoading(false); // Set loading to false regardless of the outcome
            }
        }
    }, [router]);

    if (isLoading) {
        return <div>Loading...</div>; // Show loading state
    }

    return (
        <div>
           
            <p>You are logged in!</p>
        </div>
    );
}
