import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};

  if (!booking) {
    navigate('/');
    return null;
  }

  return (
    <div className="confirmation-page container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <i className="fas fa-check-circle"></i>
          <h2>Booking Confirmed!</h2>
          <p>Your tickets have been booked successfully.</p>
        </div>

        <div className="pnr-section">
          <h3>PNR Number</h3>
          <div className="pnr-number">{booking.pnr}</div>
        </div>

        <div className="confirmation-details">
          <div className="detail-row">
            <span>Train</span>
            <strong>{booking.trainName} ({booking.trainNumber})</strong>
          </div>
          <div className="detail-row">
            <span>Route</span>
            <strong>{booking.source} → {booking.destination}</strong>
          </div>
          <div className="detail-row">
            <span>Date</span>
            <strong>{new Date(booking.journeyDate).toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}</strong>
          </div>
          <div className="detail-row">
            <span>Time</span>
            <strong>{booking.departureTime} - {booking.arrivalTime}</strong>
          </div>
          <div className="detail-row">
            <span>Class</span>
            <strong>{booking.classType}</strong>
          </div>
          <div className="detail-row">
            <span>Passengers</span>
            <strong>{booking.passengers.length}</strong>
          </div>
          <div className="detail-row">
            <span>Total Fare</span>
            <strong className="fare">₹{booking.totalFare}</strong>
          </div>
          <div className="detail-row">
            <span>Status</span>
            <strong className="status-confirmed">{booking.status}</strong>
          </div>
        </div>

        <div className="passenger-details">
          <h3>Passenger Details</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Coach</th>
                <th>Seat</th>
                <th>Berth</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {booking.passengers.map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td><strong>{p.coachNumber}</strong></td>
                  <td><strong>{p.seatNumber}</strong></td>
                  <td>{p.berthAllocation || p.berthPreference}</td>
                  <td><span className="status-confirmed">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="confirmation-actions">
          <Link to="/my-bookings" className="btn btn-primary">
            <i className="fas fa-ticket-alt"></i> My Bookings
          </Link>
          <Link to="/" className="btn btn-outline">
            <i className="fas fa-home"></i> Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
