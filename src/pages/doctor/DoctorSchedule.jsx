import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, Calendar, Plus, Edit, Trash2, Settings } from 'lucide-react';
import { timeSlotsAPI } from '../../services/api';
import AddTimeSlotForm from "./AddTimeSlotForm";

const DoctorSchedule = () => {
  const { user } = useSelector(state => state.auth);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isAddTimeSlotOpen, setIsAddTimeSlotOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchTimeSlots();
  }, [user]);

  const fetchTimeSlots = async () => {
    if (!user?.doctor_id && !user?.id) return;

    setLoading(true);
    try {
      const doctorId = user.doctor_id || user.id;
      const response = await timeSlotsAPI.getByDoctor(doctorId);

      const slotsData = response.data?.data || [];
      setTimeSlots(slotsData);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('Failed to load time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeSlot = async (slotData) => {
    try {
      const doctorId = user.doctor_id || user.id;
      const timeSlotData = {
        ...slotData,
        doctor_id: doctorId
      };

      const response = await timeSlotsAPI.create(timeSlotData);
      if (response.data.success) {
        setTimeSlots(prev => [...prev, response.data.data]);
        setIsAddTimeSlotOpen(false);
      }
    } catch (error) {
      console.error('Error adding time slot:', error);
      throw error;
    }
  };

  const handleEditTimeSlot = async (id, slotData) => {
    try {
      const doctorId = user.doctor_id || user.id;
      const timeSlotData = {
        ...slotData,
        doctor_id: doctorId
      };

      const response = await timeSlotsAPI.update(id, timeSlotData);
      if (response.data.success) {
        setTimeSlots(prev => prev.map(slot =>
          slot.id === id ? response.data.data : slot
        ));
        setEditingSlot(null);
      }
    } catch (error) {
      console.error('Error updating time slot:', error);
      throw error;
    }
  };

  const handleDeleteTimeSlot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    try {
      await timeSlotsAPI.delete(id);
      setTimeSlots(prev => prev.filter(slot => slot.id !== id));
    } catch (error) {
      console.error('Error deleting time slot:', error);
      alert('Failed to delete time slot');
    }
  };

  const groupSlotsByDay = () => {
    const grouped = {};
    daysOfWeek.forEach(day => {
      grouped[day] = timeSlots.filter(slot => slot.day_of_week === day);
    });
    return grouped;
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchTimeSlots}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDay();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your availability and time slots
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsAddTimeSlotOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Time Slot</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Weekly Schedule</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Your recurring availability for each day of the week
          </p>
        </div>

        <div className="p-6">
          {timeSlots.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No time slots configured yet
              </p>
              <button
                onClick={() => setIsAddTimeSlotOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Time Slot</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {daysOfWeek.map(day => (
                <div key={day} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-t-lg border-b border-gray-200 dark:border-gray-600">
                    <h3 className="font-medium text-gray-900 dark:text-white">{day}</h3>
                  </div>
                  <div className="p-4">
                    {groupedSlots[day].length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                        No availability set for {day}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {groupedSlots[day].map(slot => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                          >
                            <div className="flex items-center space-x-4">
                              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {slot.slot_duration} min slots
                                  {slot.break_start_time && slot.break_end_time && (
                                    <span className="ml-2">
                                      • Break: {formatTime(slot.break_start_time)} - {formatTime(slot.break_end_time)}
                                    </span>
                                  )}
                                  {slot.notes && (
                                    <span className="ml-2">• {slot.notes}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingSlot(slot)}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTimeSlot(slot.id)}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Time Slot Modal */}
      <AddTimeSlotForm
        isOpen={isAddTimeSlotOpen}
        onClose={() => setIsAddTimeSlotOpen(false)}
        onTimeSlotAdded={handleAddTimeSlot}
      />

      {/* Edit Time Slot Modal */}
      {editingSlot && (
        <AddTimeSlotForm
          isOpen={!!editingSlot}
          onClose={() => setEditingSlot(null)}
          onTimeSlotAdded={(data) => handleEditTimeSlot(editingSlot.id, data)}
          initialData={editingSlot}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default DoctorSchedule;
