import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trainAPI, bookingAPI } from '../utils/api';

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trains');
  const [trains, setTrains] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [formData, setFormData] = useState({
    name: '', number: '', source: '', destination: '',
    departureTime: '', arrivalTime: '', duration: '', distance: '',
    daysOfWeek: [],
    classes: [
      { name: 'SL', totalSeats: 72, fare: 250, availableSeats: 72 },
    ],
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trainsRes, bookingsRes] = await Promise.all([
        trainAPI.getAll(),
        bookingAPI.getAllBookings(),
      ]);
      setTrains(trainsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', number: '', source: '', destination: '',
      departureTime: '', arrivalTime: '', duration: '', distance: '',
      daysOfWeek: [],
      classes: [{ name: 'SL', totalSeats: 72, fare: 250, availableSeats: 72 }],
    });
    setEditingTrain(null);
    setShowForm(false);
  };

  const handleEdit = (train) => {
    setEditingTrain(train);
    setFormData({
      name: train.name,
      number: train.number,
      source: train.source,
      destination: train.destination,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      duration: train.duration,
      distance: train.distance,
      daysOfWeek: train.daysOfWeek,
      classes: train.classes,
    });
    setShowForm(true);
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const handleClassChange = (index, field, value) => {
    const updatedClasses = [...formData.classes];
    updatedClasses[index] = { ...updatedClasses[index], [field]: field === 'name' ? value : Number(value) };
    if (field === 'totalSeats' && !editingTrain) {
      updatedClasses[index].availableSeats = Number(value);
    }
    setFormData(prev => ({ ...prev, classes: updatedClasses }));
  };

  const addClass = () => {
    setFormData(prev => ({
      ...prev,
      classes: [...prev.classes, { name: '3A', totalSeats: 64, fare: 500, availableSeats: 64 }],
    }));
  };

  const removeClass = (index) => {
    if (formData.classes.length > 1) {
      setFormData(prev => ({
        ...prev,
        classes: prev.classes.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (editingTrain) {
        await trainAPI.update(editingTrain._id, formData);
        setMessage('Train updated successfully');
      } else {
        await trainAPI.create(formData);
        setMessage('Train added successfully');
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save train');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trainId) => {
    if (!window.confirm('Are you sure you want to delete this train?')) return;
    try {
      await trainAPI.delete(trainId);
      setMessage('Train deleted successfully');
      fetchData();
    } catch (err) {
      setError('Failed to delete train');
    }
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading && trains.length === 0) {
    return <div className="loading-page"><i className="fas fa-spinner fa-spin fa-3x"></i><p>Loading admin panel...</p></div>;
  }

  return (
    <div className="admin-page container">
      <h2><i className="fas fa-cog"></i> Admin Panel</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-tabs">
        <button className={`tab ${activeTab === 'trains' ? 'active' : ''}`} onClick={() => setActiveTab('trains')}>
          <i className="fas fa-train"></i> Manage Trains
        </button>
        <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <i className="fas fa-ticket-alt"></i> All Bookings
        </button>
      </div>

      {activeTab === 'trains' && (
        <div className="admin-trains">
          <div className="section-header">
            <h3>All Trains ({trains.length})</h3>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
              {' '}{showForm ? 'Close' : 'Add Train'}
            </button>
          </div>

          {showForm && (
            <div className="admin-form-card">
              <h3>{editingTrain ? 'Edit Train' : 'Add New Train'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Train Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Train Number</label>
                    <input type="text" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} required disabled={!!editingTrain} />
                  </div>
                  <div className="form-group">
                    <label>Source</label>
                    <input type="text" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Destination</label>
                    <input type="text" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Departure Time</label>
                    <input type="time" value={formData.departureTime} onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Arrival Time</label>
                    <input type="time" value={formData.arrivalTime} onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 12h 30m" required />
                  </div>
                  <div className="form-group">
                    <label>Distance (km)</label>
                    <input type="number" value={formData.distance} onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })} required />
                  </div>
                </div>

                <div className="form-section">
                  <label>Operating Days</label>
                  <div className="days-selector">
                    {days.map((day, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`day-btn ${formData.daysOfWeek.includes(i) ? 'active' : ''}`}
                        onClick={() => handleDayToggle(i)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <label>Classes & Fares</label>
                    <button type="button" className="btn btn-sm" onClick={addClass}>
                      <i className="fas fa-plus"></i> Add Class
                    </button>
                  </div>
                  {formData.classes.map((cls, index) => (
                    <div key={index} className="class-form-row">
                      <select value={cls.name} onChange={(e) => handleClassChange(index, 'name', e.target.value)}>
                        <option value="SL">Sleeper</option>
                        <option value="3A">AC 3 Tier</option>
                        <option value="2A">AC 2 Tier</option>
                        <option value="1A">AC First Class</option>
                        <option value="CC">AC Chair Car</option>
                        <option value="EC">Executive Chair Car</option>
                        <option value="2S">Second Sitting</option>
                        <option value="FC">First Class</option>
                      </select>
                      <input type="number" placeholder="Total Seats" value={cls.totalSeats}
                        onChange={(e) => handleClassChange(index, 'totalSeats', e.target.value)} />
                      <input type="number" placeholder="Fare (₹)" value={cls.fare}
                        onChange={(e) => handleClassChange(index, 'fare', e.target.value)} />
                      <input type="number" placeholder="Available" value={cls.availableSeats}
                        onChange={(e) => handleClassChange(index, 'availableSeats', e.target.value)} />
                      <button type="button" className="btn-remove" onClick={() => removeClass(index)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                    {' '}{editingTrain ? 'Update Train' : 'Add Train'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Number</th>
                  <th>Name</th>
                  <th>Route</th>
                  <th>Time</th>
                  <th>Classes</th>
                  <th>Days</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trains.map((train, idx) => (
                  <tr key={train._id}>
                    <td>{idx + 1}</td>
                    <td><strong>{train.number}</strong></td>
                    <td>{train.name}</td>
                    <td>{train.source} → {train.destination}</td>
                    <td>{train.departureTime} - {train.arrivalTime}</td>
                    <td>{train.classes.map(c => `${c.name}(${c.fare})`).join(', ')}</td>
                    <td>{train.daysOfWeek.map(d => days[d]).join(', ')}</td>
                    <td className="actions">
                      <button className="btn btn-sm" onClick={() => handleEdit(train)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(train._id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="admin-bookings">
          <h3>All Bookings ({bookings.length})</h3>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PNR</th>
                  <th>User</th>
                  <th>Train</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Fare</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td><strong>{booking.pnr}</strong></td>
                    <td>{booking.user?.name || 'N/A'}</td>
                    <td>{booking.trainName} ({booking.trainNumber})</td>
                    <td>{booking.source} → {booking.destination}</td>
                    <td>{new Date(booking.journeyDate).toLocaleDateString('en-IN')}</td>
                    <td>₹{booking.totalFare}</td>
                    <td>
                      <span className={`booking-status status-${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
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

export default AdminPage;
