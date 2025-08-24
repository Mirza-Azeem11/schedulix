import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { patientsAPI } from '../src/services/api';

// Async thunks for patient operations
export const fetchPatients = createAsyncThunk(
  'patients/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await patientsAPI.getAll(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch patients'
      );
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  'patients/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await patientsAPI.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch patient'
      );
    }
  }
);

export const createPatient = createAsyncThunk(
  'patients/create',
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await patientsAPI.create(patientData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create patient'
      );
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/update',
  async ({ id, patientData }, { rejectWithValue }) => {
    try {
      const response = await patientsAPI.update(id, patientData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update patient'
      );
    }
  }
);

export const deletePatient = createAsyncThunk(
  'patients/delete',
  async (id, { rejectWithValue }) => {
    try {
      await patientsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete patient'
      );
    }
  }
);

const initialState = {
  patients: [],
  currentPatient: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    ageRange: { min: '', max: '' },
    gender: ''
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

const patientSlice = createSlice({
  name: 'patients',
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
    clearCurrentPatient(state) {
      state.currentPatient = null;
    },
    setCurrentPatient(state, action) {
      state.currentPatient = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch patients cases
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload.patients || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch patient by ID cases
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.currentPatient = action.payload;
      })


      // Create patient cases
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients.unshift(action.payload);
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update patient cases
      .addCase(updatePatient.fulfilled, (state, action) => {
        const index = state.patients.findIndex(
          patient => patient.id === action.payload.id
        );
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
        if (state.currentPatient?.id === action.payload.id) {
          state.currentPatient = action.payload;
        }
      })

      // Delete patient cases
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter(
          patient => patient.id !== action.payload
        );
        if (state.currentPatient?.id === action.payload) {
          state.currentPatient = null;
        }
      });
  },
});

export const {
  clearError,
  setFilters,
  setPagination,
  clearCurrentPatient,
  setCurrentPatient,
} = patientSlice.actions;

export default patientSlice.reducer;
