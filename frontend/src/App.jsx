import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Users from './pages/Users';
import Sidebar from './components/Sidebar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    if (token && userId && userRole) {
      setUser({ id: userId, role: userRole, name: userName });
    }
  }, []);

  const handleLogin = (selectedUser) => {
    localStorage.setItem('userId', selectedUser.id);
    localStorage.setItem('userRole', selectedUser.role);
    localStorage.setItem('userName', selectedUser.name);
    setUser(selectedUser);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-[var(--background)]">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-x-hidden overflow-y-auto w-full p-6">
          <header className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Finance Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Welcome, {user.name} ({user.role})</span>
            </div>
          </header>
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
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
