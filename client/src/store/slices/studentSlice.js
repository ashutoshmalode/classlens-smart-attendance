import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/students');
      return response.data.students;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
    }
  }
);

export const addStudent = createAsyncThunk(
  'students/addStudent',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.student;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Student registration failed');
    }
  }
);

export const updateStudentProfile = createAsyncThunk(
  'students/updateStudent',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/students/${id}`, data);
      return response.data.student;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update student');
    }
  }
);

export const deleteStudentProfile = createAsyncThunk(
  'students/deleteStudent',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/students/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete student');
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
  success: false,
};

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    resetStudentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Student
      .addCase(addStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
        state.success = true;
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Student
      .addCase(updateStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Student
      .addCase(deleteStudentProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStudentState } = studentSlice.actions;
export default studentSlice.reducer;
