"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';
import { CameraIcon } from '@heroicons/react/20/solid';
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import axios from 'axios';
import { Bars2Icon, XMarkIcon } from '@heroicons/react/20/solid'; // Importing the close icon

export default function SidebarOwner() {

    const [ownerName, setOwnerName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [image, setImage] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility
    const router = useRouter();
    const pathname = usePathname();

    const handleFile = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            setIsErrorOpen(true);
            return;
        }

        const formData = new FormData();
        formData.append('OwnerImage', file);

        const token = localStorage.getItem('token');
        axios.post('http://localhost:5000/ownersImage/uploadOwner', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => {
                if (res.data.status === "Success") {
                    console.log("Upload succeeded");
                    setImage(res.data.image);
                    setIsOpen(false);
                } else {
                    console.error('Error uploading image:', res.data.message);
                }
            })
            .catch(error => {
                console.error('Upload failed:', error.response?.data || error.message);
            });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setOwnerName(decoded.ownername);
            } catch (error) {
                console.error('Error decoding token:', error);
                alert('Invalid token. Please log in again.');
                localStorage.removeItem('token');
                router.push('/owner/loginOwner');
            }
        } else {
            router.push('/owner/loginOwner');
        }
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('http://localhost:5000/ownersImage/getOwnerimage', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(res => {
                    if (res.data.length > 0) {
                        setImage(res.data[0].own_image);
                    }
                })
                .catch(err => console.log(err));
        }
    }, []);

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            localStorage.removeItem('token');
            localStorage.removeItem('owner');
            router.push('/owner/loginOwner');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'JD';
        const nameArray = name.split(' ');
        const initials = nameArray.map(n => n[0]).join('');
        return initials || 'JD';
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility
    };

    return (
        <div className="flex">
            <div className={`flex flex-col min-h-screen w-64 bg-gray-800 text-white p-4 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center mb-4">
                    <div className='border-2 rounded-full w-fit h-fit relative'>
                        <Image
                            src={image ? `http://localhost:5000/uploads/owner/${image}` : `https://api.dicebear.com/6.x/initials/svg?seed=${getInitials(ownerName)}`}
                            alt="Profile"
                            width={80}
                            height={80}
                            className="rounded-full w-20 h-20 cursor-pointer"
                            onClick={() => setIsImageOpen(true)}
                        />
                        <CameraIcon
                            width={20}
                            height={20}
                            className='absolute bottom-0 right-0 -mb-1'
                            onClick={() => setIsOpen(true)}
                        />
                    </div>
                    <h1 className="text-xl font-bold ml-2">Dashboard</h1>
                </div>
                <nav>
                    <ul className="flex flex-col space-y-2">
                        <li>
                            <Link href="/owner/dashboard" className={`block py-2 px-4 rounded transition ${pathname === "/owner/dashboard" ? "bg-blue-600" : "hover:bg-blue-600"
                                }`}> 🏠 Home</Link>
                        </li>
                        <li>
                            <Link href="/owner/dashboard/profile" className={`block py-2 px-4 rounded transition ${pathname === "/owner/dashboard/profile" ? "bg-blue-600" : "hover:bg-blue-600"
                                }`}>👤 Profile</Link>
                        </li>
                        <li>
                            <Link href="/owner/dashboard/vehicles" className={`block py-2 px-4 rounded transition ${pathname === "/owner/dashboard/vehicles" ? "bg-blue-600" : "hover:bg-blue-600"
                                }`}>➕ Add Vehicles</Link>
                        </li>
                        <li>
                            <Link
                                href="/owner/dashboard/password"
                                className={`block py-2 px-4 rounded transition ${pathname === "/owner/dashboard/password" ? "bg-blue-600" : "hover:bg-blue-600"
                                    }`}
                            >
                                <span className="font-medium">🔑 Change Password</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/owner/dashboard/vehiclelist"
                                className={`block py-2 px-4 rounded transition ${pathname === "/owner/dashboard/vehiclelist" ? "bg-blue-600" : "hover:bg-blue-600"
                                    }`}
                            >
                                <span className="font-medium">🚘 Vehicles </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/owner/dashboard/orderdetails"
                                className={`block py-2 px-4 rounded transition ${pathname === "/owner/dashboard/orderdetails" ? "bg-blue-600" : "hover:bg-blue-600"
                                    }`}
                            >
                                <span className="font-medium">📋 OrderDetails </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/owner/dashboard/earning"
                                className={`block py-2 px-4 rounded transition ${pathname === "/owner/dashboard/earning" ? "bg-blue-600" : "hover:bg-blue-600"
                                    }`}
                            >
                                <span className="font-medium">💵 Earnings </span>
                            </Link>
                        </li>

                    </ul>
                </nav>
                <div className="mt-auto">
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left p-2 hover:bg-gray-700 rounded bg-red-500 text-white"
                    >
                        🚪 Logout
                    </button>
                </div>

                {/* Image upload dialog */}
                <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => setIsOpen(false)}>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="w-[90%] md:w-[40%] rounded-lg bg-white p-6 space-y-5 shadow-xl">
                            <DialogTitle className="font-semibold">Upload Profile Image</DialogTitle>
                            <input type="file" onChange={handleFile} />
                            <div className="flex space-x-2">
                                <Button onClick={handleUpload}>Upload</Button>
                                <Button onClick={() => setIsOpen(false)} className="bg-red-500">Cancel</Button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* Error dialog */}
                <Dialog open={isErrorOpen} as="div" className="relative z-20 focus:outline-none" onClose={() => setIsErrorOpen(false)}>
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="rounded-lg bg-white p-6 shadow-xl">
                            <DialogTitle className="font-semibold">Error</DialogTitle>
                            <p className="text-center">Please select an image file before uploading.</p>
                            <div className="mt-4">
                                <Button onClick={() => setIsErrorOpen(false)} className="bg-red-500">Close</Button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* Image view dialog */}
                <Dialog open={isImageOpen} as="div" className="relative z-20 focus:outline-none" onClose={() => setIsImageOpen(false)}>
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="rounded-lg bg-white p-6 shadow-xl">
                            <DialogTitle className="font-semibold">Profile Image</DialogTitle>
                            <div className="flex justify-center">
                                <Image
                                    src={image ? `http://localhost:5000/uploads/owner/${image}` : `https://api.dicebear.com/6.x/initials/svg?seed=${getInitials(ownerName)}`}
                                    alt="Profile"
                                    width={300}
                                    height={300}
                                    className="rounded"
                                />
                            </div>
                            <div className="mt-4">
                                <Button onClick={() => setIsImageOpen(false)} className="bg-red-500">Close</Button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            </div>

            {/* Button to toggle sidebar */}
            <button
                className="p-2 bg-blue-500 text-white rounded-md absolute top-4 right-1 z-30"
                onClick={toggleSidebar}
            >
                {isSidebarOpen ? <Bars2Icon className="h-6 w-6" /> : <Bars2Icon className="h-6 w-6" />}
            </button>

        </div>
    );
}
