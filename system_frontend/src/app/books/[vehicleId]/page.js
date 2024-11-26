"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Tab } from "@headlessui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import RentalForm from "./input";
import RatingAndComment from "./rate";
import AverageRating from "./average";
import CommentsSection from "./comment";

const VehicleDetailPage = () => {
    const [vehicle, setVehicle] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const [orderError, setOrderError] = useState(null);
    const [orderStatus, setOrderStatus] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const [cancelSuccess, setCancelSuccess] = useState(false);
    const params = useParams();
    const vehicleId = params.vehicleId;
    const router = useRouter();

    useEffect(() => {
        const fetchUserId = async () => {
            const token = localStorage.getItem("userToken");
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 < Date.now()) {
                        alert("Your session has expired. Please log in again.");
                        localStorage.removeItem("userToken");
                        router.push("/user/loginuser");
                        return;
                    }
                    setUserId(decoded.id);
                } catch (error) {
                    console.error("Error decoding token:", error);
                    router.push("/user/loginuser");
                }
            } else {
                router.push("/user/loginuser");
            }
        };
        fetchUserId();
    }, [router]);

    useEffect(() => {
        const fetchVehicleDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/fetchdetails/vehicle/${vehicleId}`);
                setVehicle(response.data);

            } catch (error) {
                setError(error.message);
                console.error("Error fetching vehicle details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicleDetails();
    }, [vehicleId]);

    // useEffect(() => {
    //     if (!userId || !vehicleId) {
    //       router.push("/vehicles"); // Redirect to the vehicles page
    //     }
    //   }, [userId, vehicleId, router]);

    useEffect(() => {
        const fetchOrder = async () => {
            if (userId && vehicleId) {
                setLoadingOrder(true);
                try {
                    const response = await axios.get(`http://localhost:5000/order/get-order/${userId}/${vehicleId}`);
                    setOrder(response.data);
                } catch (error) {
                    //setOrderError(error.response?.data?.message || error.message);
                    //console.error("Error fetching order:", error);
                    router.push("/vehicles")
                } finally {
                    setLoadingOrder(false);
                }
            }
        };
        fetchOrder();
    }, [userId, vehicleId]);



    const formatPrice = (price) => {
        if (price === undefined || price === null) return "Not specified";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const cancelOrder = async () => {
        if (!order || !order.order_id) {
            setError("No active order found for this vehicle.");
            return;
        }

        const confirmation = window.confirm("Are you sure you want to cancel this order?");
        if (!confirmation) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("userToken");
            if (!token) {
                throw new Error("User not authenticated.");
            }

            if (!['draft', 'payment_pending'].includes(order.status)) {
                throw new Error(`Cannot cancel order with status "${order.status}".`);
            }

            const cancelResponse = await axios.post(
                `http://localhost:5000/order/cancel`,
                { order_id: order.order_id, user_id: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (cancelResponse.status === 200) {
                setCancelSuccess(true);
                setTimeout(() => {
                    setCancelSuccess(false);
                    router.push("/vehicles");
                }, 3000);
            } else {
                throw new Error(`Failed to cancel order. Status: ${cancelResponse.status}, message: ${cancelResponse.data?.message || "Unknown error"}`);
            }
        } catch (error) {
            setError(error.message);
            console.error("Cancel order error:", error);
        } finally {
            setLoading(false);
        }
    };
    //status check
    useEffect(() => {
        const fetchOrderStatus = async () => {
            if (userId && vehicleId && order && order.order_id) { // Only if user, vehicle, and order data is available
                try {
                    const token = localStorage.getItem('userToken');
                    if (!token) {
                        throw new Error('User not authenticated');
                    }
                    const response = await axios.get(
                        `http://localhost:5000/order/status/${userId}/${vehicleId}/${order.order_id}`, // Your API endpoint
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setOrderStatus(response.data.status);
                    setFetchError(null);
                } catch (error) {
                    setFetchError(error.message); //Update with error msg
                    //console.error('Error fetching order status:', error);
                    router.push('/vehicles');
                }
            }
        };

        const intervalId = setInterval(fetchOrderStatus, 1000); // Poll every second

        return () => clearInterval(intervalId);
    }, [userId, vehicleId, order]); //Only run when relevant data changes


    useEffect(() => {
        if (orderStatus === 'expires') {
            alert('Your order has expired. Redirecting to vehicle list.');
            router.push('/vehicles');
        }
        // Add other status handlers if needed (e.g., for 'cancelled')
    }, [orderStatus, router]);

    useEffect(() => {
        if (orderStatus === 'completed') {
            alert('Your order has been placed sucessfully.please wait for confirmation');
            router.push('/vehicles');
        }
        // Add other status handlers if needed (e.g., for 'cancelled')
    }, [orderStatus, router]);

    const openUpdateModal = () => {
        setShowUpdateModal(true);
    };

    const closeUpdateModal = () => {
        setShowUpdateModal(false);
    };

    const handleUpdateSubmit = (orderId) => {
        setShowUpdateModal(false);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
    };

    const ImageCarousel = ({ images, currentImageIndex, setCurrentImageIndex }) => {
        return (
            <Tab.Group selectedIndex={currentImageIndex} onChange={setCurrentImageIndex}>
                <div className="relative h-[400px] bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                    <Tab.Panels>
                        {images.map((image, idx) => (
                            <Tab.Panel key={idx}>
                                <img
                                    src={`http://localhost:5000/${image.url}`}
                                    alt={image.label}
                                    className="w-full h-[400px] object-contain"
                                />
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                    <button
                        onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
                <Tab.List className="flex gap-3 mt-4">
                    {images.map((image, idx) => (
                        <Tab
                            key={idx}
                            className={({ selected }) =>
                                `w-20 h-20 rounded-lg overflow-hidden focus:outline-none ${selected ? "ring-2 ring-blue-500" : ""}`
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
        );
    };

    const VehicleInfoBadges = ({ vehicle }) => {
        return (
           
            <span className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md">{vehicle.transmission}</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md">{vehicle.fuel_type}</span>
                <span
                    className={`px-3  rounded-md ${vehicle.availability ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                    {vehicle.availability ? "Available" : "Not Available"}
                </span>
               

                
            </span>
        );
    };

    const RentalInfo = ({ vehicle, formatPrice }) => {
        return (
            <div className="space-y-4 mt-6">

                <h2 className="text-2xl font-semibold">Rental Information</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div className="font-semibold">Price:</div>
                    <div className="flex items-center gap-2">
                        <p className="text-gray-700 font-semibold">
                            {vehicle.discounted_price && vehicle.final_price && vehicle.discounted_price < vehicle.final_price ? (
                                <>
                                    <span className="line-through text-red-600 mr-2">{formatPrice(vehicle.final_price)}</span>
                                    <span className="text-green-600">{formatPrice(vehicle.discounted_price)}</span>
                                </>
                            ) : (
                                <span className="text-green-600">{formatPrice(vehicle.final_price)}</span>
                            )}
                        </p>
                    </div>
                  

                </div>
                <div>
                    {vehicle.discounted_price && vehicle.discounted_price < vehicle.final_price && (
                        <div className="grid grid-cols-2 gap-6 ">
                            <div className="font-semibold">Discount:</div>

                            <div className="flex items-center gap-2">
                            <p className="text-gray-700 font-semibold">
                                <span className="mr-2">{vehicle.discount_percentage ? `${vehicle.discount_percentage}%` : "N/A"}</span>
                                </p>
                                </div>
                        </div>
                    )}
                    </div>
            </div>
        );
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
        { url: vehicle.image_front, label: "Front View" },
        { url: vehicle.image_back, label: "Back View" },
        { url: vehicle.image_right, label: "Right View" },
        { url: vehicle.image_left, label: "Left View" },
    ].filter((img) => img.url);


    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-7/12 relative">
                    <ImageCarousel images={images} currentImageIndex={currentImageIndex} setCurrentImageIndex={setCurrentImageIndex} />
                </div>
                <div className="w-full lg:w-5/12 space-y-6  border-2 border-black">
                    <div className="space-y-4 border-2 border-red-600">
                        <h2 className="text-3xl font-semibold">{vehicle.vehicle_name}, {vehicle.model}</h2>
                        <span className=""><AverageRating  vehicleId={vehicleId}/></span>
                        <VehicleInfoBadges vehicle={vehicle} />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="font-semibold">Engine:</div>
                            <div>{vehicle.cc} CC</div>
                            <div className="font-semibold">Registration Number:</div>
                            <div>{vehicle.registration_number || "Not specified"}</div>
                        </div>
                    </div>
                    {loadingOrder && <p>Loading Order Details...</p>}
                    {orderError && <p style={{ color: "red" }}>Order Error: {orderError}</p>}
                    {order && (
                        <>
                            <RentalInfo vehicle={vehicle} formatPrice={formatPrice} />
                            <div className="flex gap-4">
                                <button
                                    onClick={openUpdateModal}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                                >
                                    Update Rent
                                </button>
                                <button
                                    onClick={cancelOrder}
                                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                                >
                                    Cancel Order
                                </button>
                            </div>
                        </>
                    )}
                    {!loadingOrder && !order && <p>No active order found for this vehicle.</p>}
                </div>
            </div>
            <div>
      
      <RatingAndComment vehicleId={vehicleId} userId={userId} />
      <CommentsSection vehicleId={vehicleId}/>
    </div> 
            {updateSuccess && (
                <div className="mt-4 bg-green-200 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Order updated successfully!
                </div>
            )}

            {cancelSuccess && (
                <div className="mt-4 bg-green-200 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Order canceled successfully!
                </div>
            )}

            {showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-11/12 md:w-1/2">
                        {/* Replace with your actual OrderUpdateForm component */}
                        <RentalForm userId={userId} vehicleId={vehicleId}
                            orderId={order?.order_id}  // Pass orderId
                            vehicle={vehicle}
                            onClose={closeUpdateModal}  // Pass closeUpdateModal function
                            onSubmit={handleUpdateSubmit}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const ImageCarousel = ({ images, currentImageIndex, setCurrentImageIndex }) => {
    return (
        <Tab.Group selectedIndex={currentImageIndex} onChange={setCurrentImageIndex}>
            <div className="relative h-[400px] bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <Tab.Panels>
                    {images.map((image, idx) => (
                        <Tab.Panel key={idx}>
                            <img
                                src={`http://localhost:5000/${image.url}`}
                                alt={image.label}
                                className="w-full h-[400px] object-contain"
                            />
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
                <button
                    onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
            <Tab.List className="flex gap-3 mt-4">
                {images.map((image, idx) => (
                    <Tab
                        key={idx}
                        className={({ selected }) =>
                            `w-20 h-20 rounded-lg overflow-hidden focus:outline-none ${selected ? "ring-2 ring-blue-500" : ""}`
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
    );
};

const VehicleInfoBadges = ({ vehicle }) => {
    return (
        <span className="flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md flex items-center h-8">
            {vehicle.transmission}
        </span>
       
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md flex items-center h-8">
            {vehicle.fuel_type}
        </span>
        <div className={`py-1 px-3 flex items-center h-8 ${ vehicle.availability ? "bg-green-100   text-green-700" : "bg-red-100  text-red-700"}`}>
            {vehicle.availability ? "Available" : "Not Available"}
        </div>
    </span>
    

    );
};

const RentalInfo = ({ vehicle, formatPrice, formatTime, timeLeft }) => {
    return (
        <div className="space-y-4 mt-6">
            <div className="text-right text-gray-500 text-sm mb-2">
                Time remaining: {formatTime(timeLeft)}
            </div>
            <h2 className="text-2xl font-semibold">Rental Information</h2>
            <div className="grid grid-cols-2 gap-6">
                <div className="font-semibold">Price:</div>
                <div className="flex items-center gap-2">
                    <p className="text-gray-700 font-semibold">
                        {vehicle.discounted_price && vehicle.discounted_price < vehicle.final_price ? (
                            <>
                                <span className="line-through text-red-600 mr-2">{formatPrice(vehicle.final_price)}</span>
                                <span className="text-green-600">{formatPrice(vehicle.discounted_price)}</span>
                            </>
                        ) : (
                            <span className="text-green-600">{formatPrice(vehicle.final_price)}</span>
                        )}
                    </p>
                </div>
                <div className="font-semibold">Discount:</div>
                <div>{vehicle.discount_percentage ? `${vehicle.discount_percentage}%` : "N/A"}</div>
            </div>
        </div>
    );
};


export default VehicleDetailPage;