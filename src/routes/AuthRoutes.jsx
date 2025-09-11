import React from 'react';
import { Route } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterPatientForm from '../components/RegisterPatientForm';
import RegisterDoctorForm from '../components/RegisterDoctorForm';
import CompanyRegistration from '../pages/auth/CompanyRegistration';

const AuthRoutes = (
  <>
    <Route path="/login" element={<LoginForm />} />
    <Route path="/register/patient" element={<RegisterPatientForm />} />
    <Route path="/register/doctor" element={<RegisterDoctorForm />} />
    <Route path="/register/company" element={<CompanyRegistration />} />
    <Route path="/unauthorized" element={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    } />
  </>
);

export default AuthRoutes;
