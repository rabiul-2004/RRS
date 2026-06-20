import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trainAPI, stationAPI, routeAPI, bookingAPI } from '../utils/api';
import { SEATS_PER_COACH } from '../utils/constants';

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trains');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [isAdmin, navigate]);

  return (
    <div className="admin-page container">
      <h2><i className="fas fa-cog"></i> Admin Panel</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="admin-tabs">
        <button className={`tab ${activeTab === 'trains' ? 'active' : ''}`} onClick={() => setActiveTab('trains')}>
          <i className="fas fa-train"></i> Trains
        </button>
        <button className={`tab ${activeTab === 'stations' ? 'active' : ''}`} onClick={() => setActiveTab('stations')}>
          <i className="fas fa-building"></i> Stations
        </button>
        <button className={`tab ${activeTab === 'routes' ? 'active' : ''}`} onClick={() => setActiveTab('routes')}>
          <i className="fas fa-route"></i> Routes
        </button>
        <button className={`tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <i className="fas fa-ticket-alt"></i> Bookings
        </button>
      </div>
      {activeTab === 'trains' && <TrainsTab setMessage={setMessage} setError={setError} />}
      {activeTab === 'stations' && <StationsTab setMessage={setMessage} setError={setError} />}
      {activeTab === 'routes' && <RoutesTab setMessage={setMessage} setError={setError} />}
      {activeTab === 'bookings' && <BookingsTab setMessage={setMessage} setError={setError} />}
    </div>
  );
};

const TrainsTab = ({ setMessage, setError }) => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [formData, setFormData] = useState({
    name: '', number: '',
    classes: [{ name: 'SL', numCoaches: 1, fare: 250 }],
  });

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const { data } = await trainAPI.getAll();
      setTrains(data);
    } catch (_) { setError('Failed to fetch trains'); }
    setLoading(false);
  };

  useEffect(() => { fetchTrains(); }, []);

  const resetForm = () => {
    setFormData({ name: '', number: '', classes: [{ name: 'SL', numCoaches: 1, fare: 250 }] });
    setEditingTrain(null);
    setShowForm(false);
  };

  const handleEdit = (train) => {
    setEditingTrain(train);
    setFormData({
      name: train.name,
      number: train.number,
      classes: train.classes,
    });
    setShowForm(true);
  };

  const handleClassChange = (index, field, value) => {
    const updatedClasses = [...formData.classes];
    updatedClasses[index] = { ...updatedClasses[index], [field]: field === 'name' ? value : Number(value) };
    setFormData(prev => ({ ...prev, classes: updatedClasses }));
  };

  const addClass = () => {
    setFormData(prev => ({
      ...prev,
      classes: [...prev.classes, { name: '3A', numCoaches: 1, fare: 500 }],
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
      fetchTrains();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save train');
    }
    setLoading(false);
  };

  const handleDelete = async (trainId) => {
    if (!window.confirm('Are you sure you want to delete this train?')) return;
    try {
      await trainAPI.delete(trainId);
      setMessage('Train deleted successfully');
      fetchTrains();
    } catch (_) { setError('Failed to delete train'); }
  };

  if (loading && trains.length === 0) {
    return <div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading...</div>;
  }

  return (
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
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Train Number</label>
                <input type="text" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} required disabled={!!editingTrain} />
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <label>Classes</label>
                <button type="button" className="btn btn-sm" onClick={addClass}>
                  <i className="fas fa-plus"></i> Add Class
                </button>
              </div>
              {formData.classes.map((cls, index) => (
                <div key={index} className="class-form-row">
                  <select value={cls.name} onChange={e => handleClassChange(index, 'name', e.target.value)}>
                    <option value="SL">Sleeper</option>
                    <option value="3A">AC 3 Tier</option>
                    <option value="2A">AC 2 Tier</option>
                    <option value="1A">AC First Class</option>
                    <option value="CC">AC Chair Car</option>
                    <option value="EC">Executive Chair Car</option>
                    <option value="2S">Second Sitting</option>
                    <option value="FC">First Class</option>
                  </select>
                  <input type="number" placeholder="Coaches" value={cls.numCoaches} min="1"
                    onChange={e => handleClassChange(index, 'numCoaches', e.target.value)} />
                  <input type="number" placeholder="Fare" value={cls.fare}
                    onChange={e => handleClassChange(index, 'fare', e.target.value)} />
                  <span className="class-summary">
                    {SEATS_PER_COACH[cls.name] * (cls.numCoaches || 0)} seats
                  </span>
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
              <th>Classes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trains.map((train, idx) => (
              <tr key={train._id}>
                <td>{idx + 1}</td>
                <td><strong>{train.number}</strong></td>
                <td>{train.name}</td>
                <td>{train.classes.map(c => `${c.name}(${c.fare})`).join(', ')}</td>
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
  );
};

const StationsTab = ({ setMessage, setError }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', city: '' });

  const fetchStations = async () => {
    setLoading(true);
    try {
      const { data } = await stationAPI.getAll();
      setStations(data);
    } catch (_) { setError('Failed to fetch stations'); }
    setLoading(false);
  };

  useEffect(() => { fetchStations(); }, []);

  const resetForm = () => {
    setFormData({ name: '', code: '', city: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (s) => {
    setEditing(s);
    setFormData({ name: s.name, code: s.code, city: s.city || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); setMessage('');
    try {
      if (editing) {
        await stationAPI.update(editing._id, formData);
        setMessage('Station updated successfully');
      } else {
        await stationAPI.create(formData);
        setMessage('Station added successfully');
      }
      resetForm();
      fetchStations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save station');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this station?')) return;
    try {
      await stationAPI.delete(id);
      setMessage('Station deleted');
      fetchStations();
    } catch (_) { setError('Failed to delete station'); }
  };

  return (
    <div className="admin-stations">
      <div className="section-header">
        <h3>All Stations ({stations.length})</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i> {showForm ? 'Close' : 'Add Station'}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? 'Edit Station' : 'Add Station'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Station Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required disabled={!!editing} maxLength="4" />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                {' '}{editing ? 'Update' : 'Add'}
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
              <th>Code</th>
              <th>Name</th>
              <th>City</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((s, idx) => (
              <tr key={s._id}>
                <td>{idx + 1}</td>
                <td><strong>{s.code}</strong></td>
                <td>{s.name}</td>
                <td>{s.city || '—'}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => handleEdit(s)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s._id)}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RoutesTab = ({ setMessage, setError }) => {
  const [routes, setRoutes] = useState([]);
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    trainId: '',
    daysOfWeek: [],
    stops: [{ stationId: '', stopOrder: 0, departureTime: '', arrivalTime: '', dayNumber: 1, distance: 0, platform: '' }],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r, t, s] = await Promise.all([
        routeAPI.getAll(),
        trainAPI.getAll(),
        stationAPI.getAll(),
      ]);
      setRoutes(r.data);
      setTrains(t.data);
      setStations(s.data);
    } catch (_) { setError('Failed to fetch data'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setFormData({
      trainId: '',
      daysOfWeek: [],
      stops: [{ stationId: '', stopOrder: 0, departureTime: '', arrivalTime: '', dayNumber: 1, distance: 0, platform: '' }],
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (route) => {
    setEditing(route);
    setFormData({
      trainId: route.train._id,
      daysOfWeek: route.daysOfWeek,
      stops: route.stops.map(s => ({
        stationId: s.station._id,
        stopOrder: s.stopOrder,
        departureTime: s.departureTime,
        arrivalTime: s.arrivalTime,
        dayNumber: s.dayNumber,
        distance: s.distance,
        platform: s.platform || '',
      })),
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

  const handleStopChange = (index, field, value) => {
    const updatedStops = [...formData.stops];
    updatedStops[index] = { ...updatedStops[index], [field]: value };
    setFormData(prev => ({ ...prev, stops: updatedStops }));
  };

  const addStop = () => {
    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, { stationId: '', stopOrder: prev.stops.length, departureTime: '', arrivalTime: '', dayNumber: 1, distance: 0, platform: '' }],
    }));
  };

  const removeStop = (index) => {
    if (formData.stops.length > 1) {
      setFormData(prev => ({
        ...prev,
        stops: prev.stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, stopOrder: i })),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); setMessage('');
    try {
      const payload = {
        train: formData.trainId,
        daysOfWeek: formData.daysOfWeek,
        stops: formData.stops,
      };
      if (editing) {
        await routeAPI.update(editing._id, payload);
        setMessage('Route updated successfully');
      } else {
        await routeAPI.create(payload);
        setMessage('Route created successfully');
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save route');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route?')) return;
    try {
      await routeAPI.delete(id);
      setMessage('Route deleted');
      fetchData();
    } catch (_) { setError('Failed to delete route'); }
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="admin-routes">
      <div className="section-header">
        <h3>All Routes ({routes.length})</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i> {showForm ? 'Close' : 'Add Route'}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editing ? 'Edit Route' : 'Create Route'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Train</label>
                <select value={formData.trainId} onChange={e => setFormData({ ...formData, trainId: e.target.value })} required>
                  <option value="">Select train</option>
                  {trains.map(t => <option key={t._id} value={t._id}>{t.name} ({t.number})</option>)}
                </select>
              </div>
            </div>

            <div className="form-section">
              <label>Operating Days</label>
              <div className="days-selector">
                {days.map((day, i) => (
                  <button type="button" key={i}
                    className={`day-btn ${formData.daysOfWeek.includes(i) ? 'active' : ''}`}
                    onClick={() => handleDayToggle(i)}>{day}</button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <label>Stops</label>
                <button type="button" className="btn btn-sm" onClick={addStop}><i className="fas fa-plus"></i> Add Stop</button>
              </div>
              {formData.stops.map((stop, idx) => (
                <div key={idx} className="stop-form-row">
                  <span className="stop-order">{idx + 1}.</span>
                  <select value={stop.stationId} onChange={e => handleStopChange(idx, 'stationId', e.target.value)} required>
                    <option value="">Station</option>
                    {stations.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                  </select>
                  <input type="time" value={stop.arrivalTime} onChange={e => handleStopChange(idx, 'arrivalTime', e.target.value)} placeholder="Arr" />
                  <input type="time" value={stop.departureTime} onChange={e => handleStopChange(idx, 'departureTime', e.target.value)} placeholder="Dep" />
                  <input type="number" value={stop.dayNumber} min="1" max="7" onChange={e => handleStopChange(idx, 'dayNumber', Number(e.target.value))} placeholder="Day" className="sm-input" />
                  <input type="number" value={stop.distance} min="0" onChange={e => handleStopChange(idx, 'distance', Number(e.target.value))} placeholder="Dist" className="sm-input" />
                  <input type="text" value={stop.platform} onChange={e => handleStopChange(idx, 'platform', e.target.value)} placeholder="PF" className="sm-input" />
                  <button type="button" className="btn-remove" onClick={() => removeStop(idx)} disabled={formData.stops.length <= 1}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                {' '}{editing ? 'Update Route' : 'Create Route'}
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
              <th>Train</th>
              <th>Stops</th>
              <th>Days</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route._id}>
                <td>{route.train?.name} ({route.train?.number})</td>
                <td>
                  {route.stops.map((s, i) => (
                    <span key={s._id}>
                      {s.station?.code || '?'}{i < route.stops.length - 1 ? ' → ' : ''}
                    </span>
                  ))}
                </td>
                <td>{route.daysOfWeek.map(d => days[d]).join(', ') || '—'}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => handleEdit(route)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(route._id)}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BookingsTab = ({ setMessage, setError }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.getAllBookings();
      setBookings(data);
    } catch (_) { setError('Failed to fetch bookings'); }
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  return (
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
            {bookings.map(booking => (
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
  );
};

export default AdminPage;
