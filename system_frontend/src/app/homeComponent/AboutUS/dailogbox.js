"use client";
import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import WHatarewe from "./whatarewe";
import WhatweOffer from "./whatweOffer";
import Whatwewant from "./whatwewant";
import Orgdetails from "../details";
import Footer from "../footer";

export default function Dialogboxes() {
    const [openDialog, setOpenDialog] = useState(null); // Track which dialog is open

    const handleOpenDialog = (section) => {
        setOpenDialog(section); // Set the open section
    };

    const handleCloseDialog = () => {
        setOpenDialog(null); // Close dialog by setting it back to null
    };

    return (
        <>
            <div className="bg-slate-400 h-fit border-4">
                <h1 className="border text-white text-4xl md:text-6xl font-Lato font-extrabold drop-shadow-2xl shadow-blue-800 text-center py-5">
                    About Us
                </h1>

                <div className=" bg-slate-400  flex flex-col md:flex-row justify-center gap-6 mt-5 px-4">
                    {/* "Who are we?" Section */}
                    <div
                        onClick={() => handleOpenDialog("who")}
                        className="rounded-3xl  bg-slate-400 h-64 w-full md:w-96 text-center cursor-pointer backdrop-blur-sm shadow-slate-900 shadow-2xl p-4"
                    >
                        <h1 className="mt-7 font-bold">Who are we?</h1>
                        <section className="text-start mt-3">
                            <p>
                                We are a platform for those who want the freedom to rent and drive vehicles for their personal journeys...
                            </p>
                            <p className="mt-5 text-blue-600">Read More...</p>
                        </section>
                    </div>

                    {/* "What we offer?" Section */}
                    <div
                        onClick={() => handleOpenDialog("offer")}
                        className="rounded-3xl h-64 w-full md:w-96 text-center cursor-pointer backdrop-blur-sm shadow-slate-900 shadow-2xl bg-slate-400 p-4"
                    >
                        <h1 className="mt-7 font-bold">What we offer?</h1>
                        <section className="text-start mt-3">
                            <p>
                                At Easy Rent Nepal, we offer a seamless and user-friendly platform for vehicle rentals...
                            </p>
                            <p className="mt-5 text-blue-600">Read More...</p>
                        </section>
                    </div>

                    {/* "What we want?" Section */}
                    <div
                        onClick={() => handleOpenDialog("want")}
                        className="rounded-3xl h-64 w-full md:w-96 text-center cursor-pointer backdrop-blur-sm shadow-slate-900 shadow-2xl  bg-slate-400 p-4"
                    >
                        <h1 className="mt-7 font-bold">What we want</h1>
                        <section className="text-start mt-3">
                            <p>
                                We aim to revolutionize the vehicle rental experience by providing a platform that emphasizes accessibility, trust, and customer satisfaction...
                            </p>
                            <p className="mt-5 text-blue-600">Read More...</p>
                        </section>
                    </div>
                </div>

                {/* Dialog Box for displaying content based on section */}
                <Dialog open={openDialog !== null} onClose={handleCloseDialog} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="w-full max-w-lg md:max-w-2xl space-y-4 border shadow-2xl shadow-slate-400 bg-slate-400 p-6 md:p-12">
                            <DialogTitle className="font-bold text-xl">
                                {openDialog === "who" && "Who are we?"}
                                {openDialog === "offer" && "What we offer?"}
                                {openDialog === "want" && "What we want"}
                            </DialogTitle>

                            {/* Conditionally render the component based on the open section */}
                            {openDialog === "who" && <WHatarewe />}
                            {openDialog === "offer" && <WhatweOffer />}
                            {openDialog === "want" && <Whatwewant />}

                            {/* Close Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCloseDialog}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Close
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
                <div className="mt-4">  <Orgdetails /></div>
                <div className="mt-3"><Footer/></div>
               
            </div>
        </>
    );
}
