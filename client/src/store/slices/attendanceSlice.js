import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

export const getAttendance = createAsyncThunk(
  'attendance/getAttendance',
  async (date, { rejectWithValue }) => {
    try {
      const response = await api.get(`/attendance?date=${date}`);
      return response.data.attendance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance');
    }
  }
);

export const runClassroomScan = createAsyncThunk(
  'attendance/runClassroomScan',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/session', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Classroom scan failed');
    }
  }
);

export const manuallyAdjustAttendance = createAsyncThunk(
  'attendance/manuallyAdjustAttendance',
  async ({ date, studentId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put('/attendance/manual', { date, studentId, status });
      return response.data.attendance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Manual override failed');
    }
  }
);

export const resolveUnknownFace = createAsyncThunk(
  'attendance/resolveUnknownFace',
  async ({ date, unknownFaceId, studentId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/resolve-unknown', { date, unknownFaceId, studentId });
      return response.data.attendance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Resolution failed');
    }
  }
);

const initialState = {
  currentSession: null,
  statistics: null,
  loading: false,
  error: null,
  scanSuccess: false,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    resetAttendanceState: (state) => {
      state.loading = false;
      state.error = null;
      state.scanSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Attendance
      .addCase(getAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        if (action.payload) {
          const records = action.payload.records || [];
          const present = records.filter(r => r.status === 'Present').length;
          const absent = records.length - present;
          const unknown = action.payload.unknownFaces ? action.payload.unknownFaces.filter(u => !u.assignedStudent).length : 0;
          state.statistics = {
            totalStudents: records.length,
            present,
            absent,
            unknown,
            attendancePercentage: records.length > 0 ? ((present / records.length) * 100).toFixed(1) : '0.0',
          };
        } else {
          state.statistics = null;
        }
      })
      .addCase(getAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Classroom Scan
      .addCase(runClassroomScan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.scanSuccess = false;
      })
      .addCase(runClassroomScan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload.attendance;
        state.statistics = action.payload.statistics;
        state.scanSuccess = true;
      })
      .addCase(runClassroomScan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.scanSuccess = false;
      })
      // Manual Adjustment
      .addCase(manuallyAdjustAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(manuallyAdjustAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        // Recalculate quick stats locally
        const records = action.payload.records || [];
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.length - present;
        const unknown = action.payload.unknownFaces ? action.payload.unknownFaces.filter(u => !u.assignedStudent).length : 0;
        state.statistics = {
          totalStudents: records.length,
          present,
          absent,
          unknown,
          attendancePercentage: records.length > 0 ? ((present / records.length) * 100).toFixed(1) : '0.0',
        };
      })
      .addCase(manuallyAdjustAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Resolve Unknown Face
      .addCase(resolveUnknownFace.pending, (state) => {
        state.loading = true;
      })
      .addCase(resolveUnknownFace.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        // Recalculate stats
        const records = action.payload.records || [];
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.length - present;
        const unknown = action.payload.unknownFaces ? action.payload.unknownFaces.filter(u => !u.assignedStudent).length : 0;
        state.statistics = {
          totalStudents: records.length,
          present,
          absent,
          unknown,
          attendancePercentage: records.length > 0 ? ((present / records.length) * 100).toFixed(1) : '0.0',
        };
      })
      .addCase(resolveUnknownFace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAttendanceState } = attendanceSlice.actions;
export default attendanceSlice.reducer;
