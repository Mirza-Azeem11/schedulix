import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersAPI, rolesAPI, appointmentsAPI } from '../src/services/api';

// Admin Dashboard API calls
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch multiple data sources for dashboard
      const [usersResponse, appointmentsResponse] = await Promise.all([
        usersAPI.getAll(),
        appointmentsAPI.getAll()
      ]);

      return {
        users: usersResponse.data.data,
        appointments: appointmentsResponse.data.data,
        totalUsers: usersResponse.data.data?.length || 0,
        totalAppointments: appointmentsResponse.data.data?.length || 0
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard stats'
      );
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getAll(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

export const fetchSystemRoles = createAsyncThunk(
  'admin/fetchSystemRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rolesAPI.getAll();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch roles'
      );
    }
  }
);

const initialState = {
  // Dashboard Stats
  dashboardStats: {
    totalUsers: 0,
    totalAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
    recentAppointments: [],
    systemHealth: 'good'
  },

  // User Management
  allUsers: [],
  systemRoles: [],

  // Loading States
  loading: false,
  dashboardLoading: false,
  usersLoading: false,
  rolesLoading: false,

  // Error States
  error: null,
  dashboardError: null,
  usersError: null,
  rolesError: null,

  // Filters
  userFilters: {
    role: '',
    status: '',
    search: ''
  }
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
      state.dashboardError = null;
      state.usersError = null;
      state.rolesError = null;
    },
    setUserFilters(state, action) {
      state.userFilters = { ...state.userFilters, ...action.payload };
    },
    updateDashboardStats(state, action) {
      state.dashboardStats = { ...state.dashboardStats, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats Cases
      .addCase(fetchDashboardStats.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardStats = {
          ...state.dashboardStats,
          totalUsers: action.payload.totalUsers,
          totalAppointments: action.payload.totalAppointments,
          recentAppointments: action.payload.appointments?.slice(0, 5) || []
        };
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload;
      })

      // Fetch All Users Cases
      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.allUsers = action.payload.users || action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })

      // Fetch System Roles Cases
      .addCase(fetchSystemRoles.pending, (state) => {
        state.rolesLoading = true;
        state.rolesError = null;
      })
      .addCase(fetchSystemRoles.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.systemRoles = action.payload.roles || action.payload;
      })
      .addCase(fetchSystemRoles.rejected, (state, action) => {
        state.rolesLoading = false;
        state.rolesError = action.payload;
      });
  },
});

export const { clearError, setUserFilters, updateDashboardStats } = adminSlice.actions;
export default adminSlice.reducer;