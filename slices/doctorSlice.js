import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doctorsAPI } from '../src/services/api';

// Async thunks for doctor operations
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await doctorsAPI.getAll(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch doctors'
      );
    }
  }
);

export const fetchDoctorById = createAsyncThunk(
  'doctors/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await doctorsAPI.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch doctor'
      );
    }
  }
);

export const fetchDoctorAppointments = createAsyncThunk(
  'doctors/fetchAppointments',
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const response = await doctorsAPI.getAppointments(id, params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch doctor appointments'
      );
    }
  }
);

export const createDoctor = createAsyncThunk(
  'doctors/create',
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await doctorsAPI.create(doctorData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create doctor'
      );
    }
  }
);

export const updateDoctor = createAsyncThunk(
  'doctors/update',
  async ({ id, doctorData }, { rejectWithValue }) => {
    try {
      const response = await doctorsAPI.update(id, doctorData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update doctor'
      );
    }
  }
);

export const deleteDoctor = createAsyncThunk(
  'doctors/delete',
  async (id, { rejectWithValue }) => {
    try {
      await doctorsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete doctor'
      );
    }
  }
);

const initialState = {
  doctors: [],
  currentDoctor: null,
  doctorAppointments: [],
  loading: false,
  error: null,
  activeTab: 'overview', // Add activeTab state
  filters: {
    specialty: '',
    availability: '',
    search: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentDoctor(state) {
      state.currentDoctor = null;
    },
    setCurrentDoctor(state, action) {
      state.currentDoctor = action.payload;
    },
    clearDoctorAppointments(state) {
      state.doctorAppointments = [];
    },
    setActiveTab(state, action) { // Add setActiveTab action
      state.activeTab = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch doctors cases
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.doctors || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch doctor by ID cases
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.currentDoctor = action.payload;
      })

      // Fetch doctor appointments cases
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.doctorAppointments = action.payload.appointments || action.payload;
      })

      // Create doctor cases
      .addCase(createDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors.unshift(action.payload);
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update doctor cases
      .addCase(updateDoctor.fulfilled, (state, action) => {
        const index = state.doctors.findIndex(
          doctor => doctor.id === action.payload.id
        );
        if (index !== -1) {
          state.doctors[index] = action.payload;
        }
        if (state.currentDoctor?.id === action.payload.id) {
          state.currentDoctor = action.payload;
        }
      })

      // Delete doctor cases
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.doctors = state.doctors.filter(
          doctor => doctor.id !== action.payload
        );
        if (state.currentDoctor?.id === action.payload) {
          state.currentDoctor = null;
        }
      });
  },
});

export const {
  clearError,
  setFilters,
  setPagination,
  clearCurrentDoctor,
  setCurrentDoctor,
  clearDoctorAppointments,
  setActiveTab // Export setActiveTab action
} = doctorSlice.actions;

export default doctorSlice.reducer;
