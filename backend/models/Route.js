const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  stopOrder: {
    type: Number,
    required: true,
  },
  arrivalTime: {
    type: String,
    default: '',
  },
  departureTime: {
    type: String,
    default: '',
  },
  dayNumber: {
    type: Number,
    default: 1,
  },
  distance: {
    type: Number,
    default: 0,
  },
  platform: {
    type: String,
    default: '',
  },
}, { _id: false });

const routeSchema = new mongoose.Schema({
  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Train',
    required: true,
  },
  stops: {
    type: [stopSchema],
    validate: [arr => arr.length >= 2, 'Route must have at least 2 stops'],
  },
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

module.exports = mongoose.model('Route', routeSchema);
