import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../slices/authSlice';
import appointmentReducer from '../../slices/appointmentSlice';
import doctorReducer from '../../slices/doctorSlice';
import patientReducer from '../../slices/patientSlice';
import userReducer from '../../slices/userSlice';
import roleReducer from '../../slices/roleSlice';
import notificationReducer from '../../slices/notificationSlice';
import adminReducer from '../../slices/adminSlice';

// Configure the Redux store with all slices and middleware
const store = configureStore({
    reducer: {
        auth: authReducer,
        appointments: appointmentReducer,
        doctors: doctorReducer,
        patients: patientReducer,
        users: userReducer,
        roles: roleReducer,
        notifications: notificationReducer,
        admin: adminReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
