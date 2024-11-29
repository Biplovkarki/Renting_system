// UserOrdersTable.js
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

const UserOrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  // Authentication and Token Verification
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Check token expiration
        if (decoded.exp < currentTime) {
          localStorage.removeItem("userToken");
          setError("Session expired. Please log in again.");
          router.push("/vehicles "); // Replace '/vehicles' with your actual login route
          return;
        }

        setUserId(decoded.id);
      } catch (error) {
        console.error("Invalid token:", error);
        setError("Invalid token. Please log in again.");
        localStorage.removeItem("userToken");
        router.push("/vehicles"); // Replace '/vehicles' with your actual login route
      }
    } else {
      setError("No token found. Please log in.");
      router.push("/vehicles"); // Replace '/vehicles' with your actual login route
    }
  }, [router]);

  // Fetch User Orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;

      try {
        const token = localStorage.getItem("userToken");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const response = await axios.get(
          `http://localhost:5000/userOrder/${userId}`, // Adjust API endpoint as needed
          config
        );
        setOrders(response.data);
      } catch (err) {
        setError("Failed to load orders. Please try again.");
        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  // Handle Invoice Generation
  const handleGenerateInvoice = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  // Print Invoice (Improved to print the modal content)
  const handlePrint = () => {
    window.print();
  };

  // Download PDF Invoice
  const handleDownloadPDF = () => {
    if (!selectedOrder) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Company Details (Customize as needed)
    const companyDetails = {
      name: "Easy Rent Nepal",
      address: "Kathmandu Metropolitan City, Ward No. 32",
      contact: "+977 9841234567",
      email: "support@easyrentnepal.com",
      pan: "123456789",
    };

    // Invoice Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(companyDetails.name, 105, 25, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(companyDetails.address, 105, 32, { align: "center" });
    doc.text(`Contact: ${companyDetails.contact} | Email: ${companyDetails.email}`, 105, 37, { align: "center" });
    doc.text(`PAN No: ${companyDetails.pan}`, 105, 42, { align: "center" });

    // Horizontal Line
    doc.line(20, 47, 190, 47);

    // Invoice Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("VEHICLE RENTAL INVOICE", 105, 57, { align: "center" });

    // Invoice Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: INV-${selectedOrder.order_id}`, 20, 67);
    doc.text(`Date: ${formatDate(new Date())}`, 150, 67, { align: "right" });

    // Customer Details
    const customerDetails = [
      { label: "Customer Name", value: selectedOrder.username || "N/A" },
      { label: "Phone", value: selectedOrder.user_phone || "N/A" },
      { label: "Email", value: selectedOrder.user_email || "N/A" },
      { label: "Address", value: selectedOrder.user_address || "N/A" },
    ];

    // Render Customer Details
    let yPos = 80;
    customerDetails.forEach((detail, index) => {
      doc.text(`${detail.label}: ${detail.value}`, 20, yPos + (index * 6));
    });

    // Order Details Table
    const orderDetailsRows = [
      ["Vehicle Details", ""],
      ["Vehicle Name", selectedOrder.vehicle_name || "N/A"],
      ["Model", selectedOrder.model || "N/A"],
      ["Rental Period", ""],
      ["Rent Start Date", formatDate(selectedOrder.rent_start_date)],
      ["Rent End Date", formatDate(selectedOrder.rent_end_date)],
      ["Total Rental Days", `${selectedOrder.rental_days} Days`],
    ];

    doc.autoTable({
      startY: 110,
      head: [['Description', 'Details']],
      body: orderDetailsRows,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    // Calculate Tax and Total (Adjust tax rate as needed)
    const baseAmount = selectedOrder.grand_total;
    const taxRate = 0.13; // 13% tax rate
    const taxAmount = baseAmount * taxRate;
    const totalAmount = baseAmount + taxAmount;


    // Payment Details
    const paymentDetailsRows = [
      ["Base Rental Charge", `Rs. ${convertToNPR(baseAmount)}`],
      ["Tax (13%)", `Rs. ${convertToNPR(taxAmount)}`],
      ["Total Amount", `Rs. ${convertToNPR(totalAmount)}`],
    ];

    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 10,
      head: [['Payment Details', '']],
      body: paymentDetailsRows,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    // Payment Status
    doc.text(`Payment Status: ${selectedOrder.paid_status}`, 20, doc.previousAutoTable.finalY + 20);

    // Terms and Conditions
    doc.setFontSize(8);
    doc.text("Terms & Conditions:", 20, doc.previousAutoTable.finalY + 30);
    doc.text("1. This is a computer-generated invoice and does not require a signature.", 20, doc.previousAutoTable.finalY + 35);
    doc.text("2. Subject to Kathmandu jurisdiction.", 20, doc.previousAutoTable.finalY + 40);

    // Footer
    doc.setLineWidth(0.5);
    doc.line(20, doc.internal.pageSize.height - 20, 190, doc.internal.pageSize.height - 20);
    doc.setFontSize(8);
    doc.text("Thank you for choosing Easy Rent Nepal!", 105, doc.internal.pageSize.height - 10, { align: "center" });

    doc.save(`invoice_${selectedOrder.order_id}.pdf`);
  };

  // Date Formatting Utility
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Currency Formatting Utility
  const convertToNPR = (amount) => {
    return amount !== null && amount !== undefined ? amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "N/A";
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center"> Vehicle Rental Orders</h1>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
            
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Rental Period</th>
              <th className="px-4 py-3 text-right">Total Amount</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">paid_status</th>
              <th className="px-4 py-3 text-center">delivered_status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id} className="border-b hover:bg-gray-100">
               
                <td className="px-4 py-3">
                  <div className="font-semibold">{order.vehicle_name}</div>
                  <div className="text-sm text-gray-500">{order.model}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{formatDate(order.rent_start_date)} - {formatDate(order.rent_end_date)}</div>
                  <div className="text-sm text-gray-500">{order.rental_days} Days</div>
                </td>
                <td className="px-4 py-3 text-right">Rs. {convertToNPR(order.grand_total)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold 
                    ${order.status === 'completed' ? 'bg-green-200 text-green-800' : 
                    order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                    'bg-red-200 text-red-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold 
                    ${order.paid_status === 'paid' ? 'bg-green-200 text-green-800' : 
                    order.paid_status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                    'bg-red-200 text-red-800'}`}>
                    {order.paid_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold 
                    ${order.delivered_status === 'delivered' ? 'bg-green-200 text-green-800' : 
                    order.delivered_status === 'not_delivered' ? 'bg-yellow-200 text-yellow-800' : 
                    'bg-red-200 text-red-800'}`}>
                    {order.delivered_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleGenerateInvoice(order)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                     Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Improved Invoice Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-96 md:w-3/4 lg:w-1/2 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 focus:outline-none"
            >
              Close
            </button>

            {selectedOrder.status === 'completed' && selectedOrder.paid_status === 'paid' ? (
              <>
                <div className="text-center mb-4 border-b-2 border-gray-300">
                  <h3 className="text-2xl font-bold text-gray-800">Easy Rent Nepal</h3>
                  <p className="text-sm text-gray-600">Kathmandu Metropolitan City, Ward No. 32</p>
                  <p className="text-sm text-gray-600">Contact: +977 9813316813 | Email: support@easyrentnepal.com</p>
                  <p className="text-sm text-gray-600">PAN No: 123456789</p>
                </div>

                <div className="mt-4">
                  <p className="text-lg font-semibold">Invoice No: INV-{selectedOrder.order_id}</p>
                  <p className="text-gray-600">Date: {formatDate(new Date())}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Customer Details:</p>
                    <p>Name: <span className="font-normal">{selectedOrder.username || "N/A"}</span></p>
                    <p>Phone: <span className="font-normal">{selectedOrder.user_phone || "N/A"}</span></p>
                    <p>Email: <span className="font-normal">{selectedOrder.user_email || "N/A"}</span></p>
                    <p>Address: <span className="font-normal">{selectedOrder.user_address || "N/A"}</span></p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Order Details:</p>
                    <p>Vehicle Name: <span className="font-normal">{selectedOrder.vehicle_name}</span></p>
                    <p>Model: <span className="font-normal">{selectedOrder.model}</span></p>
                    <p>Rent Start Date: <span className="font-normal">{formatDate(selectedOrder.rent_start_date)}</span></p>
                    <p>Rent End Date: <span className="font-normal">{formatDate(selectedOrder.rent_end_date)}</span></p>
                    <p>Rental Days: <span className="font-normal">{selectedOrder.rental_days}</span></p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-700">Base Rental Charge</p>
                    <p className="font-normal">Rs. {convertToNPR(selectedOrder.grand_total)}</p>
                  </div>
                
                  <div className="flex justify-between font-bold">
                    <p className="font-medium text-gray-700">Total Amount</p>
                    <p className="font-normal">Rs. {convertToNPR(selectedOrder.grand_total )}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="font-medium text-gray-700 mb-1">Payment Status:</p>
                  <p>{selectedOrder.paid_status}</p>
                </div>

                <div className="mt-6 flex justify-between space-x-2">
                  <button onClick={handlePrint} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded focus:outline-none">
                    Print
                  </button>
                  <button onClick={handleDownloadPDF} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none">
                    Download PDF
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <p className="text-red-500 text-xl font-bold mb-4">Payment Pending</p>
                <p className="text-gray-600 mb-4">Please complete the payment to generate the invoice.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrdersTable;