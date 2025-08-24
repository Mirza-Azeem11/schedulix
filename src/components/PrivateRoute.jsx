import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useRedux';
import { useAuthStatus, useUserRole } from '../hooks/useRedux';
import { getMe } from '../../slices/authSlice';

// Component for protecting routes that require authentication
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthStatus();
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    // If we have a token but no user data, fetch user info
    const token = localStorage.getItem('token');
    if (token && !user && !loading) {
      dispatch(getMe());
    }
  }, [dispatch, user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Component for protecting routes based on user roles
export const RoleBasedRoute = ({ children, allowedRoles, fallbackPath = '/unauthorized' }) => {
  const { hasRole } = useUserRole();
  const { isAuthenticated, loading } = useAuthStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

// Specific route protections for different user types
export const AdminRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['Admin', 'SuperAdmin']}>
    {children}
  </RoleBasedRoute>
);

export const DoctorRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['Doctor', 'Admin', 'SuperAdmin']}>
    {children}
  </RoleBasedRoute>
);

export const PatientRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['Patient', 'Doctor', 'Admin', 'SuperAdmin']}>
    {children}
  </RoleBasedRoute>
);

export const SuperAdminRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['SuperAdmin']}>
    {children}
  </RoleBasedRoute>
);
