import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../utils/api';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await bookingAPI.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund will be processed.')) {
      return;
    }
    try {
      await bookingAPI.cancel(bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) return <div className="loading-page"><i className="fas fa-spinner fa-spin fa-3x"></i><p>Loading bookings...</p></div>;

  return (
    <div className="my-bookings-page container">
      <h2><i className="fas fa-ticket-alt"></i> My Bookings</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-train fa-3x"></i>
          <p>No bookings found.</p>
          <Link to="/" className="btn btn-primary">Book a Train</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className={`booking-card ${booking.status === 'Cancelled' ? 'cancelled' : ''}`}>
              <div className="booking-header">
                <div>
                  <h3>{booking.trainName} ({booking.trainNumber})</h3>
                  <span className={`booking-status status-${booking.status.toLowerCase().replace(' ', '-')}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-pnr">PNR: {booking.pnr}</div>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <i className="fas fa-route"></i>
                  <span>{booking.source} → {booking.destination}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-calendar"></i>
                  <span>{new Date(booking.journeyDate).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-clock"></i>
                  <span>{booking.departureTime} - {booking.arrivalTime}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-chair"></i>
                  <span>{booking.classType}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-users"></i>
                  <span>{booking.passengers.length} Passenger{booking.passengers.length > 1 ? 's' : ''}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-rupee-sign"></i>
                  <span>₹{booking.totalFare}</span>
                </div>
              </div>

              <div className="booking-footer">
                <Link to={`/pnr-status?pnr=${booking.pnr}`} className="btn btn-sm">
                  <i className="fas fa-search"></i> View
                </Link>
                {booking.status === 'Confirmed' && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleCancel(booking._id)}>
                    <i className="fas fa-times"></i> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
