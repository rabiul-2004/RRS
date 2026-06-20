const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Train = require('./models/Train');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    await Train.deleteMany({});
    await User.deleteMany({ role: 'admin' });

    const trains = [
      {
        name: 'Rajdhani Express',
        number: '12301',
        source: 'Howrah Junction',
        destination: 'New Delhi',
        departureTime: '13:05',
        arrivalTime: '09:55',
        duration: '20h 50m',
        distance: 1450,
        classes: [
          { name: '1A', totalSeats: 24, fare: 4755, availableSeats: 24 },
          { name: '2A', totalSeats: 54, fare: 2775, availableSeats: 54 },
          { name: '3A', totalSeats: 64, fare: 1970, availableSeats: 64 },
        ],
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      },
      {
        name: 'Shatabdi Express',
        number: '12001',
        source: 'New Delhi',
        destination: 'Kanpur Central',
        departureTime: '06:00',
        arrivalTime: '10:50',
        duration: '4h 50m',
        distance: 440,
        classes: [
          { name: 'CC', totalSeats: 78, fare: 875, availableSeats: 78 },
          { name: 'EC', totalSeats: 56, fare: 1680, availableSeats: 56 },
        ],
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      },
      {
        name: 'Duronto Express',
        number: '12245',
        source: 'Howrah Junction',
        destination: 'Chennai Central',
        departureTime: '23:40',
        arrivalTime: '04:45',
        duration: '29h 05m',
        distance: 1660,
        classes: [
          { name: 'SL', totalSeats: 72, fare: 690, availableSeats: 72 },
          { name: '3A', totalSeats: 64, fare: 1860, availableSeats: 64 },
          { name: '2A', totalSeats: 46, fare: 2645, availableSeats: 46 },
        ],
        daysOfWeek: [2, 4, 6],
        isActive: true,
      },
      {
        name: 'Garib Rath Express',
        number: '12259',
        source: 'Sealdah',
        destination: 'New Delhi',
        departureTime: '13:55',
        arrivalTime: '06:55',
        duration: '17h 00m',
        distance: 1450,
        classes: [
          { name: '3A', totalSeats: 72, fare: 1260, availableSeats: 72 },
        ],
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      },
      {
        name: 'Kolkata Mail',
        number: '12005',
        source: 'New Delhi',
        destination: 'Howrah Junction',
        departureTime: '21:50',
        arrivalTime: '08:30',
        duration: '10h 40m',
        distance: 1450,
        classes: [
          { name: 'SL', totalSeats: 72, fare: 490, availableSeats: 72 },
          { name: '3A', totalSeats: 64, fare: 1325, availableSeats: 64 },
          { name: '2A', totalSeats: 46, fare: 1850, availableSeats: 46 },
          { name: '1A', totalSeats: 18, fare: 3150, availableSeats: 18 },
        ],
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      },
      {
        name: 'Vande Bharat Express',
        number: '22435',
        source: 'New Delhi',
        destination: 'Varanasi Junction',
        departureTime: '06:00',
        arrivalTime: '13:30',
        duration: '7h 30m',
        distance: 800,
        classes: [
          { name: 'CC', totalSeats: 78, fare: 1420, availableSeats: 78 },
          { name: 'EC', totalSeats: 56, fare: 2625, availableSeats: 56 },
        ],
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      },
      {
        name: 'Chennai Express',
        number: '12631',
        source: 'Chennai Central',
        destination: 'Mumbai CST',
        departureTime: '06:55',
        arrivalTime: '05:20',
        duration: '22h 25m',
        distance: 1280,
        classes: [
          { name: 'SL', totalSeats: 72, fare: 425, availableSeats: 72 },
          { name: '3A', totalSeats: 64, fare: 1140, availableSeats: 64 },
          { name: '2A', totalSeats: 46, fare: 1610, availableSeats: 46 },
        ],
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      },
      {
        name: 'Mumbai Rajdhani',
        number: '12951',
        source: 'Mumbai Central',
        destination: 'New Delhi',
        departureTime: '17:00',
        arrivalTime: '08:35',
        duration: '15h 35m',
        distance: 1380,
        classes: [
          { name: '1A', totalSeats: 24, fare: 4595, availableSeats: 24 },
          { name: '2A', totalSeats: 54, fare: 2645, availableSeats: 54 },
          { name: '3A', totalSeats: 64, fare: 1885, availableSeats: 64 },
        ],
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      },
      {
        name: 'Kerala Express',
        number: '12625',
        source: 'New Delhi',
        destination: 'Thiruvananthapuram Central',
        departureTime: '11:20',
        arrivalTime: '18:35',
        duration: '31h 15m',
        distance: 2935,
        classes: [
          { name: 'SL', totalSeats: 72, fare: 765, availableSeats: 72 },
          { name: '3A', totalSeats: 64, fare: 2025, availableSeats: 64 },
          { name: '2A', totalSeats: 46, fare: 2915, availableSeats: 46 },
        ],
        daysOfWeek: [1, 3, 5],
        isActive: true,
      },
      {
        name: 'Bengaluru Express',
        number: '12609',
        source: 'Chennai Central',
        destination: 'Bengaluru City Junction',
        departureTime: '22:50',
        arrivalTime: '05:40',
        duration: '6h 50m',
        distance: 360,
        classes: [
          { name: 'SL', totalSeats: 72, fare: 165, availableSeats: 72 },
          { name: 'CC', totalSeats: 78, fare: 425, availableSeats: 78 },
          { name: '2S', totalSeats: 108, fare: 95, availableSeats: 108 },
        ],
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      },
    ];

    await Train.insertMany(trains);
    console.log(`${trains.length} trains seeded successfully`);

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
