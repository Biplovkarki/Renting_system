import * as React from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const RatingAndComment = ({ vehicleId, userId }) => {
  const [comment, setComment] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const token = localStorage.getItem("userToken");

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmitComment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/rating/comment/${userId}/${vehicleId}`,
        { comment_text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setComment('');
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
        Add a Comment on Vehicle
      </Typography>

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
