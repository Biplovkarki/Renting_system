"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Make sure to import useRouter
import VehicleForm from "./form";
import { jwtDecode } from "jwt-decode"; // Ensure you're using the correct import for jwtDecode

export default function Vehicle() {
    const router = useRouter();
    const [notification, setNotification] = useState(null); // State for notifications
    const [formKey, setFormKey] = useState(0); // Key to refresh VehicleForm
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                
                // Check if the token has expired
                const currentTime = Date.now() / 1000; // Current time in seconds
                if (decoded.exp < currentTime) {
                    // Token has expired, log the user out
                    localStorage.removeItem('token'); // Clear expired token
                    setNotification({ message: 'Your session has expired. Please log in again.', type: 'error' });
                    router.push('/owner/loginOwner'); // Redirect to login
                    return;
                }

             // Uncomment if you have ownerId state

            } catch (error) {
                console.error('Error decoding token:', error);
                setNotification({ message: 'Invalid token. Please log in again.', type: 'error' });
                localStorage.removeItem('token');
                router.push('/owner/loginOwner');
            }
        } else {
            setNotification({ message: 'No token found. Please log in.', type: 'error' });
            router.push('/owner/loginOwner');
        }
    }, [router]);

    // Function to handle refreshing VehicleForm
    const refresh = () => {
        // Increment formKey to force re-render of VehicleForm
        setFormKey(prevKey => prevKey + 1);
        setNotification(null); // Clear any existing notifications
    };

    return (
        <div>
            {notification && (
                <div className={`notification ${notification.type}`}>{notification.message}</div>
            )}
            <VehicleForm key={formKey} refresh={refresh} />
        </div>
    );
}
