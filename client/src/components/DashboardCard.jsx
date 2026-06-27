import React from 'react';

export const DashboardCard = ({ title, value, icon: Icon, colorClass = 'text-accent-purple', trend }) => {
  return (
    <div className="glass p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-white/10 flex items-center justify-between">
      <div className="flex flex-col gap-1 text-left">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-3xl font-extrabold text-white mt-1">
          {value}
        </span>
        {trend && (
          <span className="text-[10px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            {trend}
          </span>
        )}
      </div>
      <div className={`p-4 rounded-xl bg-white/5 border border-white/10 ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default DashboardCard;
