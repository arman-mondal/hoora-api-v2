const express = require('express');
const router = express.Router();
const CarWash = require('./CarWash'); // Import your MongoDB model

// Define the route to handle saving car wash data
router.post('/book-car-wash', async (req, res) => {
  try {
    const { email, carModel, carBrand, washType, bookingDateTime, customBookingDateTime, address } = req.body;

    // Create a new CarWash document using the mongoose model
    const carWash = new CarWash({
      email,
      carModel,
      carBrand,
      washType,
      bookingDateTime,
      customBookingDateTime,
      address,
    });

    // Save the car wash data to the MongoDB database
    await carWash.save();

    res.status(201).json({ message: 'Car wash booking saved successfully.' });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Error saving car wash booking.' });
  }
});

module.exports = router;
