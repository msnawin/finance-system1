import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Users        from './pages/Users';
import Sidebar      from './components/Sidebar';

/*
  Auth Strategy: sessionStorage
  – Token lives only for the browser session (cleared on tab/window close).
  – On page REFRESH within the same session, the user stays logged in.
  – Opening a new tab ALWAYS shows the login page.
  – No async API ping needed → zero flash, instant render.
*/
function App() {
  const [user, setUser] = useState(() => {
    try {
      const token = sessionStorage.getItem('fs_token');
      const raw   = sessionStorage.getItem('fs_user');
      if (token && raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
  });

  const handleLogin = (loggedInUser, token) => {
    sessionStorage.setItem('fs_token', token);
    sessionStorage.setItem('fs_user',  JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-navy text-white overflow-hidden">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/"             element={<PageWrap><Dashboard    user={user} /></PageWrap>} />
              <Route path="/transactions" element={<PageWrap><Transactions user={user} /></PageWrap>} />
              {user.role === 'ADMIN' && (
                <Route path="/users"      element={<PageWrap><Users /></PageWrap>} />
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

function PageWrap({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
}

export default App;
