// AddPriceModal.js
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import the close icon

const AddPriceModal = ({ isOpen, onClose,children }) => {
    if (!isOpen) return null; // Don't render the modal if it's not open

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded shadow-md relative w-11/12 md:w-1/3">
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-800"
                    aria-label="Close"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h2 className="text-lg font-bold mb-2">Add Price Range</h2>
                <div>{children}</div> {/* Render the form here */}
              
            </div>
        </div>
    );
};

export default AddPriceModal;
