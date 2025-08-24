import React from 'react';
import { Route } from 'react-router-dom';
import { AdminRoute } from '../components/PrivateRoute';
import Layout from '../pages/layout/Layout';

const AdminRoutes = (
  <Route path="/admin/*" element={
    <AdminRoute>
      <Layout />
    </AdminRoute>
  } />
);

export default AdminRoutes;
