import React from 'react';
import { Shield, Users, Settings, Plus } from 'lucide-react';
import { mockRoles } from '../../../../../../Downloads/project/src/data/mockData';

const RoleManagement = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Role Management</h1>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Create Role</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockRoles.map((role) => (
                    <div key={role.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`${role.color} p-2 rounded-lg`}>
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{role.userCount} users</p>
                                </div>
                            </div>
                            <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <Settings className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{role.description}</p>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Permissions:</p>
                            <div className="flex flex-wrap gap-2">
                                {role.permissions.map((permission, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                    {permission.replace('_', ' ')}
                  </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                                <Users className="w-4 h-4" />
                                <span>{role.userCount} users</span>
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors">
                                    Edit
                                </button>
                                <button className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Permissions Matrix */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Permissions Matrix</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Permission</th>
                            {mockRoles.map(role => (
                                <th key={role.id} className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                                    {role.name}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {['read', 'write', 'delete', 'manage_users', 'manage_roles', 'view_analytics', 'manage_patients', 'view_medical_records'].map(permission => (
                            <tr key={permission} className="border-b border-gray-200 dark:border-gray-700">
                                <td className="py-3 px-4 text-gray-900 dark:text-white capitalize">
                                    {permission.replace('_', ' ')}
                                </td>
                                {mockRoles.map(role => (
                                    <td key={role.id + permission} className="text-center py-3 px-4">
                                        {role.permissions.includes(permission) ? (
                                            <span className="text-green-500">✓</span>
                                        ) : (
                                            <span className="text-gray-300 dark:text-gray-600">-</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;
