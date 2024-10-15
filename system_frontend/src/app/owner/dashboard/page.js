"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [ownername, setOwnername] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            // No token, redirect to login
            router.push('/owner/loginOwner');
        } else {
            try {
                const decoded = jwtDecode(token);
                
                // Check if the token has expired
                const currentTime = Date.now() / 1000; // Current time in seconds
                if (decoded.exp < currentTime) {
                    // Token has expired, log the user out
                    localStorage.removeItem('token'); // Clear expired token
                    router.push('/owner/loginOwner'); // Redirect to login
                    return;
                }

                setOwnername(decoded.ownername || 'Owner'); // Default to 'Owner' if name not found
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('token'); // Clear invalid token
                router.push('/owner/loginOwner'); // Redirect to login
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
            <h1>Welcome to the Dashboard, {ownername}!</h1>
            <p>You are logged in!</p>
        </div>
    );
}
