import Link from "next/link";

export default function SidebarOwner() {


    return (
        <div className="flex flex-col h-screen w-64 bg-gray-800 text-white p-4">
            <div className="flex items-center mb-4">
              
                <h1 className="text-xl font-bold ml-2">Dashboard</h1>
            </div>
            <nav>
                <ul className="flex flex-col space-y-2">
                    <li>
                        <Link href="/owner/dashboard" className="block p-2 hover:bg-gray-700 rounded">Home</Link>
                    </li>
                    <li>
                        <Link href="/owner/dashboard/profile" className="block p-2 hover:bg-gray-700 rounded">Profile</Link>
                    </li>
                    <li>
                        <Link href="/owner/dashboard/vehicles" className="block p-2 hover:bg-gray-700 rounded">Users</Link>
                    </li>
                    <li>
                        <Link href="/owner/dashboard/vehicles" className="block p-2 hover:bg-gray-700 rounded">Owners</Link>
                    </li>
                    <li>
                        <Link href="/owner/dashboard/vehicles" className="block p-2 hover:bg-gray-700 rounded">Vehicles</Link>
                    </li>
                    <li>
                        <Link href="/owner/dashboard/vehicles" className="block p-2 hover:bg-gray-700 rounded">category</Link>
                    </li>
                    <li>
                        <Link href="/owner/dashboard/vehicles" className="block p-2 hover:bg-gray-700 rounded">Price</Link>
                    </li>
                    <li>
                        <Link href="/owner/dashboard/vehicles" className="block p-2 hover:bg-gray-700 rounded">Payments</Link>
                    </li>
                    <li>
                        <button
                         //   onClick={handleLogout}
                            className="block w-full text-left p-2 hover:bg-gray-700 rounded bg-red-500 text-white"
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>

           </div>

          
    );
}
