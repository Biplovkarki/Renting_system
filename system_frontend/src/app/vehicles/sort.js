import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SortComponent = () => {
  const [vehicles, setVehicles] = useState([]);
  const [sortBy, setSortBy] = useState('final_price');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/sort/vehicles', {
          params: { sortBy, order },
        });
        setVehicles(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch vehicles');
        setLoading(false);
        console.error(err);
      }
    };

    fetchVehicles();
  }, [sortBy, order]);

  const renderVehicleCard = (vehicle) => (
    <div key={vehicle.vehicle_id} className="border p-4 mb-2 rounded shadow-sm">
      <h3 className="text-lg font-bold">{vehicle.model}</h3>
      <div className="flex justify-between">
        <div>
          <p>Price: ${vehicle.final_price.toLocaleString()}</p>
          <p>CC: {vehicle.cc}</p>
          <p>Rating: {vehicle.rating_value ? vehicle.rating_value.toFixed(1) : 'N/A'}</p>
        </div>
        {vehicle.discounted_price && (
          <div className="text-green-600">
            <p>Discounted Price: ${vehicle.discounted_price.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vehicle List</h1>

      <div className="mb-4">
        <label className="mr-2" htmlFor="sortBy">Sort By:</label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="final_price">Price</option>
          <option value="cc">CC</option>
          <option value="rating_value">Rating</option>
        </select>

        <label className="mr-2 ml-4" htmlFor="order">Order:</label>
        <select
          id="order"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {vehicles.map(renderVehicleCard)}
    </div>
  );
};

export default SortComponent;
