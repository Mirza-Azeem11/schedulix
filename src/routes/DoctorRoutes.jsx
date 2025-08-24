import React from 'react';
import { Route } from 'react-router-dom';
import DoctorLayout from '../pages/doctor/DoctorLayout';
import DoctorOverview from '../pages/doctor/DoctorOverview';
import DoctorPatients from '../pages/doctor/DoctorPatients';
import DoctorPayments from '../pages/doctor/DoctorPayments';
import DoctorSchedule from '../pages/doctor/DoctorSchedule';
import DoctorSettings from '../pages/doctor/DoctorSettings';

const DoctorRoutes = (
    <Route path="/doctor" element={<DoctorLayout />}>
        <Route index element={<DoctorOverview />} />
        <Route path="overview" element={<DoctorOverview />} />
        <Route path="appointments" element={<DoctorPatients />} />
        <Route path="patients" element={<DoctorPayments />} />
        <Route path="schedule" element={<DoctorSchedule />} />
        <Route path="payments" element={<DoctorSettings />} />
    </Route>
);

export default DoctorRoutes;
