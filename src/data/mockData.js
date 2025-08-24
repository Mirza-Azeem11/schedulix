export const mockUsers = [
    {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        role: 'Doctor',
        status: 'Active',
        avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400',
        joinDate: '2023-01-15',
        lastLogin: '2024-01-20 09:30',
        department: 'Cardiology',
        patients: 45
    },
    {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@hospital.com',
        role: 'Admin',
        status: 'Active',
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
        joinDate: '2022-08-10',
        lastLogin: '2024-01-20 11:15',
        department: 'IT'
    },
    {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@hospital.com',
        role: 'Staff',
        status: 'Active',
        avatar: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=400',
        joinDate: '2023-03-22',
        lastLogin: '2024-01-19 16:45',
        department: 'Reception'
    },
    {
        id: '4',
        name: 'James Wilson',
        email: 'james.wilson@email.com',
        role: 'Patient',
        status: 'Active',
        avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpg?auto=compress&cs=tinysrgb&w=400',
        joinDate: '2023-11-05',
        lastLogin: '2024-01-18 14:20'
    },
    {
        id: '5',
        name: 'Dr. Lisa Park',
        email: 'lisa.park@hospital.com',
        role: 'Doctor',
        status: 'Active',
        avatar: 'https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg?auto=compress&cs=tinysrgb&w=400',
        joinDate: '2022-12-01',
        lastLogin: '2024-01-20 08:00',
        department: 'Pediatrics',
        patients: 62
    }
];

export const mockRoles = [
    {
        id: '1',
        name: 'Admin',
        description: 'Full system access with all administrative privileges',
        permissions: ['read', 'write', 'delete', 'manage_users', 'manage_roles', 'view_analytics'],
        userCount: 3,
        color: 'bg-red-500'
    },
    {
        id: '2',
        name: 'Doctor',
        description: 'Medical staff with patient management access',
        permissions: ['read', 'write', 'manage_patients'],
        userCount: 15,
        color: 'bg-blue-500'
    },
    {
        id: '3',
        name: 'Patient',
        description: 'Limited access to personal medical information',
        permissions: ['read', 'view_appointments', 'update_profile'],
        userCount: 248,
        color: 'bg-green-500'
    },
    {
        id: '4',
        name: 'Staff',
        description: 'Administrative staff with limited system access',
        permissions: ['read', 'write', 'manage_appointments', 'basic_reports'],
        userCount: 12,
        color: 'bg-purple-500'
    }
];

export const mockPayments = [
    {
        id: '1',
        patient: 'James Wilson',
        amount: 250.0,
        status: 'Completed',
        date: '2024-01-20',
        method: 'Card',
        invoice: 'INV-2024-001'
    },
    {
        id: '2',
        patient: 'Maria Garcia',
        amount: 450.0,
        status: 'Pending',
        date: '2024-01-19',
        method: 'Insurance',
        invoice: 'INV-2024-002'
    },
    {
        id: '3',
        patient: 'David Brown',
        amount: 180.0,
        status: 'Completed',
        date: '2024-01-18',
        method: 'Cash',
        invoice: 'INV-2024-003'
    },
    {
        id: '4',
        patient: 'Sophie Chen',
        amount: 320.0,
        status: 'Failed',
        date: '2024-01-17',
        method: 'Card',
        invoice: 'INV-2024-004'
    }
];

export const mockStats = [
    {
        title: 'Total Users',
        value: '1,248',
        change: '+12.5%',
        trend: 'up',
        icon: 'Users',
        color: 'bg-blue-500'
    },
    {
        title: 'Active Doctors',
        value: '28',
        change: '+2.1%',
        trend: 'up',
        icon: 'UserCheck',
        color: 'bg-green-500'
    },
    {
        title: 'Monthly Revenue',
        value: '$42,580',
        change: '+8.3%',
        trend: 'up',
        icon: 'DollarSign',
        color: 'bg-purple-500'
    },
    {
        title: 'Pending Payments',
        value: '23',
        change: '-5.2%',
        trend: 'down',
        icon: 'Clock',
        color: 'bg-orange-500'
    }
];

export const chartData = {
    users: [
        { month: 'Jan', users: 180 },
        { month: 'Feb', users: 220 },
        { month: 'Mar', users: 280 },
        { month: 'Apr', users: 320 },
        { month: 'May', users: 380 },
        { month: 'Jun', users: 420 }
    ],
    revenue: [
        { month: 'Jan', revenue: 32000 },
        { month: 'Feb', revenue: 28000 },
        { month: 'Mar', revenue: 35000 },
        { month: 'Apr', revenue: 42000 },
        { month: 'May', revenue: 38000 },
        { month: 'Jun', revenue: 45000 }
    ]
};
