import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Users, Calendar, CheckCircle, Clock, TrendingUp, Activity, Heart } from "lucide-react";
import {
  analyticsAPI,
  appointmentsAPI,
  patientsAPI,
} from '../../services/api';
import { getPatientAvatar, handleImageError } from '../../utils/imageUtils';

const DoctorOverview = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completedConsultations: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.doctor_id && !user?.id) return;

    setLoading(true);
    try {
      const doctorId = user.doctor_id || user.id;

      // Fetch all data in parallel
      const [
        dashboardStatsRes,
        appointmentsRes,
        patientsRes
      ] = await Promise.all([
        analyticsAPI.getDashboardStats({ doctor_id: doctorId }),
        appointmentsAPI.getAll({
          doctor_id: doctorId,
          limit: 10,
          date: new Date().toISOString().split('T')[0] // Today's appointments
        }),
        patientsAPI.getAll({
          doctor_id: doctorId,
          limit: 10
        })
      ]);

      console.log('Dashboard Stats Response:', dashboardStatsRes);
      console.log('Appointments Response:', appointmentsRes);
      console.log('Patients Response:', patientsRes);

      // Update stats from the new dashboard API
      const dashboardData = dashboardStatsRes.data?.data || {};
      const statsData = dashboardData.stats || {};

      setStats({
        totalPatients: statsData.total_patients || 0,
        todayAppointments: statsData.todays_appointments || 0,
        completedConsultations: statsData.completed_consultations || 0,
      });

      // Update appointments data - handle response structure properly
      let appointmentsData = [];
      if (appointmentsRes.data?.data?.appointments) {
        appointmentsData = appointmentsRes.data.data.appointments;
      } else if (appointmentsRes.data?.appointments) {
        appointmentsData = appointmentsRes.data.appointments;
      } else if (appointmentsRes.data?.data && Array.isArray(appointmentsRes.data.data)) {
        appointmentsData = appointmentsRes.data.data;
      } else if (Array.isArray(appointmentsRes.data)) {
        appointmentsData = appointmentsRes.data;
      }

      // Update patients data - handle response structure properly
      let patientsData = [];
      if (patientsRes.data?.data?.patients) {
        patientsData = patientsRes.data.data.patients;
      } else if (patientsRes.data?.patients) {
        patientsData = patientsRes.data.patients;
      } else if (patientsRes.data?.data && Array.isArray(patientsRes.data.data)) {
        patientsData = patientsRes.data.data;
      } else if (Array.isArray(patientsRes.data)) {
        patientsData = patientsRes.data;
      }

      setAppointments(appointmentsData);
      setPatients(patientsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Patients",
      value: stats?.totalPatients?.toString() || "0",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "bg-blue-500",
      description: "Active patients",
    },
    {
      title: "Today Appointments",
      value: stats?.todayAppointments?.toString() || "0",
      change: "+3",
      trend: "up",
      icon: Calendar,
      color: "bg-green-500",
      description: "Scheduled today",
    },
    {
      title: "Completed Consultations",
      value: stats?.completedConsultations?.toString() || "0",
      change: "+8.3%",
      trend: "up",
      icon: CheckCircle,
      color: "bg-purple-500",
      description: "This month",
    },
  ]

  const todayAppointments = Array.isArray(appointments)
      ? appointments
          .filter((apt) => {
            const today = new Date().toISOString().split("T")[0]
            return apt.appointment_date === today
          })
          .slice(0, 5)
          .map(apt => ({
            id: apt.id,
            patientName: apt.Patient?.User
                ? `${apt.Patient.User.first_name} ${apt.Patient.User.last_name}`
                : 'Unknown Patient',
            patientAvatar: getPatientAvatar(apt.Patient, 48),
            time: apt.appointment_time || 'N/A',
            type: apt.appointment_type || 'N/A',
            duration: apt.duration_minutes || 30,
            status: apt.status || 'Scheduled',
            notes: apt.reason || apt.notes || 'No notes'
          }))
      : []

  const recentPatients = Array.isArray(patients)
      ? patients.slice(0, 4).map(patient => ({
        id: patient.id,
        name: patient.User
            ? `${patient.User.first_name} ${patient.User.last_name}`
            : 'Unknown Patient',
        lastVisit: patient.created_at || new Date().toISOString(),
        avatar: getPatientAvatar(patient, 40)
      }))
      : []

  const getTrendIcon = (trend) => {
    return trend === "up" ? (
        <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
        <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
    )
  }

  const getTrendColor = (trend) => {
    return trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
        <div className="p-6">
          <p className="text-gray-500 dark:text-gray-400">Loading data...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-6">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
    );
  }

  return (
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Good Morning, {user?.first_name ? `Dr. ${user.first_name}` : 'Doctor'}!
              </h2>
              <p className="text-blue-100 mb-4">
                You have {stats?.todayAppointments || 0} appointments today.
              </p>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                View Schedule
              </button>
            </div>
            <div className="hidden md:block">
              <Heart className="w-24 h-24 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
                <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`${stat.color} p-3 rounded-lg shadow-sm`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(stat.trend)}
                      <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>{stat.change}</span>
                    </div>
                  </div>
                </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Appointments</h3>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {todayAppointments.length > 0 ? (
                    todayAppointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-600"
                        >
                          <img
                              src={appointment.patientAvatar}
                              alt={appointment.patientName}
                              onError={(e) => handleImageError(e, 'patient')}
                              className="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{appointment.patientName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {appointment.time} • {appointment.type}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{appointment.notes}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                      <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}
                      >
                        {appointment.status}
                      </span>
                            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{appointment.duration}m</span>
                            </div>
                          </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No appointments scheduled for today</p>
                      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Schedule Appointment
                      </button>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Patients & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Patients */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Patients</h3>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">View All</button>
              </div>
              <div className="space-y-3">
                {recentPatients.length > 0 ? (
                    recentPatients.map((patient) => (
                        <div
                            key={patient.id}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <img
                              src={getPatientAvatar({ name: patient.name, avatar: patient.avatar }, 40)}
                              alt={patient.name}
                              className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                              onError={(e) => handleImageError(e, 'patient')}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                      <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No recent patients</p>
                    </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Schedule Appointment</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Book new patient visit</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Add New Patient</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Register patient profile</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Add Time Slot</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Manage availability</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default DoctorOverview