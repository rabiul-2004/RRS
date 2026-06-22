# Railway Reservation System (IRCTC Clone)

A full-stack MERN application simulating Indian Railway's e-ticketing system with route-based train search, coach-wise seat allocation, and PNR status tracking.

## Features

- **Route-based search** — Find trains between stations via intermediate stop matching
- **Coach + seat allocation** — Seat numbers assigned per passenger (e.g. S1, S2, B1...)
- **Proportional fare** — Fare calculated as `(journey distance / total route distance) × base fare`
- **Auto duration** — Journey duration computed from arrival/departure times
- **PNR status** — Track bookings with a unique 10-character PNR
- **Admin panel** — Manage trains, stations, routes, and view all bookings
- **IRCTC-themed UI** — Blue/orange theme, responsive design

## Tech Stack

| Layer    | Technology                |
| -------- | ------------------------- |
| Frontend | React 18, React Router 6  |
| Backend  | Node.js, Express          |
| Database | MongoDB + Mongoose        |
| Auth     | JWT (JSON Web Tokens)     |

## Prerequisites

- Node.js >= 16
- MongoDB (local or Atlas)

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd RRS
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rrs
JWT_SECRET=your_jwt_secret_here
```

Seed the database and start the server:

```bash
node seed.js
node server.js
```

### 3. Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000`.

## Default Admin Login

| Email             | Password  |
| ----------------- | --------- |
| admin@irctc.in    | admin123  |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — Get profile (auth required)

### Trains
- `GET /api/trains` — List active trains
- `GET /api/trains/:id` — Get train by ID
- `POST /api/trains` — Create train (admin)
- `PUT /api/trains/:id` — Update train (admin)
- `DELETE /api/trains/:id` — Delete train (admin)

### Stations
- `GET /api/stations` — List active stations
- `POST /api/stations` — Create station (admin)
- `PUT /api/stations/:id` — Update station (admin)
- `DELETE /api/stations/:id` — Delete station (admin)

### Routes
- `GET /api/routes/search?source=&destination=&date=&class=` — Search routes
- `GET /api/routes` — List all routes (admin)
- `GET /api/routes/:id` — Get route by ID
- `POST /api/routes` — Create route (admin)
- `PUT /api/routes/:id` — Update route (admin)
- `DELETE /api/routes/:id` — Delete route (admin)

### Bookings
- `POST /api/bookings/create` — Create booking (auth required)
- `GET /api/bookings/my-bookings` — User's bookings
- `GET /api/bookings/pnr/:pnr` — Lookup by PNR
- `PUT /api/bookings/cancel/:id` — Cancel booking
- `GET /api/bookings/admin/all` — All bookings (admin)

## Project Structure

```
RRS/
├── backend/
│   ├── config/          # DB connection
│   ├── middleware/       # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route handlers
│   ├── utils/           # Helpers (PNR, duration, constants)
│   ├── server.js        # Entry point
│   └── seed.js          # Database seeder
└── frontend/
    ├── src/
    │   ├── context/     # AuthContext
    │   ├── pages/       # All page components
    │   ├── utils/       # API client, constants
    │   ├── App.js       # Routes
    │   └── App.css      # Global styles
    └── package.json
```

## Train Classes

| Code | Class               | Seats/Coach | Coach Prefix |
| ---- | ------------------- | ----------- | ------------ |
| SL   | Sleeper             | 80          | S            |
| 3A   | AC 3 Tier           | 80          | B            |
| 2A   | AC 2 Tier           | 60          | A            |
| 1A   | AC First Class      | 40          | H            |
| CC   | AC Chair Car        | 78          | C            |
| EC   | Executive Chair Car | 56          | E            |
| 2S   | Second Sitting      | 108         | D            |
| FC   | First Class         | 50          | F            |
