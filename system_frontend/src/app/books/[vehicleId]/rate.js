import * as React from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';

const labels = {
  0.5: 'Useless',
  1: 'Useless+',
  1.5: 'Poor',
  2: 'Poor+',
  2.5: 'Ok',
  3: 'Ok+',
  3.5: 'Good',
  4: 'Good+',
  4.5: 'Excellent',
  5: 'Excellent+',
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

const RatingAndComment = ({ vehicleId, userId }) => {
  const [rating, setRating] = React.useState(2);
  const [hover, setHover] = React.useState(-1);
  const [comment, setComment] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [existingRating, setExistingRating] = React.useState(null); // Store existing rating
  const token = localStorage.getItem("userToken");

  console.log('User ID:', userId);
  console.log('Vehicle ID:', vehicleId);

  // Fetch existing rating on component mount
  React.useEffect(() => {
    const fetchExistingRating = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/rating/rate/${userId}/${vehicleId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.rating_value) {
          setExistingRating(response.data.rating_value); // Set existing rating
          setRating(response.data.rating_value); // Set rating state
        }
      } catch (error) {
        console.error('Error fetching existing rating:', error);
      }
    };
    fetchExistingRating();
  }, [vehicleId, userId, token]);

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      setMessage("Please provide a rating between 1 and 5.");
    
      return;
    }

    setLoading(true);
    try {
      if (existingRating !== null) {
        // If user has already rated, update the rating
        const response = await axios.put(
          `http://localhost:5000/rating/rate/${userId}/${vehicleId}`,
          { rating_value: parseFloat(rating) }, // Payload
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } } // Headers
        );
        setMessage(response.data.message);
        window.location.reload();
      } else {
        // If user has not rated, create a new rating
        const response = await axios.post(
          `http://localhost:5000/rating/rate/${userId}/${vehicleId}`,
          { rating_value: parseFloat(rating) }, // Payload
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } } // Headers
        );
        setMessage(response.data.message);
      }
      window.location.reload();
    } catch (error) {
      console.error('Error submitting rating:', error);
      setMessage(`Error: ${error.response ? error.response.data.message : error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/rating/comment/${userId}/${vehicleId}`,
        { comment_text: comment }, // Payload
        { headers: { Authorization: `Bearer ${token}` } } // Headers
      );
      setMessage(response.data.message);
      setComment(''); // Clear comment field after submission'
      window.location.reload();
    } catch (error) {
      console.error('Error submitting comment:', error);
      setMessage(`Error: ${error.response ? error.response.data.message : error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Rate & Comment on Vehicle
      </Typography>

      {/* Rating Component */}
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
        <Rating
          name="hover-feedback"
          value={rating}
          precision={0.5}
          getLabelText={getLabelText}
          onChange={handleRatingChange}
          onChangeActive={(event, newHover) => setHover(newHover)}
          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
        />
        {rating !== null && <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : rating]}</Box>}
      </Box>

      {/* Submit Rating Button */}
      <Button variant="contained" onClick={handleSubmitRating} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Submit Rating'}
      </Button>

      {/* Comment Section */}
      <Box sx={{ marginTop: 3 }}>
        <TextField
          label="Add a Comment"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={handleCommentChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitComment}
          sx={{ marginTop: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Comment'}
        </Button>
      </Box>

      {/* Response Message */}
      {message && <Typography sx={{ marginTop: 2 }} color="textSecondary">{message}</Typography>}
    </Box>
  );
};

export default RatingAndComment;
