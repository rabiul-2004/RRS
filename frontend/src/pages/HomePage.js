import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { routeAPI, stationAPI } from '../utils/api';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    class: '',
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const { data } = await stationAPI.getAll();
        setStations(data);
      } catch (_) {}
    };
    fetchStations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.source === formData.destination) {
      setError('Source and destination cannot be the same');
      return;
    }
    setLoading(true);
    try {
      const params = {
        source: formData.source,
        destination: formData.destination,
        date: formData.date,
      };
      if (formData.class) params.class = formData.class;
      const { data } = await routeAPI.search(params);
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search trains');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (result) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    navigate(`/booking/${result.train._id}`, {
      state: {
        routeId: result.routeId,
        train: result.train,
        boardingStop: result.boardingStop,
        deboardingStop: result.deboardingStop,
        journeyDuration: result.journeyDuration,
        journeyDistance: result.journeyDistance,
        journeyDate: formData.date,
        classType: formData.class || result.train.classes[0]?.name,
      },
    });
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Indian Railway Reservation System</h1>
            <p>Book train tickets with ease — IRCTC Official Partner</p>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="container">
          <div className="search-card">
            <h2><i className="fas fa-search"></i> Search Trains</h2>
            <form onSubmit={handleSearch}>
              <div className="search-grid">
                <div className="form-group">
                  <label><i className="fas fa-circle-dot"></i> From</label>
                  <input list="src-list" name="source" value={formData.source}
                    onChange={handleChange} placeholder="Enter source station" required />
                  <datalist id="src-list">
                    {stations.map(s => <option key={s._id} value={s.name} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label><i className="fas fa-location-dot"></i> To</label>
                  <input list="dst-list" name="destination" value={formData.destination}
                    onChange={handleChange} placeholder="Enter destination station" required />
                  <datalist id="dst-list">
                    {stations.map(s => <option key={s._id} value={s.name} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label><i className="fas fa-calendar"></i> Date</label>
                  <input type="date" name="date" value={formData.date}
                    onChange={handleChange} min={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-chair"></i> Class</label>
                  <select name="class" value={formData.class} onChange={handleChange}>
                    <option value="">All Classes</option>
                    <option value="SL">Sleeper (SL)</option>
                    <option value="3A">AC 3 Tier (3A)</option>
                    <option value="2A">AC 2 Tier (2A)</option>
                    <option value="1A">AC First Class (1A)</option>
                    <option value="CC">AC Chair Car (CC)</option>
                    <option value="EC">Executive Chair Car (EC)</option>
                    <option value="2S">Second Sitting (2S)</option>
                    <option value="FC">First Class (FC)</option>
                  </select>
                </div>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                {' '}Search Trains
              </button>
            </form>
          </div>
        </div>
      </div>

      {searched && (
        <div className="train-results container">
          <h3>
            <i className="fas fa-train"></i> Trains from {formData.source} to {formData.destination}
            <span className="result-count"> ({results.length} found)</span>
          </h3>

          {results.length === 0 ? (
            <div className="no-trains">
              <i className="fas fa-train fa-3x"></i>
              <p>No trains found for this route. Try different stations or date.</p>
            </div>
          ) : (
            <div className="train-list">
              {results.map((r, idx) => {
                const train = r.train;
                const board = r.boardingStop;
                const deboard = r.deboardingStop;
                return (
                  <div key={idx} className="train-card">
                    <div className="train-header">
                      <div className="train-info">
                        <h4>{train.name}</h4>
                        <span className="train-number">{train.number}</span>
                      </div>
                    </div>

                    <div className="train-route">
                      <div className="route-point">
                        <div className="time">{board.departureTime}</div>
                        <div className="station">{board.station.name} ({board.station.code})</div>
                        <div className="station-detail">Day {board.dayNumber}</div>
                      </div>
                      <div className="route-line">
                        <div className="line"></div>
                        <i className="fas fa-train"></i>
                        <div className="line"></div>
                        <span className="duration">{r.journeyDuration}</span>
                      </div>
                      <div className="route-point">
                        <div className="time">{deboard.arrivalTime}</div>
                        <div className="station">{deboard.station.name} ({deboard.station.code})</div>
                        <div className="station-detail">Day {deboard.dayNumber}</div>
                      </div>
                    </div>

                    <div className="train-classes">
                      {train.classes.map((cls) => (
                        <div key={cls.name} className="class-item">
                          <span className="class-name">{cls.name}</span>
                          <span className="class-fare">₹{cls.fare}</span>
                          <span className={`class-seats ${cls.availableSeats < 10 ? 'low' : ''}`}>
                            {cls.availableSeats} seats
                          </span>
                        </div>
                      ))}
                    </div>

                    <button className="btn btn-primary" onClick={() => handleBookNow(r)}>
                      <i className="fas fa-ticket"></i> Book Now
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="features-section container">
        <h2>Why Choose IRCTC?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-shield-alt"></i>
            <h3>Secure Booking</h3>
            <p>100% secure payment gateway with encrypted transactions</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-clock"></i>
            <h3>Instant Confirmation</h3>
            <p>Get instant PNR confirmation after booking</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-headset"></i>
            <h3>24/7 Support</h3>
            <p>Round the clock customer support for all queries</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-exchange-alt"></i>
            <h3>Easy Cancellation</h3>
            <p>Cancel tickets online with instant refund</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
