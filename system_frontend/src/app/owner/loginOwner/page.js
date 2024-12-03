"use client";

import Image from "next/image";
import logo from "../../../../public/logo.png";
import Link from "next/link";
import FormOwner from "./Form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";



export default function LoginOwner() {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        router.push("/owner/loginOwner"); // Redirect to the vehicles page if logged in
      }
    }, [router]);
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100"> {/* Added min-h-screen for full height */}
            <div className="flex flex-col items-center border-2 border-gray-300 shadow-lg w-[500px] bg-white p-6 rounded-lg">
                <Image
                    src={logo}
                    alt="Logo" // Added alt attribute for accessibility
                    width={100}
                    height={100}
                />
                <h1 className="text-2xl font-bold mt-2 mb-6">Owner Login</h1> {/* Added title for context */}
              <FormOwner/>
            </div>
            <div className="text-center">
            <h1 className="mt-4">Are you a member of Easy Rent Nepal? <Link href="/owner/registerOwner" className="text-blue-500 hover:underline">Register here</Link></h1>
            <h1 className="mt-4">Are you a user ? <Link href="/user/loginuser" className="text-blue-500 hover:underline">User Login</Link></h1>
            </div>
        </div>
    );
}
