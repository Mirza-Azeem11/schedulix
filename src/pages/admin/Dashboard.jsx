import React from 'react';
import StatsCard from './StatsCard';
import Chart from './Chart';
import { mockStats, chartData } from '../../../../../../Downloads/project/src/data/mockData';
import { Calendar, Clock, UserCheck, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const recentActivities = [
        { id: 1, action: 'New patient registration', user: 'James Wilson', time: '5 minutes ago', type: 'user' },
        { id: 2, action: 'Payment received', user: 'Maria Garcia', time: '15 minutes ago', type: 'payment' },
        { id: 3, action: 'Doctor appointment scheduled', user: 'Dr. Sarah Johnson', time: '30 minutes ago', type: 'appointment' },
        { id: 4, action: 'System maintenance completed', user: 'System', time: '1 hour ago', type: 'system' },
    ];

    const getActivityIcon = (type) => {
        switch (type) {
            case 'user':
                return <UserCheck className="w-4 h-4 text-blue-500" />;
            case 'payment':
                return <Calendar className="w-4 h-4 text-green-500" />;
            case 'appointment':
                return <Clock className="w-4 h-4 text-purple-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-orange-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockStats.map((stat, index) => (
                    <StatsCard key={index} stat={stat} />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Chart title="User Growth" data={chartData.users} type="users" />
                <Chart title="Revenue Trend" data={chartData.revenue} type="revenue" />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex-shrink-0 mt-1">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {activity.action}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {activity.user} • {activity.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
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
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Add New User</span>
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
