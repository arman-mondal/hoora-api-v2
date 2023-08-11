const mongoose = require('mongoose');

const carWashSchema = new mongoose.Schema({
  email: { type: String, required: true },
  carModel: { type: String, required: true },
  carBrand: { type: String, required: true },
  washType: { type: String, required: true },
  bookingDateTime: { type: Date, required: true },
  customBookingDateTime: { type: Date, required: true },
  address: { type: String, required: true },
});

const CarWash = mongoose.model('CarWash', carWashSchema);

module.exports = CarWash;
