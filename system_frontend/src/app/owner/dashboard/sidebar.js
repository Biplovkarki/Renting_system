"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';  
import { jwtDecode } from 'jwt-decode';
import { CameraIcon } from '@heroicons/react/20/solid';
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import axios from 'axios';

export default function SidebarOwner() {
    const router = useRouter();
    const [ownerName, setOwnerName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false); // State for error dialog
    const [file, setFile] = useState(null);
    const [image, setImage] = useState(null);

    const handleFile = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            setIsErrorOpen(true); // Open error dialog if no file is selected
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
        if (!name) return 'JD'; // Return default initials if name is undefined or empty
        const nameArray = name.split(' '); // Assuming you want to split by spaces
        const initials = nameArray.map(n => n[0]).join('');
        return initials || 'JD';
    };
    

    return (
        <div className="flex flex-col h-screen w-64 bg-gray-800 text-white p-4">
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
                        <Link href="/owner/dashboard" className="block p-2 hover:bg-gray-700 rounded">Home</Link>
                    </li>
                    <li>
                        <Link href="/owner/dashboard/profile" className="block p-2 hover:bg-gray-700 rounded">Profile</Link>
                    </li>
                    <li>
                        <Link href="/owner/dashboard/vehicles" className="block p-2 hover:bg-gray-700 rounded">My Vehicles</Link>
                    </li>
                    <li>
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left p-2 hover:bg-gray-700 rounded bg-red-500 text-white"
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>

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
    );
}
