const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['SL', '3A', '2A', '1A', 'CC', 'EC', '2S', 'FC'],
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
    default: 0,
  },
  totalSeats: {
    type: Number,
    required: true,
  },
  fare: {
    type: Number,
    required: true,
  },
}, { _id: false });

const trainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Train name is required'],
    trim: true,
  },
  number: {
    type: String,
    required: [true, 'Train number is required'],
    unique: true,
    trim: true,
  },
  source: {
    type: String,
    required: [true, 'Source station is required'],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, 'Destination station is required'],
    trim: true,
  },
  departureTime: {
    type: String,
    required: [true, 'Departure time is required'],
  },
  arrivalTime: {
    type: String,
    required: [true, 'Arrival time is required'],
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
  },
  classes: [classSchema],
  daysOfWeek: [{
    type: Number,
    enum: [0, 1, 2, 3, 4, 5, 6],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Train', trainSchema);
