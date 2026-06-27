import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAttendance, manuallyAdjustAttendance } from '../store/slices/attendanceSlice.js';
import { fetchStudents } from '../store/slices/studentSlice.js';
import DashboardCard from '../components/DashboardCard.jsx';
import TrendChart from '../components/TrendChart.jsx';
import {
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Search,
  FileSpreadsheet,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../utils/api.js';

export const Dashboard = () => {
  const dispatch = useDispatch();
  const { list: students } = useSelector((state) => state.students);
  const { currentSession, statistics, loading } = useSelector((state) => state.attendance);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial fetch
  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(getAttendance(date));
  }, [dispatch]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    dispatch(getAttendance(selectedDate));
  };

  const handleRefresh = () => {
    dispatch(getAttendance(date));
    dispatch(fetchStudents());
  };

  const handleManualStatusChange = (studentId, currentStatus) => {
    const nextStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
    dispatch(manuallyAdjustAttendance({ date, studentId, status: nextStatus }));
  };

  const handleCSVExport = () => {
    // Navigate directly to download link
    window.open(`/api/reports/export?date=${date}`, '_blank');
  };

  // Filter student list
  const filteredRecords = currentSession?.records?.filter((record) => {
    const nameMatch = record.student?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = record.student?.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || idMatch;
  }) || [];

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col gap-6 md:gap-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white m-0">Admin Dashboard</h2>
          <p className="text-gray-400 text-xs mt-1">
            Real-time analytics and attendance verification
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
            <Calendar size={16} className="text-accent-purple" />
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="bg-transparent text-sm text-white focus:outline-none border-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleRefresh}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {currentSession && (
            <button
              onClick={handleCSVExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Enrollment"
          value={students.length}
          icon={Users}
          colorClass="text-blue-400"
        />
        <DashboardCard
          title="Present Today"
          value={statistics?.present ?? 0}
          icon={CheckCircle2}
          colorClass="text-emerald-400"
          trend={statistics ? `${statistics.attendancePercentage}% Present` : undefined}
        />
        <DashboardCard
          title="Absent Today"
          value={statistics?.absent ?? 0}
          icon={XCircle}
          colorClass="text-pink-400"
        />
        <DashboardCard
          title="Unknown Detections"
          value={statistics?.unknown ?? 0}
          icon={HelpCircle}
          colorClass="text-amber-400"
        />
      </div>

      {/* Main content split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend line */}
        <div className="lg:col-span-2">
          <TrendChart />
        </div>

        {/* Info card */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between">
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              AI Face Matching Info
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              We process up to 10 photos per session, extract 128-float facial vectors and match them with database templates using Euclidean distances.
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-400">Green highlight: matched student &lt; 0.60 distance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs text-gray-400">Red highlight: crop triggered for review</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 mt-4">
            <span className="text-[10px] text-gray-500">System load: Normal</span>
          </div>
        </div>
      </div>

      {/* Daily Records List */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
          <h3 className="text-base font-bold text-white text-left m-0">
            Attendance Log - {date}
          </h3>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          </div>
        </div>

        {/* Student status table */}
        <div className="overflow-x-auto">
          {!currentSession ? (
            <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
              <SlidersHorizontal size={24} className="text-gray-600 animate-pulse" />
              <p className="text-sm font-semibold">No Attendance Records Found</p>
              <p className="text-xs text-gray-600 max-w-xs">
                Run a multi-angle classroom scan session on this date to automatically compute attendance records.
              </p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p className="text-sm">No matched students found for search: "{searchQuery}"</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-wider bg-white/[0.02]">
                  <th className="px-6 py-3.5">Student ID</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Confidence</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.map((record) => {
                  const s = record.student || {};
                  const isPresent = record.status === 'Present';
                  return (
                    <tr key={record._id} className="hover:bg-white/[0.01] transition-all text-xs">
                      <td className="px-6 py-3.5 font-mono text-gray-400">
                        {s.studentId}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-white">
                        {s.name}
                      </td>
                      <td className="px-6 py-3.5 text-gray-400">
                        {s.email}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPresent
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-gray-400 font-semibold">{record.method}</span>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-gray-400">
                        {record.method === 'AI' && record.confidence
                          ? `${((1 - record.confidence) * 100).toFixed(0)}%`
                          : '100%'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => handleManualStatusChange(s._id, record.status)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                            isPresent
                              ? 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
