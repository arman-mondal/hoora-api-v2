const express = require('express');
const router = express.Router();
const CarWash = require('./CarWash'); // Import your MongoDB model

// Define the route to handle fetching user-specific booking history
router.post('/booking-history', async (req, res) => {
  try {
    const { email } = req.body;

    // Fetch booking history for the specified user
    const bookingHistory = await CarWash.find({ email });

    res.status(200).json(bookingHistory);
  } catch (error) {
    console.error('Error fetching booking history', error);
    res.status(500).json({ message: 'Error fetching booking history.' });
  }
});

module.exports = router;
