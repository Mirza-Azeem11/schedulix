import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useRedux';
import { useAppointments, usePatients, useAuthStatus } from '../../hooks/useRedux';
import { fetchAppointments } from '../../../slices/appointmentSlice';
import { logout } from '../../../slices/authSlice';
import {
  Calendar,
  Clock,
  User,
  FileText,
  CreditCard,
  Plus,
  Bell,
  Heart,
  Activity,
  LogOut,
  Stethoscope,
  MapPin,
  Video
} from 'lucide-react';

// Import the appointment booking modal
import BookAppointmentModal from '../../components/BookAppointmentModal';

const PatientDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuthStatus(); // Add user context
  const { appointments, loading } = useAppointments();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    thisMonth: 0
  });

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (appointments) {
      // Filter upcoming appointments
      const upcoming = appointments.filter(apt => {
        const appointmentDate = new Date(apt.appointment_date);
        return appointmentDate >= new Date() && ['Scheduled', 'Confirmed'].includes(apt.status);
      }).slice(0, 3);
      setUpcomingAppointments(upcoming);

      // Calculate appointment statistics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const stats = {
        total: appointments.length,
        upcoming: appointments.filter(apt =>
            new Date(apt.appointment_date) >= now && ['Scheduled', 'Confirmed'].includes(apt.status)
        ).length,
        completed: appointments.filter(apt => apt.status === 'Completed').length,
        thisMonth: appointments.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
        }).length
      };
      setAppointmentStats(stats);
    }
  }, [appointments]);

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule a new appointment with your doctor',
      icon: Calendar,
      color: 'blue',
      action: () => setShowBookingModal(true)
    },
    // {
    //   title: 'View Bills',
    //   description: 'Check your billing and payment history',
    //   icon: CreditCard,
    //   color: 'orange',
    //   action: () => navigate('/patient/bills')
    // }
  ];

  const healthStats = [
    {
      title: 'Total Appointments',
      value: appointmentStats.total,
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Upcoming',
      value: appointmentStats.upcoming,
      icon: Clock,
      color: 'green'
    },
    {
      title: 'Completed',
      value: appointmentStats.completed,
      icon: Stethoscope,
      color: 'purple'
    },
    {
      title: 'This Month',
      value: appointmentStats.thisMonth,
      icon: Activity,
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
      case 'green':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
      case 'purple':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
      case 'orange':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400';
      case 'red':
        return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const handleLogout = () => {
    // Clear Redux state
    dispatch(logout());

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Navigate to login page
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.first_name} {user?.last_name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's your health overview for today
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors flex items-center space-x-2"
                  title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">Logout</span>
              </button>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            </div>
          </div>
        </div>

        {/* Health Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {healthStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                  <button
                      key={index}
                      onClick={action.action}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg ${getColorClasses(action.color)} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Appointments & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900 flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Dr. {appointment.doctor_id}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {appointment.appointment_type}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                          </p>
                        </div>
                        <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                        </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No upcoming appointments</p>
                    <button className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm">
                      Book your first appointment
                    </button>
                  </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    New Appointment Scheduled
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Appointment completed
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Booking Modal */}
        {showBookingModal && (
            <BookAppointmentModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                patientId={user?.patient_id || user?.id}
            />
        )}
      </div>
  );
};

export default PatientDashboard;