import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Users, LogOut, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_STYLE = {
  ADMIN:   'text-[#0A84FF] border-[#0A84FF]/20',
  ANALYST: 'text-slate-300 border-slate-700',
  VIEWER:  'text-slate-500 border-slate-800',
};

export default function Sidebar({ user, onLogout }) {
  const nav = [
    { to: '/',             end: true,  icon: LayoutDashboard, label: 'Dashboard',        roles: ['ADMIN','ANALYST','VIEWER'] },
    { to: '/transactions', end: false, icon: Receipt,         label: 'Transactions',     roles: ['ADMIN','ANALYST'] },
    { to: '/users',        end: false, icon: Users,           label: 'User Management',  roles: ['ADMIN'] },
  ].filter(n => n.roles.includes(user.role));

  return (
    <aside
      className="w-[260px] shrink-0 flex flex-col h-full subtle-border border-r bg-[#000000] relative"
    >
      {/* Brand */}
      <div className="px-6 py-8 border-b subtle-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#111111] border border-[#222222]">
          <TrendingUp size={16} className="text-[#0A84FF]" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm tracking-tight flex items-center gap-1">
            Finance<span className="text-slate-500 font-normal">Sys</span>
          </p>
        </div>
      </div>

      {/* User */}
      <div className="px-5 py-5 border-b subtle-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-slate-800 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 bg-[#0A84FF]">
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-[13px] font-medium truncate">{user.name}</p>
            <span className={`mt-0.5 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${ROLE_STYLE[user.role] || ROLE_STYLE.VIEWER}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-medium text-slate-500 px-3 mb-3">Menu</p>
        {nav.map(({ to, end, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 outline-none ` +
              (isActive
                ? 'text-white font-medium bg-[#111111] subtle-border border'
                : 'text-slate-400 font-normal hover:text-slate-200 hover:bg-[#0a0a0a] border border-transparent')
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative z-10 flex items-center justify-center w-5">
                  <Icon size={16} className={isActive ? 'text-[#0A84FF]' : 'text-slate-500 group-hover:text-slate-300 transition-colors'} />
                </div>
                <span className="relative z-10 flex-1">{label}</span>
                {isActive && (
                  <motion.div layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-[#0A84FF]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-5 border-t subtle-border">
        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:text-white bg-[#0a0a0a] hover:bg-[#141414] border border-[#222222] hover:border-slate-700 transition-colors">
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
