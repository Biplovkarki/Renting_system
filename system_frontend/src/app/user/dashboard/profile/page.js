"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { UserIcon } from "@heroicons/react/20/solid";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/navigation";

const ProfileUser = () => {
    const [userName, setUserName] = useState('');
    const [userID, setUserId] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [userImage, setUserImage] = useState(''); // State to store image URL
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // For image modal
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    localStorage.removeItem('userToken');
                    setNotification({ message: 'Your session has expired. Please log in again.', type: 'error' });
                    router.push('/vehicles');
                    return;
                }
                setUserId(decoded.id);
            } catch (error) {
                console.error('Error decoding token:', error);
                setNotification({ message: 'Invalid token. Please log in again.', type: 'error' });
                localStorage.removeItem('userToken');
                router.push('/vehicles');
            }
        } else {
            setNotification({ message: 'No token found. Please log in.', type: 'error' });
            router.push('/vehicles');
        }
    }, [router]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('http://localhost:5000/users/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                    },
                });
                const data = await response.json();
                setUserName(data.username);
                setUserEmail(data.user_email);
                setUserPhone(data.user_phone);
                setUserAddress(data.user_address);
                setUserImage(data.user_image);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setIsLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    const validateForm = () => {
        const emailPattern = /^(?!.*@.*@)([a-zA-Z0-9._%+-]+@(gmail\.com|icloud\.com|yahoo\.com))$/;
        const phonePattern = /^9[78]\d{8}$/;
        const namePattern = /^[A-Z][a-z]*(?: [A-Z][a-z]*){1,2}$/;

        if (!namePattern.test(userName)) {
            setNotification({ message: ' "Firstname [Middlename] Lastname" format required.', type: 'error' });
            return false;
        }
        if (!emailPattern.test(userEmail)) {
            setNotification({ message: 'Email must be a valid Gmail, iCloud, or Yahoo address.', type: 'error' });
            return false;
        }
        if (!phonePattern.test(userPhone)) {
            setNotification({ message: 'Phone number must start with 97 or 98 and be 10 digits long.', type: 'error' });
            return false;
        }
        return true;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:5000/users/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                },
                body: JSON.stringify({
                    username: userName,
                    user_email: userEmail,
                    user_phone: userPhone,
                    user_address: userAddress,
                }),
            });

            if (!response.ok) throw new Error('Failed to update profile');
            setNotification({ message: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => setNotification({ message: '', type: '' }), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setNotification({ message: 'Error updating profile. Please try again.', type: 'error' });
            setTimeout(() => setNotification({ message: '', type: '' }), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const formData = new FormData();
        formData.append('UserImage', e.target.files[0]);

        try {
            const response = await fetch('http://localhost:5000/users/uploaduser', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Image upload failed');

            const data = await response.json();
            setUserImage(data.image);
        } catch (error) {
            console.error('Error uploading image:', error);
            setNotification({ message: 'Error uploading image. Please try again.', type: 'error' });
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="relative max-w-4xl mx-auto p-6 border rounded-lg shadow-lg bg-white">
            {notification.message && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 mb-4 p-4 rounded z-20 ${notification.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
                    {notification.message}
                </div>
            )}
           <div className="flex flex-col items-center space-y-4">
    {userImage ? (
        <img
            src={`http://localhost:5000/users/image/${userID}`}
            alt="User Profile"
            className="w-32 h-32 rounded-full border-4 border-gray-300 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
        />
    ) : (
        <div
            className="w-32 h-32 flex items-center justify-center rounded-full border-4 border-dashed border-gray-300 cursor-pointer bg-gray-50"
            onClick={() => document.getElementById('image-upload').click()}
        >
            <UserIcon className="w-12 h-12 text-gray-500" />
            <span className="sr-only">Upload Profile Image</span>
        </div>
    )}

    <button
        type="button"
        onClick={() => document.getElementById('image-upload').click()}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md shadow hover:bg-blue-600"
    >
        Choose a Profile Picture
    </button>

    <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
    />
</div>


            <form onSubmit={handleSave} className="mt-2 space-y-6">

                <div>
                    <label htmlFor="username" className="block text-gray-700">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="block w-full px-3 py-2 border rounded-md"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-gray-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="block w-full px-3 py-2 border rounded-md"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-gray-700">Phone</label>
                    <input
                        id="phone"
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="block w-full px-3 py-2 border rounded-md"
                    />
                </div>

                <div>
                    <label htmlFor="address" className="block text-gray-700">Address</label>
                    <input
                        id="address"
                        type="text"
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                        className="block w-full px-3 py-2 border rounded-md"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="block w-full py-2 text-white bg-blue-500 rounded-md"
                >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </form>

            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <img
                        src={`http://localhost:5000/users/image/${userID}`}
                        alt="Profile Full View"
                        className="w-full max-h-[400px] object-contain rounded-lg"
                    />
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="mt-4 w-full py-2 text-white bg-red-500 rounded-md"
                    >
                        Close
                    </button>
                </div>
            </Dialog>
        </div>
    );
};

export default ProfileUser;
