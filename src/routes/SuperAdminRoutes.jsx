import React from 'react';
import { Route } from 'react-router-dom';
import Layout from '../pages/layout/Layout';
import Dashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/UserManagement';
import RoleManagement from '../pages/admin/RoleManagement';
import PaymentManagement from '../pages/admin/PaymentManagement';
import Analytics from '../pages/admin/Analytics';

const SuperAdminRoutes = (
    <Route path="/admin" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="analytics" element={<Analytics />} />
    </Route>
);

export default SuperAdminRoutes;
