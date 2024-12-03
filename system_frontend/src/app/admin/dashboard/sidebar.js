"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SidebarAdmin() {
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false); // Track if the component is on the client

    useEffect(() => {
        setIsClient(true); // Set to true after component mounts on the client
    }, []);

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            localStorage.removeItem('adminToken');
            router.push('/admin/loginAdmin');
        }
    };

    const NavLink = ({ href, children }) => {
        const isActive = pathname === href;
        return (
            <Link 
                href={href} 
                className={`block p-2 rounded ${
                    isActive 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'hover:bg-gray-700'
                }`}
            >
                {children}
            </Link>
        );
    };

    // Prevent rendering the sidebar before client-side hooks are ready
    if (!isClient) {
        return null; // or a loading spinner/message
    }

    return (
        <div className="flex flex-col min-h-screen w-52 bg-gray-800 text-white p-4">
            <div className="flex items-center mb-4">
                <h1 className="text-xl font-bold ml-2">Dashboard</h1>
            </div>
            <nav className="flex-grow">
                <ul className="flex flex-col gap-2">
                    <li>
                        <NavLink href="/admin/dashboard">Home</NavLink>
                    </li>
                    <li>
                        <NavLink href="/admin/dashboard/users">Users</NavLink>
                    </li>
                    <li>
                        <NavLink href="/admin/dashboard/owner">Owners</NavLink>
                    </li>
                    <li>
                        <NavLink href="/admin/dashboard/vehicles">Vehicles</NavLink>
                    </li>
                    <li>
                        <NavLink href="/admin/dashboard/category">Category</NavLink>
                    </li>
                    <li>
                        <NavLink href="/admin/dashboard/prices">Price</NavLink>
                    </li>
                    <li>
                        <NavLink href="/admin/dashboard/discount">Discounts</NavLink>
                    </li>
                    <li>
                        <NavLink href="/admin/dashboard/payment">Transactions</NavLink>
                    </li>
                    <li>
                        <NavLink href="/admin/dashboard/earning">Earning</NavLink>
                    </li>
                    
                    <li>
                        <NavLink href="/admin/dashboard/orders">Manage Orders</NavLink>
                    </li>
                    <li>
                        <NavLink href="/admin/dashboard/rating">Ratings and reviews</NavLink>
                    </li>
                    <li>
                        <NavLink href="/admin/dashboard/rental-revenue">Rental Revenue</NavLink>
                    </li>
                    <li>
                        <NavLink href="/admin/dashboard/document-valid">Document Review</NavLink>
                    </li>
                </ul>
            </nav>
            <div className="mt-2">
                <button
                    className="block w-full text-left p-2 hover:bg-gray-700 rounded bg-red-500 text-white"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
