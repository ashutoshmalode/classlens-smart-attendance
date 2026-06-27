import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice.js';
import { LogOut, User, Shield, Menu, X } from 'lucide-react';

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isFaculty = isAuthenticated && user && user.role !== 'student';

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <nav className="glass sticky top-0 z-40 w-full px-4 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-2 md:gap-3">
        {isFaculty && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer mr-1"
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        <img
          src="/apple-touch-icon.png"
          alt="ClassLens Logo"
          className="h-8 w-8 md:h-10 md:w-10 object-contain rounded-xl shadow-lg shadow-purple-500/20"
        />
        <div>
          <h1 className="text-base md:text-xl font-bold tracking-tight text-white m-0 leading-none">
            ClassLens
          </h1>
          <span className="text-[9px] md:text-xs text-gray-400 font-medium hidden sm:inline">
            Multi-Angle Face Recognizer
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex items-center gap-2 md:gap-3 border-r border-white/10 pr-3 md:pr-5">
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-accent-purple shrink-0">
              {user.role === 'student' ? <User size={16} /> : <Shield size={16} />}
            </div>
            <div className="text-left hidden min-[480px]:block">
              <p className="text-xs md:text-sm font-semibold text-white leading-none">
                {user.name}
              </p>
              <span className="text-[9px] md:text-[11px] text-gray-400 font-medium capitalize mt-1 block">
                {user.role} {user.studentId ? `(${user.studentId})` : ''}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all duration-200 text-[10px] md:text-xs font-semibold cursor-pointer"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
