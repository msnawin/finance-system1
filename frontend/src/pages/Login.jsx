import { useState } from 'react';
import api from '../api';
import { UserCircle, Lock, Mail } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      onLogin(user);
    } catch (err) {
      console.error(err);
      setError('Invalid credentials or server error. Default is admin@finance.com / admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-slate-900">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 animate-gradient-xy opacity-90 z-0"></div>
      
      {/* Floating Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-float z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-float z-0" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-[2.5rem] bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-400 text-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-500/30 transform transition-transform hover:scale-105">
           <UserCircle size={44} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-extrabold mb-3 text-center text-white tracking-tight">Welcome Back</h1>
        <p className="text-blue-100/70 mb-8 max-w-[280px] mx-auto text-center font-medium leading-relaxed">
          Log in with your secure credentials to access the finance portal.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-sm font-semibold mb-2 text-white/90 ml-1 tracking-wide">Email Address</label>
            <div className="relative transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-blue-400 transition-colors">
                <Mail size={20} className="drop-shadow-sm" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-blue-400/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-lg"
                placeholder="admin@finance.com"
              />
            </div>
          </div>
          
          <div className="group">
            <label className="block text-sm font-semibold mb-2 text-white/90 ml-1 tracking-wide">Password</label>
            <div className="relative transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-blue-400 transition-colors">
                <Lock size={20} className="drop-shadow-sm" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:bg-white/10 focus:border-blue-400/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-lg tracking-widest font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.8)] transition-all active:scale-[0.98] disabled:opacity-50 border border-white/10 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : null}
            {loading ? 'Authenticating...' : 'Sign In To Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
