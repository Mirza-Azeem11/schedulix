import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DollarSign, TrendingUp, Calendar, Download, CreditCard, User } from 'lucide-react';
import { paymentsAPI, analyticsAPI } from '../../services/api';

const DoctorPayments = () => {
  const { user } = useSelector(state => state.auth);
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    pending: 0,
    consultations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentData();
  }, [user]);

  const fetchPaymentData = async () => {
    if (!user?.doctor_id && !user?.id) return;

    setLoading(true);
    try {
      const doctorId = user.doctor_id || user.id;

      // Fetch payments and analytics in parallel
      const [paymentsRes, analyticsRes] = await Promise.all([
        paymentsAPI.getAll({ doctor_id: doctorId, limit: 100 }),
        analyticsAPI.getRevenueStats({ doctor_id: doctorId })
      ]);

      const paymentsData = paymentsRes.data?.data || [];
      const analyticsData = analyticsRes.data?.data || {};

      setPayments(paymentsData);
      setPaymentStats({
        totalEarnings: analyticsData.total_earnings || 0,
        thisMonth: analyticsData.this_month || 0,
        pending: analyticsData.pending_payments || 0,
        consultations: analyticsData.total_consultations || 0
      });

    } catch (error) {
      console.error('Error fetching payment data:', error);
      setError('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleExportReport = () => {
    // Implement export functionality
    console.log('Exporting payment report...');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading payment data...</p>
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
            onClick={fetchPaymentData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Earnings',
      value: `$${paymentStats.totalEarnings}`,
      change: '+8.3%',
      color: 'bg-green-500',
      icon: DollarSign
    },
    {
      title: 'This Month',
      value: `$${paymentStats.thisMonth}`,
      change: '+12.5%',
      color: 'bg-blue-500',
      icon: Calendar
    },
    {
      title: 'Pending',
      value: `$${paymentStats.pending}`,
      change: '-2.1%',
      color: 'bg-yellow-500',
      icon: CreditCard
    },
    {
      title: 'Consultations',
      value: paymentStats.consultations.toString(),
      change: '+5.2%',
      color: 'bg-purple-500',
      icon: User
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments & Earnings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your revenue and payment history
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400 ml-1">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Payments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Payments</h2>

        {payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Method</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {payment.Patient?.User?.first_name} {payment.Patient?.User?.last_name || payment.patient_name || 'Unknown Patient'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      ${payment.amount}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {payment.payment_method || 'Card'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPayments;
