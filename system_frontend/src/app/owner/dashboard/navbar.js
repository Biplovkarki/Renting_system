"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NavbarOwner() {
    const [ownerName, setOwnerName] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchOwnerProfile = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    const response = await fetch('http://localhost:5000/owners/profile', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch owner profile');
                    }

                    const data = await response.json();
                    setOwnerName(data.ownername); // Adjust this according to your API response structure
                } catch (error) {
                    console.error('Error fetching profile:', error);
                    setError('Unable to load profile. Please log in again.');
                    // Optionally, you could redirect to login if there's an error fetching the profile
                    // router.push('/owner/login');
                }
            } else {
                // Redirect to login if there's no token
                router.push('/owner/loginOwner');
            }
        };

        fetchOwnerProfile();
    }, [router]);

    return (
        <div className="flex flex-row items-center justify-between p-4 bg-gray-200 text-white">
            <div className="flex flex-row items-center gap-3">
                <img src="/logo.png" alt="logo" width={100} height={100} />
                <h1 className="mt-5">{ownerName ? `Welcome, ${ownerName}` : 'Welcome'}</h1>
            </div>
          
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}
