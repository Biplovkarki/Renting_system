"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode"; // Ensure jwt-decode is imported
import DiscountForm from "./dis_form";
import DiscountList from "./list";

export default function Discounts() {
    const [refresh, setRefresh] = useState(false);
    const [loading, setLoading] = useState(true); // Add loading state
    const router = useRouter(); // Initialize the router

    useEffect(() => {
        const token = localStorage.getItem('adminToken'); 

        if (!token) {
            window.alert("Please log in to continue."); // Use alert for no token
            router.push('/admin/loginAdmin'); // Redirect to login if no token
            setLoading(false); // Set loading to false
            return; 
        }
        
        try {
            const decoded = jwtDecode(token); 
            const currentTime = Date.now() / 1000; // Current time in seconds
            if (decoded.exp < currentTime) {
                localStorage.removeItem('adminToken'); 
                window.alert("Your session has expired. Please log in again."); 
                router.push('/admin/loginAdmin'); 
                setLoading(false); // Set loading to false
                return; 
            }
        } catch (error) {
            //console.error('Invalid token:', error); 
            localStorage.removeItem('adminToken'); 
            window.alert("Your session is invalid. Please log in again."); 
            router.push('/admin/loginAdmin'); 
            setLoading(false); // Set loading to false
            return; 
        }

        setLoading(false); // Set loading to false after validation
    }, [router]);

    if (loading) {
        return <div>Loading...</div>; // Show a loading message
    }

    return (
        <div>
            <section>
                <h1 className='text-2xl font-bold'>Discount Management</h1>
            </section>
            <DiscountForm setRefresh={setRefresh} /> {/* Pass setRefresh to DiscountForm */}
            <div>
                <DiscountList refresh={refresh} setRefresh={setRefresh} /> {/* Ensure DiscountList has setRefresh */}
            </div>
        </div>
    );
}
