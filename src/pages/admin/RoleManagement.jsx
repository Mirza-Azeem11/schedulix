import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { useRoles } from '../../hooks/useRedux';
import { fetchRoles } from '../../../slices/roleSlice';
import { Shield, Users, Plus, Edit, Trash2, Search } from 'lucide-react';
import AddEditRoleModal from './AddEditRoleModal';

const RoleManagement = () => {
    const dispatch = useAppDispatch();
    const { roles, loading } = useRoles();
    const [searchTerm, setSearchTerm] = useState('');
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    // Load roles on component mount
    useEffect(() => {
        dispatch(fetchRoles());
    }, [dispatch]);

    const filteredRoles = roles?.filter(role =>
        role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleAddRole = () => {
        setEditingRole(null);
        setShowRoleModal(true);
    };

    const handleEditRole = (role) => {
        setEditingRole(role);
        setShowRoleModal(true);
    };

    const handleRoleModalSuccess = () => {
        // Refresh roles list after successful add/edit
        dispatch(fetchRoles());
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Role Management</h1>
                <button
                    onClick={handleAddRole}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Role</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoles.map((role) => (
                    <div key={role.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {role.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {role.userCount || 0} users
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditRole(role)}
                                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {role.description}
                        </p>
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Permissions
                            </p>
                            <div className="flex flex-wrap gap-1">
  {Array.isArray(role.permissions) &&
    role.permissions.slice(0, 3).map((permission, index) => (
      <span
        key={index}
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      >
        {String(permission).replace(/[_\.]/g, ' ')}
      </span>
    ))}

  {Array.isArray(role.permissions) && role.permissions.length > 3 && (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
      +{role.permissions.length - 3} more
    </span>
  )}
</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Role Modal */}
            <AddEditRoleModal
                isOpen={showRoleModal}
                onClose={() => setShowRoleModal(false)}
                role={editingRole}
                onSuccess={handleRoleModalSuccess}
            />
        </div>
    );
};

export default RoleManagement;
