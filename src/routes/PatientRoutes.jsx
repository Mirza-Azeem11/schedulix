import React from 'react';
import { Route } from 'react-router-dom';
import PatientRoute from '../components/PatientRoute';
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientBills from '../pages/patient/PatientBills';

const PatientRoutes = (
  <>
    <Route path="/patient" element={
      <PatientRoute>
        <PatientDashboard />
      </PatientRoute>
    } />

    <Route path="/patient/dashboard" element={
      <PatientRoute>
        <PatientDashboard />
      </PatientRoute>
    } />

    <Route path="/patient/bills" element={
      <PatientRoute>
        <PatientBills />
      </PatientRoute>
    } />
  </>
);

export default PatientRoutes;
