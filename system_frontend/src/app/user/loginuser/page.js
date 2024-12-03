"use client";

import Image from "next/image";
import logo from "../../../../public/logo.png"; // Adjust path if needed
import FormUser from "./UserForm";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginUser() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      router.push("/vehicles"); // Redirect to the vehicles page if logged in
    }
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center border-2 border-gray-300 shadow-lg w-[500px] bg-white p-6 rounded-lg">
        <Image src={logo} alt="Logo" width={100} height={100} />
        <h1 className="text-2xl font-bold mt-2 mb-6">User Login</h1>
        <FormUser /> {/*Your form component here*/}
      </div>
      <div className="text-center">
        <h1 className="mt-4">
          Are you a member of Easy Rent Nepal?{" "}
          <Link href="/user/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </h1>
        <h1 className="mt-4">
          Are you an owner?{" "}
          <Link href="/owner/loginOwner" className="text-blue-500 hover:underline">
            Owner Login
          </Link>
        </h1>
      </div>
    </div>
  );
}