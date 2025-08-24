import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PatientRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Debug: Log user object to console for debugging
  console.log('PatientRoute - User object:', user);
  console.log('PatientRoute - Is authenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // More flexible patient role checking
// More flexible patient role checking
  const hasPatientRole =
      // Case 1: roles is an array of objects
      user?.roles?.some(role => role?.name === 'Patient') ||

      // Case 2: roles is an array of strings
      user?.roles?.includes('Patient') ||

      // Case 3: single role string
      user?.role === 'Patient' ||
      user?.role === 'patient';


  if (!hasPatientRole) {
    console.log('PatientRoute - Access denied. User roles:', user?.roles || user?.roles || 'No roles found');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized Access</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mb-6">This area is restricted to patients only.</p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default PatientRoute;
