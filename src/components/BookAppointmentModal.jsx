import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Clock, User, AlertCircle } from 'lucide-react';
import { createAppointment } from '../../slices/appointmentSlice';
import { doctorsAPI } from '../services/api';
// ---- helpers ---------------------------------------------------------
const stripDrPrefix = (name = '') =>
    name.replace(/^\s*Dr\.?\s*/i, '').trim();

const getDoctorDisplayName = (doctor) => {
  const first = stripDrPrefix(doctor?.User?.first_name ?? doctor?.first_name ?? '');
  const last  = doctor?.User?.last_name ?? doctor?.last_name ?? '';
  // Add "Dr." prefix unless the first name already contained it
  return `Dr. ${[first, last].filter(Boolean).join(' ')}`.trim();
};

// Normalize consultation_hours into:
// { monday:{start,end}, ..., friday:{start,end} } OR { general:{start,end} }
const normalizeConsultationHours = (hours) => {
  if (!hours) return {};

  let parsed = hours;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed); // could be {"general":"09:00-17:00"}
    } catch {
      // maybe a plain window like "09:00-17:00"
      const match = parsed.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
      if (match) return { general: { start: match[1], end: match[2] } };
      return {};
    }
  }

  // If parsed.general is "09:00-17:00", convert to {start,end}
  if (parsed?.general && typeof parsed.general === 'string') {
    const [start, end] = parsed.general.split('-');
    parsed.general = { start, end };
  }

  // Lowercase day keys + keep only valid structures
  const out = {};
  for (const [k, v] of Object.entries(parsed)) {
    const key = k.toLowerCase();
    if (key === 'general' && v?.start && v?.end) {
      out.general = { start: v.start, end: v.end };
    } else if (v && typeof v === 'object' && v.start && v.end) {
      out[key] = { start: v.start, end: v.end };
    }
  }

  return out;
};

const toLocalDateFromInput = (dateString) => {
  // Parse "YYYY-MM-DD" safely (no timezone shift)
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const getDayNameLower = (dateString) =>
    toLocalDateFromInput(dateString)
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();

const pad2 = (n) => String(n).padStart(2, '0');

// Generate slots HH:mm from start to end by interval minutes
const generateTimeSlots = (start, end, intervalMinutes) => {
  if (!start || !end || !intervalMinutes) return [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startDate = new Date(2000, 0, 1, sh, sm, 0, 0);
  const endDate   = new Date(2000, 0, 1, eh, em, 0, 0);

  const slots = [];
  let t = new Date(startDate);
  while (t < endDate) {
    slots.push(`${pad2(t.getHours())}:${pad2(t.getMinutes())}`);
    t = new Date(t.getTime() + intervalMinutes * 60000);
  }
  return slots;
};

const getMinDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getMaxDate = () => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  return maxDate.toISOString().split('T')[0];
};

// ---- component -------------------------------------------------------
const BookAppointmentModal = ({ isOpen, onClose, patientId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  console.log('BookAppointmentModal: user:', user);
  const { loading } = useSelector((state) => state.appointments);

  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // "YYYY-MM-DD"
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentData, setAppointmentData] = useState({
    appointment_type: 'Consultation',
    consultation_type: 'In-Person',
    reason: '',
    priority: 'Normal',
    duration_minutes: 30,
  });
  const [errors, setErrors] = useState({});
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // fetch doctors when opened
  useEffect(() => {
    if (!isOpen) return;
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const response = await doctorsAPI.getAll({ limit: 100 });
        const doctorsData =
            response?.data?.data?.doctors ||
            response?.data?.doctors ||
            response?.data?.data ||
            [];

        const normalized = (Array.isArray(doctorsData) ? doctorsData : []).map((doc) => ({
          ...doc,
          _normalized_hours: normalizeConsultationHours(doc.consultation_hours),
        }));
        setDoctors(normalized);
        setErrors((e) => ({ ...e, doctors: undefined }));
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
        setErrors((e) => ({ ...e, doctors: 'Failed to load doctors' }));
      } finally {
        setLoadingDoctors(false);
      }
    };

    // reset form & load
    setStep(1);
    resetForm();
    fetchDoctors();
  }, [isOpen]);

  const resetForm = () => {
    setSelectedDoctorId('');
    setSelectedDate('');
    setSelectedTime('');
    setAppointmentData({
      appointment_type: 'Consultation',
      consultation_type: 'In-Person',
      reason: '',
      priority: 'Normal',
      duration_minutes: 30,
    });
    setErrors({});
  };

  const selectedDoctor = useMemo(
      () => doctors.find((d) => d.id?.toString() === selectedDoctorId),
      [doctors, selectedDoctorId]
  );

  // compute slots locally from doctor's consultation_hours
  const availableTimesForDate = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    const hours = selectedDoctor._normalized_hours || {};
    const day = getDayNameLower(selectedDate);

    // prefer day-specific hours; otherwise use general
    let windowObj = hours[day];
    if (!windowObj && hours.general) windowObj = hours.general;

    if (!windowObj?.start || !windowObj?.end) return [];
    return generateTimeSlots(
        windowObj.start,
        windowObj.end,
        Number(appointmentData.duration_minutes || 30)
    );
  }, [selectedDoctor, selectedDate, appointmentData.duration_minutes]);

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!selectedDoctorId) newErrors.doctor = 'Please select a doctor';
    } else if (currentStep === 2) {
      if (!selectedDate) newErrors.date = 'Please select a date';
      if (!selectedTime) newErrors.time = 'Please select a time';
      // also guard: if doctor doesn’t work that day
      if (selectedDate && availableTimesForDate.length === 0) {
        newErrors.time = 'No working hours for the selected date';
      }
    } else if (currentStep === 3) {
      if (!appointmentData.reason.trim()) {
        newErrors.reason = 'Please provide a reason for the appointment';
      }
    }

    setErrors(newErrors);
    console.log('Errors:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    console.log('Submitting. next..');

    if (!patientId) {
      setErrors({ submit: 'Patient ID is missing. Please refresh and try again.' });
      return;
    }

    const formattedTime = selectedTime.includes(':')
        ? selectedTime.split(':').slice(0, 2).join(':')
        : selectedTime;

    const bookingData = {
      patient_id: parseInt(patientId, 10),
      doctor_id: parseInt(selectedDoctorId, 10),
      appointment_date: selectedDate, // "YYYY-MM-DD"
      appointment_time: formattedTime, // "HH:MM"
      ...appointmentData,
    };

    try {
      await dispatch(createAppointment(bookingData)).unwrap();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Appointment booking error:', error);
      setErrors({ submit: error?.message || 'Failed to book appointment' });
    }
  };

  if (!isOpen) return null;

  // ---- UI ------------------------------------------------------------
  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-lg border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Book Appointment</h2>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center space-x-3">
              {[1, 2, 3].map((num) => (
                  <div key={num} className="flex items-center">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            step >= num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                      {num}
                    </div>
                    {num < 3 && (
                        <div
                            className={`w-10 h-1 mx-2 rounded ${
                                step > num ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                        />
                    )}
                  </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {step === 1 && 'Select Doctor'}
              {step === 2 && 'Choose Date & Time'}
              {step === 3 && 'Appointment Details'}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Doctor */}
            {step === 1 && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Doctor
                  </label>

                  {loadingDoctors ? (
                      <div className="text-center py-6">Loading doctors...</div>
                  ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {Array.isArray(doctors) && doctors.length > 0 ? (
                            doctors.map((doctor) => {
                              const years = Number(doctor.experience_years);
                              const exp =
                                  Number.isFinite(years) && years >= 0 && years <= 80
                                      ? `${years} years experience`
                                      : null;

                              const isSelected = selectedDoctorId === doctor.id.toString();

                              return (
                                  <button
                                      type="button"
                                      key={doctor.id}
                                      onClick={() => {
                                        setSelectedDoctorId(doctor.id.toString());
                                        // reset date/time when switching doctor
                                        setSelectedDate('');
                                        setSelectedTime('');
                                      }}
                                      className={`w-full text-left p-3 border rounded-xl transition-colors ${
                                          isSelected
                                              ? 'border-primary-500 bg-primary-50'
                                              : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <User className="h-8 w-8 text-gray-400" />
                                      <div className="min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">
                                          {getDoctorDisplayName(doctor)}
                                        </h4>
                                        <p className="text-sm text-gray-500 truncate">
                                          {doctor.specialization}
                                        </p>
                                        {exp && (
                                            <p className="text-xs text-gray-400">{exp}</p>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                              );
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                              <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p>No doctors available</p>
                              <p className="text-sm">Please try again later</p>
                            </div>
                        )}
                      </div>
                  )}

                  {errors.doctors && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.doctors}
                      </p>
                  )}
                  {errors.doctor && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.doctor}
                      </p>
                  )}
                </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedTime('');
                        }}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.date && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.date}
                        </p>
                    )}
                  </div>

                  {selectedDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Time Slots
                        </label>

                        {availableTimesForDate.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                              {availableTimesForDate.map((time) => (
                                  <button
                                      key={time}
                                      onClick={() => setSelectedTime(time)}
                                      className={`p-2 text-sm border rounded-lg transition-colors ${
                                          selectedTime === time
                                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                                              : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                  >
                                    {time}
                                  </button>
                              ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p>No available slots for this date</p>
                            </div>
                        )}

                        {errors.time && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.time}
                            </p>
                        )}
                      </div>
                  )}
                </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
                <div className="space-y-4">
                  {/* Summary pill */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
                    <span className="font-medium">{getDoctorDisplayName(selectedDoctor || {})}</span>
                    {selectedDate && selectedTime ? (
                        <> — {selectedDate} at {selectedTime}</>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Type
                    </label>
                    <select
                        value={appointmentData.appointment_type}
                        onChange={(e) =>
                            setAppointmentData({ ...appointmentData, appointment_type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Check-up">Check-up</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation Type
                    </label>
                    <select
                        value={appointmentData.consultation_type}
                        onChange={(e) =>
                            setAppointmentData({ ...appointmentData, consultation_type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="In-Person">In-Person</option>
                      <option value="Telemedicine">Telemedicine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit
                    </label>
                    <textarea
                        value={appointmentData.reason}
                        onChange={(e) =>
                            setAppointmentData({ ...appointmentData, reason: e.target.value })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Describe your symptoms or reason for the appointment..."
                    />
                    {errors.reason && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.reason}
                        </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                        value={appointmentData.priority}
                        onChange={(e) =>
                            setAppointmentData({ ...appointmentData, priority: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Duration control (optional, drives slot size) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                        type="number"
                        min={10}
                        step={5}
                        value={appointmentData.duration_minutes}
                        onChange={(e) =>
                            setAppointmentData({
                              ...appointmentData,
                              duration_minutes: Number(e.target.value || 30),
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Changes slot granularity on the previous step.
                    </p>
                  </div>

                  {errors.submit && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.submit}
                        </p>
                      </div>
                  )}
                </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50 rounded-b-2xl">
            <div>
              {step > 1 && (
                  <button
                      onClick={handleBack}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Back
                  </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>

              {step < 3 ? (
                  <button
                      onClick={handleNext}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      disabled={
                          (step === 1 && !selectedDoctorId) ||
                          (step === 2 && (!selectedDate || !selectedTime))
                      }
                  >
                    Next
                  </button>
              ) : (
                  <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default BookAppointmentModal;

// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { X, Calendar, Clock, User, FileText, AlertCircle } from 'lucide-react';
// import { createAppointment } from '../../slices/appointmentSlice';
// import { doctorsAPI, timeSlotsAPI } from '../services/api';
//
// const BookAppointmentModal = ({ isOpen, onClose, patientId }) => {
//   const dispatch = useDispatch();
//   const { loading } = useSelector((state) => state.appointments);
//
//   const [step, setStep] = useState(1);
//   const [doctors, setDoctors] = useState([]);
//   const [selectedDoctor, setSelectedDoctor] = useState('');
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [selectedTime, setSelectedTime] = useState('');
//   const [appointmentData, setAppointmentData] = useState({
//     appointment_type: 'Consultation',
//     consultation_type: 'In-Person',
//     reason: '',
//     priority: 'Normal',
//     duration_minutes: 30
//   });
//   const [errors, setErrors] = useState({});
//   const [loadingDoctors, setLoadingDoctors] = useState(false);
//   const [loadingSlots, setLoadingSlotsState] = useState(false);
//
//   // Fetch doctors on component mount
//   useEffect(() => {
//     if (isOpen) {
//       fetchDoctors();
//       setStep(1);
//       resetForm();
//     }
//   }, [isOpen]);
//
//   // Fetch available time slots when doctor and date are selected
//   useEffect(() => {
//     if (selectedDoctor && selectedDate) {
//       fetchAvailableSlots();
//     }
//   }, [selectedDoctor, selectedDate]);
//
//   const fetchDoctors = async () => {
//     setLoadingDoctors(true);
//     try {
//       const response = await doctorsAPI.getAll({ limit: 100 });
//       // The backend returns: { success: true, data: { doctors: [...], pagination: {...} } }
//       const doctorsData = response.data?.data?.doctors || response.data?.doctors || response.data?.data || [];
//       setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
//     } catch (error) {
//       console.error('Error fetching doctors:', error);
//       setDoctors([]); // Ensure doctors is an array even on error
//       setErrors({ doctors: 'Failed to load doctors' });
//     } finally {
//       setLoadingDoctors(false);
//     }
//   };
//
//   const fetchAvailableSlots = async () => {
//     setLoadingSlotsState(true);
//     try {
//       const response = await timeSlotsAPI.getAll({
//         doctor_id: selectedDoctor,
//         date: selectedDate,
//         available: true
//       });
//       setAvailableSlots(response.data.data || []);
//     } catch (error) {
//       console.error('Error fetching time slots:', error);
//       setAvailableSlots([]);
//     } finally {
//       setLoadingSlotsState(false);
//     }
//   };
//
//   const resetForm = () => {
//     setSelectedDoctor('');
//     setSelectedDate('');
//     setSelectedTime('');
//     setAppointmentData({
//       appointment_type: 'Consultation',
//       consultation_type: 'In-Person',
//       reason: '',
//       priority: 'Normal',
//       duration_minutes: 30
//     });
//     setErrors({});
//     setAvailableSlots([]);
//   };
//
//   const validateStep = (currentStep) => {
//     const newErrors = {};
//
//     switch (currentStep) {
//       case 1:
//         if (!selectedDoctor) newErrors.doctor = 'Please select a doctor';
//         break;
//       case 2:
//         if (!selectedDate) newErrors.date = 'Please select a date';
//         if (!selectedTime) newErrors.time = 'Please select a time';
//         break;
//       case 3:
//         if (!appointmentData.reason.trim()) newErrors.reason = 'Please provide a reason for the appointment';
//         break;
//     }
//
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
//
//   const handleNext = () => {
//     if (validateStep(step)) {
//       setStep(step + 1);
//     }
//   };
//
//   const handleBack = () => {
//     setStep(step - 1);
//     setErrors({});
//   };
//
//   const handleSubmit = async () => {
//     if (!validateStep(3)) return;
//
//     // Validate that we have a patientId
//     if (!patientId) {
//       setErrors({ submit: 'Patient ID is missing. Please refresh and try again.' });
//       return;
//     }
//
//     // Format the time to HH:MM (remove seconds if present)
//     const formattedTime = selectedTime.includes(':')
//       ? selectedTime.split(':').slice(0, 2).join(':')
//       : selectedTime;
//
//     const bookingData = {
//       patient_id: parseInt(patientId), // Ensure patient_id is an integer
//       doctor_id: parseInt(selectedDoctor),
//       appointment_date: selectedDate,
//       appointment_time: formattedTime, // Use formatted time (HH:MM)
//       ...appointmentData
//     };
//
//     console.log('Booking data being sent:', bookingData); // Debug log
//
//     try {
//       await dispatch(createAppointment(bookingData)).unwrap();
//       onClose();
//       resetForm();
//       // Show success message
//     } catch (error) {
//       console.error('Appointment booking error:', error);
//       setErrors({ submit: error.message || 'Failed to book appointment' });
//     }
//   };
//
//   const getMinDate = () => {
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     return tomorrow.toISOString().split('T')[0];
//   };
//
//   const getMaxDate = () => {
//     const maxDate = new Date();
//     maxDate.setDate(maxDate.getDate() + 90); // 90 days from now
//     return maxDate.toISOString().split('T')[0];
//   };
//
//   if (!isOpen) return null;
//
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b">
//           <h2 className="text-xl font-semibold text-gray-900">Book Appointment</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <X className="h-6 w-6" />
//           </button>
//         </div>
//
//         {/* Progress Steps */}
//         <div className="px-6 py-4 border-b">
//           <div className="flex items-center space-x-4">
//             {[1, 2, 3].map((stepNumber) => (
//               <div key={stepNumber} className="flex items-center">
//                 <div
//                   className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
//                     step >= stepNumber
//                       ? 'bg-primary-600 text-white'
//                       : 'bg-gray-200 text-gray-600'
//                   }`}
//                 >
//                   {stepNumber}
//                 </div>
//                 {stepNumber < 3 && (
//                   <div
//                     className={`w-8 h-1 mx-2 ${
//                       step > stepNumber ? 'bg-primary-600' : 'bg-gray-200'
//                     }`}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="mt-2 text-sm text-gray-600">
//             {step === 1 && 'Select Doctor'}
//             {step === 2 && 'Choose Date & Time'}
//             {step === 3 && 'Appointment Details'}
//           </div>
//         </div>
//
//         {/* Content */}
//         <div className="p-6">
//           {/* Step 1: Select Doctor */}
//           {step === 1 && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Select Doctor
//                 </label>
//                 {loadingDoctors ? (
//                   <div className="text-center py-4">Loading doctors...</div>
//                 ) : (
//                   <div className="space-y-2 max-h-60 overflow-y-auto">
//                     {Array.isArray(doctors) && doctors.length > 0 ? (
//                       doctors.map((doctor) => (
//                         <div
//                           key={doctor.id}
//                           className={`p-3 border rounded-lg cursor-pointer transition-colors ${
//                             selectedDoctor === doctor.id.toString()
//                               ? 'border-primary-500 bg-primary-50'
//                               : 'border-gray-200 hover:border-gray-300'
//                           }`}
//                           onClick={() => setSelectedDoctor(doctor.id.toString())}
//                         >
//                           <div className="flex items-center space-x-3">
//                             <User className="h-8 w-8 text-gray-400" />
//                             <div>
//                               <h4 className="font-medium text-gray-900">
//                                 Dr. {doctor.User?.first_name || doctor.first_name} {doctor.User?.last_name || doctor.last_name}
//                               </h4>
//                               <p className="text-sm text-gray-500">{doctor.specialization}</p>
//                               <p className="text-xs text-gray-400">{doctor.experience_years} years experience</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-center py-8 text-gray-500">
//                         <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
//                         <p>No doctors available</p>
//                         <p className="text-sm">Please try again later</p>
//                       </div>
//                     )}
//                   </div>
//                 )}
//                 {errors.doctor && (
//                   <p className="mt-1 text-sm text-red-600 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.doctor}
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//
//           {/* Step 2: Select Date & Time */}
//           {step === 2 && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Appointment Date
//                 </label>
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   min={getMinDate()}
//                   max={getMaxDate()}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
//                 />
//                 {errors.date && (
//                   <p className="mt-1 text-sm text-red-600 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.date}
//                   </p>
//                 )}
//               </div>
//
//               {selectedDate && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Available Time Slots
//                   </label>
//                   {loadingSlots ? (
//                     <div className="text-center py-4">Loading available slots...</div>
//                   ) : availableSlots.length > 0 ? (
//                     <div className="grid grid-cols-3 gap-2">
//                       {availableSlots.map((slot) => (
//                         <button
//                           key={slot.id}
//                           onClick={() => setSelectedTime(slot.start_time)}
//                           className={`p-2 text-sm border rounded-lg transition-colors ${
//                             selectedTime === slot.start_time
//                               ? 'border-primary-500 bg-primary-50 text-primary-700'
//                               : 'border-gray-200 hover:border-gray-300'
//                           }`}
//                         >
//                           {slot.start_time}
//                         </button>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center py-4 text-gray-500">
//                       <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
//                       <p>No available slots for this date</p>
//                     </div>
//                   )}
//                   {errors.time && (
//                     <p className="mt-1 text-sm text-red-600 flex items-center">
//                       <AlertCircle className="h-4 w-4 mr-1" />
//                       {errors.time}
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//
//           {/* Step 3: Appointment Details */}
//           {step === 3 && (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Appointment Type
//                 </label>
//                 <select
//                   value={appointmentData.appointment_type}
//                   onChange={(e) => setAppointmentData({...appointmentData, appointment_type: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
//                 >
//                   <option value="Consultation">Consultation</option>
//                   <option value="Follow-up">Follow-up</option>
//                   <option value="Check-up">Check-up</option>
//                   <option value="Emergency">Emergency</option>
//                 </select>
//               </div>
//
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Consultation Type
//                 </label>
//                 <select
//                   value={appointmentData.consultation_type}
//                   onChange={(e) => setAppointmentData({...appointmentData, consultation_type: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
//                 >
//                   <option value="In-Person">In-Person</option>
//                   <option value="Telemedicine">Telemedicine</option>
//                 </select>
//               </div>
//
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Reason for Visit
//                 </label>
//                 <textarea
//                   value={appointmentData.reason}
//                   onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}
//                   rows={3}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
//                   placeholder="Please describe your symptoms or reason for the appointment..."
//                 />
//                 {errors.reason && (
//                   <p className="mt-1 text-sm text-red-600 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.reason}
//                   </p>
//                 )}
//               </div>
//
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Priority
//                 </label>
//                 <select
//                   value={appointmentData.priority}
//                   onChange={(e) => setAppointmentData({...appointmentData, priority: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
//                 >
//                   <option value="Low">Low</option>
//                   <option value="Normal">Normal</option>
//                   <option value="High">High</option>
//                   <option value="Urgent">Urgent</option>
//                 </select>
//               </div>
//
//               {errors.submit && (
//                 <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                   <p className="text-sm text-red-600 flex items-center">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.submit}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//
//         {/* Footer */}
//         <div className="flex items-center justify-between p-6 border-t bg-gray-50">
//           <div>
//             {step > 1 && (
//               <button
//                 onClick={handleBack}
//                 className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
//               >
//                 Back
//               </button>
//             )}
//           </div>
//           <div className="flex space-x-3">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
//             >
//               Cancel
//             </button>
//             {step < 3 ? (
//               <button
//                 onClick={handleNext}
//                 className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
//                 disabled={step === 1 && !selectedDoctor}
//               >
//                 Next
//               </button>
//             ) : (
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
//               >
//                 {loading ? 'Booking...' : 'Book Appointment'}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default BookAppointmentModal;
