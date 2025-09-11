import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  getOrganizations: () => api.get('/auth/organizations'),
  registerDoctor: (doctorData) => api.post('/auth/register-doctor', doctorData),
};

// Users API calls
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Doctors API calls
export const doctorsAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getAppointments: (id, params) => api.get(`/doctors/${id}/appointments`, { params }),
  create: (doctorData) => api.post('/doctors', doctorData),
  update: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
  delete: (id) => api.delete(`/doctors/${id}`),
  approve: (id) => api.put(`/doctors/approve/${id}`),
  reject: (id, reason) => api.put(`/doctors/reject/${id}`, { rejection_reason: reason }),
};

// Patients API calls
export const patientsAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (patientData) => api.post('/patients', patientData),
  update: (id, patientData) => api.put(`/patients/${id}`, patientData),
  delete: (id) => api.delete(`/patients/${id}`),
};

// Appointments API calls
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (appointmentData) => api.post('/appointments', appointmentData),
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  cancel: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  complete: (id, notes) => api.put(`/appointments/${id}/complete`, { notes }),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// Doctor Time Slots API calls
export const timeSlotsAPI = {
  getAll: (params) => api.get('/doctor-time-slots', { params }),
  getAvailable: (params) => api.get('/doctor-time-slots/available', { params }),
  getByDoctor: (doctorId, params) => api.get('/doctor-time-slots', { params: { doctor_id: doctorId, ...params } }),
  create: (slotData) => api.post('/doctor-time-slots', slotData),
  bulkCreate: (scheduleData) => api.post('/doctor-time-slots/bulk', scheduleData),
  update: (id, slotData) => api.put(`/doctor-time-slots/${id}`, slotData),
  delete: (id) => api.delete(`/doctor-time-slots/${id}`),
};

// Payments API calls
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (paymentData) => api.post('/payments', paymentData),
  update: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
  delete: (id) => api.delete(`/payments/${id}`),
};

// Invoices API calls
export const invoicesAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (invoiceData) => api.post('/invoices', invoiceData),
  update: (id, invoiceData) => api.put(`/invoices/${id}`, invoiceData),
  delete: (id) => api.delete(`/invoices/${id}`),
  getItems: (invoiceId) => api.get(`/invoices/${invoiceId}/items`),
  addItem: (invoiceId, itemData) => api.post(`/invoices/${invoiceId}/items`, itemData),
};

// Notifications API calls
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (notificationData) => api.post('/notifications', notificationData),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Analytics API calls
export const analyticsAPI = {
  // Admin-wide analytics endpoints (system-wide data)
  getDashboardStats: (params) => api.get('/analytics/dashboard-stats', { params }),
  getRevenueTrends: (params) => api.get('/analytics/revenue-trends', { params }),
  getAppointmentStats: (params) => api.get('/analytics/appointment-trends', { params }),
  getDoctorPerformance: (params) => api.get('/analytics/doctor-performance', { params }),
  getPatientDemographics: (params) => api.get('/analytics/patient-demographics', { params }),

  // Doctor-specific analytics endpoints (require doctor ID)
  getDoctorDashboard: (params) => api.get('/analytics/dashboard', { params }),
  getDoctorRevenueStats: (params) => api.get('/analytics/revenue-stats', { params }),
  getDoctorRevenue: (params) => api.get('/analytics/revenue', { params }),
};

// Roles API calls
export const rolesAPI = {
  getAll: (params) => api.get('/roles', { params }),
  getById: (id) => api.get(`/roles/${id}`),
  create: (roleData) => api.post('/roles', roleData),
  update: (id, roleData) => api.put(`/roles/${id}`, roleData),
  delete: (id) => api.delete(`/roles/${id}`),
  getPermissions: () => api.get('/roles/permissions'),
};

// Company API calls
export const companyAPI = {
  register: (companyData) => api.post('/company/register', companyData),
  getBySlug: (slug) => api.get(`/company/${slug}`),
  checkSlugAvailability: (slug) => api.get(`/company/check-slug/${slug}`),
};

export default api;
