"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [Adminname, setAdminName] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            // No token, redirect to login
            router.push('/admin/loginAdmin');
        } else {
            try {
                const decoded = jwtDecode(token);

                // Check if the token has expired
                const currentTime = Date.now() / 1000; // Current time in seconds
                if (decoded.exp < currentTime) {
                    // Token has expired, log the user out
                    localStorage.removeItem('adminToken'); // Clear expired token
                    alert("Your session has expired. Please log in again."); // Optional alert
                    router.push('/admin/loginAdmin'); // Redirect to login
                    return;
                }

                setAdminName(decoded.Adminname || 'adminname'); // Default to 'adminname' if name not found
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('adminToken'); // Clear invalid token
                alert("Your session is invalid. Please log in again."); // Optional alert
                router.push('/admin/loginAdmin'); // Redirect to login
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
            <h1>Welcome to the Dashboard, {Adminname}!</h1>
            <p>You are logged in!</p>
        </div>
    );
}
