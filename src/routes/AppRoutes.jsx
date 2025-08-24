import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute, DoctorRoute } from '../components/PrivateRoute';
import Layout from '../pages/layout/Layout';

// Import all route modules
import AuthRoutes from './AuthRoutes';
import PatientRoutes from './PatientRoutes';
import AdminRoutes from './AdminRoutes';

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            {AuthRoutes}

            {/* Protected Routes - Dashboard redirect */}
            <Route path="/" element={
              <PrivateRoute>
                <Navigate to="/dashboard" replace />
              </PrivateRoute>
            } />

            <Route path="/dashboard" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            } />

            {/* Patient Routes */}
            {PatientRoutes}

            {/* Doctor Routes */}
            <Route path="/doctor/*" element={
              <DoctorRoute>
                <Layout />
              </DoctorRoute>
            } />

            {/* Admin Routes */}
            {AdminRoutes}

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default AppRoutes;
