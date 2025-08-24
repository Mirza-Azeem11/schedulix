// Debug component to help troubleshoot admin permissions
import React from 'react';
import { useAppSelector } from '../hooks/useRedux';
import { hasPermission, canAccessMenuItem } from '../utils/permissions';

const PermissionDebugger = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userRoles = user?.roles || [];

  // Check admin status
  const isAdmin = userRoles.includes('Admin') || userRoles.includes('Super Admin');

  // Test all menu permissions
  const menuItems = ['dashboard', 'patients', 'doctors', 'appointments', 'users', 'roles', 'payments', 'analytics'];
  const permissionTests = [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
    'patients.view', 'patients.create', 'patients.edit', 'patients.delete'
  ];

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Permission Debug</h3>

      {/* User Info */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">User Info:</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {user?.id}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Email: {user?.email}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Roles: {JSON.stringify(userRoles)}</p>
        <p className="text-sm font-medium">Is Admin: <span className={isAdmin ? 'text-green-600' : 'text-red-600'}>{isAdmin.toString()}</span></p>
      </div>

      {/* Menu Access */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Menu Access:</h4>
        {menuItems.map(item => {
          const canAccess = canAccessMenuItem(userRoles, item);
          return (
            <div key={item} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{item}:</span>
              <span className={canAccess ? 'text-green-600' : 'text-red-600'}>
                {canAccess ? '✓' : '✗'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Permission Tests */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Permission Tests:</h4>
        <div className="max-h-40 overflow-y-auto">
          {permissionTests.map(permission => {
            const hasAccess = hasPermission(userRoles, permission);
            return (
              <div key={permission} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{permission}:</span>
                <span className={hasAccess ? 'text-green-600' : 'text-red-600'}>
                  {hasAccess ? '✓' : '✗'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw Redux State */}
      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Raw User Object:</h4>
        <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-32 text-gray-800 dark:text-gray-200">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default PermissionDebugger;
