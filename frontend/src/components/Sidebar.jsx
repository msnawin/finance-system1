import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Receipt, Users, LogOut, TrendingUp } from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const linkBase = 'flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 w-full';

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', roles: ['ADMIN','ANALYST','VIEWER'] },
    { to: '/transactions', icon: <Receipt size={18} />, label: 'Transactions', roles: ['ADMIN','ANALYST'] },
    { to: '/users', icon: <Users size={18} />, label: 'User Management', roles: ['ADMIN'] },
  ].filter(item => item.roles.includes(user.role));

  const roleColor = user.role === 'ADMIN'
    ? 'text-emerald-400 bg-emerald-400/10'
    : user.role === 'ANALYST'
    ? 'text-blue-400 bg-blue-400/10'
    : 'text-slate-400 bg-slate-400/10';

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full border-r border-white/[0.06] bg-[#0d1117]">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">FinanceSys</p>
            <p className="text-[11px] text-slate-500 leading-tight">Analytics Portal</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.04]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${roleColor}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-3 mb-2">Menu</p>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${linkBase} ${isActive
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                : 'text-slate-400 hover:bg-white/[0.05] hover:text-white border border-transparent'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-blue-400' : ''}>{item.icon}</span>
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
