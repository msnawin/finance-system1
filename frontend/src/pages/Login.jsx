import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, TrendingUp } from 'lucide-react';
import api from '../api';

export default function Login({ onLogin }) {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      onLogin(data.user, data.token);
    } catch {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-600 ' +
    'bg-[#0a0a0a] border border-[#222] outline-none transition-all duration-300 ' +
    'focus:border-[#0A84FF] focus:bg-[#111]';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[400px] px-6"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-[#0a0a0a] border border-[#222]">
            <TrendingUp size={24} className="text-[#0A84FF]" />
          </div>
          <h1 className="text-[26px] font-bold text-center text-white tracking-tight mb-2">FinanceSys</h1>
          <p className="text-slate-500 text-[13px] text-center font-medium">Please sign in to continue</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input
              type="email" required placeholder="admin@finance.com"
              value={email} onChange={e => setEmail(e.target.value)}
              className={inputBase}
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input
              type={showPass ? 'text' : 'password'} required placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              className={inputBase + ' pr-12'}
            />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-lg bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] text-[13px] font-medium">
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 bg-[#0A84FF] hover:bg-[#0070E0] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" />
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-slate-600 text-[11px] mt-8 font-medium">
          admin@finance.com / admin123
        </p>
      </motion.div>
    </div>
  );
}
