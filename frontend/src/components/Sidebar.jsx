import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Receipt, Users, LogOut, TrendingUp, ChevronRight } from 'lucide-react';

const ROLE_STYLE = {
  ADMIN:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  ANALYST: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  VIEWER:  'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

export default function Sidebar({ user, onLogout }) {
  const nav = [
    { to: '/',             end: true,  icon: LayoutDashboard, label: 'Dashboard',        roles: ['ADMIN','ANALYST','VIEWER'] },
    { to: '/transactions', end: false, icon: Receipt,          label: 'Transactions',     roles: ['ADMIN','ANALYST'] },
    { to: '/users',        end: false, icon: Users,            label: 'User Management',  roles: ['ADMIN'] },
  ].filter(n => n.roles.includes(user.role));

  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-full border-r"
      style={{ background: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Brand */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}
          >
            <TrendingUp size={15} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">FinanceSys</p>
            <p className="text-slate-600 text-[10px] leading-tight">Analytics Portal</p>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            {(user.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{user.name}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ROLE_STYLE[user.role] || ROLE_STYLE.VIEWER}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-700 px-3 mb-2">Navigation</p>
        {nav.map(({ to, end, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ` +
              (isActive
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-300'} />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <motion.div layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-500/8 border border-transparent hover:border-rose-500/15 transition-all duration-150">
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
