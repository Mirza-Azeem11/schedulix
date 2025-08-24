import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { useUsers } from '../../hooks/useRedux';
import { fetchUsers } from '../../../slices/userSlice';
import { hasPermission } from '../../utils/permissions';
import { Users, Plus, Search, Filter } from 'lucide-react';
import UserTable from './UserTable';
import AddEditUserModal from './AddEditUserModal';

const UserManagement = () => {
    const dispatch = useAppDispatch();
    const { users, loading } = useUsers();
    const user = useAppSelector((state) => state.auth.user);
    const userRoles = user?.roles || [];

    // Check permissions
    const isAdmin = userRoles.includes('Admin') || userRoles.includes('Super Admin');
    const canCreateUsers = isAdmin || hasPermission(userRoles, 'users.create');
    const canEditUsers = isAdmin || hasPermission(userRoles, 'users.edit');
    const canDeleteUsers = isAdmin || hasPermission(userRoles, 'users.delete');
    const canViewUsers = isAdmin || hasPermission(userRoles, 'users.view');

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Load users on component mount
    useEffect(() => {
        if (canViewUsers) {
            dispatch(fetchUsers());
        }
    }, [dispatch, canViewUsers]);

    // If user doesn't have view permission, show access denied
    if (!canViewUsers) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="text-6xl text-gray-300 mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
                    <p className="text-gray-500">You don't have permission to view users.</p>
                </div>
            </div>
        );
    }

    const filteredUsers = users?.filter(user => {
        const matchesSearch =
            user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' ||
            (user.roles && user.roles.some(role => role.toLowerCase() === roleFilter));
        return matchesSearch && matchesRole;
    }) || [];

    const stats = {
        total: users?.length || 0,
        active: users?.filter(u => u.status === 'Active').length || 0,
        doctors: users?.filter(u => u.roles?.includes('Doctor')).length || 0,
        patients: users?.filter(u => u.roles?.includes('Patient')).length || 0
    };

    const handleAddUser = () => {
        if (!canCreateUsers) {
            alert('You don\'t have permission to create users.');
            return;
        }
        setEditingUser(null);
        setShowUserModal(true);
    };

    const handleEditUser = (user) => {
        if (!canEditUsers) {
            alert('You don\'t have permission to edit users.');
            return;
        }
        setEditingUser(user);
        setShowUserModal(true);
    };

    const handleUserModalSuccess = () => {
        // Refresh users list after successful add/edit
        dispatch(fetchUsers());
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                {canCreateUsers && (
                    <button
                        onClick={handleAddUser}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add User</span>
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Doctors</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.doctors}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Patients</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.patients}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="doctor">Doctor</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="accountant">Accountant</option>
                            <option value="nurse">Nurse</option>
                            <option value="patient">Patient</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <UserTable
                users={filteredUsers}
                onEditUser={handleEditUser}
                canEdit={canEditUsers}
                canDelete={canDeleteUsers}
                onUserUpdated={() => dispatch(fetchUsers())}
            />

            {/* User Modal */}
            <AddEditUserModal
                isOpen={showUserModal}
                user={editingUser}
                onClose={() => setShowUserModal(false)}
                onSuccess={handleUserModalSuccess}
            />
        </div>
    );
};

export default UserManagement;
