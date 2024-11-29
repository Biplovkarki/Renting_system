import { useEffect, useState } from "react";

const PriceForm = ({ price, onClose, onPriceUpdated, isUpdating }) => {
    const [minPrice, setMinPrice] = useState(price?.min_price || "");
    const [maxPrice, setMaxPrice] = useState(price?.max_price || "");
    const [error, setError] = useState(""); // State for error message

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate that minPrice is not greater than maxPrice
        if (parseInt(minPrice) > parseInt(maxPrice)) {
            setError("Minimum price cannot be greater than maximum price.");
            return; // Prevent submission if validation fails
        }
        setError(""); // Clear error message if validation passes

        const updatedPrice = {
            ...price,
            min_price: parseInt(minPrice), // Convert to integer
            max_price: parseInt(maxPrice), // Convert to integer
        };
        onPriceUpdated(updatedPrice);
    };

    useEffect(() => {
        if (price) {
            setMinPrice(price.min_price);
            setMaxPrice(price.max_price);
        }
    }, [price]);

    return (
        <form onSubmit={handleSubmit}>
            <label className="block mb-2">Min Price:</label>
            <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border rounded w-full mb-4 p-2"
                required
            />
            <label className="block mb-2">Max Price:</label>
            <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border rounded w-full mb-4 p-2"
                required
            />
            {error && <p className="text-red-500 mb-2">{error}</p>} {/* Show error message */}
            <div className="flex justify-end gap-1 mt-4">
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={isUpdating}
                >
                    {isUpdating ? "Updating..." : "Update"}
                </button>
                <button
                    type="button" // Use type="button" to prevent form submission
                    onClick={onClose} // Call the onClose function
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default PriceForm;
