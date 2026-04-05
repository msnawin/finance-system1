import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LayoutDashboard, Receipt, Users, LogOut, Wallet } from 'lucide-react';
import { cn } from '../../utils/ui';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Transactions', icon: Receipt, path: '/transactions' }
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Users', icon: Users, path: '/users' });
  }

  return (
    <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col z-20">
      <div className="h-16 flex items-center px-6 border-b border-border gap-2 text-primary">
        <Wallet className="w-8 h-8" />
        <span className="text-xl font-bold tracking-tight text-textMain">FinanceOS</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-textMuted hover:bg-background hover:text-textMain'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
