import React from 'react';
import {
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    BarChart3,
    PieChart
} from 'lucide-react';

const Analytics = () => {
    const analyticsData = [
        { label: 'Jan', users: 120, revenue: 8500, appointments: 45 },
        { label: 'Feb', users: 140, revenue: 9200, appointments: 52 },
        { label: 'Mar', users: 180, revenue: 11800, appointments: 68 },
        { label: 'Apr', users: 220, revenue: 13400, appointments: 75 },
        { label: 'May', users: 260, revenue: 15600, appointments: 82 },
        { label: 'Jun', users: 300, revenue: 18200, appointments: 95 }
    ];

    const usersByRole = [
        { role: 'Patients', count: 248, color: 'bg-blue-500' },
        { role: 'Doctors', count: 28, color: 'bg-green-500' },
        { role: 'Staff', count: 15, color: 'bg-purple-500' },
        { role: 'Admin', count: 5, color: 'bg-red-500' }
    ];

    const maxUsers = Math.max(...analyticsData.map(d => d.users));
    const maxRevenue = Math.max(...analyticsData.map(d => d.revenue));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <div className="flex space-x-3">
                    <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>Last 6 months</option>
                        <option>Last year</option>
                        <option>All time</option>
                    </select>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Growth</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">+24.5%</p>
                        </div>
                        <div className="bg-green-500 p-3 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User Retention</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">89.2%</p>
                        </div>
                        <div className="bg-blue-500 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">$12.8k</p>
                        </div>
                        <div className="bg-purple-500 p-3 rounded-lg">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Appointments</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">417</p>
                        </div>
                        <div className="bg-orange-500 p-3 rounded-lg">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h3>
                        <BarChart3 className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex items-end justify-between h-64 space-x-2">
                        {analyticsData.map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-600"
                                    style={{
                                        height: `${(item.users / maxUsers) * 100}%`,
                                        minHeight: '8px'
                                    }}
                                />
                                <div className="mt-2 text-center">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.users}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
                        <DollarSign className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex items-end justify-between h-64 space-x-2">
                        {analyticsData.map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600"
                                    style={{
                                        height: `${(item.revenue / maxRevenue) * 100}%`,
                                        minHeight: '8px'
                                    }}
                                />
                                <div className="mt-2 text-center">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">${(item.revenue / 1000).toFixed(1)}k</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Performance</h3>
                            <Calendar className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Month</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Users</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Revenue</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Appointments</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Growth</th>
                                </tr>
                                </thead>
                                <tbody>
                                {analyticsData.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                                        <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{item.label}</td>
                                        <td className="py-3 px-4 text-gray-900 dark:text-white">{item.users}</td>
                                        <td className="py-3 px-4 text-gray-900 dark:text-white">${item.revenue.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-gray-900 dark:text-white">{item.appointments}</td>
                                        <td className="py-3 px-4">
                        <span className="text-green-600 dark:text-green-400 flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>+{Math.floor(Math.random() * 10 + 5)}%</span>
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* User Role Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Distribution</h3>
                        <PieChart className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="space-y-4">
                        {usersByRole.map((item, index) => {
                            const total = usersByRole.reduce((sum, u) => sum + u.count, 0);
                            const percentage = Math.round((item.count / total) * 100);

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.role}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{item.count} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`${item.color} h-2 rounded-full transition-all duration-300`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
