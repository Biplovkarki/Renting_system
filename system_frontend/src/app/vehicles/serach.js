"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faCar, faTachometerAlt, faPalette, faStar, faSearch } from "@fortawesome/free-solid-svg-icons";

const VehicleSearch = ({ onVehicleSelect }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("vehicle name");
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showNoResults, setShowNoResults] = useState(false); // State for showing no results message

  const filters = [
    { name: "Vehicle Name", icon: faCar },
    { name: "CC", icon: faTachometerAlt },
    { name: "Model", icon: faCar },
    { name: "Color", icon: faPalette },
    { name: "Ratings", icon: faStar },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/search/categories");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setError(`Failed to fetch categories: ${error.message}`);
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter.name.toLowerCase());
    setShowFilters(false);
    setSearchText("");
  };

  const handleSearch = async () => {
    // If the search bar is empty, clear the results and return early
    if (!searchText.trim()) {
      setResults([]);  // Clear previous results
      setShowNoResults(false);  // Hide "No results found" message if search text is empty
      return;
    }
  
    setLoading(true);
    setError(null);
    setResults([]);  // Clear previous results when starting a new search
    setShowNoResults(false);  // Hide "No results found" message when starting a search
  
    try {
      const queryParams = new URLSearchParams({
        searchText,
        selectedFilter,
        category: selectedCategory,
        vehicleId,
      });
  
      const response = await fetch(`http://localhost:5000/search?${queryParams}`);
      if (!response.ok) {
        const message = `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }
      const data = await response.json();
      setResults(data);
      if (data.length === 0) {
        setShowNoResults(true);  // Show "No results found" if there are no results
      }
    } catch (error) {
      setError(error.message);
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleClick = (vehicleId) => {
    onVehicleSelect(vehicleId);
  };

  // Double-click to hide "No results found" message
  const handleSearchBarDoubleClick = () => {
    setShowNoResults(false);
  };

  return (
    <div className="vehicle-search-container max-w-screen-lg mx-auto p-6">
      {/* Wrapper for Category and Search Bar */}
      <div className="flex items-center space-x-4 mb-6">
        {/* Category Dropdown */}
        <div className="category-filter flex items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 p-2 text-sm rounded-md shadow-sm"
          >
            <option value="">Select</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Search bar */}
        <div className="search-bar flex items-center border border-gray-300 rounded-md shadow-sm relative flex-grow">
          <button
            className="filter-icon bg-gray-100 text-gray-600 px-4 py-2 rounded-l-md hover:bg-gray-200 transition"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FontAwesomeIcon icon={filters.find((filter) => filter.name.toLowerCase() === selectedFilter)?.icon || faFilter} />
          </button>
          <input
            type="text"
            placeholder={`Search by ${selectedFilter}`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onDoubleClick={handleSearchBarDoubleClick}  // Double-click to hide "No results found"
            className="flex-grow p-2 focus:outline-none"
          />
          <button
            className="search-icon bg-blue-500 text-white py-2 px-4 rounded-r-md hover:bg-blue-600 transition"
            onClick={handleSearch}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="filter-options absolute bg-white border border-gray-300 rounded-md shadow-lg mt-2 w-full z-10">
          {filters.map((filter) => (
            <button
              key={filter.name}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition"
              onClick={() => handleFilterSelect(filter)}
            >
              <FontAwesomeIcon icon={filter.icon} className="mr-2" />
              {filter.name}
            </button>
          ))}
        </div>
      )}

      <div className="search-results mt-6">
        {loading && (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            <span>{error}</span>
          </div>
        )}

        {results.length > 0 ? (
          <div className="max-h-[350px] overflow-y-auto border border-gray-200 rounded-lg">
            {results.map((vehicle) => (
              <div
                key={vehicle.vehicle_id}
                className="bg-white border-b last:border-b-0 border-gray-200 flex items-center w-full h-[70px] cursor-pointer"
                onClick={() => handleVehicleClick(vehicle.vehicle_id)}
              >
                {/* Image Section */}
                <div className="w-1/4 h-full p-2">
                  {vehicle.image_front ? (
                    <img
                      src={`http://localhost:5000/${vehicle.image_front}`}
                      alt={vehicle.vehicle_name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No Image</p>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="w-3/4 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {vehicle.vehicle_name} <span className="text-sm text-gray-600">({vehicle.model})</span>
                    </h3>
                    <div className="text-gray-600 text-sm  mt-1">
                      <p>CC: {vehicle.cc}</p>
                      <p>Color: {vehicle.color}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && showNoResults && (  // Only show "No results found" if search was triggered
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No results found</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default VehicleSearch;
