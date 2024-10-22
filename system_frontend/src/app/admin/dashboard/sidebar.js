"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SidebarAdmin() {
    const router = useRouter();

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            localStorage.removeItem('adminToken');
            router.push('/admin/loginAdmin');
        }
    };

    return (
        <div className="flex flex-col h-full w-52 bg-gray-800 text-white p-4">
            <div className="flex items-center mb-4">
                <h1 className="text-xl font-bold ml-2">Dashboard</h1>
            </div>
            <nav className="flex-grow">
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link href="/admin/dashboard" className="block p-2 hover:bg-gray-700 rounded">Home</Link>
                    </li>
                    <li>
                        <Link href="/admin/dashboard/profile" className="block p-2 hover:bg-gray-700 rounded">Profile</Link>
                    </li>
                    <li>
                        <Link href="/admin/dashboard/users" className="block p-2 hover:bg-gray-700 rounded">Users</Link>
                    </li>
                    <li>
                        <Link href="/admin/dashboard/owners" className="block p-2 hover:bg-gray-700 rounded">Owners</Link>
                    </li>
                    <li>
                        <Link href="/admin/dashboard/vehicles" className="block p-2 hover:bg-gray-700 rounded">Vehicles</Link>
                    </li>
                    <li>
                        <Link href="/admin/dashboard/category" className="block p-2 hover:bg-gray-700 rounded">Category</Link>
                    </li>
                    <li>
                        <Link href="/admin/dashboard/prices" className="block p-2 hover:bg-gray-700 rounded">Price</Link>
                    </li>
                    <li>
                        <Link href="/admin/dashboard/payments" className="block p-2 hover:bg-gray-700 rounded">Payments</Link>
                    </li>
                    <li>
                        <Link href="/admin/dashboard/discount" className="block p-2 hover:bg-gray-700 rounded">Discounts</Link>
                    </li>
                </ul>
            </nav>
            <div className="mt-auto">
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
