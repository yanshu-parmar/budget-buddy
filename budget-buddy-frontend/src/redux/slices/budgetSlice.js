import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/budgets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const addBudget = createAsyncThunk(
  'budgets/addBudget',
  async (budgetData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/budgets`, budgetData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, budgetData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_URL}/budgets/${id}`, budgetData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateBudgetCategorySpent = createAsyncThunk(
  'budgets/updateBudgetCategorySpent',
  async ({ budgetId, category, amount }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/budgets/${budgetId}/category/${category}/spent`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const initialState = {
  budgets: [],
  loading: false,
  error: null,
  currentBudget: null
};

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setCurrentBudget: (state, action) => {
      state.currentBudget = action.payload;
    },
    clearCurrentBudget: (state) => {
      state.currentBudget = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Budget
      .addCase(addBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets.unshift(action.payload);
      })
      .addCase(addBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Budget
      .addCase(updateBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.budgets.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Budget
      .addCase(deleteBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = state.budgets.filter(b => b._id !== action.payload);
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Budget Category Spent
      .addCase(updateBudgetCategorySpent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBudgetCategorySpent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.budgets.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
      })
      .addCase(updateBudgetCategorySpent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setCurrentBudget, clearCurrentBudget, clearError } = budgetSlice.actions;
export default budgetSlice.reducer; 