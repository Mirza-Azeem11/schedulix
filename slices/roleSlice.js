import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rolesAPI } from '../src/services/api';

// Async thunks for role operations
export const fetchRoles = createAsyncThunk(
  'roles/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await rolesAPI.getAll(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch roles'
      );
    }
  }
);

export const fetchRoleById = createAsyncThunk(
  'roles/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await rolesAPI.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch role'
      );
    }
  }
);

export const createRole = createAsyncThunk(
  'roles/create',
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await rolesAPI.create(roleData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create role'
      );
    }
  }
);

export const updateRole = createAsyncThunk(
  'roles/update',
  async ({ id, roleData }, { rejectWithValue }) => {
    try {
      const response = await rolesAPI.update(id, roleData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update role'
      );
    }
  }
);

export const deleteRole = createAsyncThunk(
  'roles/delete',
  async (id, { rejectWithValue }) => {
    try {
      await rolesAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete role'
      );
    }
  }
);

const initialState = {
  roles: [],
  currentRole: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    permissions: []
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

const roleSlice = createSlice({
  name: 'roles',
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
    clearCurrentRole(state) {
      state.currentRole = null;
    },
    setCurrentRole(state, action) {
      state.currentRole = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch roles cases
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.roles || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch role by ID cases
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.currentRole = action.payload;
      })

      // Create role cases
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.unshift(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update role cases
      .addCase(updateRole.fulfilled, (state, action) => {
        const index = state.roles.findIndex(
          role => role.id === action.payload.id
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
        if (state.currentRole?.id === action.payload.id) {
          state.currentRole = action.payload;
        }
      })

      // Delete role cases
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter(
          role => role.id !== action.payload
        );
        if (state.currentRole?.id === action.payload) {
          state.currentRole = null;
        }
      });
  },
});

export const {
  clearError,
  setFilters,
  setPagination,
  clearCurrentRole,
  setCurrentRole
} = roleSlice.actions;

export default roleSlice.reducer;
