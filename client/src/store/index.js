import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import studentReducer from './slices/studentSlice.js';
import attendanceReducer from './slices/attendanceSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    attendance: attendanceReducer,
  },
});

export default store;
