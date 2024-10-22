"use client"; 
import { useEffect, useState } from "react"; 
import { useRouter } from "next/navigation"; 
import { jwtDecode } from "jwt-decode"; 
import AddPriceRangeForm from "./addprice"; 
import PriceList from "./price_list"; 
import AddPriceModal from "./modal";

export default function Manage_price() {
    const router = useRouter(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken'); 

        if (!token) {
            router.push('/admin/loginAdmin'); // Redirect to login if no token
        } else {
            try {
                const decoded = jwtDecode(token); 
                const currentTime = Date.now() / 1000; // Current time in seconds
                if (decoded.exp < currentTime) {
                    localStorage.removeItem('adminToken'); 
                    alert("Your session has expired. Please log in again."); 
                    router.push('/admin/loginAdmin'); 
                    return; 
                }
            } catch (error) {
                console.error('Invalid token:', error); 
                localStorage.removeItem('adminToken'); 
                alert("Your session is invalid. Please log in again."); 
                router.push('/admin/loginAdmin'); 
            }
        }
    }, [router]);

    const handlePriceAdded = () => {
        setRefresh(!refresh); // Trigger refresh to update the price list
        setIsModalOpen(false); // Close the modal after adding a price
    };

    return (
        <div>
            <section >
                <h1 className='text-2xl px-2 font-bold'>Price Management</h1>
            </section>
            <div>
                <button 
                    onClick={() => setIsModalOpen(true)} // Open the modal
                    className="bg-blue-500 text-white px-4 py-2 mt-2 rounded mb-4 hover:bg-blue-600"
                >
                    Add Price Range
                </button>
                <div>
                    <PriceList refresh={refresh} /> {/* List of existing prices */}
                </div>
                <AddPriceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <AddPriceRangeForm onPriceAdded={handlePriceAdded} /> {/* Pass the handler to the form */}
                </AddPriceModal>
            </div>
        </div>
    );
}
