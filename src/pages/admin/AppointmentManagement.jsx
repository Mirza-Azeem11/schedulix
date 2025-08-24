import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { fetchAppointments } from '../../../slices/appointmentSlice';
import { appointmentsAPI } from '../../services/api';
import AddEditAppointmentModal from './AddEditAppointmentModal';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Stethoscope
} from 'lucide-react';

const AppointmentManagement = () => {
  const dispatch = useAppDispatch();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentsAPI.getAll();
      console.log("API response:", response.data);

      let data = [];

      // ✅ Correct extraction
      if (Array.isArray(response.data?.data?.appointments)) {
        data = response.data.data.appointments;
      } else if (Array.isArray(response.data?.data)) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else {
        data = [];
      }

      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Failed to load appointments. Please try again.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };


  const filteredAppointments = Array.isArray(appointments)
      ? appointments.filter((appointment) => {
        const matchesSearch =
            appointment.Patient?.User?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.Patient?.User?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.Doctor?.User?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.Doctor?.User?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.appointment_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || appointment.status?.toLowerCase() === statusFilter;

        let matchesDate = true;
        if (dateFilter !== 'all') {
          const appointmentDate = new Date(appointment.appointment_date);
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);

          switch (dateFilter) {
            case 'today':
              matchesDate = appointmentDate.toDateString() === today.toDateString();
              break;
            case 'tomorrow':
              matchesDate = appointmentDate.toDateString() === tomorrow.toDateString();
              break;
            case 'week':
              matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow;
              break;
            case 'past':
              matchesDate = appointmentDate < today;
              break;
            default:
              matchesDate = true;
          }
        }

        return matchesSearch && matchesStatus && matchesDate;
      })
      : [];

  const stats = {
    total: Array.isArray(appointments) ? appointments.length : 0,
    scheduled: Array.isArray(appointments) ? appointments.filter((a) => a.status === 'Scheduled').length : 0,
    completed: Array.isArray(appointments) ? appointments.filter((a) => a.status === 'Completed').length : 0,
    cancelled: Array.isArray(appointments) ? appointments.filter((a) => a.status === 'Cancelled').length : 0,
    today: Array.isArray(appointments)
        ? appointments.filter((a) => {
          const appointmentDate = new Date(a.appointment_date);
          const today = new Date();
          return appointmentDate.toDateString() === today.toDateString();
        }).length
        : 0,
  };

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setShowAddModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setShowAddModal(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentsAPI.delete(appointmentId);
        await loadAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        setError('Failed to delete appointment. Please try again.');
      }
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason) {
      try {
        await appointmentsAPI.cancel(appointmentId, reason);
        await loadAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        setError('Failed to cancel appointment. Please try again.');
      }
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    const notes = prompt('Any notes for this completed appointment?');
    try {
      await appointmentsAPI.complete(appointmentId, notes || '');
      await loadAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
      setError('Failed to complete appointment. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointment Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage patient appointments and scheduling</p>
          </div>
          <button
              onClick={handleAddAppointment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-gray-600 dark:text-gray-400">Total</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-gray-600 dark:text-gray-400">Scheduled</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-gray-600 dark:text-gray-400">Completed</h3>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-gray-600 dark:text-gray-400">Cancelled</h3>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-gray-600 dark:text-gray-400">Today</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no show">No Show</option>
              </select>

              <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="w-full text-left">
            <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <th className="p-3">Code</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Doctor</th>
              <th className="p-3">Date</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-b dark:border-gray-700">
                  <td className="p-3">{appointment.appointment_code}</td>
                  <td className="p-3 flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>
                    {appointment.Patient?.User?.first_name} {appointment.Patient?.User?.last_name}
                  </span>
                  </td>
                  <td className="p-3 flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4" />
                    <span>
                    {appointment.Doctor?.User?.first_name} {appointment.Doctor?.User?.last_name}
                  </span>
                  </td>
                  <td className="p-3">{new Date(appointment.appointment_date).toLocaleString()}</td>
                  <td className="p-3">{appointment.reason}</td>
                  <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-sm flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span>{appointment.status}</span>
                  </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => handleEditAppointment(appointment)} className="text-blue-500 hover:underline">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleCompleteAppointment(appointment.id)} className="text-green-500 hover:underline">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleCancelAppointment(appointment.id)} className="text-red-500 hover:underline">
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteAppointment(appointment.id)} className="text-gray-500 hover:underline">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
            ))}
            {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No appointments found.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Appointment Modal */}
        <AddEditAppointmentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={loadAppointments}
          appointment={editingAppointment}
        />
      </div>
  );
};

export default AppointmentManagement;
