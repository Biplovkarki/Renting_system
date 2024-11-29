"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [notification, setNotification] = useState(null);
  const router = useRouter();

  // Token validation and user ID extraction
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

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`Minimum ${minLength} characters`);
    if (!hasNumber) errors.push('At least one number');
    if (!hasSpecialChar) errors.push('At least one special character');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return setError('All fields are required.');
    }

    if (newPassword !== confirmNewPassword) {
      return setError('New passwords do not match.');
    }

    // Validate new password complexity
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return setError(`Password requirements not met:\n${passwordErrors.join('\n')}`);
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        router.push('/vehicles');
        return;
      }

      const response = await axios.put(
        'http://localhost:5000/users/change-password',
        { currentPassword, newPassword, confirmPassword: confirmNewPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear form fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      // Show success message
      setSuccess(response.data.message || 'Password changed successfully!');

      // Optional: Redirect or show additional success handling
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 2000);

    } catch (error) {
      // Handle specific error messages from server
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-12">
    <div className=" w-full bg-white shadow-xl rounded-xl p-8 border border-gray-200 ">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Change Password</h2>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 text-sm font-medium">{success}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
            required
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            Password must be at least 8 characters with a number and special character
          </p>
        </div>

        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Changing Password...
              </div>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};


export default ChangePassword;