import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Moon, Sun, Menu, Bell, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Navbar = () => {
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 text-textMuted hover:bg-background rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-textMain capitalize tracking-tight">
          {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2 text-textMuted hover:bg-background hover:text-textMain rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <button 
          onClick={toggleTheme}
          className="p-2 text-textMuted hover:bg-background hover:text-textMain rounded-full transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="h-8 w-px bg-border mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-textMain leading-tight">{user?.username || 'User'}</span>
            <span className="text-xs text-textMuted font-medium">{user?.role || 'VIEWER'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 shadow-sm shadow-primary/20 flex items-center justify-center text-white font-bold border-2 border-card">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button 
            onClick={() => useAuthStore.getState().logout()} 
            className="md:hidden p-2 text-danger hover:bg-danger/10 rounded-full transition-colors ml-2"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
