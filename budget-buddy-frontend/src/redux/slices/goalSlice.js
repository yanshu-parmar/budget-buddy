import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const addGoal = createAsyncThunk(
  'goals/addGoal',
  async (goalData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/goals`, goalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, goalData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_URL}/goals/${id}`, goalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (goalId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return { goalId, ...response.data };
    } catch (error) {
      if (error.response?.status === 404) {
        return { goalId, message: 'Goal not found' };
      }
      return rejectWithValue(error.response?.data || 'Failed to delete goal');
    }
  }
);

export const deleteAllGoals = createAsyncThunk(
  'goals/deleteAllGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateGoalProgress = createAsyncThunk(
  'goals/updateGoalProgress',
  async ({ id, amount }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/goals/${id}/progress`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const addGoalMilestone = createAsyncThunk(
  'goals/addGoalMilestone',
  async ({ id, milestoneData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/goals/${id}/milestones`,
        milestoneData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const initialState = {
  goals: [],
  loading: false,
  error: null,
  currentGoal: null
};

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setCurrentGoal: (state, action) => {
      state.currentGoal = action.payload;
    },
    clearCurrentGoal: (state) => {
      state.currentGoal = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Goals
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Goal
      .addCase(addGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.unshift(action.payload);
      })
      .addCase(addGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Goal
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.goals.findIndex(g => g._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Goal
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = state.goals.filter(goal => goal._id !== action.payload.goalId);
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Goal Progress
      .addCase(updateGoalProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoalProgress.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.goals.findIndex(g => g._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(updateGoalProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Goal Milestone
      .addCase(addGoalMilestone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGoalMilestone.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.goals.findIndex(g => g._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(addGoalMilestone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setCurrentGoal, clearCurrentGoal, clearError } = goalSlice.actions;
export default goalSlice.reducer; 