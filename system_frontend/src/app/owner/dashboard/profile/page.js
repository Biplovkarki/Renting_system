"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; 
import { UserIcon, EnvelopeIcon, PhoneIcon, HomeIcon } from "@heroicons/react/20/solid";

const ProfileOwner = () => {
    const [ownerName, setOwnerName] = useState(''); // Store owner's full name
    const [ownerID, setOwnerId] = useState('');
    const [ownEmail, setOwnEmail] = useState('');
    const [ownPhone, setOwnPhone] = useState('');
    const [ownAddress, setOwnAddress] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' }); // State for notification
    const [isSaving, setIsSaving] = useState(false); // State to track saving status
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                
                // Check if the token has expired
                const currentTime = Date.now() / 1000; // Current time in seconds
                if (decoded.exp < currentTime) {
                    // Token has expired, log the user out
                    localStorage.removeItem('token'); // Clear expired token
                    setNotification({ message: 'Your session has expired. Please log in again.', type: 'error' });
                    router.push('/owner/loginOwner'); // Redirect to login
                    return;
                }

                setOwnerId(decoded.id);
            } catch (error) {
                console.error('Error decoding token:', error);
                setNotification({ message: 'Invalid token. Please log in again.', type: 'error' }); // Use notification for error
                localStorage.removeItem('token');
                router.push('/owner/loginOwner');
            }
        } else {
            setNotification({ message: 'No token found. Please log in.', type: 'error' });
            router.push('/owner/loginOwner');
        }
    }, [router]);

    useEffect(() => {
        const fetchOwnerProfile = async () => {
            try {
                const response = await fetch('http://localhost:5000/owners/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch owner profile');
                }

                const data = await response.json();
                setOwnerName(data.ownername); // Fetch full name
                setOwnEmail(data.own_email);
                setOwnPhone(data.own_phone);
                setOwnAddress(data.own_address);
            } catch (error) {
                console.error('Error fetching owner profile:', error);
                setNotification({ message: 'Error fetching profile. Please try again.', type: 'error' }); // Use notification for error
            }
        };

        fetchOwnerProfile();
    }, []);

    const validateForm = () => {
        const emailPattern = /^(?!.*@.*@)([a-zA-Z0-9._%+-]+@(gmail\.com|icloud\.com|yahoo\.com))$/;
        const phonePattern = /^9[78]\d{8}$/; // Starts with 97 or 98 and 10 digits in total
        const namePattern = /^[A-Z][a-z]*(?: [A-Z][a-z]*){1,2}$/; // Firstname [Middlename] Lastname

        if (!namePattern.test(ownerName)) {
            setNotification({ message: ' "Firstname [Middlename] Lastname" format required.', type: 'error' });
            return false;
        }
        if (!emailPattern.test(ownEmail)) {
            setNotification({ message: 'Email must be a valid Gmail, iCloud, or Yahoo address.', type: 'error' });
            return false;
        }
        if (!phonePattern.test(ownPhone)) {
            setNotification({ message: 'Phone number must start with 97 or 98 and be 10 digits long.', type: 'error' });
            return false;
        }
        return true;
    };

    const handleSave = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!validateForm()) {
            return; // Stop the form submission if validation fails
        }
        
        setIsSaving(true); // Set saving status to true

        try {
            const response = await fetch('http://localhost:5000/owners/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    ownername: ownerName,
                    own_email: ownEmail,
                    own_phone: ownPhone,
                    own_address: ownAddress,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Set notification message for success and hide it after a few seconds
            setNotification({ message: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => {
                setNotification({ message: '', type: '' }); // Hide notification after 3 seconds
            }, 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setNotification({ message: 'Error updating profile. Please fill the address and try again.', type: 'error' }); // Use notification for error
            setTimeout(() => {
                setNotification({ message: '', type: '' }); // Hide notification after 3 seconds
            }, 3000);
        } finally {
            setIsSaving(false); // Reset saving status
        }
    };

    return (
        <div className="relative w-full p-6 border rounded-lg shadow-lg">
            {notification.message && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 mb-4 p-4 border rounded z-20 ${
                    notification.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'
                }`}>
                    {notification.message}
                </div>
            )}
            <div>
                <h1 className="text-2xl font-bold mb-4">Profile</h1>
                <form onSubmit={handleSave}>
                    <label className="flex flex-col mb-4">
                        <span className="flex flex-row gap-3 mb-4">
                            <UserIcon width={20} height={20} className="mb-2" />
                            <h1>Owner</h1>
                        </span>
                        <input
                            type="text"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)} // Allow editing
                            className="border rounded p-2"
                        />
                    </label>
                    <label className="flex flex-col mb-4">
                        <span className="flex flex-row gap-3 mb-4">
                            <EnvelopeIcon width={20} height={20} className="mb-2" />
                            <h1>Email</h1>
                        </span>
                        <input
                            type="email"
                            value={ownEmail}
                            onChange={(e) => setOwnEmail(e.target.value)} // Allow editing
                            className="border rounded p-2"
                        />
                    </label>
                    <label className="flex flex-col mb-4">
                        <span className="flex flex-row gap-3 mb-4">
                            <PhoneIcon width={20} height={20} className="mb-2" />
                            <h1>Phone</h1>
                        </span>
                        <input
                            type="text"
                            value={ownPhone}
                            onChange={(e) => setOwnPhone(e.target.value)} // Allow editing
                            className="border rounded p-2"
                            maxLength={10}
                        />
                    </label>
                    <label className="flex flex-col mb-4">
                        <span className="flex flex-row gap-3 mb-4">
                            <HomeIcon width={20} height={20} className="mb-2" />
                            <h1>Address</h1> 
                        </span>
                        <input
                            type="text"
                            value={ownAddress}
                            onChange={(e) => setOwnAddress(e.target.value)} // Allow editing
                            className="border rounded p-2"
                        />
                    </label>
                    <button 
                        type="submit" 
                        className="bg-blue-500 text-white rounded px-4 py-2"
                        disabled={isSaving} // Disable button while saving
                    >
                        {isSaving ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileOwner;
