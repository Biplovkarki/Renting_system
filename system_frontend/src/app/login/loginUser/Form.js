"use client";
import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'; // Import Heroicons

export default function FormOwner() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const emailPattern = /^[^\s@]+@(gmail\.com|yahoo\.com|icloud\.com)$/;
        const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}\[\]:;"'<>?,.\/\\|`~]).{8,}$/;

        if (!emailPattern.test(email)) {
            setError('Please enter a valid email (only Gmail, Yahoo, or iCloud).');
            setLoading(false);
        } else if (!passwordPattern.test(password)) {
            setError('at least 8 characters long and include letters, numbers, and special characters.');
            setLoading(false);
        } else {
            setTimeout(() => {
                console.log('Email submitted:', email);
                console.log('Password submitted:', password);
                setEmail('');
                setPassword('');
                setLoading(false);
            }, 2000);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
                <label htmlFor="ownerEmail" className="flex flex-row bg-slate-300 border-2  w-[400px] gap-11 rounded-3xl h-12 mb-4">
                    <div className="mt-[8px] ml-3">
                        <h1>Email</h1>
                    </div>
                    <input
                        type="email"
                        id="ownerEmail"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email"
                        className="w-[500px] rounded-3xl bg-slate-200 placeholder:ml-5 p-2 focus:border-blue-400"
                        required
                    />
                </label>
                <label htmlFor="ownerPassword" className="flex flex-row bg-slate-300 border-2  w-[400px] gap-5 h-12 rounded-3xl mb-4 relative">
                    <div className="mt-[8px] ml-2">
                        <h1>Password</h1>
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="ownerPassword"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your password"
                        className="flex-grow rounded-3xl bg-slate-200 placeholder:ml-5 p-2 pr-10 w-[310px] focus:border-blue-400" // Add padding to right for icon
                        required
                    />
                    <button 
                        type="button" 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2" // Positioning the icon
                        onClick={() => setShowPassword(!showPassword)} // Toggle show/hide password
                    >
                        {showPassword ? (
                            <EyeIcon  className="h-5 w-5 text-white" /> // Show eye slash when password is visible
                        ) : (
                            <EyeSlashIcon className="h-5 w-5 text-white" /> // Show eye icon when password is hidden
                        )}
                    </button>
                </label>
                <button 
                    type="submit" 
                    className="mt-4 bg-blue-500 text-white py-2 px-4 w-40 rounded-3xl"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
