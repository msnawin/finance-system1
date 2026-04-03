import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Users, LogOut } from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-[var(--primary)] text-white shadow-md' 
        : 'hover:bg-[var(--secondary)] text-[var(--foreground)]'
    }`;

  return (
    <aside className="w-64 glass-panel border-r shrink-0 flex flex-col h-full sticky left-0 top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-[var(--primary)] flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg">
            F
          </div>
          FinanceSys
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavLink to="/" className={navLinkClass}>
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </NavLink>
        
        {(user.role === 'ADMIN' || user.role === 'ANALYST') && (
          <NavLink to="/transactions" className={navLinkClass}>
            <Receipt size={20} />
            <span className="font-medium">Transactions</span>
          </NavLink>
        )}

        {user.role === 'ADMIN' && (
          <NavLink to="/users" className={navLinkClass}>
            <Users size={20} />
            <span className="font-medium">Users</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-[var(--secondary)]">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
