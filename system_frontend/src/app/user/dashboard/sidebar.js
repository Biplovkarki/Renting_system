"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SidebarUser() {
    const router = useRouter();

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            localStorage.removeItem('userToken');
            router.push('/');
        }
    };

    return (
        <div className="flex flex-col h-screen w-64 bg-gray-900 text-white p-6 shadow-lg">
            {/* Logo / Title */}
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-500 rounded-full h-10 w-10 flex items-center justify-center text-lg font-bold">
                    U
                </div>
                <h1 className="text-2xl font-semibold">User Space</h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow">
                <ul className="flex flex-col gap-4">
                    <li>
                        <Link
                            href="/user/dashboard"
                            className="block py-2 px-4 hover:bg-blue-600 rounded transition"
                        >
                            <span className="font-medium">🏠 Home</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/user/dashboard/profile"
                            className="block py-2 px-4 hover:bg-blue-600 rounded transition"
                        >
                            <span className="font-medium">👤 Profile</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/dashboard/users"
                            className="block py-2 px-4 hover:bg-blue-600 rounded transition"
                        >
                            <span className="font-medium">📦 Orders</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/dashboard/settings"
                            className="block py-2 px-4 hover:bg-blue-600 rounded transition"
                        >
                            <span className="font-medium">⚙️ Settings</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Divider */}
            <div className="border-t border-gray-700 my-4"></div>

            {/* Logout Button */}
            <div>
                <button
                    className="block w-full text-left py-2 px-4 hover:bg-red-600 bg-red-500 rounded transition"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
}
