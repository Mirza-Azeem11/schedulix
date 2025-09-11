"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Clock, User, Bell, Search, Building } from "lucide-react"
import { authAPI } from "../../services/api"

const NewAppointment = ({ isOpen, onClose, onAddAppointment, patients = [], doctors = [] }) => {
    const [formData, setFormData] = useState({
        organizationId: "",
        patientId: "",
        patientName: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        duration: "30",
        appointmentType: "",
        reason: "",
        notes: "",
        status: "Scheduled",
        priority: "Normal",
        reminderEnabled: true,
        reminderTime: "24", // hours before
        location: "Clinic",
        consultationType: "In-Person",
    })

    const [errors, setErrors] = useState({})
    const [patientSearch, setPatientSearch] = useState("")
    const [showPatientDropdown, setShowPatientDropdown] = useState(false)
    const [organizations, setOrganizations] = useState([])
    const [loadingOrganizations, setLoadingOrganizations] = useState(false)

    const appointmentTypes = [
        "General Consultation",
        "Follow-up",
        "Check-up",
        "Vaccination",
        "Lab Results Review",
        "Prescription Renewal",
        "Emergency",
        "Surgery Consultation",
        "Therapy Session",
        "Other",
    ]

    const durationOptions = [
        { value: "15", label: "15 minutes" },
        { value: "30", label: "30 minutes" },
        { value: "45", label: "45 minutes" },
        { value: "60", label: "1 hour" },
        { value: "90", label: "1.5 hours" },
        { value: "120", label: "2 hours" },
    ]

    const statusOptions = ["Scheduled", "Confirmed", "Pending", "Cancelled"]
    const priorityOptions = ["Low", "Normal", "High", "Urgent"]
    const reminderOptions = [
        { value: "1", label: "1 hour before" },
        { value: "2", label: "2 hours before" },
        { value: "24", label: "1 day before" },
        { value: "48", label: "2 days before" },
        { value: "168", label: "1 week before" },
    ]

    const consultationTypes = ["In-Person", "Video Call", "Phone Call"]
    const locationOptions = ["Clinic", "Hospital", "Home Visit", "Online"]

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
    ) : []

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }))
        }
    }

    const handlePatientSelect = (patient) => {
        const firstName = patient.User?.first_name || patient.first_name || '';
        const lastName = patient.User?.last_name || patient.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Patient';

        setFormData((prev) => ({
            ...prev,
            patientId: patient.id,
            patientName: fullName,
        }))
        setPatientSearch(fullName)
        setShowPatientDropdown(false)
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.patientId) newErrors.patientId = "Please select a patient"
        if (!formData.appointmentDate) newErrors.appointmentDate = "Appointment date is required"
        if (!formData.appointmentTime) newErrors.appointmentTime = "Appointment time is required"
        if (!formData.appointmentType) newErrors.appointmentType = "Appointment type is required"
        if (!formData.reason.trim()) newErrors.reason = "Reason for visit is required"

        // Check if appointment is in the past
        const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`)
        if (appointmentDateTime < new Date()) {
            newErrors.appointmentDate = "Appointment cannot be scheduled in the past"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            const selectedPatient = patients.find((p) => p.id === formData.patientId)
            const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`)

            const newAppointment = {
                ...formData,
                id: Date.now().toString(),
                patient: selectedPatient,
                createdAt: new Date().toISOString(),
                appointmentDateTime: appointmentDateTime.toISOString(),
                endTime: new Date(appointmentDateTime.getTime() + Number.parseInt(formData.duration) * 60000).toISOString(),
            }

            onAddAppointment(newAppointment)
            onClose()
            resetForm()
        }
    }

    const resetForm = () => {
        setFormData({
            organizationId: "",
            patientId: "",
            patientName: "",
            doctorId: "",
            appointmentDate: "",
            appointmentTime: "",
            duration: "30",
            appointmentType: "",
            reason: "",
            notes: "",
            status: "Scheduled",
            priority: "Normal",
            reminderEnabled: true,
            reminderTime: "24",
            location: "Clinic",
            consultationType: "In-Person",
        })
        setErrors({})
        setPatientSearch("")
    }

    useEffect(() => {
        if (isOpen) {
            loadOrganizations();
        }
    }, [isOpen])

    const loadOrganizations = async () => {
        setLoadingOrganizations(true);
        try {
            const response = await authAPI.getOrganizations();
            const orgList = Array.isArray(response.data?.data?.organizations)
                ? response.data.data.organizations
                : [];
            setOrganizations(orgList);
        } catch (error) {
            console.error('Error loading organizations:', error);
        } finally {
            setLoadingOrganizations(false);
        }
    };

    // Filter doctors based on selected organization
    const filteredDoctorsForOrg = Array.isArray(doctors) ? doctors.filter(doctor => {
        // If no organization is selected, show all doctors
        if (!formData.organizationId) return true;

        // Filter doctors by their tenant_id matching the selected organization
        return doctor.tenant_id?.toString() === formData.organizationId;
    }) : [];

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Appointment</h2>
                                <p className="text-gray-600 dark:text-gray-400">Schedule a new appointment with patient</p>
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
                    {/* Organization Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Building className="w-5 h-5 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Organization Selection</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Healthcare Organization *
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    name="organizationId"
                                    value={formData.organizationId}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        // Reset doctor selection when organization changes
                                        setFormData(prev => ({ ...prev, doctorId: '' }));
                                    }}
                                    disabled={loadingOrganizations}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Select healthcare organization</option>
                                    {organizations.map((org) => (
                                        <option key={org.id} value={org.id}>
                                            {org.name}                                        </option>
                                    ))}
                                </select>
                            </div>
                            {loadingOrganizations && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Loading organizations...</p>
                            )}
                        </div>

                        {/* Doctor Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Assigned Doctor
                            </label>
                            <select
                                name="doctorId"
                                value={formData.doctorId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Select doctor (optional)</option>
                                {filteredDoctorsForOrg.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        Dr. {doctor.User?.first_name} {doctor.User?.last_name} - {doctor.specialization}
                                    </option>
                                ))}
                            </select>
                            {formData.organizationId && filteredDoctorsForOrg.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    No doctors available for the selected organization
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Patient Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <User className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Information</h3>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Patient *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={patientSearch}
                                    onChange={(e) => {
                                        setPatientSearch(e.target.value)
                                        setShowPatientDropdown(true)
                                        if (!e.target.value) {
                                            setFormData((prev) => ({ ...prev, patientId: "", patientName: "" }))
                                        }
                                    }}
                                    onFocus={() => setShowPatientDropdown(true)}
                                    className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                        errors.patientId ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                    placeholder="Search for a patient..."
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                            {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}

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
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{fullName}</p>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                                            {email && <span>{email}</span>}
                                                            {patientCode && (
                                                                <>
                                                                    {email && <span>•</span>}
                                                                    <span>ID: {patientCode}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                            {patientSearch ? 'No patients found matching your search' : 'Start typing to search for patients'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Clock className="w-5 h-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appointment Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Appointment Date *
                                </label>
                                <input
                                    type="date"
                                    name="appointmentDate"
                                    value={formData.appointmentDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split("T")[0]}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                        errors.appointmentDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                />
                                {errors.appointmentDate && <p className="text-red-500 text-sm mt-1">{errors.appointmentDate}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Appointment Time *
                                </label>
                                <input
                                    type="time"
                                    name="appointmentTime"
                                    value={formData.appointmentTime}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                        errors.appointmentTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                />
                                {errors.appointmentTime && <p className="text-red-500 text-sm mt-1">{errors.appointmentTime}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration</label>
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
                                        errors.appointmentType ? "border-red-500" : "border-gray-300 dark:border-gray-600"
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
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
                                    errors.reason ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Enter reason for the appointment"
                            />
                            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Additional notes or special instructions..."
                            />
                        </div>
                    </div>

                    {/* Reminder Settings */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Bell className="w-5 h-5 text-orange-600" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reminder Settings</h3>
                        </div>

                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="reminderEnabled"
                                    checked={formData.reminderEnabled}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable reminder</span>
                            </label>

                            {formData.reminderEnabled && (
                                <div className="flex-1 max-w-xs">
                                    <select
                                        name="reminderTime"
                                        value={formData.reminderTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        {reminderOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Schedule Appointment</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default NewAppointment
