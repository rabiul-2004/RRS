import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookingAPI } from '../utils/api';

const PNRStatusPage = () => {
  const [searchParams] = useSearchParams();
  const [pnr, setPnr] = useState(searchParams.get('pnr') || '');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('pnr')) {
      handleSearch(searchParams.get('pnr'));
    }
  }, [searchParams]);

  const handleSearch = async (pnrValue) => {
    const pnrToSearch = pnrValue || pnr;
    if (!pnrToSearch || pnrToSearch.length < 8) {
      setError('Please enter a valid PNR number');
      return;
    }
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      const { data } = await bookingAPI.getByPNR(pnrToSearch);
      setBooking(data);
    } catch (err) {
      setError(err.response?.data?.message || 'PNR not found. Please check the number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pnr-page container">
      <h2><i className="fas fa-search"></i> PNR Status</h2>

      <div className="pnr-search-card">
        <div className="form-group">
          <label>Enter 10-digit PNR Number</label>
          <div className="pnr-input-group">
            <input
              type="text"
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              placeholder="e.g. ABC1234567"
              maxLength="10"
            />
            <button className="btn btn-primary" onClick={() => handleSearch()} disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
              {' '}Search
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {booking && (
        <div className="pnr-result-card">
          <div className="pnr-header">
            <h3>PNR: {booking.pnr}</h3>
            <span className={`booking-status status-${booking.status.toLowerCase().replace(' ', '-')}`}>
              {booking.status}
            </span>
          </div>

          <div className="pnr-details">
            <div className="detail-grid">
              <div className="detail-item"><label>Train</label><span>{booking.trainName} ({booking.trainNumber})</span></div>
              <div className="detail-item"><label>Route</label><span>{booking.source} → {booking.destination}</span></div>
              <div className="detail-item"><label>Date</label><span>{new Date(booking.journeyDate).toLocaleDateString('en-IN')}</span></div>
              <div className="detail-item"><label>Departure</label><span>{booking.departureTime}</span></div>
              <div className="detail-item"><label>Arrival</label><span>{booking.arrivalTime}</span></div>
              <div className="detail-item"><label>Class</label><span>{booking.classType}</span></div>
              <div className="detail-item"><label>Total Fare</label><span>₹{booking.totalFare}</span></div>
              <div className="detail-item"><label>Payment</label><span>{booking.paymentStatus}</span></div>
            </div>
          </div>

          <div className="pnr-passengers">
            <h4>Passenger Details</h4>
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
                      <td><span className={`status-${p.status.toLowerCase()}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PNRStatusPage;
