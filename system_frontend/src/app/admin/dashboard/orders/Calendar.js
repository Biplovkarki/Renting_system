"use client";
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

const RentalCalendar = ({ vehicleId, onClose }) => {
  const [rentalDates, setRentalDates] = useState([]);
  const [value, setValue] = useState(new Date());
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentalDates = async () => {
      try {
        if (!vehicleId) {
          setError('No vehicle ID provided');
          return;
        }

        const response = await axios.get(`http://localhost:5000/counts/${vehicleId}/rental-dates`);

        if (response.data.success) {
          const dates = response.data.rentalDates;
          const parsedDates = dates.map(date => ({
            start: new Date(date.rent_start_date),
            end: new Date(date.rent_end_date)
          }));
          setRentalDates(parsedDates);
        } else {
          setError('Failed to fetch rental dates');
        }
      } catch (error) {
        console.error('Error fetching rental dates:', error);
        setError(error.message || 'An error occurred while fetching rental dates');
      }
    };

    fetchRentalDates();
  }, [vehicleId]);

  const isDateRented = (dateToCheck) => {
    return rentalDates.some(rental => 
      dateToCheck >= rental.start && 
      dateToCheck <= rental.end
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      return isDateRented(date) ? 'bg-red-500 text-white': ''; // Corrected this line
    }
    return ''; // Added this return statement for other views
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
        {onClose && (
          <button onClick={onClose} className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <Calendar
        onChange={setValue}
        value={value}
        tileClassName={tileClassName}
        className="w-full"
      />
      {onClose && (
        <button onClick={onClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Close
        </button>
      )}
    </div>
  );
};

export default RentalCalendar;