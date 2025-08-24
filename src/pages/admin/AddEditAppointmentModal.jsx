import React, { useState, useEffect } from 'react';
import { appointmentsAPI, doctorsAPI, patientsAPI } from '../../services/api';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  X,
  CalendarPlus,
  AlertCircle,
  DollarSign,
  Bell,
  Search,
  MapPin,
  Video
} from 'lucide-react';

const AddEditAppointmentModal = ({ isOpen, onClose, appointment = null, onSuccess }) => {
  const isEdit = !!appointment;

  const [formData, setFormData] = useState({
    patient_id: '',
    patientName: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    duration: '30',
    appointmentType: '',
    type: 'Consultation', // Keep for backward compatibility
    reason: '',
    notes: '',
    status: 'Scheduled',
    priority: 'Normal',
    fee: '',
    reminderEnabled: true,
    reminderTime: '24',
    location: 'Clinic',
    consultationType: 'In-Person'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const appointmentTypes = [
    'General Consultation',
    'Follow-up',
    'Check-up',
    'Vaccination',
    'Lab Results Review',
    'Prescription Renewal',
    'Emergency',
    'Surgery Consultation',
    'Therapy Session',
    'Other'
  ];

  const statusOptions = [
    'Scheduled', 'Confirmed', 'Pending', 'In Progress', 'Completed',
    'Cancelled', 'No Show', 'Rescheduled'
  ];

  const priorityOptions = ['Low', 'Normal', 'High', 'Urgent'];

  const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ];

  const reminderOptions = [
    { value: '1', label: '1 hour before' },
    { value: '2', label: '2 hours before' },
    { value: '24', label: '1 day before' },
    { value: '48', label: '2 days before' },
    { value: '168', label: '1 week before' }
  ];

  const consultationTypes = ['In-Person', 'Video Call', 'Phone Call'];
  const locationOptions = ['Clinic', 'Hospital', 'Home Visit', 'Online'];

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isEdit && appointment) {
      const appointmentDate = appointment.appointment_date ?
        new Date(appointment.appointment_date).toISOString().split('T')[0] : '';

      setFormData({
        patient_id: appointment.patient_id || '',
        patientName: appointment.patientName || '',
        doctor_id: appointment.doctor_id || '',
        appointment_date: appointmentDate,
        appointment_time: appointment.appointment_time || '',
        duration: appointment.duration || '30',
        appointmentType: appointment.appointmentType || '',
        type: appointment.type || 'Consultation',
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        status: appointment.status || 'Scheduled',
        priority: appointment.priority || 'Normal',
        fee: appointment.fee || '',
        reminderEnabled: appointment.reminderEnabled !== undefined ? appointment.reminderEnabled : true,
        reminderTime: appointment.reminderTime || '24',
        location: appointment.location || 'Clinic',
        consultationType: appointment.consultationType || 'In-Person'
      });
    } else if (isOpen && !isEdit) {
      setFormData({
        patient_id: '',
        patientName: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        duration: '30',
        appointmentType: '',
        type: 'Consultation',
        reason: '',
        notes: '',
        status: 'Scheduled',
        priority: 'Normal',
        fee: '',
        reminderEnabled: true,
        reminderTime: '24',
        location: 'Clinic',
        consultationType: 'In-Person'
      });
    }
    setErrors({});
  }, [isOpen, isEdit, appointment]);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const [doctorsResponse, patientsResponse] = await Promise.all([
        doctorsAPI.getAll(),
        patientsAPI.getAll()
      ]);

      const doctorList = Array.isArray(doctorsResponse.data?.data?.doctors)
        ? doctorsResponse.data.data.doctors
        : [];

      const patientList = Array.isArray(patientsResponse.data?.data?.patients)
        ? patientsResponse.data.data.patients
        : [];

      setDoctors(doctorList);
      setPatients(patientList);
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const filteredPatients = Array.isArray(patients) ? patients.filter(
    (patient) => {
      // Handle different possible patient data structures
      const firstName = patient.User?.first_name || patient.first_name || '';
      const lastName = patient.User?.last_name || patient.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const email = patient.User?.email || patient.email || '';
      const patientCode = patient.patient_code || '';

      const searchLower = patientSearch.toLowerCase();

      return fullName.toLowerCase().includes(searchLower) ||
             email.toLowerCase().includes(searchLower) ||
             firstName.toLowerCase().includes(searchLower) ||
             lastName.toLowerCase().includes(searchLower) ||
             patientCode.toLowerCase().includes(searchLower);
    }
  ) : [];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient_id) newErrors.patient_id = 'Please select a patient';
    if (!formData.doctor_id) newErrors.doctor_id = 'Doctor is required';
    if (!formData.appointment_date) newErrors.appointment_date = 'Appointment date is required';
    if (!formData.appointment_time) newErrors.appointment_time = 'Appointment time is required';
    if (!formData.appointmentType) newErrors.appointmentType = 'Appointment type is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for visit is required';

    // Validate appointment is in the future (for new appointments)
    if (!isEdit && formData.appointment_date && formData.appointment_time) {
      const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`);
      const now = new Date();
      if (appointmentDateTime <= now) {
        newErrors.appointment_date = 'Appointment cannot be scheduled in the past';
      }
    }

    if (formData.fee && formData.fee < 0) {
      newErrors.fee = 'Fee must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    const selectedDoctor = doctors.find(d => d.id.toString() === doctorId);

    setFormData(prev => ({
      ...prev,
      doctor_id: doctorId,
      fee: selectedDoctor?.consultation_fee || prev.fee
    }));

    if (errors.doctor_id) {
      setErrors(prev => ({
        ...prev,
        doctor_id: ''
      }));
    }
  };

  const handlePatientSearch = (e) => {
    const value = e.target.value;
    setPatientSearch(value);
    setShowPatientDropdown(true);

    if (!value) {
      setFormData(prev => ({ ...prev, patient_id: '', patientName: '' }));
    }
  };

  const handlePatientSelect = (patient) => {
    const firstName = patient.User?.first_name || patient.first_name || '';
    const lastName = patient.User?.last_name || patient.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Patient';

    setFormData(prev => ({
      ...prev,
      patient_id: patient.id,
      patientName: fullName
    }));
    setPatientSearch(fullName);
    setShowPatientDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Prepare appointment data in the format expected by the backend API
      const appointmentData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        duration_minutes: parseInt(formData.duration),
        appointment_type: formData.appointmentType,
        consultation_type: formData.consultationType,
        reason: formData.reason,
        notes: formData.notes,
        priority: formData.priority,
        location: formData.location,
        status: formData.status,
        // Additional fields for admin functionality
        fee: formData.fee ? parseFloat(formData.fee) : undefined,
        reminder_enabled: formData.reminderEnabled,
        reminder_time_hours: formData.reminderEnabled ? parseInt(formData.reminderTime) : undefined
      };

      // Remove undefined fields to keep the payload clean
      Object.keys(appointmentData).forEach(key =>
        appointmentData[key] === undefined && delete appointmentData[key]
      );

      let response;
      if (isEdit) {
        response = await appointmentsAPI.update(appointment.id, appointmentData);
      } else {
        response = await appointmentsAPI.create(appointmentData);
      }

      // Show success message (you can customize this based on your notification system)
      console.log(`Appointment ${isEdit ? 'updated' : 'created'} successfully:`, response.data);

      // Call the success callback to refresh the appointment list
      onSuccess();
      onClose();

      // Reset form state
      resetForm();
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} appointment:`, error);

      // Handle different types of errors
      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} appointment. Please try again.`;

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = {};
        error.response.data.errors.forEach(err => {
          validationErrors[err.path || err.param] = err.msg;
        });
        setErrors(validationErrors);
        return;
      }

      setErrors({ general: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      patientName: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      duration: '30',
      appointmentType: '',
      type: 'Consultation',
      reason: '',
      notes: '',
      status: 'Scheduled',
      priority: 'Normal',
      fee: '',
      reminderEnabled: true,
      reminderTime: '24',
      location: 'Clinic',
      consultationType: 'In-Person'
    });
    setErrors({});
    setPatientSearch('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CalendarPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEdit ? 'Edit Appointment' : 'Schedule New Appointment'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {isEdit ? 'Update appointment details' : 'Schedule a new appointment for a patient'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-300">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Loading Options */}
          {loadingOptions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-700 dark:text-blue-300">Loading doctors and patients...</span>
              </div>
            </div>
          )}

          {/* Appointment Details */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appointment Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Patient *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientDropdown(true);
                      if (!e.target.value) {
                        setFormData(prev => ({ ...prev, patient_id: '', patientName: '' }));
                      }
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.patient_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Search for a patient..."
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {errors.patient_id && <p className="text-red-500 text-sm mt-1">{errors.patient_id}</p>}

                {/* Patient Dropdown */}
                {showPatientDropdown && patientSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => {
                        const firstName = patient.User?.first_name || patient.first_name || '';
                        const lastName = patient.User?.last_name || patient.last_name || '';
                        const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Patient';
                        const email = patient.User?.email || patient.email || '';
                        const patientCode = patient.patient_code || patient.code || '';

                        return (
                          <div
                            key={patient.id}
                            onClick={() => handlePatientSelect(patient)}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 ring-2 ring-gray-200 dark:ring-gray-600">
                              {firstName.charAt(0) || 'P'}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {fullName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                                <span>{patientCode}</span>
                                {email && <span>• {email}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        No patients found matching "{patientSearch}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Doctor *
                </label>
                <div className="relative">
                  <Stethoscope className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleDoctorChange}
                    disabled={loadingOptions}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.doctor_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.User?.first_name} {doctor.User?.last_name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.doctor_id && <p className="text-red-500 text-sm mt-1">{errors.doctor_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.appointment_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.appointment_date && <p className="text-red-500 text-sm mt-1">{errors.appointment_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Appointment Time *
                </label>
                <div className="relative">
                  <Clock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.appointment_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
                {errors.appointment_time && <p className="text-red-500 text-sm mt-1">{errors.appointment_time}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Appointment Type *
                </label>
                <select
                  name="appointmentType"
                  value={formData.appointmentType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.appointmentType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select appointment type</option>
                  {appointmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.appointmentType && <p className="text-red-500 text-sm mt-1">{errors.appointmentType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Visit *
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.reason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter the reason for this appointment"
                />
                {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fee
                </label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="fee"
                    value={formData.fee}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.fee ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter appointment fee"
                  />
                </div>
                {errors.fee && <p className="text-red-500 text-sm mt-1">{errors.fee}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reminder
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="reminderEnabled"
                      checked={formData.reminderEnabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, reminderEnabled: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Enable reminder
                    </span>
                  </div>
                  {formData.reminderEnabled && (
                    <div className="flex items-center space-x-2">
                      <select
                        name="reminderTime"
                        value={formData.reminderTime}
                        onChange={handleInputChange}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {reminderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-500 dark:text-gray-400">
                        before the appointment
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Consultation Type
                </label>
                <select
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {consultationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <div className="relative">
                <FileText className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter appointment notes or special instructions"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingOptions}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{isEdit ? 'Update Appointment' : 'Schedule Appointment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditAppointmentModal;
