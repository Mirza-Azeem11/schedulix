import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Calendar,
  Clock,
  User,
  Plus,
  FileText,
  Bell,
  Activity,
  Stethoscope
} from 'lucide-react';
import { fetchAppointments } from '../../slices/appointmentSlice';
import { patientsAPI } from '../services/api';
import BookAppointmentModal from './BookAppointmentModal';
import AppointmentCard from './AppointmentCard';
import PatientStats from './PatientStats';

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments, loading } = useSelector((state) => state.appointments);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // Fetch patient data based on user_id
  useEffect(() => {
    const fetchPatientData = async () => {
      if (user?.id && user?.roles?.includes('Patient')) {
        setLoadingPatient(true);
        try {
          // Try to get patient data by user_id
          const response = await patientsAPI.getAll({ limit: 100 });
          const patients = response.data?.data?.patients || response.data?.data || [];

          // Find patient record with matching user_id
          const currentPatient = patients.find(p => p.user_id === user.id);

          if (currentPatient) {
            setPatientData(currentPatient);
            // Fetch appointments for this patient
            dispatch(fetchAppointments({ patient_id: currentPatient.id }));
          } else {
            // If no patient record found, use user.id directly
            console.warn('No patient record found, using user.id as patient_id');
            setPatientData({ id: user.id, user_id: user.id });
            dispatch(fetchAppointments({ patient_id: user.id }));
          }
        } catch (error) {
          console.error('Error fetching patient data:', error);
          // Fallback: use user.id as patient_id
          setPatientData({ id: user.id, user_id: user.id });
        } finally {
          setLoadingPatient(false);
        }
      }
    };

    fetchPatientData();
  }, [dispatch, user]);

  const upcomingAppointments = appointments?.filter(
    apt => apt.status === 'Scheduled' || apt.status === 'Confirmed'
  ) || [];

  const recentAppointments = appointments?.filter(
    apt => apt.status === 'Completed'
  ).slice(0, 3) || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <PatientStats userId={user?.id} />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Book Appointment</span>
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                  <span>View Appointments</span>
                </button>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      isCompact={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No upcoming appointments</p>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Book your first appointment
                  </button>
                </div>
              )}
            </div>

          </div>
        );

      case 'appointments':
        return <AppointmentsList appointments={appointments} loading={loading} />;


      case 'notifications':
        return <NotificationsList userId={user?.id} />;

      default:
        return null;
    }
  };

  if (loading || loadingPatient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome, {user?.first_name} {user?.last_name}
                </h1>
                <p className="text-sm text-gray-500">Patient Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Book Appointment Modal */}
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

// Placeholder components for other tabs
const AppointmentsList = ({ appointments, loading }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Appointments</h3>
    {loading ? (
      <div className="text-center py-8">Loading appointments...</div>
    ) : appointments?.length > 0 ? (
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No appointments found</p>
      </div>
    )}
  </div>
);


const NotificationsList = ({ userId }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
    <div className="text-center py-8 text-gray-500">
      <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p>No new notifications</p>
    </div>
  </div>
);

export default PatientDashboard;
