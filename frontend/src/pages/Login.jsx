import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
      // Pass both user object AND the token back to App
      onLogin(data.user, data.token);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 ' +
    'bg-white/[0.04] border border-white/[0.06] outline-none transition-all duration-200 ' +
    'focus:border-blue-500/60 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]';

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy relative overflow-hidden">

      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none float" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-emerald-600/8 blur-[120px] pointer-events-none float" style={{ animationDelay: '3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        <div className="glass p-10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-7 pulse-blue"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 8px 30px rgba(59,130,246,0.35)' }}
          >
            <TrendingUp size={26} className="text-white" />
          </motion.div>

          <h1 className="text-2xl font-black text-center text-white mb-1 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 text-sm text-center mb-8">Sign in to your finance portal</p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-5"
              >
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                type="email" required placeholder="admin@finance.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className={inputBase}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'} required placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)}
                className={inputBase + ' pr-11'}
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 0 36px rgba(59,130,246,0.45)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 4px 20px rgba(59,130,246,0.28)' }}
            >
              {loading
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" />
                : null}
              {loading ? 'Signing in…' : 'Sign In to Dashboard'}
            </motion.button>
          </form>

          <p className="text-center text-slate-700 text-xs mt-6 font-mono">
            admin@finance.com / admin123
          </p>
        </div>
      </motion.div>
    </div>
  );
}
