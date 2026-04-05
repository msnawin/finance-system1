import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { LayoutDashboard, Receipt, Users, LogOut, Wallet, X } from 'lucide-react';
import { cn } from '../../utils/ui';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useUIStore();
  const isAdmin = user?.role === 'ADMIN';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Transactions', icon: Receipt, path: '/transactions' }
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Users', icon: Users, path: '/users' });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border text-primary">
          <div className="flex items-center gap-2">
            <Wallet className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-textMain">FinanceOS</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-1 hover:bg-background rounded-lg text-textMuted"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
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
            onClick={() => {
              closeSidebar();
              logout();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
