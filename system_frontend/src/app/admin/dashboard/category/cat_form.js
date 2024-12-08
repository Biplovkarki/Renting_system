// CategoryForm.js

"use client";

import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

const CategoryForm=({ onCategoryAdded })=> {
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    // Function to handle form submission for adding a category
    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('adminToken'); // Get the token

        try {
            const response = await fetch('http://localhost:5000/adminAPI/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Attach the token to the request
                },
                body: JSON.stringify({ categoryName, description }),
            });

            const data = await response.json(); // Get response body

            if (response.ok) {
                setMessage({ text: data.message, type: 'success' });
                setCategoryName(''); // Reset the input fields on success
                setDescription('');
                onCategoryAdded(); // Notify the parent to refresh the category list
            } else {
                // Display error message returned from backend
                setMessage({ text: data.message || "An unexpected error occurred.", type: 'error' });
            }
        } catch (error) {
            //console.error('Network Error:', error);
            setMessage({ text: 'A network error occurred. Please check your connection.', type: 'error' });
        }
    };

    // Automatically clear the message after 3 seconds
    useEffect(() => {
        if (message.text) {
            const timeoutId = setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000); // Clear after 3 seconds
            return () => clearTimeout(timeoutId); // Clean up
        }
    }, [message]);

    return (
        <div className='shadow-2xl p-4'>
            {message.text && (
                <p className={`p-2 rounded mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </p>
            )}
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div className='flex flex-row items-center gap-2'>
                    <label htmlFor="categoryName" className='text-lg font-bold flex gap-2'>
                        <img src='/category.png' width={25} height={15} alt="Category Icon" />
                        Category Name:
                    </label>
                    <input
                        type="text"
                        id="categoryName"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className='border-2 focus:outline-blue-600 p-1 text-sm w-64 flex flex-grow'
                        required
                    />
                </div>
                <div className='flex flex-row items-center gap-11'>
                    <label htmlFor="description" className='text-lg font-bold flex gap-2'>
                        <img src='/information.png' width={25} height={15} alt="Information Icon" />
                        Description:
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className='border-2 focus:outline-blue-600 p-1 text-sm w-64 h-24 resize flex flex-grow'
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className='bg-blue-600 text-white p-2 rounded hover:bg-blue-500 transition flex items-center justify-center'
                >
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Category
                </button>
            </form>
        </div>
    );
}

export default CategoryForm; 