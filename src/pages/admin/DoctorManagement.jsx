import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { fetchDoctors, deleteDoctor } from '../../../slices/doctorSlice';
import { doctorsAPI } from '../../services/api';
import AddEditDoctorModal from './AddEditDoctorModal';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Stethoscope
} from 'lucide-react';

const DoctorManagement = () => {
  const dispatch = useAppDispatch();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await doctorsAPI.getAll();

      // ✅ Ensure we always get an array
      const doctorList = Array.isArray(response.data?.data?.doctors)
          ? response.data.data.doctors
          : [];

      console.log("Doctors API response:", response.data);
      setDoctors(doctorList);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError('Failed to load doctors. Please try again.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = (doctors || []).filter((doctor) => {
    const matchesSearch =
        doctor.User?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.User?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.User?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.license_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
        statusFilter === 'all' || doctor.status?.toLowerCase() === statusFilter;

    const matchesSpecialization =
        specializationFilter === 'all' ||
        doctor.specialization?.toLowerCase() === specializationFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  const stats = {
    total: (doctors || []).length,
    active: (doctors || []).filter((d) => d.status?.toLowerCase() === 'active').length,
    inactive: (doctors || []).filter((d) => d.status?.toLowerCase() === 'inactive').length,
    specializations: [
      ...new Set((doctors || []).map((d) => d.specialization).filter(Boolean)),
    ].length,
  };

  const specializations = [
    ...new Set((doctors || []).map((d) => d.specialization).filter(Boolean)),
  ];

  const handleAddDoctor = () => {
    setEditingDoctor(null);
    setShowAddModal(true);
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setShowAddModal(true);
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorsAPI.delete(doctorId);
        await loadDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        setError('Failed to delete doctor. Please try again.');
      }
    }
  };

  const handleViewDoctor = (doctor) => {
    console.log('View doctor:', doctor);
  };

  const handleViewAppointments = async (doctorId) => {
    try {
      const response = await doctorsAPI.getAppointments(doctorId);
      console.log('Doctor appointments:', response.data);
    } catch (error) {
      console.error('Error loading doctor appointments:', error);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage doctor profiles and specializations</p>
          </div>
          <button
              onClick={handleAddDoctor}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Doctor</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Stethoscope className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Specializations</p>
                <p className="text-2xl font-bold text-blue-600">{stats.specializations}</p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Specializations</option>
                {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fee
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 font-medium">
                            {doctor.User?.first_name?.[0]}
                            {doctor.User?.last_name?.[0]}
                          </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Dr. {doctor.User?.first_name} {doctor.User?.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            License: {doctor.license_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {doctor.specialization}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {doctor.years_of_experience} years exp.
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {doctor.User?.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {doctor.User?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            doctor.status?.toLowerCase() === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                    >
                      {doctor.status}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ${doctor.consultation_fee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                            onClick={() => handleViewDoctor(doctor)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Doctor"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleViewAppointments(doctor.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="View Appointments"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleEditDoctor(doctor)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            title="Edit Doctor"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteDoctor(doctor.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Doctor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No doctors found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm
                      ? 'Try adjusting your search criteria.'
                      : 'Get started by adding a new doctor.'}
                </p>
              </div>
          )}
        </div>

        {/* Add/Edit Doctor Modal */}
        <AddEditDoctorModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={loadDoctors}
          doctor={editingDoctor}
        />
      </div>
  );
};

export default DoctorManagement;
