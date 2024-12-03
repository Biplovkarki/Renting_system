"use client"
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

const RentalCalendar = ({ vehicleId }) => {
  const [rentalDates, setRentalDates] = useState([]);
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    const fetchRentalDates = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/counts/${vehicleId}/rental-dates`);
        if (response.data.success) {
          const dates = response.data.rentalDates;
          setRentalDates(dates.map(date => ({
            start: new Date(date.rent_start_date),
            end: new Date(date.rent_end_date)
          })));
        }
      } catch (error) {
        console.error('Error fetching rental dates:', error);
      }
    };

    fetchRentalDates();
  }, [vehicleId]);

  // Mark the dates that are within the rental periods
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      for (let rental of rentalDates) {
        if (date >= rental.start && date <= rental.end) {
          return 'bg-green-500 text-white'; // Highlight the rental dates in green
        }
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Rental Dates Calendar</h2>
      <Calendar
        onChange={setValue}
        value={value}
        tileClassName={tileClassName} // Apply tile class for rental dates
        minDate={new Date()} // Prevent selecting past dates
      />
    </div>
  );
};

export default RentalCalendar;
