import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { createRole, updateRole } from '../../../slices/roleSlice';
import {
  Shield,
  X,
  Check,
  AlertCircle,
  Users,
  Settings,
  FileText,
  Calendar,
  CreditCard,
  MessageSquare,
  BarChart3,
  Database
} from 'lucide-react';

const AddEditRoleModal = ({ isOpen, onClose, role = null, onSuccess }) => {
  const dispatch = useAppDispatch();
  const isEdit = !!role;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const availablePermissions = [
    {
      category: 'User Management',
      permissions: [
        { id: 'users.view', name: 'View Users', description: 'View user list and details' },
        { id: 'users.create', name: 'Create Users', description: 'Add new users to the system' },
        { id: 'users.edit', name: 'Edit Users', description: 'Modify user information' },
        { id: 'users.delete', name: 'Delete Users', description: 'Remove users from the system' },
      ]
    },
    {
      category: 'Role Management',
      permissions: [
        { id: 'roles.view', name: 'View Roles', description: 'View role list and details' },
        { id: 'roles.create', name: 'Create Roles', description: 'Add new roles' },
        { id: 'roles.edit', name: 'Edit Roles', description: 'Modify role permissions' },
        { id: 'roles.delete', name: 'Delete Roles', description: 'Remove roles' },
      ]
    },
    {
      category: 'Patient Management',
      permissions: [
        { id: 'patients.view', name: 'View Patients', description: 'View patient list and details' },
        { id: 'patients.create', name: 'Create Patients', description: 'Add new patient records' },
        { id: 'patients.edit', name: 'Edit Patients', description: 'Modify patient information' },
        { id: 'patients.delete', name: 'Delete Patients', description: 'Remove patient records' },
      ]
    },
    {
      category: 'Doctor Management',
      permissions: [
        { id: 'doctors.view', name: 'View Doctors', description: 'View doctor list and details' },
        { id: 'doctors.create', name: 'Create Doctors', description: 'Add new doctor profiles' },
        { id: 'doctors.edit', name: 'Edit Doctors', description: 'Modify doctor information' },
        { id: 'doctors.delete', name: 'Delete Doctors', description: 'Remove doctor profiles' },
        { id: 'doctors.schedule', name: 'Manage Schedules', description: 'Manage doctor schedules and time slots' },
      ]
    },
    {
      category: 'Appointment Management',
      permissions: [
        { id: 'appointments.view', name: 'View Appointments', description: 'View appointment list and details' },
        { id: 'appointments.create', name: 'Create Appointments', description: 'Schedule new appointments' },
        { id: 'appointments.edit', name: 'Edit Appointments', description: 'Modify appointment details' },
        { id: 'appointments.cancel', name: 'Cancel Appointments', description: 'Cancel appointments' },
        { id: 'appointments.complete', name: 'Complete Appointments', description: 'Mark appointments as completed' },
      ]
    },
    {
      category: 'Financial Management',
      permissions: [
        { id: 'payments.view', name: 'View Payments', description: 'View payment history and details' },
        { id: 'payments.create', name: 'Process Payments', description: 'Process and record payments' },
        { id: 'payments.refund', name: 'Process Refunds', description: 'Issue payment refunds' },
        { id: 'invoices.view', name: 'View Invoices', description: 'View invoice list and details' },
        { id: 'invoices.create', name: 'Create Invoices', description: 'Generate new invoices' },
      ]
    },
    {
      category: 'Communication',
      permissions: [
        { id: 'notifications.manage', name: 'Manage Notifications', description: 'Create and manage notifications' },
      ]
    },
    {
      category: 'Analytics & Reports',
      permissions: [
        { id: 'analytics.view', name: 'View Analytics', description: 'Access dashboard analytics' },
        { id: 'reports.generate', name: 'Generate Reports', description: 'Create and export reports' },
      ]
    },
    {
      category: 'System Administration',
      permissions: [
        { id: 'system.settings', name: 'System Settings', description: 'Manage system configuration' },
        { id: 'system.backup', name: 'System Backup', description: 'Perform system backups' },
        { id: 'system.maintenance', name: 'System Maintenance', description: 'Perform system maintenance' },
      ]
    }
  ];

  useEffect(() => {
    if (isOpen && isEdit && role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || []
      });
    } else if (isOpen && !isEdit) {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setErrors({});
  }, [isOpen, isEdit, role]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Role name is required';
    if (!formData.description.trim()) newErrors.description = 'Role description is required';
    if (formData.permissions.length === 0) newErrors.permissions = 'At least one permission must be selected';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const roleData = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions
      };

      if (isEdit) {
        await dispatch(updateRole({ id: role.id, roleData })).unwrap();
      } else {
        await dispatch(createRole(roleData)).unwrap();
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || `Failed to ${isEdit ? 'update' : 'create'} role` });
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

  const handlePermissionToggle = (permissionId) => {
    const currentPermissions = formData.permissions;
    const isSelected = currentPermissions.includes(permissionId);

    if (isSelected) {
      handleInputChange('permissions', currentPermissions.filter(id => id !== permissionId));
    } else {
      handleInputChange('permissions', [...currentPermissions, permissionId]);
    }
  };

  const handleCategoryToggle = (category) => {
    const categoryPermissions = category.permissions.map(p => p.id);
    const allSelected = categoryPermissions.every(p => formData.permissions.includes(p));

    if (allSelected) {
      // Deselect all in category
      handleInputChange('permissions', formData.permissions.filter(p => !categoryPermissions.includes(p)));
    } else {
      // Select all in category
      const newPermissions = [...new Set([...formData.permissions, ...categoryPermissions])];
      handleInputChange('permissions', newPermissions);
    }
  };

  const getCategoryIcon = (categoryName) => {
    switch (categoryName) {
      case 'User Management': return Users;
      case 'Role Management': return Shield;
      case 'Patient Management': return FileText;
      case 'Doctor Management': return Users;
      case 'Appointment Management': return Calendar;
      case 'Financial Management': return CreditCard;
      case 'Communication': return MessageSquare;
      case 'Analytics & Reports': return BarChart3;
      case 'System Administration': return Settings;
      default: return Database;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Role' : 'Create New Role'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role Name *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter role name"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe the role and its purpose"
              />
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Permissions *
              </label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formData.permissions.length} permission(s) selected
              </div>
            </div>

            <div className="space-y-4">
              {availablePermissions.map((category) => {
                const Icon = getCategoryIcon(category.category);
                const categoryPermissions = category.permissions.map(p => p.id);
                const selectedInCategory = categoryPermissions.filter(p => formData.permissions.includes(p)).length;
                const allSelected = selectedInCategory === categoryPermissions.length;
                const someSelected = selectedInCategory > 0 && selectedInCategory < categoryPermissions.length;

                return (
                  <div key={category.category} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <div
                      className="p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {category.category}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedInCategory}/{categoryPermissions.length}
                          </span>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            allSelected
                              ? 'border-blue-500 bg-blue-500'
                              : someSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {allSelected && <Check className="w-3 h-3 text-white" />}
                            {someSelected && !allSelected && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {category.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start space-x-3 cursor-pointer"
                          onClick={() => handlePermissionToggle(permission.id)}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                            formData.permissions.includes(permission.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {formData.permissions.includes(permission.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {permission.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.permissions && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.permissions}</p>
            )}
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
                  <span>{isEdit ? 'Update Role' : 'Create Role'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditRoleModal;
