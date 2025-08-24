import React, { useState } from 'react';
import { useAuthStatus, useUserRole } from '../../hooks/useRedux';
import { canAccessMenuItem } from '../../utils/permissions';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../admin/Dashboard';
import UserManagement from '../admin/UserManagement';
import RoleManagement from '../admin/RoleManagement';
import PaymentManagement from '../admin/PaymentManagement';
import Analytics from '../admin/Analytics';
import PatientManagement from '../admin/PatientManagement';
import DoctorManagement from '../admin/DoctorManagement';
import AppointmentManagement from '../admin/AppointmentManagement';
import DoctorLayout from '../doctor/DoctorLayout';
import PatientDashboard from '../patient/PatientDashboard';

const Layout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuthStatus();
  const { hasRole } = useUserRole();
  const userRoles = user?.roles || [];

  // Check if user is admin (has all permissions)
  const isAdmin = userRoles.includes('Admin') || userRoles.includes('Super Admin');

  // Determine which layout to show based on user role
  const getUserRole = () => {
    if (!user?.roles || !Array.isArray(user.roles)) return 'patient';

    // Check for admin roles first (highest priority) - fixed role check
    if (hasRole(['Admin', 'Super Admin'])) return 'admin';

    // Check for doctor role
    if (hasRole(['Doctor'])) return 'doctor';

    // Default to patient
    return 'patient';
  };

  const userRole = getUserRole();

  // If user is a doctor, show the doctor layout
  if (userRole === 'doctor') {
    return <DoctorLayout />;
  }

  // If user is a patient, show patient layout with proper navigation
  if (userRole === 'patient') {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <PatientDashboard />
          </main>
        </div>
      </div>
    );
  }

  // Permission-aware content rendering for admin pages
  const renderContent = () => {
    // Check if user has permission to access the requested page
    if (!isAdmin && !canAccessMenuItem(userRoles, activeTab)) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl text-gray-300 mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
            <p className="text-gray-500">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'roles':
        return <RoleManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'analytics':
        return <Analytics />;
      case 'patients':
        return <PatientManagement />;
      case 'doctors':
        return <DoctorManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
  );
};

export default Layout;
