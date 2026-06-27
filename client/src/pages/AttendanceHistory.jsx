import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAttendance, manuallyAdjustAttendance } from '../store/slices/attendanceSlice.js';
import { fetchStudents } from '../store/slices/studentSlice.js';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Users, 
  ShieldCheck, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import StudentAvatar from '../components/StudentAvatar.jsx';

export const AttendanceHistory = () => {
  const dispatch = useDispatch();
  const { currentSession, statistics, loading, error } = useSelector((state) => state.attendance);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Load attendance data when date changes
  useEffect(() => {
    dispatch(getAttendance(date));
    dispatch(fetchStudents()); // ensure student store is loaded
  }, [dispatch, date]);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleRefresh = () => {
    dispatch(getAttendance(date));
  };

  const handleToggleStatus = (record) => {
    const studentId = record.student._id;
    const newStatus = record.status === 'Present' ? 'Absent' : 'Present';
    
    dispatch(manuallyAdjustAttendance({ date, studentId, status: newStatus }))
      .unwrap()
      .catch((err) => {
        alert(`Failed to adjust attendance: ${err}`);
      });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col gap-6 md:gap-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white m-0">Attendance History</h2>
          <p className="text-gray-400 text-xs mt-1 font-medium">
            Review detailed student attendance logs and apply manual overrides
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl">
            <Calendar size={15} className="text-accent-purple" />
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="bg-transparent text-xs text-white focus:outline-none border-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 text-left">
          <AlertCircle size={16} />
          <span>Error loading logs: {error}</span>
        </div>
      )}

      {/* Stats Cards */}
      {currentSession && statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Present Rate (Circular visualization) */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Present Rate
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {statistics.attendancePercentage}%
              </h3>
            </div>
            
            <div className="relative h-14 w-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-white/5"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-accent-purple"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={138}
                  strokeDashoffset={138 - (138 * parseFloat(statistics.attendancePercentage)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-white">
                {statistics.attendancePercentage}%
              </span>
            </div>
          </div>

          {/* Total Students */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between text-left">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Total Enrolled
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {statistics.totalStudents}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={18} />
            </div>
          </div>

          {/* Present count */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between text-left">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Present Count
              </span>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                {statistics.present}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={18} />
            </div>
          </div>

          {/* Absent count */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between text-left">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Absent Count
              </span>
              <h3 className="text-2xl font-extrabold text-pink-400 mt-1">
                {statistics.absent}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <XCircle size={18} />
            </div>
          </div>
        </div>
      )}

      {/* Main logs display */}
      {!currentSession ? (
        <div className="glass p-20 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full">
          <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-4">
            <Calendar size={28} />
          </div>
          <h3 className="text-base font-bold text-white">No attendance records for this date</h3>
          <p className="text-xs text-gray-400 max-w-sm mt-1 leading-relaxed">
            There is no attendance session initialized for {date}. Go to the <strong>Attendance Scanner</strong> tab to launch a classroom scan.
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-wider bg-white/[0.02]">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(currentSession.records || []).map((record) => {
                  const student = record.student || {};
                  const isPresent = record.status === 'Present';
                  
                  return (
                    <tr key={record._id || student._id} className="hover:bg-white/[0.01] transition-all text-xs">
                      {/* Student Info */}
                      <td className="px-6 py-3.5 flex items-center gap-3">
                        <StudentAvatar 
                          src={student.profilePictures?.[0]} 
                          name={student.name} 
                          className="h-9 w-9 rounded-lg" 
                        />
                        <span className="font-bold text-white">{student.name || 'Unknown Student'}</span>
                      </td>

                      {/* ID */}
                      <td className="px-6 py-3.5 font-mono text-gray-400">
                        {student.studentId || 'N/A'}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-3.5 text-gray-400">
                        {student.email || 'N/A'}
                      </td>

                      {/* Method */}
                      <td className="px-6 py-3.5 text-gray-300 font-medium">
                        {record.method === 'AI' ? (
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-accent-purple" />
                            <span>Neural Scan</span>
                          </span>
                        ) : (
                          <span className="text-gray-500">Manual Override</span>
                        )}
                      </td>

                      {/* Match Confidence */}
                      <td className="px-6 py-3.5 font-mono text-gray-400">
                        {isPresent && record.method === 'AI' && record.confidence !== undefined
                          ? `${((1 - record.confidence) * 100).toFixed(0)}% Match`
                          : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPresent
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      {/* Toggle status manual control */}
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleStatus(record)}
                          className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold cursor-pointer transition-all duration-200 ${
                            isPresent
                              ? 'bg-pink-500/5 hover:bg-pink-500/10 border-pink-500/20 text-pink-400'
                              : 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          Mark {isPresent ? 'Absent' : 'Present'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
