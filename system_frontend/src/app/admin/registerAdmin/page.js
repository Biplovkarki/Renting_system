"use client"
import { useState, useEffect } from "react";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/solid"; // Import lock icons
import axios from "axios";
import Image from "next/image";
import logo from "../../../../public/logo.png";
import { useRouter } from "next/navigation"; // Import useRouter

const RegisterAdmin = () => {
  const router = useRouter(); // Initialize router
  const [adminname, setAdminname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for tracking submission status

  // Email validation regex
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|icloud\.com)$/;
    return emailPattern.test(email);
  };

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    return (
      password.length >= minLength &&
      hasNumber.test(password) &&
      hasSpecialChar.test(password)
    );
  };

  // Phone number validation function
  const validatePhone = (phone) => {
    const phonePattern = /^(97|98)\d{8}$/; // Phone number must start with 97 or 98 and followed by 8 digits
    return phonePattern.test(phone);
  };

  // Username validation function
  const validateUsername = (adminname) => {
    const usernamePattern = /^[A-Z][a-zA-Z]*(?: [A-Z][a-zA-Z]*){0,2}$/; // Starts with capital letter and allows up to two additional names
    return usernamePattern.test(adminname);
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setAdminname(value);
    
    // Validate username
    if (value.length > 15) {
      setError("Admin name must not exceed 15 characters.");
    } else if (!validateUsername(value)) {
      setError("Admin name must start with a capital letter and may contain up to two names.");
    } else {
      setError(null); // Clear error if valid
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!validateEmail(value)) {
      setError("Invalid email format (only gmail, yahoo, or icloud).");
    } else {
      setError(null); // Clear error if valid
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (!validatePassword(value)) {
      setError("Password must be at least 8 characters long, including numbers and special characters.");
    } else {
      setError(null); // Clear error if valid
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value !== password) {
      setError("Passwords do not match.");
    } else {
      setError(null); // Clear error if valid
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value; // Get the value from the event target
  
    // Check if the value is numeric
    if (!/^\d*$/.test(value)) {
      setError("Phone number must be numeric.");
    } 
    // Check if it starts with 98 or 97
    else if (!/^(97|98)/.test(value)) {
      setError("Phone number must start with 98 or 97.");
    } 
    // Check if the length exceeds 10 digits
    else if (value.length > 10) {
      setError("Phone number must not exceed 10 digits.");
    } 
    // Clear the error if valid
    else {
      setError(null);
    }
    
    // Set the phone value
    setPhone(value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setIsSubmitting(true); // Set submitting state to true

    // Final validation before submission
    if (!adminname || !email || !password || !confirmPassword || !phone) {
      setError("All fields are required.");
      setIsSubmitting(false); // Reset submitting state
      return;
    }

    if (adminname.length > 20) {
      setError("Admin name must not exceed 20 characters.");
      setIsSubmitting(false); // Reset submitting state
      return;
    }

    if (!validateUsername(adminname)) {
      setError("Admin name must start with a capital letter and may contain up to two names.");
      setIsSubmitting(false); // Reset submitting state
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format (only gmail, yahoo, or icloud).");
      setIsSubmitting(false); // Reset submitting state
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long, including numbers and special characters.");
      setIsSubmitting(false); // Reset submitting state
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false); // Reset submitting state
      return;
    }

    if (!validatePhone(phone)) {
      setError("Phone number must start with 97 or 98 and contain 10 digits.");
      setIsSubmitting(false); // Reset submitting state
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/admin/register', {
        adminname: adminname,
        email,
        password,
        phone,
      });
      setSuccess(response.data.message);

      // Redirect to the login page after a delay, without pop-up
      setTimeout(() => {
        router.push('/admin/loginAdmin'); // Adjust to your login page route
      }, 3000); // Wait for 3 seconds before redirecting

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state after request is complete
    }
  };

  // Clear error or success message after 3 seconds
  useEffect(() => {
    let timer;
    if (error) {
      timer = setTimeout(() => {
        setError(null);
      }, 3000);
    }
    if (success) {
      timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [error, success]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <div className="flex flex-row">
            <Image 
              src={logo}
              width={100}
              height={80}
              className="-mt-10 rounded-full"
              alt="Easy Rent Nepal Logo"
              priority
            />
            <h2 className="text-2xl font-bold text-center mb-6">Register as Admin</h2>
          </div>
          <input
            type="text"
            placeholder="Admin name"
            value={adminname}
            onChange={handleUsernameChange}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <div className="relative mb-4">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full p-2 border rounded pr-10"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
              {isPasswordVisible ? (
                <LockOpenIcon className="h-6 w-6 text-black" />
              ) : (
                <LockClosedIcon className="h-6 w-6 text-black" />
              )}
            </div>
          </div>
          <div className="relative mb-4">
            <input
              type={isConfirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="w-full p-2 border rounded pr-10"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
              {isConfirmPasswordVisible ? (
                <LockOpenIcon className="h-6 w-6 text-black" />
              ) : (
                <LockClosedIcon className="h-6 w-6 text-black" />
              )}
            </div>
          </div>
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={handlePhoneChange}
            className="w-full p-2 mb-4 border rounded"
            maxLength={10}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting} // Disable button during submission
            className={`w-full p-2 mb-4 text-white font-bold rounded ${isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isSubmitting ? 'Submitting...' : 'Register'}
          </button>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          {success && <div className="text-green-500 text-center mb-4">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin;
