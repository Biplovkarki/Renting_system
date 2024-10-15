"use client"; 
import React, { useState } from "react";
import Image from "next/image";
import logo from "../../../public/logo.png";
import "../globals.css";
import { usePathname } from "next/navigation";
import Link from "next/link"; // Import Link from next/link

export default function Navbar() {
  const pathname = usePathname(); // Get the current pathname
  const [menuOpen, setMenuOpen] = useState(false); // State to manage menu toggle

  const isActive = (path) => (pathname === path ? "underline" : ""); // Helper to check if path is active

  return (
    <nav className="flex items-center justify-between p-4 z-50 bg-gray-300 shadow-md">
      {/* Logo Section */}
      <div className="flex h-16 w-20 items-center">
        <Image src={logo} alt="logo" className="w-full h-full object-cover" />
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex flex-grow justify-center">
        <div className="flex flex-row gap-9">
          <Link href="/" className={`${isActive("/")} text-lg`}>
            Home
          </Link>
          <Link href="/homeComponent/AboutUS" className={`${isActive("/homeComponent/AboutUS")} text-lg`}>
            About Us
          </Link>
          <Link href="/homeComponent/Services" className={`${isActive("/homeComponent/Services")} text-lg`}>
            Services
          </Link>
          <Link href="/homeComponent/vehicle" className={`${isActive("/homeComponent/vehicle")} text-lg`}>
            Vehicles
          </Link>
        </div>
      </div>

      {/* Desktop Right Section */}
      <section className="hidden md:flex flex-row gap-4 mx-1 items-center">
        
        <Link href="/login/loginUser">
          <button className="border-2 w-20 h-14 bg-black text-white rounded-xl hover:bg-green-500">
            Login
          </button>
        </Link>
      </section>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden">
        <button
          className="p-2 rounded-md focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {/* Menu Icon */}
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} // Change icon when open
            ></path>
          </svg>
        </button>
      </div>

      {/* Mobile Links */}
      <div
        className={`md:hidden z-50 absolute top-16 left-0 w-full bg-white p-4 shadow-md transition-all duration-300 ease-in-out ${menuOpen ? "block" : "hidden"}`}
      >
        <div className="flex flex-col items-center gap-4">
          <Link href="/" className={`${isActive("/")} text-xl`} onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/AboutUS" className={`${isActive("/AboutUS")} text-xl`} onClick={() => setMenuOpen(false)}>
            About Us
          </Link>
          <Link href="/Services" className={`${isActive("/Services")} text-xl`} onClick={() => setMenuOpen(false)}>
            Services
          </Link>
          <Link href="/vehicle" className={`${isActive("/vehicle")} text-xl`} onClick={() => setMenuOpen(false)}>
            Vehicles
          </Link>
         

          <Link href="/login/loginUser">
            <button className="border-2 w-24 h-14 bg-black text-white rounded-xl hover:bg-green-500" onClick={() => setMenuOpen(false)}>
              Login
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
