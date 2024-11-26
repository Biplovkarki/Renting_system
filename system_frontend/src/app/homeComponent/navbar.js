"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../../public/logo.png"; // Adjust path as needed
import "../globals.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    console.log("Token from localStorage:", token);
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken); // Add logging here
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem("userToken");
        }
      } catch (error) {
        console.error("Error decoding token:", error); // Log complete error object
        console.error("Original Token:", token); // Log original token for inspection
        setIsLoggedIn(false);
        localStorage.removeItem("userToken");
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setIsLoggedIn(false);
    router.push("/");
  };

  const isActive = (path) => (pathname === path ? "underline" : "");

  return (
    <nav className="flex items-center justify-between p-4 z-50 bg-gray-300 shadow-md">
      <div className="flex h-16 w-20 items-center">
        <Image src={logo} alt="logo" className="w-full h-full object-cover" />
      </div>

      <div className="hidden md:flex flex-grow justify-center">
        <div className="flex flex-row gap-9">
          <Link href="/" className={`${isActive("/")} text-lg`}>Home</Link>
          <Link href="/homeComponent/AboutUS" className={`${isActive("/homeComponent/AboutUS")} text-lg`}>About Us</Link>
          <Link href="/homeComponent/Services" className={`${isActive("/homeComponent/Services")} text-lg`}>Services</Link>
          <Link href="/vehicles" className={`${isActive("/vehicles")} text-lg`}>Vehicles</Link>
        </div>
      </div>

      <section className="hidden md:flex flex-row gap-4 mx-1 items-center">
        {isLoggedIn ? (
          <>
            <Link href="/user/profile">
              <button className="border-2 w-20 h-14 bg-black text-white rounded-xl hover:bg-green-500">Profile</button>
            </Link>
            <button className="border-2 w-20 h-14 bg-red-500 text-white rounded-xl hover:bg-red-600" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link href="/user/loginuser">
            <button className="border-2 w-20 h-14 bg-black text-white rounded-xl hover:bg-green-500">Login</button>
          </Link>
        )}
      </section>

      <div className="md:hidden">
        <button className="p-2 rounded-md focus:outline-none" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
          </svg>
        </button>
      </div>

      <div className={`md:hidden z-50 absolute top-16 left-0 w-full bg-white p-4 shadow-md transition-all duration-300 ease-in-out ${menuOpen ? "block" : "hidden"}`}>
        <div className="flex flex-col items-center gap-4">
          <Link href="/" className={`${isActive("/")} text-xl`} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/homeComponent/AboutUS" className={`${isActive("/homeComponent/AboutUS")} text-xl`} onClick={() => setMenuOpen(false)}>About Us</Link>
          <Link href="/homeComponent/Services" className={`${isActive("/homeComponent/Services")} text-xl`} onClick={() => setMenuOpen(false)}>Services</Link>
          <Link href="/vehicle" className={`${isActive("/vehicle")} text-xl`} onClick={() => setMenuOpen(false)}>Vehicles</Link>

          {isLoggedIn ? (
            <>
              <Link href="/user/profile">
                <button className="border-2 w-24 h-14 bg-black text-white rounded-xl hover:bg-green-500" onClick={() => setMenuOpen(false)}>Profile</button>
              </Link>
              <button className="border-2 w-24 h-14 bg-red-500 text-white rounded-xl hover:bg-red-600" onClick={() => { setMenuOpen(false); handleLogout(); }}>Logout</button>
            </>
          ) : (
            <Link href="/user/loginuser">
              <button className="border-2 w-24 h-14 bg-black text-white rounded-xl hover:bg-green-500" onClick={() => setMenuOpen(false)}>Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}