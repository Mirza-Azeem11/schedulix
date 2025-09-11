// Permission utility functions
import { useSelector } from 'react-redux';

// Get user roles and permissions from Redux store
export const usePermissions = () => {
  const user = useSelector((state) => state.auth.user);
  const roles = user?.roles || [];

  // Admin has full access to the UI
  const isAdmin = roles.includes('Admin');

  return {
    user,
    roles,
    isAdmin
  };
};

// Check if user has specific permission
export const hasPermission = (userRoles, permission) => {
  // Admin has all permissions
  if (userRoles.includes('Admin')) {
    return true;
  }

  // Define role-based permissions mapping based on backend seeder
  const rolePermissions = {
    'Doctor': [
      'patients.view', 'patients.edit',
      'doctors.view', 'doctors.schedule',
      'appointments.view', 'appointments.edit', 'appointments.complete',
      'analytics.view'
    ],
    'Receptionist': [
      'patients.view', 'patients.create', 'patients.edit',
      'doctors.view',
      'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.cancel'
    ],
    'Accountant': [
      'patients.view',
      'appointments.view',
      'payments.view', 'payments.create', 'payments.refund',
      'invoices.view', 'invoices.create',
      'analytics.view'
    ],
    'Nurse': [
      'patients.view', 'patients.edit',
      'doctors.view',
      'appointments.view', 'appointments.edit'
    ]
  };

  // Check if any of the user's roles has the required permission
  return userRoles.some(role => {
    const permissions = rolePermissions[role] || [];
    return permissions.includes(permission);
  });
};

// Check if user can access specific admin menu items
export const canAccessMenuItem = (userRoles, menuItem) => {
  const menuPermissions = {
    'dashboard': true, // Everyone can access dashboard
    'patients': 'patients.view',
    'doctors': 'doctors.view',
    'appointments': 'appointments.view',
    'users': 'users.view',
    'roles': 'roles.view',
    'payments': 'payments.view',
    'analytics': 'analytics.view'
  };

  const requiredPermission = menuPermissions[menuItem];

  if (requiredPermission === true) {
    return true;
  }

  return hasPermission(userRoles, requiredPermission);
};
