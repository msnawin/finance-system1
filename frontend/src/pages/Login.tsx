import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Wallet, Loader2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Adjusted based on standard Spring Boot convention, 
      // some backends use { username, password }, check specific if it fails
      const response = await api.post('/auth/login', { email, password });
      
      // Expected structure from a typical Spring JWT auth
      const { token, user } = response.data; 
      
      if (token) {
         // fallback user parsing if backend only returns token
        const authUser = user ? { ...user, username: user.name || email } : { username: email, role: 'ADMIN', id: 1 }; 
        setAuth(authUser, token);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials format received from server.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-cardContent relative overflow-hidden">
        {/* Decorative background vectors */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 select-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent"></div>
        </div>
        
        <div className="z-10 flex flex-col items-center text-center p-8 max-w-md">
          <div className="bg-primary/20 p-4 rounded-2xl mb-6">
            <Wallet className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-textMain mb-4">FinanceOS</h1>
          <p className="text-textMuted text-lg">
            Manage your corporate transactions, analyze trends, and securely control your financial data in one unified dashboard.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-24 xl:px-32 bg-card">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="md:hidden flex items-center justify-center mb-8 gap-2">
            <Wallet className="w-10 h-10 text-primary" />
            <h1 className="text-2xl font-bold text-textMain">FinanceOS</h1>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-textMain">Welcome back</h2>
            <p className="mt-2 text-sm text-textMuted">Please sign in to your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-border bg-cardContent px-4 py-3 text-textMain focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder-textMuted transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-border bg-cardContent px-4 py-3 text-textMain focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder-textMuted transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm shadow-primary/20 text-sm font-medium text-white bg-primary hover:bg-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
