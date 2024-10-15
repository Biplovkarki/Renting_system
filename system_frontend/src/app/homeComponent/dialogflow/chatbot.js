"use client";
import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from '@fortawesome/free-solid-svg-icons';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChatbot = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <>
            {/* Floating Message Icon Button */}
            <div
                className="fixed bottom-4 right-6 lg:right-8 sm:right-4 z-50" // Responsive position with Tailwind
            >
                <button
                    onClick={toggleChatbot}
                    style={{
                        
                        border: 'none',
                        background: 'transparent',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '70px',
                        transition: 'transform 0.3s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  
                >
                    <FontAwesomeIcon icon={faComment}   className='text-blue-400' style={{ fontSize: 'inherit' }} />
                </button>
            </div>

            {/* Chatbot Dialog */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '108px',
                        right: '20px',
                        width: '330px',
                        height: '410px',
                        background: 'white',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        zIndex: 1001,
                        borderRadius: '8px',
                    }}
                >
                    <iframe
                        allow="microphone;"
                        width="100%"
                        height="100%"
                        src="https://console.dialogflow.com/api-client/demo/embedded/e27e44e7-3769-4f3e-a899-0404ac84c2ec"
                        title="Dialogflow Chatbot"
                        style={{ border: 'none' }}
                    ></iframe>
                </div>
            )}
        </>
    );
};

export default Chatbot;
