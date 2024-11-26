"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';

const CommentsSection = ({ vehicleId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/comments/${vehicleId}`);
                setComments(response.data.comments);
                setError(null);
            } catch (err) {
                setError('Failed to fetch comments. Please try again later.');
                setComments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
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
        <Box>
            {comments.length > 0 ? (
                comments.map((comment, index) => (
                    <Box
                        key={index}
                        display="flex"
                        alignItems="flex-start"
                        mb={2}
                        p={2}
                        borderRadius="8px"
                        boxShadow={1}
                        bgcolor="#f9f9f9"
                    >
                        {/* User Avatar */}
                        <Avatar
                            src={comment.user_image || null}
                            sx={{ bgcolor: comment.user_image ? 'transparent' : '#1976d2', mr: 2 }}
                        >
                            {!comment.user_image && comment.user_name.charAt(0).toUpperCase()}
                        </Avatar>

                        {/* User Details */}
                        <Box>
                            {/* Username */}
                            <Typography variant="subtitle1" fontWeight="bold">
                                {comment.user_name}
                            </Typography>

                            {/* Comment Text */}
                            <Typography variant="body2" color="textSecondary" mb={1}>
                                {comment.comment_text}
                            </Typography>

                            {/* Single User Rating */}
                            <Box display="flex" alignItems="center" mt={1}>
                                <Rating
                                    name={`rating-${index}`}
                                    value={comment.rating_value || 0} // Display user's rating
                                    precision={0.5}
                                    readOnly
                                    icon={<StarIcon fontSize="inherit" />}
                                    emptyIcon={<StarIcon fontSize="inherit" style={{ opacity: 0.3 }} />}
                                />
                                {comment.rating_value !== null && (
                                    <Typography variant="body2" ml={1}>
                                        ({comment.rating_value})
                                    </Typography>
                                )}
                            </Box>

                            {/* Timestamp */}
                            <Typography
                                variant="caption"
                                color="textSecondary"
                                mt={0.5}
                                display="block"
                            >
                                {new Date(comment.created_at).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Box>
                ))
            ) : (
                <Typography variant="body2" align="center">
                    No comments available for this vehicle.
                </Typography>
            )}
        </Box>
    );
};

export default CommentsSection;
