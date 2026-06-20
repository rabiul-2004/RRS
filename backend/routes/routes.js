const express = require('express');
const { body, validationResult } = require('express-validator');
const Route = require('../models/Route');
const Station = require('../models/Station');
const Train = require('../models/Train');
const { protect, admin } = require('../middleware/auth');
const calcDuration = require('../utils/calcDuration');

const router = express.Router();

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

router.get('/search', async (req, res) => {
  try {
    const { source, destination, date, class: classType } = req.query;
    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and destination are required' });
    }

    const srcStations = await Station.find({ name: { $regex: new RegExp(source, 'i') }, isActive: true });
    const dstStations = await Station.find({ name: { $regex: new RegExp(destination, 'i') }, isActive: true });

    if (!srcStations.length || !dstStations.length) {
      return res.json([]);
    }

    const srcIds = srcStations.map(s => s._id.toString());
    const dstIds = dstStations.map(s => s._id.toString());

    const searchDate = date ? new Date(date) : new Date();
    const dayOfWeek = searchDate.getDay();

    const allRoutes = await Route.find({
      isActive: true,
      daysOfWeek: dayOfWeek,
    }).populate('stops.station train').lean();

    const results = [];
    for (const route of allRoutes) {
      const srcStop = route.stops.find(s => srcIds.includes(s.station._id.toString()));
      const dstStop = route.stops.find(s => dstIds.includes(s.station._id.toString()));

      if (!srcStop || !dstStop || srcStop.stopOrder >= dstStop.stopOrder) continue;

      const train = route.train;
      if (!train || !train.isActive) continue;

      const srcMin = timeToMinutes(srcStop.departureTime);
      const dstMin = timeToMinutes(dstStop.arrivalTime);
      let diffMin = dstMin - srcMin;
      const dayDiff = (dstStop.dayNumber || 1) - (srcStop.dayNumber || 1);
      if (dayDiff > 0) diffMin += dayDiff * 24 * 60;
      if (diffMin < 0) diffMin += 24 * 60;

      const hours = Math.floor(diffMin / 60);
      const mins = diffMin % 60;
      const durationStr = `${hours}h ${mins.toString().padStart(2, '0')}m`;
      const distance = (dstStop.distance || 0) - (srcStop.distance || 0);

      let classes = train.classes.map(c => {
        const ratio = distance / (route.stops[route.stops.length - 1].distance || 1);
        return { ...c.toObject(), fare: Math.round(c.fare * ratio) };
      });

      if (classType) {
        classes = classes.filter(c => c.name.toUpperCase() === classType.toUpperCase());
      }

      results.push({
        routeId: route._id,
        train: { _id: train._id, name: train.name, number: train.number, classes, isActive: train.isActive },
        boardingStop: { ...srcStop, station: srcStop.station },
        deboardingStop: { ...dstStop, station: dstStop.station },
        journeyDuration: durationStr,
        journeyDistance: distance,
        daysOfWeek: route.daysOfWeek,
      });
    }

    results.sort((a, b) => timeToMinutes(a.boardingStop.departureTime) - timeToMinutes(b.boardingStop.departureTime));
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const routes = await Route.find().populate('stops.station train').sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await Route.findById(req.params.id).populate('stops.station train');
    if (!r) return res.status(404).json({ message: 'Route not found' });
    res.json(r);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, [
  body('train').notEmpty(),
  body('stops').isArray({ min: 2 }),
  body('daysOfWeek').isArray({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existing = await Route.findOne({ train: req.body.train });
    if (existing) {
      return res.status(400).json({ message: 'Route already exists for this train' });
    }

    const train = await Train.findById(req.body.train);
    if (!train) return res.status(404).json({ message: 'Train not found' });

    const sortedStops = [...req.body.stops].sort((a, b) => a.stopOrder - b.stopOrder);

    const route = await Route.create({ ...req.body, stops: sortedStops });
    const populated = await Route.findById(route._id).populate('stops.station train');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.stops) {
      body.stops = body.stops.sort((a, b) => a.stopOrder - b.stopOrder);
    }
    const r = await Route.findByIdAndUpdate(req.params.id, body, {
      new: true, runValidators: true,
    }).populate('stops.station train');
    if (!r) return res.status(404).json({ message: 'Route not found' });
    res.json(r);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const r = await Route.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
