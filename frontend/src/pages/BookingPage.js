import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CLASSES, BERTH_PREFERENCES, GENDERS } from '../utils/constants';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { train, journeyDate, classType } = location.state || {};

  const [passengers, setPassengers] = useState([
    { name: '', age: '', gender: 'Male', berthPreference: 'No Preference' },
  ]);
  const [travelClass, setTravelClass] = useState(classType || train?.classes[0]?.name || '');

  if (!train) {
    navigate('/');
    return null;
  }

  const selectedClass = train.classes.find(c => c.name === travelClass);
  const baseFare = selectedClass?.fare || 0;
  const totalFare = baseFare * passengers.length;

  const addPassenger = () => {
    setPassengers([...passengers, { name: '', age: '', gender: 'Male', berthPreference: 'No Preference' }]);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleProceedToPayment = () => {
    const valid = passengers.every(p => p.name && p.age && p.gender);
    if (!valid) {
      alert('Please fill all passenger details');
      return;
    }
    navigate('/payment', {
      state: {
        train,
        journeyDate,
        classType: travelClass,
        passengers,
        baseFare,
        totalFare,
      },
    });
  };

  const classInfo = CLASSES[travelClass];

  return (
    <div className="booking-page container">
      <h2><i className="fas fa-ticket-alt"></i> Book Tickets</h2>

      <div className="booking-summary">
        <div className="summary-card">
          <div className="summary-train">
            <h3>{train.name}</h3>
            <span className="train-number">{train.number}</span>
          </div>
          <div className="summary-route">
            <div className="summary-point">
              <strong>{train.source}</strong>
              <span>{train.departureTime}</span>
            </div>
            <div className="summary-arrow">
              <i className="fas fa-arrow-right"></i>
              <span>{train.duration}</span>
            </div>
            <div className="summary-point">
              <strong>{train.destination}</strong>
              <span>{train.arrivalTime}</span>
            </div>
          </div>
          <div className="summary-date">
            <i className="fas fa-calendar"></i> {new Date(journeyDate).toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>
        </div>
      </div>

      <div className="booking-form">
        <div className="form-section">
          <h3><i className="fas fa-chair"></i> Select Class</h3>
          <div className="class-selector">
            {train.classes.map((cls) => (
              <button
                key={cls.name}
                className={`class-option ${travelClass === cls.name ? 'active' : ''}`}
                onClick={() => setTravelClass(cls.name)}
                disabled={cls.availableSeats <= 0}
              >
                <span className="class-code">{cls.name}</span>
                <span className="class-desc">{CLASSES[cls.name]?.name}</span>
                <span className="class-price">₹{cls.fare}</span>
                <span className={`class-avail ${cls.availableSeats < 10 ? 'low' : ''}`}>
                  {cls.availableSeats} left
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3><i className="fas fa-users"></i> Passenger Details</h3>
            <button className="btn btn-sm" onClick={addPassenger}>
              <i className="fas fa-plus"></i> Add Passenger
            </button>
          </div>

          {passengers.map((passenger, index) => (
            <div key={index} className="passenger-card">
              <div className="passenger-header">
                <h4>Passenger {index + 1}</h4>
                {passengers.length > 1 && (
                  <button className="btn-remove" onClick={() => removePassenger(index)}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <div className="passenger-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={passenger.name}
                    onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={passenger.age}
                    onChange={(e) => updatePassenger(index, 'age', Number(e.target.value))}
                    placeholder="Age"
                    min="1"
                    max="120"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                  >
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Berth Preference</label>
                  <select
                    value={passenger.berthPreference}
                    onChange={(e) => updatePassenger(index, 'berthPreference', e.target.value)}
                  >
                    {BERTH_PREFERENCES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="booking-footer">
          <div className="fare-summary">
            <span>Base Fare ({passengers.length} passenger{passengers.length > 1 ? 's' : ''})</span>
            <span className="fare-amount">₹{baseFare} × {passengers.length} = ₹{totalFare}</span>
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleProceedToPayment}>
            <i className="fas fa-credit-card"></i> Proceed to Payment - ₹{totalFare}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
