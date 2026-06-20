const mongoose = require('mongoose');

const SEATS_PER_COACH = {
  SL: 80, '3A': 80, '2A': 60, '1A': 40,
  CC: 78, EC: 56, '2S': 108, FC: 50,
};

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['SL', '3A', '2A', '1A', 'CC', 'EC', '2S', 'FC'],
    required: true,
  },
  numCoaches: {
    type: Number,
    required: true,
    min: 1,
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

classSchema.pre('validate', function (next) {
  const seatsPerCoach = SEATS_PER_COACH[this.name];
  if (seatsPerCoach && this.numCoaches) {
    this.totalSeats = seatsPerCoach * this.numCoaches;
    if (this.availableSeats === undefined || this.availableSeats === 0) {
      this.availableSeats = this.totalSeats;
    }
  }
  next();
});

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
  classes: [classSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Train', trainSchema);
