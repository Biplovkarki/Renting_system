"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import AdminDashboardCounts from './details';
import SalesDashboard from './sale';
import VehicleCategoryCountTable from './vehicle-count-category';
import ForecastComponent from './arima';

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
        return <div className="flex justify-center items-center h-screen">Loading...</div>; // Show loading state
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <header className=" text-black p-4 text-center">
                <h1 className="text-3xl font-bold">Welcome to the Dashboard, {Adminname}!</h1>
            </header>

            {/* Main Content */}
            <main className="p-8 space-y-8">
            <div className="bg-white p-6 shadow-md rounded-lg">
                    <ForecastComponent/>
                </div>
                <div className="bg-white p-6 shadow-md rounded-lg">
                    <SalesDashboard />
                </div>

                <div className="bg-white p-6 shadow-md rounded-lg">
                    <AdminDashboardCounts />
                </div>

                <div className="bg-white p-6  shadow-md rounded-lg">
                    <VehicleCategoryCountTable />
                </div>
            </main>
        </div>
    );
}
