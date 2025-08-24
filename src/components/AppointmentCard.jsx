import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Video,
  Edit,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { updateAppointment, cancelAppointment } from '../../slices/appointmentSlice';

const AppointmentCard = ({ appointment, isCompact = false }) => {
  const dispatch = useDispatch();
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'No Show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'text-red-600';
      case 'High':
        return 'text-orange-600';
      case 'Normal':
        return 'text-blue-600';
      case 'Low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCancelAppointment = async () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setLoading(true);
      try {
        const reason = prompt('Please provide a reason for cancellation:');
        if (reason) {
          await dispatch(cancelAppointment({
            id: appointment.id,
            reason
          })).unwrap();
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      } finally {
        setLoading(false);
        setShowActions(false);
      }
    }
  };

  const canCancelAppointment = () => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);

    return (
      ['Scheduled', 'Confirmed'].includes(appointment.status) &&
      hoursUntilAppointment > 24 // Can only cancel if more than 24 hours away
    );
  };

  if (isCompact) {
    return (
      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Dr. {appointment.Doctor?.first_name} {appointment.Doctor?.last_name}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Dr. {appointment.Doctor?.first_name} {appointment.Doctor?.last_name}
              </h3>
              <p className="text-sm text-gray-500">{appointment.Doctor?.specialization}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
            {canCancelAppointment() && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4" />
                </button>
                {showActions && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border z-10">
                    <button
                      onClick={handleCancelAppointment}
                      disabled={loading}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      {loading ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(appointment.appointment_date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{formatTime(appointment.appointment_time)} ({appointment.duration_minutes} min)</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {appointment.consultation_type === 'Telemedicine' ? (
              <Video className="h-4 w-4" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span>{appointment.consultation_type}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <AlertCircle className={`h-4 w-4 ${getPriorityColor(appointment.priority)}`} />
            <span className={getPriorityColor(appointment.priority)}>{appointment.priority} Priority</span>
          </div>
        </div>

        {/* Appointment Type and Reason */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <span className="text-sm text-gray-600">{appointment.appointment_type}</span>
          </div>
          {appointment.reason && (
            <div>
              <span className="text-sm font-medium text-gray-700">Reason:</span>
              <p className="text-sm text-gray-600 mt-1">{appointment.reason}</p>
            </div>
          )}
        </div>

        {/* Doctor Contact Info */}
        {appointment.Doctor && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Doctor Information</h4>
            <div className="space-y-1">
              {appointment.Doctor.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{appointment.Doctor.phone}</span>
                </div>
              )}
              {appointment.Doctor.office_address && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{appointment.Doctor.office_address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {appointment.status === 'Scheduled' && (
          <div className="border-t pt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Please arrive 15 minutes early
            </div>
            <div className="flex space-x-2">
              {appointment.consultation_type === 'Telemedicine' && (
                <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>Join Call</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {appointment.notes && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
            <p className="text-sm text-gray-600">{appointment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
