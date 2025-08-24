import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DoctorSidebar from './DoctorSidebar';
import DoctorHeader from './DoctorHeader';
import DoctorOverview from './DoctorOverview';
import DoctorAppointments from './DoctorAppointments';
import DoctorPatients from './DoctorPatients';
import DoctorSchedule from './DoctorSchedule';
import DoctorPayments from './DoctorPayments';
import DoctorBlog from './DoctorBlog';
import DoctorSettings from './DoctorSettings';
import { setActiveTab } from '../../../slices/doctorSlice';

const DoctorLayout = () => {
  const dispatch = useDispatch();
  const { activeTab } = useSelector(state => state.doctors); // Fix: change from state.doctor to state.doctors

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DoctorOverview />;
      case 'appointment':
        return <DoctorAppointments />;
      case 'patients':
        return <DoctorPatients />;
      case 'schedule':
        return <DoctorSchedule />;
      case 'payments':
        return <DoctorPayments />;
      case 'blog':
        return <DoctorBlog />;
      case 'settings':
        return <DoctorSettings />;
      default:
        return <DoctorOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <DoctorSidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DoctorHeader />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;