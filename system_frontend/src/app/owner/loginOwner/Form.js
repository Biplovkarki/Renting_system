"use client";
import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

export default function FormOwner() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        const emailPattern = /^[^\s@]+@(gmail\.com|yahoo\.com|icloud\.com)$/;
        const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}\[\]:;"'<>?,.\/\\|`~]).{8,}$/;
    
        if (!emailPattern.test(email)) {
            setError('Please enter a valid email (only Gmail, Yahoo, or iCloud).');
            setLoading(false); // Reset loading state
            return;
        } else if (!passwordPattern.test(password)) {
            setError('Password must include at least 8 characters long, letters, numbers, and special characters.');
            setLoading(false); // Reset loading state
            return;
        }
    
        try {
            const response = await fetch('http://localhost:5000/owners/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
    
            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                router.push('/owner/dashboard');
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
                setLoading(false); // Reset loading state on error
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
            setLoading(false); // Reset loading state on error
        }
    };
    

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
                <label htmlFor="ownerEmail" className="flex flex-row bg-slate-300 border-2 w-[400px] gap-11 rounded-3xl h-12 mb-4">
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
                <label htmlFor="ownerPassword" className="flex flex-row bg-slate-300 border-2 w-[400px] gap-5 h-12 rounded-3xl mb-4 relative">
                    <div className="mt-[8px] ml-2">
                        <h1>Password</h1>
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="ownerPassword"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your password"
                        className="flex-grow rounded-3xl bg-slate-200 placeholder:ml-5 p-2 pr-10 w-[310px] focus:border-blue-400"
                        required
                    />
                    <button 
                        type="button" 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeIcon className="h-5 w-5 text-white" />
                        ) : (
                            <EyeSlashIcon className="h-5 w-5 text-white" />
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