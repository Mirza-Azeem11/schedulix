import React, { useEffect, useState } from 'react';
import { analyticsAPI, usersAPI, doctorsAPI, patientsAPI, appointmentsAPI } from '../../services/api';
import StatsCard from './StatsCard';
import Chart from './Chart';
import {
  Calendar,
  Clock,
  UserCheck,
  AlertCircle,
  Users,
  Stethoscope,
  CalendarDays,
  DollarSign,
  CreditCard
} from 'lucide-react';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [revenueData, setRevenueData] = useState(null);
    const [appointmentStats, setAppointmentStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load all admin dashboard data
    useEffect(() => {
        loadAllDashboardData();
    }, []);

    const loadAllDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel for better performance
            const [
                dashboardStats,
                revenueStats,
                appointmentData,
                recentAppointments,
                recentUsers
            ] = await Promise.allSettled([
                analyticsAPI.getDashboardStats(),
                analyticsAPI.getRevenueTrends({ period: '6months' }),
                analyticsAPI.getAppointmentStats({ period: '30days' }),
                appointmentsAPI.getAll({ limit: 5, sort: 'created_at', order: 'DESC' }),
                usersAPI.getAll({ limit: 5, sort: 'created_at', order: 'DESC' })
            ]);

            // Process dashboard stats
            if (dashboardStats.status === 'fulfilled') {
                setDashboardData(dashboardStats.value.data.data);
            } else {
                console.warn('Dashboard stats failed:', dashboardStats.reason);
                await loadFallbackStats();
            }

            // Process revenue data
            if (revenueStats.status === 'fulfilled') {
                setRevenueData(revenueStats.value.data.data);
            }

            // Process appointment stats
            if (appointmentData.status === 'fulfilled') {
                setAppointmentStats(appointmentData.value.data.data);
            }

            // Process recent activity
            const activities = [];

            if (recentAppointments.status === 'fulfilled') {
                // Handle different possible response structures
                const appointmentsData = recentAppointments.value.data?.data ||
                                       recentAppointments.value.data ||
                                       [];

                // Ensure it's an array before calling slice
                const appointments = Array.isArray(appointmentsData) ?
                                   appointmentsData.slice(0, 3) :
                                   [];

                appointments.forEach(apt => {
                    activities.push({
                        id: `apt-${apt.id}`,
                        type: 'appointment',
                        title: 'New Appointment',
                        description: `${apt.Patient?.User?.first_name || 'Patient'} with Dr. ${apt.Doctor?.User?.first_name || 'Doctor'}`,
                        time: apt.created_at,
                        status: apt.status,
                        icon: Calendar
                    });
                });
            }

            if (recentUsers.status === 'fulfilled') {
                // Handle different possible response structures for users too
                const usersData = recentUsers.value.data?.data ||
                                recentUsers.value.data ||
                                [];

                // Ensure it's an array before calling slice
                const users = Array.isArray(usersData) ?
                            usersData.slice(0, 2) :
                            [];

                users.forEach(user => {
                    activities.push({
                        id: `user-${user.id}`,
                        type: 'user',
                        title: 'New User Registration',
                        description: `${user.first_name} ${user.last_name} joined`,
                        time: user.created_at,
                        status: 'active',
                        icon: Users
                    });
                });
            }

            // Sort activities by time
            activities.sort((a, b) => new Date(b.time) - new Date(a.time));
            setRecentActivity(activities.slice(0, 5));

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setError('Failed to load dashboard data. Please try again.');
            await loadFallbackStats();
        } finally {
            setLoading(false);
        }
    };

    const loadFallbackStats = async () => {
        try {
            // Load basic stats individually if analytics endpoint fails
            const [users, doctors, patients, appointments] = await Promise.allSettled([
                usersAPI.getAll({ limit: 1 }),
                doctorsAPI.getAll({ limit: 1 }),
                patientsAPI.getAll({ limit: 1 }),
                appointmentsAPI.getAll({ limit: 1 })
            ]);

            const fallbackData = {
                overview: {
                    totalUsers: users.status === 'fulfilled' ? users.value.data.pagination?.total || 0 : 0,
                    totalDoctors: doctors.status === 'fulfilled' ? doctors.value.data.pagination?.total || 0 : 0,
                    totalPatients: patients.status === 'fulfilled' ? patients.value.data.pagination?.total || 0 : 0,
                    totalAppointments: appointments.status === 'fulfilled' ? appointments.value.data.pagination?.total || 0 : 0,
                    todaysAppointments: 0,
                    monthlyAppointments: 0,
                    monthlyRevenue: 0,
                    pendingPayments: 0
                },
                appointmentsByStatus: [],
                recentActivity: []
            };

            setDashboardData(fallbackData);
        } catch (error) {
            console.error('Fallback data loading failed:', error);
            // Set minimal default data
            setDashboardData({
                overview: {
                    totalUsers: 0,
                    totalDoctors: 0,
                    totalPatients: 0,
                    totalAppointments: 0,
                    todaysAppointments: 0,
                    monthlyAppointments: 0,
                    monthlyRevenue: 0,
                    pendingPayments: 0
                },
                appointmentsByStatus: [],
                recentActivity: []
            });
        }
    };

    const refreshData = () => {
        loadAllDashboardData();
    };

    // Calculate percentage changes (mock data for now, can be enhanced with historical data)
    const calculateChange = (current, previous = 0) => {
        if (previous === 0) return '+0%';
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    // Transform data into stats cards format
    const stats = dashboardData ? [
        {
            title: 'Total Patients',
            value: dashboardData.overview.totalPatients || 0,
            change: calculateChange(dashboardData.overview.totalPatients, dashboardData.overview.totalPatients * 0.9),
            trend: 'up',
            icon: Users,
            color: 'blue'
        },
        {
            title: 'Total Doctors',
            value: dashboardData.overview.totalDoctors || 0,
            change: calculateChange(dashboardData.overview.totalDoctors, dashboardData.overview.totalDoctors * 0.95),
            trend: 'up',
            icon: Stethoscope,
            color: 'green'
        },
        {
            title: 'Appointments Today',
            value: dashboardData.overview.todaysAppointments || 0,
            change: calculateChange(dashboardData.overview.todaysAppointments, dashboardData.overview.todaysAppointments * 0.8),
            trend: 'up',
            icon: CalendarDays,
            color: 'purple'
        },
        {
            title: 'Monthly Revenue',
            value: `$${(dashboardData.overview.monthlyRevenue || 0).toLocaleString()}`,
            change: calculateChange(dashboardData.overview.monthlyRevenue, dashboardData.overview.monthlyRevenue * 0.85),
            trend: 'up',
            icon: DollarSign,
            color: 'orange'
        },
        {
            title: 'Total Appointments',
            value: dashboardData.overview.totalAppointments || 0,
            change: calculateChange(dashboardData.overview.totalAppointments, dashboardData.overview.totalAppointments * 0.9),
            trend: 'up',
            icon: Calendar,
            color: 'indigo'
        },
        {
            title: 'Pending Payments',
            value: `$${(dashboardData.overview.pendingPayments || 0).toLocaleString()}`,
            change: calculateChange(dashboardData.overview.pendingPayments, dashboardData.overview.pendingPayments * 1.1),
            trend: 'down',
            icon: CreditCard,
            color: 'red'
        }
    ] : [];

    // Transform revenue data for charts
    const chartData = {
        revenue: revenueData ? {
            labels: revenueData.trends?.map(trend => {
                const date = new Date(trend.period);
                return date.toLocaleDateString('en-US', { month: 'short' });
            }) || [],
            datasets: [{
                label: 'Revenue',
                data: revenueData.trends?.map(trend => trend.revenue) || [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        } : null,
        appointments: appointmentStats ? {
            labels: appointmentStats.trends?.map(trend => {
                const date = new Date(trend.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }) || [],
            datasets: [{
                label: 'Appointments',
                data: appointmentStats.trends?.map(trend => trend.count) || [],
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
        } : null,
        appointmentsByStatus: dashboardData?.appointmentsByStatus ? {
            labels: dashboardData.appointmentsByStatus.map(item => item.status),
            datasets: [{
                data: dashboardData.appointmentsByStatus.map(item => item.count),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 1
            }]
        } : null
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                {/* Loading skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={refreshData}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Healthcare Dashboard</h1>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Export Report
                    </button>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Settings
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <StatsCard key={index} stat={stat} />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Chart title="Revenue Trend" data={chartData.revenue} type="revenue" />
                <Chart title="Appointments Trend" data={chartData.appointments} type="appointments" />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {recentActivity.length > 0 ? recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex-shrink-0 mt-1">
                                        {activity.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {activity.title}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {activity.description} • {new Date(activity.time).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No recent activity to display
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <UserCheck className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Add New Patient</span>
                                </div>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-green-500" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Schedule Appointment</span>
                                </div>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <Clock className="w-5 h-5 text-purple-500" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Generate Report</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Online
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">API Services</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Healthy
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Analytics</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
