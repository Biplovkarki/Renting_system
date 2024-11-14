'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const VehicleDetailPage = () => {
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const params = useParams();
    const vehicleId = params?.vehicleId;

    useEffect(() => {
        const fetchVehicleDetails = async () => {
            if (!vehicleId) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/fetchdetails/vehicle/${vehicleId}`);
                setVehicle(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching vehicle details:', err);
                setError(err.response?.data?.message || 'Failed to load vehicle details.');
                setLoading(false);
            }
        };

        fetchVehicleDetails();
    }, [vehicleId]);

    // Format price function
    const formatPrice = (price) => {
        if (price === undefined || price === null) return 'Not specified';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 text-red-500">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    No vehicle found.
                </div>
            </div>
        );
    }

    const images = [
        { url: vehicle.image_front, label: 'Front View' },
        { url: vehicle.image_back, label: 'Back View' },
        { url: vehicle.image_right, label: 'Right View' },
        { url: vehicle.image_left, label: 'Left View' }
    ].filter(img => img.url);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const previousImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-row gap-8">
                {/* Left side - Image Carousel with 70% width */}
                <div className="w-full md:w-7/10 relative">
                    <Tab.Group selectedIndex={currentImageIndex} onChange={setCurrentImageIndex}>
                        <div className="relative h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                            <Tab.Panels>
                                {images.map((image, idx) => (
                                    <Tab.Panel key={idx}>
                                        <img
                                            src={`http://localhost:5000/${image.url}`}
                                            alt={image.label}
                                            className="w-full h-[400px] object-cover"
                                        />
                                    </Tab.Panel>
                                ))}
                            </Tab.Panels>

                            {/* Navigation Arrows */}
                            <button
                                onClick={previousImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Thumbnail Navigation */}
                        <Tab.List className="flex gap-2 mt-4">
                            {images.map((image, idx) => (
                                <Tab
                                    key={idx}
                                    className={({ selected }) =>
                                        `w-20 h-20 rounded-lg overflow-hidden focus:outline-none ${
                                            selected ? 'ring-2 ring-blue-500' : ''
                                        }`
                                    }
                                >
                                    <img
                                        src={`http://localhost:5000/${image.url}`}
                                        alt={image.label}
                                        className="w-full h-full object-contain"
                                    />
                                </Tab>
                            ))}
                        </Tab.List>
                    </Tab.Group>
                </div>

                {/* Right side - Vehicle Details with 30% width */}
                <div className="w-full md:w-3/10 space-y-6">
                    <div className="space-y-4">
                      <span className="flex flex-row justify-between">
                        <h2 className="text-xl font-semibold">{vehicle.vehicle_name},{vehicle.model}</h2>
                        <h1
                                    className={`px-2 py-1 rounded ${
                                        vehicle.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {vehicle.availability ? 'Available' : 'Not Available'}
                                </h1>
                                </span>
                        <div className="grid grid-cols-2 gap-2">

                            <div className="font-semibold">Engine:</div>
                            <div>{vehicle.cc} CC</div>

                            <div className="font-semibold">Fuel Type:</div>
                            <div>{vehicle.fuel_type}</div>

                            <div className="font-semibold">Transmission:</div>
                            <div>{vehicle.transmission}</div>

                            <div className="font-semibold">Registration Number:</div>
                            <div>{vehicle.registration_number || 'Not specified'}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Rental Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="font-semibold">Price:</div>
                            <div className="flex items-center gap-2">
                               <p className="text-gray-700 font-semibold">
                                                Price:
                                                {vehicle.discounted_price && vehicle.discounted_price < vehicle.final_price ? (
                                                    <>
                                                        <span className="line-through mr-2 text-red-500">{formatPrice(vehicle.final_price)}</span>
                                                        <span className="text-green-600">{formatPrice(vehicle.discounted_price)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-green-600">{formatPrice(vehicle.final_price)}</span>
                                                )}
                                            </p>
                            </div>

                            <div className="font-semibold">Rent Start Date:</div>
                            <div>{formatDate(vehicle.rent_start_date)}</div>

                            <div className="font-semibold">Rent End Date:</div>
                            <div>{formatDate(vehicle.rent_end_date)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetailPage;
