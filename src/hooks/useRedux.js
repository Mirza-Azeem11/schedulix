import { useDispatch, useSelector } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hooks for specific slices
export const useAuth = () => useAppSelector((state) => state.auth);
export const useAppointments = () => useAppSelector((state) => state.appointments);
export const useDoctors = () => useAppSelector((state) => state.doctors);
export const usePatients = () => useAppSelector((state) => state.patients);
export const useUsers = () => useAppSelector((state) => state.users);
export const useRoles = () => useAppSelector((state) => state.roles);
export const useNotifications = () => useAppSelector((state) => state.notifications);
export const useAdmin = () => useAppSelector((state) => state.admin);

// Custom hook for authentication status
export const useAuthStatus = () => {
  const { isAuthenticated, loading, user } = useAuth();
  return { isAuthenticated, loading, user };
};

// Custom hook for checking user roles
export const useUserRole = () => {
  const { user } = useAuth();

  const hasRole = (roleNames) => {
    if (!user?.roles) return false;
    const roles = Array.isArray(roleNames) ? roleNames : [roleNames];

    // Handle both formats: array of strings ["Doctor"] or array of objects [{name: "Doctor"}]
    return user.roles.some(role => {
      const roleName = typeof role === 'string' ? role : role.name;
      return roles.includes(roleName);
    });
  };

  const isAdmin = () => hasRole(['Admin', 'SuperAdmin']);
  const isDoctor = () => hasRole('Doctor');
  const isPatient = () => hasRole('Patient');
  const isSuperAdmin = () => hasRole('SuperAdmin');

  return {
    roles: user?.roles || [],
    hasRole,
    isAdmin,
    isDoctor,
    isPatient,
    isSuperAdmin
  };
};

// Custom hook for loading states across all slices
export const useAppLoading = () => {
  const authLoading = useAppSelector((state) => state.auth.loading);
  const appointmentsLoading = useAppSelector((state) => state.appointments.loading);
  const doctorsLoading = useAppSelector((state) => state.doctors.loading);
  const patientsLoading = useAppSelector((state) => state.patients.loading);
  const usersLoading = useAppSelector((state) => state.users.loading);
  const notificationsLoading = useAppSelector((state) => state.notifications.loading);

  return {
    authLoading,
    appointmentsLoading,
    doctorsLoading,
    patientsLoading,
    usersLoading,
    notificationsLoading,
    isAnyLoading: authLoading || appointmentsLoading || doctorsLoading || patientsLoading || usersLoading || notificationsLoading
  };
};

// Custom hook for error states across all slices
export const useAppErrors = () => {
  const authError = useAppSelector((state) => state.auth.error);
  const appointmentsError = useAppSelector((state) => state.appointments.error);
  const doctorsError = useAppSelector((state) => state.doctors.error);
  const patientsError = useAppSelector((state) => state.patients.error);
  const usersError = useAppSelector((state) => state.users.error);
  const notificationsError = useAppSelector((state) => state.notifications.error);

  const hasAnyError = !!(authError || appointmentsError || doctorsError || patientsError || usersError || notificationsError);

  return {
    authError,
    appointmentsError,
    doctorsError,
    patientsError,
    usersError,
    notificationsError,
    hasAnyError,
    allErrors: [authError, appointmentsError, doctorsError, patientsError, usersError, notificationsError].filter(Boolean)
  };
};
