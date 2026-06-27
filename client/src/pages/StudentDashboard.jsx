import React, { useState, useEffect } from 'react';
import { RefreshCw, Calendar, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import api from '../utils/api.js';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMyAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/attendance/my-attendance');
      if (response.data.success) {
        setData(response.data);
      } else {
        setError(response.data.message || 'Failed to retrieve attendance');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const stats = data?.statistics;
  const history = data?.history || [];

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white m-0">Student Portal</h2>
          <p className="text-gray-400 text-xs mt-1">
            Personal attendance record and recognition history
          </p>
        </div>

        <button
          onClick={fetchMyAttendance}
          disabled={loading}
          className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl text-xs font-semibold text-left">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Attendance Rate */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Attendance Rate
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {stats.attendancePercentage}%
              </h3>
            </div>
            {/* Visual Ring */}
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
                  strokeDashoffset={138 - (138 * parseFloat(stats.attendancePercentage)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-white">
                {stats.attendancePercentage}%
              </span>
            </div>
          </div>

          {/* Total Sessions */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between text-left">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Total Classes Checked
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {stats.totalSessions}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Calendar size={18} />
            </div>
          </div>

          {/* Present Days */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between text-left">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Present Days
              </span>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                {stats.present}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>

          {/* Absent Days */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between text-left">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Absent Days
              </span>
              <h3 className="text-2xl font-extrabold text-pink-400 mt-1">
                {stats.absent}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <XCircle size={18} />
            </div>
          </div>
        </div>
      )}

      {/* History Grid */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-base font-bold text-white text-left m-0">
            Attendance Log History
          </h3>
        </div>

        <div className="overflow-x-auto">
          {history.length === 0 ? (
            <div className="py-20 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
              <Clock size={24} className="text-gray-600 animate-pulse" />
              <p className="text-sm font-semibold">No attendance sessions found</p>
              <p className="text-xs text-gray-600 max-w-xs">
                Your face has not been registered in any classroom sessions yet.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-wider bg-white/[0.02] ">
                  <th className="px-6 py-4">Session Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Recognition Type</th>
                  <th className="px-6 py-4">Accuracy / Confidence</th>
                  <th className="px-6 py-4">Timestamp Checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((record, index) => {
                  const isPresent = record.status === 'Present';
                  return (
                    <tr key={index} className="hover:bg-white/[0.01] transition-all text-xs">
                      <td className="px-6 py-3.5 font-mono text-gray-300 font-bold">
                        {record.date}
                      </td>
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
                      <td className="px-6 py-3.5 font-semibold text-gray-300">
                        {record.method === 'AI' ? (
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-accent-purple" />
                            <span>Neural Scan</span>
                          </span>
                        ) : (
                          <span>Manual Adjust</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-gray-400">
                        {isPresent
                          ? record.method === 'AI' && record.confidence
                            ? `${((1 - record.confidence) * 100).toFixed(0)}% Match`
                            : '100% Match'
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-3.5 text-gray-400">
                        {isPresent ? formatTime(record.detectedAt) : '--:--:--'}
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

export default StudentDashboard;
