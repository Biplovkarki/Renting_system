"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import TotalEarnings from './earn';
import RentalStats from './rentalview';
import Alerts from './alerts';
import IncomeBreakdown from './income';
import VehicleOverview from './vehicle';


export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [ownername, setOwnername] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [token, setToken] = useState('');
  const [vehicleId, setVehicleId] = useState([]); // State for vehicle IDs
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token)
    setToken(token);
    if (!token) {
      router.push('/owner/loginOwner');
    } else {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          router.push('/owner/loginOwner');
          return;
        }

        setOwnername(decoded.ownername || 'Owner');
        setOwnerId(decoded.id);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        router.push('/owner/loginOwner');
      } finally {
        setIsLoading(false);
      }
    }
  }, [router]);

  useEffect(() => {
    if (ownerId) {
      fetch(`http://localhost:5000/dashboardforowner/${ownerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch vehicle details');
          }
          return response.json();
        })
        .then((data) => {
          // Extract only vehicle IDs
          const ids = data.map((vehicle) => vehicle.vehicle_id);
          console.log(ids)
          setVehicleId(ids);
        })
        .catch((error) => {
          console.error('Error fetching vehicles:', error);
        });
    }
  }, [ownerId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">Welcome to the Dashboard, {ownername}!</h1>
        <p className="text-lg text-center text-gray-600 mt-2">You are logged in!</p>
      </div>
      <TotalEarnings ownerId={ownerId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">

        <div className="bg-white shadow-xl rounded-lg p-6">
          <RentalStats ownerId={ownerId} token={token} />
        </div>
        <div className="bg-white shadow-xl rounded-lg p-6">
          <VehicleOverview ownerId={ownerId} token={token} />
        </div>
      </div>


      <Alerts ownerId={ownerId} token={token} />
      <IncomeBreakdown ownerId={ownerId} token={token} />

    </div>
  );
}
