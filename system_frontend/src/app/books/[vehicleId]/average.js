import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress } from '@mui/material';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';

const AverageRating = ({ vehicleId }) => {
    const [averageRating, setAverageRating] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    
    useEffect(() => {
        const fetchAverageRating = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/Average/average-rating/${vehicleId}`);
                const roundedRating = Math.round(response.data.average_rating * 2) / 2; // Round to nearest 0.5
                setAverageRating(roundedRating);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch average rating');
                setAverageRating(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAverageRating();
    }, [vehicleId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" variant="body2" align="center" mt={2}>
                {error}
            </Typography>
        );
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
            {averageRating !== null ? (
                <Box display="flex" alignItems="center" mt={1}>
                    <Rating
                        name="average-rating"
                        value={averageRating}
                        precision={0.5} // Allows half-star increments
                        readOnly
                        icon={<StarIcon fontSize="inherit" />}
                        emptyIcon={<StarIcon fontSize="inherit" style={{ opacity: 0.3 }} />}
                    />
                    <Typography variant="body2" ml={1}>
                        ({averageRating})
                    </Typography>
                </Box>
            ) : (
                <Typography variant="body2">No ratings available</Typography>
            )}
        </Box>
    );
};

export default AverageRating;
