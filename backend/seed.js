const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Train = require('./models/Train');
const Station = require('./models/Station');
const Route = require('./models/Route');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    await Promise.all([
      Train.deleteMany({}),
      Station.deleteMany({}),
      Route.deleteMany({}),
      User.deleteMany({ role: 'admin' }),
    ]);

    // ── Stations ──
    const stationData = [
      { name: 'Howrah Junction', code: 'HWH', city: 'Kolkata', state: 'West Bengal' },
      { name: 'New Delhi', code: 'NDLS', city: 'Delhi', state: 'Delhi' },
      { name: 'Kanpur Central', code: 'CNB', city: 'Kanpur', state: 'Uttar Pradesh' },
      { name: 'Chennai Central', code: 'MAS', city: 'Chennai', state: 'Tamil Nadu' },
      { name: 'Mumbai CST', code: 'CSTM', city: 'Mumbai', state: 'Maharashtra' },
      { name: 'Bengaluru City Junction', code: 'SBC', city: 'Bengaluru', state: 'Karnataka' },
      { name: 'Sealdah', code: 'SDAH', city: 'Kolkata', state: 'West Bengal' },
      { name: 'Varanasi Junction', code: 'BSB', city: 'Varanasi', state: 'Uttar Pradesh' },
      { name: 'Thiruvananthapuram Central', code: 'TVC', city: 'Thiruvananthapuram', state: 'Kerala' },
      { name: 'Mumbai Central', code: 'BCT', city: 'Mumbai', state: 'Maharashtra' },
      { name: 'Lucknow Junction', code: 'LJN', city: 'Lucknow', state: 'Uttar Pradesh' },
      { name: 'Patna Junction', code: 'PNBE', city: 'Patna', state: 'Bihar' },
      { name: 'Ahmedabad Junction', code: 'ADI', city: 'Ahmedabad', state: 'Gujarat' },
      { name: 'Pune Junction', code: 'PUNE', city: 'Pune', state: 'Maharashtra' },
      { name: 'Jaipur Junction', code: 'JP', city: 'Jaipur', state: 'Rajasthan' },
    ];
    const stations = await Station.insertMany(stationData);
    console.log(`${stations.length} stations created`);

    const stationMap = {};
    stationData.forEach((sd, i) => { stationMap[sd.code] = stations[i]._id; });

    // ── Trains ──
    const trainData = [
      {
        name: 'Rajdhani Express', number: '12301',
        classes: [
          { name: '1A', numCoaches: 1, fare: 4755 },
          { name: '2A', numCoaches: 2, fare: 2775 },
          { name: '3A', numCoaches: 3, fare: 1970 },
        ],
      },
      {
        name: 'Shatabdi Express', number: '12001',
        classes: [
          { name: 'CC', numCoaches: 3, fare: 875 },
          { name: 'EC', numCoaches: 1, fare: 1680 },
        ],
      },
      {
        name: 'Duronto Express', number: '12245',
        classes: [
          { name: 'SL', numCoaches: 4, fare: 690 },
          { name: '3A', numCoaches: 3, fare: 1860 },
          { name: '2A', numCoaches: 2, fare: 2645 },
        ],
      },
      {
        name: 'Garib Rath Express', number: '12259',
        classes: [
          { name: '3A', numCoaches: 6, fare: 1260 },
        ],
      },
      {
        name: 'Kolkata Mail', number: '12005',
        classes: [
          { name: 'SL', numCoaches: 5, fare: 490 },
          { name: '3A', numCoaches: 3, fare: 1325 },
          { name: '2A', numCoaches: 2, fare: 1850 },
          { name: '1A', numCoaches: 1, fare: 3150 },
        ],
      },
      {
        name: 'Vande Bharat Express', number: '22435',
        classes: [
          { name: 'CC', numCoaches: 4, fare: 1420 },
          { name: 'EC', numCoaches: 1, fare: 2625 },
        ],
      },
      {
        name: 'Chennai Express', number: '12631',
        classes: [
          { name: 'SL', numCoaches: 5, fare: 425 },
          { name: '3A', numCoaches: 3, fare: 1140 },
          { name: '2A', numCoaches: 2, fare: 1610 },
        ],
      },
      {
        name: 'Mumbai Rajdhani', number: '12951',
        classes: [
          { name: '1A', numCoaches: 1, fare: 4595 },
          { name: '2A', numCoaches: 2, fare: 2645 },
          { name: '3A', numCoaches: 3, fare: 1885 },
        ],
      },
      {
        name: 'Kerala Express', number: '12625',
        classes: [
          { name: 'SL', numCoaches: 4, fare: 765 },
          { name: '3A', numCoaches: 2, fare: 2025 },
          { name: '2A', numCoaches: 1, fare: 2915 },
        ],
      },
      {
        name: 'Bengaluru Express', number: '12609',
        classes: [
          { name: 'SL', numCoaches: 3, fare: 165 },
          { name: 'CC', numCoaches: 2, fare: 425 },
          { name: '2S', numCoaches: 4, fare: 95 },
        ],
      },
    ];
    const createdTrains = await Train.insertMany(trainData);
    console.log(`${createdTrains.length} trains created`);

    // ── Routes ──
    const routeData = [
      {
        trainIdx: 0, daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        stops: [
          { code: 'HWH', stopOrder: 1, dep: '13:05', day: 1, dist: 0 },
          { code: 'NDLS', stopOrder: 2, arr: '09:55', day: 2, dist: 1450 },
        ],
      },
      {
        trainIdx: 1, daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        stops: [
          { code: 'NDLS', stopOrder: 1, dep: '06:00', day: 1, dist: 0 },
          { code: 'CNB', stopOrder: 2, arr: '10:50', day: 1, dist: 440 },
        ],
      },
      {
        trainIdx: 2, daysOfWeek: [2, 4, 6],
        stops: [
          { code: 'HWH', stopOrder: 1, dep: '23:40', day: 1, dist: 0 },
          { code: 'MAS', stopOrder: 2, arr: '04:45', day: 3, dist: 1660 },
        ],
      },
      {
        trainIdx: 3, daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        stops: [
          { code: 'SDAH', stopOrder: 1, dep: '13:55', day: 1, dist: 0 },
          { code: 'NDLS', stopOrder: 2, arr: '06:55', day: 2, dist: 1450 },
        ],
      },
      {
        trainIdx: 4, daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        stops: [
          { code: 'NDLS', stopOrder: 1, dep: '21:50', day: 1, dist: 0 },
          { code: 'CNB', stopOrder: 2, arr: '00:30', dep: '00:40', day: 2, dist: 440 },
          { code: 'PNBE', stopOrder: 3, arr: '04:20', dep: '04:30', day: 2, dist: 1000 },
          { code: 'HWH', stopOrder: 4, arr: '08:30', day: 2, dist: 1450 },
        ],
      },
      {
        trainIdx: 5, daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        stops: [
          { code: 'NDLS', stopOrder: 1, dep: '06:00', day: 1, dist: 0 },
          { code: 'LJN', stopOrder: 2, arr: '09:15', dep: '09:20', day: 1, dist: 490 },
          { code: 'CNB', stopOrder: 3, arr: '10:30', dep: '10:35', day: 1, dist: 630 },
          { code: 'BSB', stopOrder: 4, arr: '13:30', day: 1, dist: 800 },
        ],
      },
      {
        trainIdx: 6, daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        stops: [
          { code: 'MAS', stopOrder: 1, dep: '06:55', day: 1, dist: 0 },
          { code: 'PUNE', stopOrder: 2, arr: '22:00', dep: '22:10', day: 1, dist: 1050 },
          { code: 'CSTM', stopOrder: 3, arr: '05:20', day: 2, dist: 1280 },
        ],
      },
      {
        trainIdx: 7, daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        stops: [
          { code: 'BCT', stopOrder: 1, dep: '17:00', day: 1, dist: 0 },
          { code: 'ADI', stopOrder: 2, arr: '21:05', dep: '21:15', day: 1, dist: 490 },
          { code: 'JP', stopOrder: 3, arr: '03:00', dep: '03:10', day: 2, dist: 930 },
          { code: 'NDLS', stopOrder: 4, arr: '08:35', day: 2, dist: 1380 },
        ],
      },
      {
        trainIdx: 8, daysOfWeek: [1, 3, 5],
        stops: [
          { code: 'NDLS', stopOrder: 1, dep: '11:20', day: 1, dist: 0 },
          { code: 'CNB', stopOrder: 2, arr: '16:30', dep: '16:40', day: 1, dist: 440 },
          { code: 'PNBE', stopOrder: 3, arr: '22:00', dep: '22:10', day: 1, dist: 1000 },
          { code: 'HWH', stopOrder: 4, arr: '03:30', dep: '03:45', day: 2, dist: 1450 },
          { code: 'MAS', stopOrder: 5, arr: '09:00', dep: '09:15', day: 3, dist: 2200 },
          { code: 'TVC', stopOrder: 6, arr: '18:35', day: 3, dist: 2935 },
        ],
      },
      {
        trainIdx: 9, daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        stops: [
          { code: 'MAS', stopOrder: 1, dep: '22:50', day: 1, dist: 0 },
          { code: 'SBC', stopOrder: 2, arr: '05:40', day: 2, dist: 360 },
        ],
      },
    ];

    const routeDocs = routeData.map(rd => ({
      train: createdTrains[rd.trainIdx]._id,
      daysOfWeek: rd.daysOfWeek,
      stops: rd.stops.map(st => ({
        station: stationMap[st.code],
        stopOrder: st.stopOrder,
        arrivalTime: st.arr || '',
        departureTime: st.dep || '',
        dayNumber: st.day || 1,
        distance: st.dist || 0,
        platform: '',
      })),
    }));

    await Route.insertMany(routeDocs);
    console.log(`${routeDocs.length} routes created`);

    await User.create({
      name: 'Admin User',
      email: 'admin@irctc.in',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      isVerified: true,
    });
    console.log('Admin user created (admin@irctc.in / admin123)');

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
