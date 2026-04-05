import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  isSidebarOpen: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => {
  const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  const initialTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    theme: initialTheme,
    isSidebarOpen: false,
    toggleTheme: () =>
      set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
      }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    closeSidebar: () => set({ isSidebarOpen: false }),
  };
});
