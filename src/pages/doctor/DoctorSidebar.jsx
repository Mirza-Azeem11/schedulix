import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useRedux';
import { logout } from '../../../slices/authSlice';
import {
  LayoutDashboard, 
  Calendar, 
  Users, 
  Clock,
  CreditCard,
  FileText,
  Settings,
  Stethoscope,
  LogOut
} from 'lucide-react';

const DoctorSidebar = ({ activeTab, onTabChange }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear Redux state
    dispatch(logout());

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Navigate to login page
    navigate('/login');
  };

  const navigationItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: LayoutDashboard
    },
    { 
      id: 'appointment', 
      label: 'Appointment', 
      icon: Calendar
    },
    { 
      id: 'patients', 
      label: 'My Patients', 
      icon: Users
    },
    { 
      id: 'schedule', 
      label: 'Schedule Timings', 
      icon: Clock
    },
    // {
    //   id: 'payments',
    //   label: 'Payments',
    //   icon: CreditCard
    // },
    // {
    //   id: 'blog',
    //   label: 'Blog',
    //   icon: FileText
    // },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings
    }
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Doct.
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Doctor Portal
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gray-900 dark:bg-gray-700 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;