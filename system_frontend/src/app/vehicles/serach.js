import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faCar, faTachometerAlt, faPalette, faStar, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { debounce } from "lodash";

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
  const [showNoResults, setShowNoResults] = useState(false);
  const [lastQuery, setLastQuery] = useState(""); // To prevent repeated searches

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
    setResults([]);
  };

  const handleSearch = useCallback(
    debounce(async () => {
      const currentQuery = `${searchText}-${selectedFilter}-${selectedCategory}-${vehicleId}`;
      if (currentQuery === lastQuery) {
        return; // Skip the search if it's the same as the last one
      }
      setLastQuery(currentQuery);

      if (!searchText.trim()) {
        setResults([]);
        setShowNoResults(false);
        return;
      }

      setLoading(true);
      setError(null);  // Reset the error before the new search
      setResults([]);
      setShowNoResults(false);

      try {
        const queryParams = new URLSearchParams({
          searchText,
          selectedFilter,
          category: selectedCategory,
          vehicleId,
        });

        const response = await fetch(`http://localhost:5000/search?${queryParams}`);

        if (!response.ok) {
          if (response.status === 400) {
            // Custom error handling for invalid numeric input
            setError("You can only use numbers in this filter.");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return;
        }

        const data = await response.json();
        setResults(data);
        setShowNoResults(data.length === 0);
      } catch (error) {
        setError(`Failed to fetch vehicles: ${error.message}`);
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    }, 500), // 500ms delay before making the search request
    [searchText, selectedFilter, selectedCategory, vehicleId, lastQuery]
  );

  useEffect(() => {
    handleSearch();
  }, [searchText, selectedFilter, selectedCategory, vehicleId, handleSearch]);

  const handleVehicleClick = (vehicleId) => {
    onVehicleSelect(vehicleId);
  };

  const handleSearchBarDoubleClick = () => {
    setShowNoResults(false);
  };

  return (
    <div className="vehicle-search-container max-w-screen-lg mx-auto p-6">
      {/* Filters and Search Bar */}
      <div className="flex items-center space-x-4 mb-6">
        {/* Category Dropdown */}
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 p-2 text-sm rounded-md shadow-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="flex items-center border border-gray-300 rounded-md shadow-sm flex-grow relative">
          <button
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-l-md hover:bg-gray-200"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FontAwesomeIcon
              icon={filters.find((filter) => filter.name.toLowerCase() === selectedFilter)?.icon || faFilter}
            />
          </button>
          <input
            type="text"
            placeholder={`Search by ${selectedFilter}`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onDoubleClick={handleSearchBarDoubleClick}
            className="flex-grow p-2 focus:outline-none"
          />
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-r-md hover:bg-blue-600"
            onClick={handleSearch}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="absolute bg-white border border-gray-300 rounded-md shadow-lg mt-2 w-full z-10">
          <button
            className="absolute top-0 right-0 p-2"
            onClick={() => setShowFilters(false)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          {filters.map((filter) => (
            <button
              key={filter.name}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={() => handleFilterSelect(filter)}
            >
              <FontAwesomeIcon icon={filter.icon} className="mr-2" />
              {filter.name}
            </button>
          ))}
        </div>
      )}

      {/* Search Results */}
      <div className="mt-6">
        {loading && <div className="text-center">Loading...</div>}

        {error && (
          <div className="text-center text-red-600">{error}</div>
        )}

        {results.length > 0 ? (
          <div className="max-h-[350px] overflow-y-auto border border-gray-200 rounded-lg">
            {results.map((vehicle) => (
              <div
                key={vehicle.vehicle_id}
                className="flex items-center border-b last:border-0 p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleVehicleClick(vehicle.vehicle_id)}
              >
                <div className="w-1/4">
                  {vehicle.image_front ? (
                    <img
                      src={`http://localhost:5000/${vehicle.image_front}`}
                      alt={vehicle.vehicle_name}
                      className="w-full h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-20 bg-gray-200 flex items-center justify-center rounded">
                      No Image
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-lg font-bold">{vehicle.vehicle_name}</h3>
                  <p className="text-sm text-gray-600">CC: {vehicle.cc}, Color: {vehicle.color}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && showNoResults && (
            <div className="text-center py-6 text-gray-500">No vehicles found matching your criteria.</div>
          )
        )}
      </div>
    </div>
  );
};

export default VehicleSearch;
