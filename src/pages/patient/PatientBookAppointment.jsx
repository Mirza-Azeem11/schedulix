import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { useDoctors } from '../../hooks/useRedux';
import { fetchDoctors } from '../../../slices/doctorSlice';
import { createAppointment } from '../../../slices/appointmentSlice';
import {
  Calendar,
  Clock,
  User,
  Search,
  MapPin,
  Video,
  Phone,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

const PatientBookAppointment = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { doctors, loading: doctorsLoading } = useDoctors();

  const [formData, setFormData] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    appointment_type: '',
    consultation_type: 'In-Person',
    reason: '',
    notes: '',
    priority: 'Normal'
  });

  const [errors, setErrors] = useState({});
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDoctors());
    }
  }, [isOpen, dispatch]);

  const appointmentTypes = [
    'General Consultation',
    'Follow-up',
    'Check-up',
    'Vaccination',
    'Lab Results Review',
    'Prescription Renewal',
    'Emergency',
    'Therapy Session'
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  const filteredDoctors = doctors?.filter(doctor =>
    doctor.first_name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    doctor.last_name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(doctorSearch.toLowerCase())
  ) || [];

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData(prev => ({ ...prev, doctor_id: doctor.id }));
    setDoctorSearch(`Dr. ${doctor.first_name} ${doctor.last_name}`);
    // TODO: Fetch available slots for selected doctor
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, appointment_date: date }));
    // TODO: Update available slots based on date
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctor_id) newErrors.doctor_id = 'Please select a doctor';
    if (!formData.appointment_date) newErrors.appointment_date = 'Please select a date';
    if (!formData.appointment_time) newErrors.appointment_time = 'Please select a time';
    if (!formData.appointment_type) newErrors.appointment_type = 'Please select appointment type';
    if (!formData.reason) newErrors.reason = 'Please provide a reason for the visit';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await dispatch(createAppointment(formData)).unwrap();
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        appointment_type: '',
        consultation_type: 'In-Person',
        reason: '',
        notes: '',
        priority: 'Normal'
      });
      setSelectedDoctor(null);
      setDoctorSearch('');
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to book appointment' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Appointment</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Doctor Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Doctor *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="Search for a doctor..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {doctorSearch && !selectedDoctor && (
              <div className="mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {doctorsLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => handleDoctorSelect(doctor)}
                      className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {doctor.specialty || 'General Practice'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No doctors found
                  </div>
                )}
              </div>
            )}
            {errors.doctor_id && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.doctor_id}</p>
            )}
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Appointment Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {errors.appointment_date && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.appointment_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Appointment Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={formData.appointment_time}
                  onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              {errors.appointment_time && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.appointment_time}</p>
              )}
            </div>
          </div>

          {/* Appointment Type and Consultation Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Appointment Type *
              </label>
              <select
                value={formData.appointment_type}
                onChange={(e) => handleInputChange('appointment_type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select type</option>
                {appointmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.appointment_type && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.appointment_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Consultation Type
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('consultation_type', 'In-Person')}
                  className={`flex-1 p-3 border rounded-lg flex items-center justify-center space-x-2 ${
                    formData.consultation_type === 'In-Person'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <span>In-Person</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('consultation_type', 'Online')}
                  className={`flex-1 p-3 border rounded-lg flex items-center justify-center space-x-2 ${
                    formData.consultation_type === 'Online'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Video className="w-5 h-5" />
                  <span>Online</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason for Visit *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Please describe your symptoms or reason for the appointment..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.reason && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information or special requests..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <div className="flex space-x-4">
              {['Normal', 'High', 'Urgent'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => handleInputChange('priority', priority)}
                  className={`px-4 py-2 border rounded-lg ${
                    formData.priority === priority
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Book Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientBookAppointment;
