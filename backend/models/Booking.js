const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  berthPreference: {
    type: String,
    enum: ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'No Preference'],
    default: 'No Preference',
  },
  berthAllocation: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['CNF', 'RAC', 'WL'],
    default: 'CNF',
  },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  pnr: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Train',
    required: true,
  },
  trainNumber: String,
  trainName: String,
  source: String,
  destination: String,
  departureTime: String,
  arrivalTime: String,
  journeyDate: {
    type: Date,
    required: true,
  },
  classType: {
    type: String,
    required: true,
  },
  passengers: [passengerSchema],
  totalFare: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Partial Cancelled'],
    default: 'Confirmed',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Refunded'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);
