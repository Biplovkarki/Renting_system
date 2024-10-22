"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { jwtDecode } from 'jwt-decode'; 
import { PlusIcon } from '@heroicons/react/24/solid';
import CategoryList from './category_list'; 
import CategoryForm from './cat_form';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Category() {
    const router = useRouter(); 
    const [message, setMessage] = useState({ text: '', type: '' });
    const [refresh, setRefresh] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

    useEffect(() => {
        const token = localStorage.getItem('adminToken'); 

        if (!token) {
            router.push('/admin/loginAdmin'); 
            return; // Prevent further execution
        }

        try {
            const decoded = jwtDecode(token); 
            const currentTime = Date.now() / 1000; 
            if (decoded.exp < currentTime) {
                localStorage.removeItem('adminToken'); 
                // Show alert for expired session
                window.alert("Your session has expired. Please log in again.");
                router.push('/admin/loginAdmin'); 
                return; // Prevent further execution
            }
        } catch (error) {
            console.error('Invalid token:', error); 
            localStorage.removeItem('adminToken'); 
            // Show alert for invalid session
            window.alert("Your session is invalid. Please log in again.");
            router.push('/admin/loginAdmin'); 
            return; // Prevent further execution
        }
    }, [router]); 

    const handleCategoryAdded = () => {
        setMessage({ text: 'Category added successfully!', type: 'success' });
        setRefresh(prev => !prev); 
        setIsModalOpen(false); // Close modal after adding category
    };

    return (
        <div className='flex flex-col'>
            <h1 className='text-2xl font-bold'>Category</h1>
            <div className='flex mb-2 mt-3'>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className='flex items-center bg-blue-500 text-white px-4 py-2 rounded'
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Category
                </button>
            </div>
            <div className='shadow-2xl p-4'>
                {message.text && (
                    <p className={`p-2 rounded mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </p>
                )}
                <CategoryList refresh={refresh} />
            </div>

            {/* Modal for CategoryForm */}
            {isModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center z-50'>
                    <div className='absolute inset-0 bg-black opacity-50' onClick={() => setIsModalOpen(false)}></div>
                    <div className='bg-white rounded-lg p-6 z-10'>
                    <div className="flex  items-center justify-between mt-4">
                    <h2 className='text-xl font-bold mb-4'>Add New Category</h2>
                    <button
                            onClick={() => setIsModalOpen(false)}
                            className='  text-red-600 -mt-4 px-4 rounded'
                        >
                            <XMarkIcon className='h-6 w-6'/> 
                        </button>
                        
                        </div>
                        <CategoryForm onCategoryAdded={handleCategoryAdded} />
                        
                    </div>
                </div>
            )}
        </div>
    );
}
