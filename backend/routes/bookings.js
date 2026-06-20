const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Train = require('../models/Train');
const Route = require('../models/Route');
const { protect, admin } = require('../middleware/auth');
const generatePNR = require('../utils/generatePNR');
const { SEATS_PER_COACH, COACH_PREFIX } = require('../utils/constants');

const router = express.Router();

router.post('/create', protect, [
  body('routeId').notEmpty(),
  body('boardingStopId').notEmpty(),
  body('deboardingStopId').notEmpty(),
  body('journeyDate').notEmpty(),
  body('classType').notEmpty(),
  body('passengers').isArray({ min: 1 }),
  body('paymentMethod').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { routeId, boardingStopId, deboardingStopId, journeyDate, classType, passengers, paymentMethod } = req.body;

    const route = await Route.findById(routeId).populate('stops.station train');
    if (!route) return res.status(404).json({ message: 'Route not found' });

    const train = route.train;
    if (!train || !train.isActive) return res.status(400).json({ message: 'Train not available' });

    const boardingStop = route.stops.id(boardingStopId);
    const deboardingStop = route.stops.id(deboardingStopId);
    if (!boardingStop || !deboardingStop) {
      return res.status(400).json({ message: 'Invalid boarding/deboarding stops' });
    }
    if (boardingStop.stopOrder >= deboardingStop.stopOrder) {
      return res.status(400).json({ message: 'Boarding stop must be before deboarding stop' });
    }

    const classInfo = train.classes.find(c => c.name.toUpperCase() === classType.toUpperCase());
    if (!classInfo) return res.status(400).json({ message: 'Class not available on this train' });

    if (classInfo.availableSeats < passengers.length) {
      return res.status(400).json({
        message: `Only ${classInfo.availableSeats} seats available in ${classType}`,
      });
    }

    const totalDist = route.stops[route.stops.length - 1].distance || 1;
    const journeyDist = (deboardingStop.distance || 0) - (boardingStop.distance || 0);
    const ratio = journeyDist / totalDist;
    const farePerPassenger = Math.round(classInfo.fare * ratio);
    const totalFare = farePerPassenger * passengers.length;

    let pnr;
    let isUnique = false;
    while (!isUnique) {
      pnr = generatePNR();
      const existing = await Booking.findOne({ pnr });
      if (!existing) isUnique = true;
    }

    const seatsPerCoach = SEATS_PER_COACH[classType.toUpperCase()] || 80;
    const coachPrefix = COACH_PREFIX[classType.toUpperCase()] || 'X';

    const existingCount = await Booking.countDocuments({
      train: train._id,
      journeyDate: new Date(journeyDate),
      classType: classType.toUpperCase(),
      status: { $ne: 'Cancelled' },
    });

    const bookingPassengers = passengers.map((p, idx) => {
      const seatIndex = existingCount + idx;
      const coachNum = Math.floor(seatIndex / seatsPerCoach) + 1;
      const seatInCoach = (seatIndex % seatsPerCoach) + 1;
      return {
        name: p.name,
        age: p.age,
        gender: p.gender,
        berthPreference: p.berthPreference || 'No Preference',
        berthAllocation: 'CNF',
        coachNumber: `${coachPrefix}${coachNum}`,
        seatNumber: seatInCoach,
        status: 'CNF',
      };
    });

    const booking = await Booking.create({
      pnr,
      user: req.user._id,
      train: train._id,
      route: route._id,
      trainNumber: train.number,
      trainName: train.name,
      source: boardingStop.station.name,
      destination: deboardingStop.station.name,
      departureTime: boardingStop.departureTime,
      arrivalTime: deboardingStop.arrivalTime,
      journeyDate: new Date(journeyDate),
      classType: classType.toUpperCase(),
      passengers: bookingPassengers,
      totalFare,
      status: 'Confirmed',
      paymentStatus: 'Completed',
      paymentMethod,
    });

    classInfo.availableSeats -= passengers.length;
    await train.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/pnr/:pnr', async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnr: req.params.pnr.toUpperCase() });
    if (!booking) return res.status(404).json({ message: 'PNR not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/cancel/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    booking.status = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    const train = await Train.findById(booking.train);
    if (train) {
      const classInfo = train.classes.find(c => c.name.toUpperCase() === booking.classType.toUpperCase());
      if (classInfo) {
        classInfo.availableSeats += booking.passengers.length;
        await train.save();
      }
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
