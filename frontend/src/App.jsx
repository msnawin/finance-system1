import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Users from './pages/Users';
import Sidebar from './components/Sidebar';
import api from './api';

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true); // prevents flash of login page

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setChecking(false);
      return;
    }
    // Validate token against backend — if it fails, clear and show login
    api.get('/dashboard/summary')
      .then(() => {
        const userId   = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');
        if (userId && userRole) {
          setUser({ id: userId, role: userRole, name: userName });
        } else {
          localStorage.clear();
        }
      })
      .catch(() => {
        localStorage.clear(); // expired / invalid token → force login
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = (loggedInUser) => {
    localStorage.setItem('userId',   loggedInUser.id);
    localStorage.setItem('userRole', loggedInUser.role);
    localStorage.setItem('userName', loggedInUser.name);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d1117]">
        <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#0d1117] text-white">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/"             element={<Dashboard    user={user} />} />
            <Route path="/transactions" element={<Transactions user={user} />} />
            {user.role === 'ADMIN' && (
              <Route path="/users" element={<Users />} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
