import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const trainAPI = {
  search: (params) => api.get('/trains/search', { params }),
  getAll: () => api.get('/trains/all'),
  getById: (id) => api.get(`/trains/${id}`),
  getStations: () => api.get('/trains/stations'),
  create: (data) => api.post('/trains', data),
  update: (id, data) => api.put(`/trains/${id}`, data),
  delete: (id) => api.delete(`/trains/${id}`),
};

export const bookingAPI = {
  create: (data) => api.post('/bookings/create', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getByPNR: (pnr) => api.get(`/bookings/pnr/${pnr}`),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/cancel/${id}`),
  getAllBookings: () => api.get('/bookings/admin/all'),
};

export default api;
