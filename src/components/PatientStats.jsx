import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { appointmentsAPI } from '../services/api';

const PatientStats = ({ userId }) => {
  const { appointments } = useSelector((state) => state.appointments);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0,
    thisMonth: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointments) {
      calculateStats();
    }
  }, [appointments]);

  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const statsData = {
      total: appointments.length,
      completed: appointments.filter(apt => apt.status === 'Completed').length,
      upcoming: appointments.filter(apt =>
        ['Scheduled', 'Confirmed'].includes(apt.status) &&
        new Date(apt.appointment_date) >= now
      ).length,
      cancelled: appointments.filter(apt => apt.status === 'Cancelled').length,
      thisMonth: appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
      }).length
    };

    setStats(statsData);
  };

  const statCards = [
    {
      title: 'Total Appointments',
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Upcoming',
      value: stats.upcoming,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'This Month',
      value: stats.thisMonth,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`${stat.bgColor} rounded-lg p-6 border`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PatientStats;
