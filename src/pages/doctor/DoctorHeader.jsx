import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search, Settings } from 'lucide-react';
import { getUserAvatar, getDoctorAvatar, handleImageError } from '../../utils/imageUtils';

const DoctorHeader = () => {
  const { activeTab } = useSelector(state => state.doctors); // Fix: change from state.doctor to state.doctors

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Dashboard Overview';
      case 'appointment':
        return 'Appointments';
      case 'patients':
        return 'My Patients';
      case 'schedule':
        return 'Schedule Timings';
      case 'payments':
        return 'Payments';
      case 'blog':
        return 'Blog';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, Dr. Sarah Johnson
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients, appointments..."
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              5
            </span>
          </button>
          
          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <img
              src={getDoctorAvatar({ User: { first_name: 'Sarah', last_name: 'Johnson' } }, 40)}
              alt="Doctor Profile"
              className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
              onError={(e) => handleImageError(e, 'doctor')}
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Dr. Sarah Johnson</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cardiologist</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;