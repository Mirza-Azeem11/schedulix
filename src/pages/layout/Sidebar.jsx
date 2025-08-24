import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../../slices/authSlice';
import { canAccessMenuItem } from '../../utils/permissions';
import {
  LayoutDashboard,
  Users,
  Shield,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  UserCheck,
  Stethoscope,
  Calendar
} from 'lucide-react';
import { handleImageError } from '../../utils/imageUtils';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const userRoles = user?.roles || [];

  // Check if user is admin (has all permissions)
  const isAdmin = userRoles.includes('Admin') || userRoles.includes('Super Admin');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: UserCheck },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'users', label: 'Users', icon: Users, badge: '248' },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'payments', label: 'Payments', icon: CreditCard, badge: '23' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter(item => {
    // Admin sees all menu items
    if (isAdmin) {
      return true;
    }
    // For non-admin users, check specific permissions
    return canAccessMenuItem(userRoles, item.id);
  });

  const bottomMenuItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  const handleMenuClick = (itemId) => {
    if (itemId === 'logout') {
      handleLogout();
    } else if (itemId === 'settings') {
      // Handle settings navigation if needed
      console.log('Settings clicked');
    } else {
      setActiveTab(itemId);
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

  return (
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
                <img
                src="/app-logo.jpeg"
                alt="App Logo"
                className="w-auto max-w-full object-contain"
                onError={handleImageError}
                />
            )}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
                <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {!isCollapsed && (
                      <>
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                            <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                        )}
                      </>
                  )}
                </button>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;

            return (
                <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                        item.id === 'logout' 
                            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
            );
          })}
        </div>
      </div>
  );
};

export default Sidebar;
