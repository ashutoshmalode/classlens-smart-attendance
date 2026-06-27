import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin } from '../store/slices/authSlice.js';
import { Mail, Lock, LogIn, Sparkles, SwitchCamera } from 'lucide-react';

export const Login = ({ onSwitchToStudent }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginAdmin({ email, password }));
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 relative">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-accent-purple/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-accent-pink/10 blur-[100px]" />

      <div className="w-full max-w-md glass p-8 rounded-3xl border border-white/5 relative z-10 flex flex-col items-center">
        <img
          src="/apple-touch-icon.png"
          alt="ClassLens Logo"
          className="h-14 w-14 object-contain rounded-2xl shadow-xl shadow-purple-500/20 mb-4"
        />

        <h2 className="text-2xl font-extrabold text-white mb-1">ClassLens</h2>
        <p className="text-gray-400 text-xs mb-8">Faculty Smart Attendance Portal</p>

        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@university.edu"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-all duration-200"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-all duration-200"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-accent-purple to-accent-pink hover:from-accent-purple/90 hover:to-accent-pink/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        <div className="w-full border-t border-white/5 my-6" />

        <button
          onClick={onSwitchToStudent}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <SwitchCamera size={14} className="text-accent-purple" />
          <span>Switch to Student Lookup Portal</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
