"use client"
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { UserIcon } from "@heroicons/react/20/solid";
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
    const router = useRouter();

    // Fetch user profile on component mount
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

    // Fetch user profile data from API
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
                setIsLoading(false); // Set loading to false after data is fetched
            } catch (error) {
                console.error('Error fetching profile:', error);
                setIsLoading(false); // In case of an error, also stop loading
            }
        };
    
        fetchUserProfile();
    }, []); 
    
    // Empty dependency array to run this only once on component mount

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const validateForm = () => {
        const emailPattern = /^(?!.*@.*@)([a-zA-Z0-9._%+-]+@(gmail\.com|icloud\.com|yahoo\.com))$/;
        const phonePattern = /^9[78]\d{8}$/; // Starts with 97 or 98 and 10 digits in total
        const namePattern = /^[A-Z][a-z]*(?: [A-Z][a-z]*){1,2}$/; // Firstname [Middlename] Lastname

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

    // Handle profile update form submission
    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return; // Stop the form submission if validation fails
        }

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

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setNotification({ message: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setNotification({ message: 'Error updating profile. Please try again.', type: 'error' });
            setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 3000);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle image upload
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

            if (!response.ok) {
                throw new Error('Image upload failed');
            }

            const data = await response.json();
            setUserImage(data.image); // Update user image state with new image filename
        } catch (error) {
            console.error('Error uploading image:', error);
            setNotification({ message: 'Error uploading image. Please try again.', type: 'error' });
        }
    };

    return (
        <div className="relative w-full p-6 border rounded-lg shadow-lg">
            {notification.message && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 mb-4 p-4 border rounded z-20 ${notification.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
                    {notification.message}
                </div>
            )}
            <div className="flex flex-col items-center">
                {/* Profile Image at the top in a round format */}
                {userImage ? (
                    <img
                        src={`http://localhost:5000/users/image/${userID}`}
                        alt="User Profile"
                        className="w-32 h-32 rounded-full border-4 border-gray-300 mb-6"
                    />
                ) : (
                    <UserIcon width={80} height={80} className="mb-6 text-gray-500" />
                )}
                <h1 className="text-2xl font-bold mb-4">Profile</h1>
                <form onSubmit={handleSave} className="w-full max-w-lg space-y-6">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center mb-6">
                        <label htmlFor="image-upload" className="cursor-pointer text-blue-500">
                            Upload Profile Image
                        </label>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="mt-2"
                        />
                    </div>

                    {/* Other fields */}
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="address" className="block text-gray-700">Address</label>
                        <input
                            type="text"
                            id="address"
                            value={userAddress}
                            onChange={(e) => setUserAddress(e.target.value)}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Save button */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-2 bg-blue-500 text-white rounded-md"
                    >
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileUser;
