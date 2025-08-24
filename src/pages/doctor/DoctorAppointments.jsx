import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Calendar,
  Clock,
  Search,
  Plus,
  Video,
  Phone,
  MapPin,
  MoreHorizontal,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  FileText
} from 'lucide-react';
import { appointmentsAPI, patientsAPI, timeSlotsAPI } from '../../services/api';
import NewAppointment from "./AddAppointmentForm";

const DoctorAppointments = () => {
  const { user } = useSelector(state => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [user, statusFilter, dateFilter]);

  const fetchData = async () => {
    if (!user?.doctor_id && !user?.id) return;

    setLoading(true);
    try {
      const doctorId = user.doctor_id || user.id;
      await Promise.all([
        fetchAppointments(doctorId),
        fetchPatients(doctorId)
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async (doctorId) => {
    try {
      const params = {
        doctor_id: doctorId,
        limit: 100
      };

      // Add status filter
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // Add date filter
      if (dateFilter === 'today') {
        params.date = new Date().toISOString().split('T')[0];
      } else if (dateFilter === 'week') {
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        params.date_from = weekStart.toISOString().split('T')[0];
      } else if (dateFilter === 'month') {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        params.date_from = monthStart.toISOString().split('T')[0];
      }

      const response = await appointmentsAPI.getAll(params);
      console.log('Appointments API Response:', response);
      console.log('Appointments Response Data:', response.data);

      // Handle different possible response structures
      let appointmentsData = [];
      if (response.data?.data?.appointments) {
        appointmentsData = response.data.data.appointments;
      } else if (response.data?.appointments) {
        appointmentsData = response.data.appointments;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        appointmentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        appointmentsData = response.data;
      }

      console.log('Processed Appointments Data:', appointmentsData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  };

  const fetchPatients = async (doctorId) => {
    try {
      const response = await patientsAPI.getAll({
        doctor_id: doctorId,
        limit: 50
      });

      console.log('Patients API Response:', response);
      console.log('Patients Data:', response.data);

      // Handle different possible response structures
      let patientsData = [];
      if (response.data?.data?.patients) {
        patientsData = response.data.data.patients;
      } else if (response.data?.patients) {
        patientsData = response.data.patients;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        patientsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        patientsData = response.data;
      }

      console.log('Processed Patients Data:', patientsData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Don't throw here as patients is optional for appointment display
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddAppointment = async (newAppointmentData) => {
    try {
      const doctorId = user.doctor_id || user.id;

      // Convert frontend camelCase field names to backend snake_case format
      const appointmentData = {
        patient_id: parseInt(newAppointmentData.patientId),
        doctor_id: doctorId,
        appointment_date: newAppointmentData.appointmentDate,
        appointment_time: newAppointmentData.appointmentTime,
        duration_minutes: parseInt(newAppointmentData.duration),
        appointment_type: newAppointmentData.appointmentType,
        consultation_type: newAppointmentData.consultationType,
        reason: newAppointmentData.reason,
        notes: newAppointmentData.notes,
        priority: newAppointmentData.priority,
        location: newAppointmentData.location,
        status: newAppointmentData.status || 'Scheduled'
      };

      console.log('Sending appointment data:', appointmentData);

      const response = await appointmentsAPI.create(appointmentData);
      if (response.data.success) {
        const newAppointment = response.data.data;
        setAppointments(prev => {
          const currentAppointments = Array.isArray(prev) ? prev : [];
          return [newAppointment, ...currentAppointments];
        });
        setIsNewAppointmentOpen(false);

        // Show success message
        alert('Appointment created successfully!');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create appointment';
      alert(errorMessage);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await appointmentsAPI.update(appointmentId, { status: newStatus });
      if (response.data.success) {
        setAppointments(prev => {
          const currentAppointments = Array.isArray(prev) ? prev : [];
          return currentAppointments.map(apt =>
            apt.id === appointmentId ? { ...apt, status: newStatus } : apt
          );
        });

        // Show success message
        alert(`Appointment ${newStatus.toLowerCase()} successfully!`);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update appointment status';
      alert(errorMessage);
    }
  };

  const handleCancelAppointment = async (appointmentId, reason) => {
    try {
      const cancellationReason = reason || prompt('Please provide a reason for cancellation:');
      if (!cancellationReason) return;

      const response = await appointmentsAPI.cancel(appointmentId, cancellationReason);
      if (response.data.success) {
        setAppointments(prev => {
          const currentAppointments = Array.isArray(prev) ? prev : [];
          return currentAppointments.map(apt =>
            apt.id === appointmentId ? { ...apt, status: 'Cancelled', cancellation_reason: cancellationReason } : apt
          );
        });

        alert('Appointment cancelled successfully!');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel appointment';
      alert(errorMessage);
    }
  };

  const handleCompleteAppointment = async (appointmentId, notes) => {
    try {
      const completionNotes = notes || prompt('Add any notes for this completed appointment:');

      const response = await appointmentsAPI.complete(appointmentId, completionNotes);
      if (response.data.success) {
        setAppointments(prev => {
          const currentAppointments = Array.isArray(prev) ? prev : [];
          return currentAppointments.map(apt =>
            apt.id === appointmentId ? { ...apt, status: 'Completed', notes: completionNotes } : apt
          );
        });

        alert('Appointment marked as completed!');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to complete appointment';
      alert(errorMessage);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await appointmentsAPI.delete(appointmentId);
      if (response.data.success) {
        setAppointments(prev => {
          const currentAppointments = Array.isArray(prev) ? prev : [];
          return currentAppointments.filter(apt => apt.id !== appointmentId);
        });
        alert('Appointment deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete appointment';
      alert(errorMessage);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(appointment => {
    // Handle different possible patient name structures
    const patientName = appointment.Patient?.User?.first_name + ' ' + appointment.Patient?.User?.last_name ||
                       appointment.patient_name ||
                       appointment.patientName || '';
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const todayAppointments = Array.isArray(filteredAppointments) ? filteredAppointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    // Handle different possible date field names
    const appointmentDate = apt.appointment_date || apt.date || apt.appointmentDate;
    return appointmentDate === today;
  }) : [];

  const upcomingAppointments = Array.isArray(filteredAppointments) ? filteredAppointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    // Handle different possible date field names
    const appointmentDate = apt.appointment_date || apt.date || apt.appointmentDate;
    return appointmentDate > today;
  }) : [];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Telemedicine':
        return <Video className="w-4 h-4" />;
      case 'Phone':
        return <Phone className="w-4 h-4" />;
      case 'In-Person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchAppointments}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your patient appointments and schedule
            </p>
          </div>
          <div className="flex space-x-3">
            <button
                onClick={() => setIsNewAppointmentOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Export
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                List View
              </button>
              <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                      viewMode === 'calendar'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                Calendar View
              </button>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Today's Appointments</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
            {todayAppointments.length} appointments
          </span>
          </div>
          {todayAppointments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No appointments scheduled for today</p>
          ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => {
                  // Map backend field names to display values
                  const patientName = appointment.Patient?.User?.first_name + ' ' + appointment.Patient?.User?.last_name ||
                                    appointment.patient_name ||
                                    appointment.patientName || 'New Patient';
                  const appointmentTime = appointment.appointment_time || appointment.time || 'N/A';
                  const appointmentType = appointment.appointment_type || appointment.type || 'N/A';
                  const duration = appointment.duration_minutes || appointment.duration || 'N/A';

                  return (
                    <div key={appointment.id} className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300">
                          {patientName.charAt(0) || 'P'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {patientName}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {appointmentTime}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                            {getTypeIcon(appointmentType)}
                            <span>{appointmentType}</span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {duration} minutes
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {appointment.notes || 'No notes'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <select
                            value={appointment.status}
                            onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ${getStatusColor(appointment.status)} cursor-pointer`}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
            {upcomingAppointments.length} appointments
          </span>
          </div>
          {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming appointments</p>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300">
                          {appointment.patientName?.charAt(0) || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {appointment.patientName || 'New Patient'}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {appointment.type || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Date:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                      {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
                    </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Time:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                      {appointment.time || 'N/A'}
                    </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Duration:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                      {appointment.duration || 'N/A'}m
                    </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status || 'Scheduled'}
                    </span>
                          <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>

        <NewAppointment
            isOpen={isNewAppointmentOpen}
            onClose={() => setIsNewAppointmentOpen(false)}
            onAddAppointment={handleAddAppointment}
            patients={patients || []}
        />
      </div>
  );
};

export default DoctorAppointments;
