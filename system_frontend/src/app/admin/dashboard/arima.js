"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

// Register necessary components for Chart.js
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const ForecastComponent = () => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchForecastData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:5000/arima/forecast-revenue'); // Adjust the URL to your backend route
      setForecast(response.data.forecast);
    } catch (err) {
      setError('Error fetching forecast data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for Chart.js
  const chartData = {
    labels: forecast.map(item => item.month), // months as x-axis labels
    datasets: [
      {
        label: 'Predicted Revenue',
        data: forecast.map(item => Math.round(parseFloat(item.predicted_revenue))), // Round to nearest integer
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Revenue Forecast</h1>
      
      <button 
        onClick={fetchForecastData} 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Get Forecast
      </button>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {forecast.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-medium">Predicted Revenue for Next 6 Months:</h2>
          {/* Chart rendering */}
          <div className="mt-4">
            <Line data={chartData} />
          </div>

          <table className="table-auto w-full mt-4 border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Month</th>
                <th className="border px-4 py-2">Predicted Revenue</th>
              </tr>
            </thead>
            <tbody>
            {forecast.map((item, index) => (
  <tr key={index}>
    <td className="border px-4 py-2">{item.month}</td>
    <td className="border px-4 py-2">{Math.round(item.predicted_revenue)}</td>
  </tr>
))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ForecastComponent;
