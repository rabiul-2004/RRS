const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Train = require('../models/Train');
const { protect, admin } = require('../middleware/auth');
const generatePNR = require('../utils/generatePNR');

const router = express.Router();

router.post('/create', protect, [
  body('trainId').notEmpty().withMessage('Train ID is required'),
  body('journeyDate').notEmpty().withMessage('Journey date is required'),
  body('classType').notEmpty().withMessage('Class type is required'),
  body('passengers').isArray({ min: 1 }).withMessage('At least one passenger required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { trainId, journeyDate, classType, passengers, paymentMethod } = req.body;

    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    const classInfo = train.classes.find(
      c => c.name.toUpperCase() === classType.toUpperCase()
    );
    if (!classInfo) {
      return res.status(400).json({ message: 'Class not available on this train' });
    }

    if (classInfo.availableSeats < passengers.length) {
      return res.status(400).json({
        message: `Only ${classInfo.availableSeats} seats available in ${classType}`,
      });
    }

    let pnr;
    let isUnique = false;
    while (!isUnique) {
      pnr = generatePNR();
      const existing = await Booking.findOne({ pnr });
      if (!existing) isUnique = true;
    }

    const totalFare = classInfo.fare * passengers.length;

    const bookingPassengers = passengers.map(p => ({
      name: p.name,
      age: p.age,
      gender: p.gender,
      berthPreference: p.berthPreference || 'No Preference',
      berthAllocation: 'CNF',
      status: 'CNF',
    }));

    const booking = await Booking.create({
      pnr,
      user: req.user._id,
      train: train._id,
      trainNumber: train.number,
      trainName: train.name,
      source: train.source,
      destination: train.destination,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
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
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/pnr/:pnr', async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnr: req.params.pnr.toUpperCase() });
    if (!booking) {
      return res.status(404).json({ message: 'PNR not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
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
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
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
      const classInfo = train.classes.find(
        c => c.name.toUpperCase() === booking.classType.toUpperCase()
      );
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
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
