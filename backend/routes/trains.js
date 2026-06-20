const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Train = require('../models/Train');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { source, destination, date, class: classType } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and destination are required' });
    }

    const searchDate = date ? new Date(date) : new Date();
    const dayOfWeek = searchDate.getDay();

    let queryFilter = {
      source: { $regex: new RegExp(source, 'i') },
      destination: { $regex: new RegExp(destination, 'i') },
      isActive: true,
      daysOfWeek: dayOfWeek,
    };

    const trains = await Train.find(queryFilter).sort({ departureTime: 1 });

    const result = trains.map(train => {
      const trainObj = train.toObject();
      if (classType) {
        trainObj.classes = trainObj.classes.filter(c =>
          c.name.toUpperCase() === classType.toUpperCase()
        );
      }
      return trainObj;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const trains = await Train.find({ isActive: true }).sort({ number: 1 });
    res.json(trains);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stations', async (req, res) => {
  try {
    const sources = await Train.distinct('source', { isActive: true });
    const destinations = await Train.distinct('destination', { isActive: true });
    const stations = [...new Set([...sources, ...destinations])].sort();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }
    res.json(train);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, [
  body('name').trim().notEmpty(),
  body('number').trim().notEmpty(),
  body('source').trim().notEmpty(),
  body('destination').trim().notEmpty(),
  body('departureTime').notEmpty(),
  body('arrivalTime').notEmpty(),
  body('duration').notEmpty(),
  body('distance').isNumeric(),
  body('classes').isArray({ min: 1 }),
  body('daysOfWeek').isArray({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingTrain = await Train.findOne({ number: req.body.number });
    if (existingTrain) {
      return res.status(400).json({ message: 'Train with this number already exists' });
    }

    const train = await Train.create(req.body);
    res.status(201).json(train);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }
    res.json(train);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const train = await Train.findByIdAndDelete(req.params.id);
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }
    res.json({ message: 'Train deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
