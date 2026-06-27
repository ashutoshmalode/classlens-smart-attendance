import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Camera,
  HelpCircle,
  FileText,
  CalendarRange,
  X,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Attendance Scanner', icon: Camera },
    { id: 'review-unknown', label: 'Resolve Unknowns', icon: HelpCircle },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'register-student', label: 'Enroll Student', icon: UserPlus },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
    { id: 'attendance-history', label: 'Attendance History', icon: CalendarRange },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-[#090a0f] flex flex-col justify-between py-6 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-1 px-4">
          {/* Close button inside sidebar on mobile */}
          <div className="flex lg:hidden justify-end px-2 mb-2">
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-3 mb-3 text-left">
            Navigation
          </span>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false); // Close sidebar drawer on selection (mobile/tablet)
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-purple/10 to-accent-pink/10 border-accent-purple/35 text-white shadow-sm shadow-purple-500/5'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-accent-purple' : 'text-gray-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-white/5 mx-4">
          <div className="rounded-xl bg-white/5 p-4 border border-white/10 text-center">
            <p className="text-xs font-semibold text-white">Need Support?</p>
            <p className="text-[10px] text-gray-400 mt-1">AI Face recognition threshold is default (0.60).</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
