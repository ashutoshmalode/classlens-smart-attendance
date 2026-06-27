import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import api from '../utils/api.js';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/audit-logs');
      if (response.data.success) {
        setLogs(response.data.logs);
      } else {
        setError(response.data.message || 'Failed to fetch logs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto flex flex-col gap-6 md:gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white m-0">Audit Logs</h2>
          <p className="text-gray-400 text-xs mt-1">
            Chronological logging of manual overrides and resolution changes
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          title="Refresh Logs"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl text-xs font-semibold text-left">
          Failed to fetch audit logs: {error}
        </div>
      )}

      <div className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="py-20 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
              <FileText size={24} className="text-gray-600" />
              <p className="text-sm font-semibold">No audit logs found</p>
              <p className="text-xs text-gray-600 max-w-xs">
                Manual updates or unresolved face actions will create logs here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-wider bg-white/[0.02]">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Class Date</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Prev Status</th>
                  <th className="px-6 py-4">New Status</th>
                  <th className="px-6 py-4">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/[0.01] transition-all text-xs">
                    <td className="px-6 py-3.5 font-mono text-gray-400">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-gray-400">
                      {log.attendanceDate}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="text-white font-bold">{log.student?.name || 'Unknown Student'}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{log.student?.studentId || ''}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          log.action === 'Resolve Unknown'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-gray-500 font-semibold">{log.previousState}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          log.newState === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                        }`}
                      >
                        {log.newState}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-400 font-medium">
                      {log.changedBy?.name || 'Administrator'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
