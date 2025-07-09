import React from 'react';
import UserTable from './UserTable';
import { mockUsers } from '../../../../../../Downloads/project/src/data/mockData';

const UserManagement = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            </div>
            <UserTable users={mockUsers} />
        </div>
    );
};

export default UserManagement;
