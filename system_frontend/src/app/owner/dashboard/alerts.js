"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Alerts = ({ ownerId, token }) => {
  const [documentAlerts, setDocumentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/vehicledescriptionrouter/${ownerId}/alerts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDocumentAlerts(response.data.documentAlerts);

        // Log the fetched data for inspection
        console.log("Fetched document alerts:", response.data.documentAlerts);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [ownerId, token]);

  if (loading) return <p className="text-center text-xl font-semibold">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Document Expiry Alerts</h2>
      {documentAlerts.length === 0 ? (
        <p className="text-center text-lg text-gray-500">No document expiry alerts</p>
      ) : (
        <ul className="space-y-4">
          {documentAlerts.map((alert, index) => (
            <li key={index} className="alert-item p-4 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition">
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-semibold">{alert.vehicle_name} ({alert.model})</p>
                <span className="text-sm text-gray-600">{alert.document_alert_type}</span>
              </div>
              <div className="text-sm text-gray-700">
                <p><strong>Insurance Expiry:</strong> {alert.formatted_insurance_expiry}</p>
                <p><strong>Tax Expiry:</strong> {alert.formatted_tax_paid_until}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Alerts;
