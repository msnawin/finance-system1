import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, RefreshCcw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../api';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);

/* ── 3D Tilt Card ── */
function TiltCard({ children, className = '', glowColor = 'rgba(59,130,246,0.3)' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);

  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        rotateX, rotateY,
        transformStyle: 'preserve-3d',
        perspective: 800,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 20px 40px -10px rgba(0,0,0,0.4), 0 0 60px -15px ${glowColor}`,
      }}
      className={`glass p-6 cursor-default ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ── Custom Pie Label ── */
const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.04) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const px = cx + (r + 25) * Math.cos(-midAngle * RADIAN);
  const py = cy + (r + 25) * Math.sin(-midAngle * RADIAN);
  return (
    <text x={px} y={py} fill="#e6edf3" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {name} {(percent * 100).toFixed(0)}%
    </text>
  );
};

/* ── Animated Pie Shape ── */
function AnimatedPieSlice(props) {
  return (
    <motion.path
      {...props}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{ transformOrigin: 'center', cursor: 'pointer' }}
    />
  );
}

export default function Dashboard({ user }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = () => {
    setLoading(true);
    api.get('/dashboard/summary')
      .then(r  => { setData(r.data); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  };
  useEffect(fetch, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );

  if (error || !data)
    return <p className="text-center text-red-400 mt-20">{error || 'No data.'}</p>;

  const income  = Number(data.totalIncome  || 0);
  const expense = Number(data.totalExpense || 0);
  const balance = Number(data.netBalance   || 0);
  const isAdmin = user?.role === 'ADMIN';

  const pieData = [
    { name: 'Income',  value: income  },
    { name: 'Expense', value: expense },
  ].filter(d => d.value > 0);

  const catData = (data.categoryTotals || []).map(c => ({ name: c.category, value: Number(c.totalAmount || 0) }));

  const barData = (data.monthlyTrends || []).slice().reverse().map(m => ({
    month:   m.month,
    Income:  Number(m.income  || 0),
    Expense: Number(m.expense || 0),
  }));

  const PIE_COLORS = ['#10b981', '#ef4444'];
  const CAT_COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#06b6d4','#f97316','#ec4899'];

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show:   { opacity: 1, y: 0,  transition: { type: 'spring', stiffness: 200, damping: 22 } },
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-animated min-h-full">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isAdmin ? 'Platform Overview' : 'My Dashboard'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin ? 'Aggregated data across all users' : `Showing data for ${user?.name}`}
          </p>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4 }}
          onClick={fetch}
          className="p-3 glass rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCcw size={18} />
        </motion.button>
      </motion.div>

      {/* ── Summary Cards ── */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Balance */}
        <motion.div variants={cardVariants}>
          <TiltCard glowColor="rgba(59,130,246,0.4)" className="pulse-glow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Net Balance</p>
                <p className={`text-3xl font-black ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>{fmt(balance)}</p>
                <p className="text-slate-500 text-xs mt-2">{isAdmin ? 'All users combined' : 'Your balance'}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                <Wallet size={22} />
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Income */}
        <motion.div variants={cardVariants}>
          <TiltCard glowColor="rgba(16,185,129,0.3)">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Total Income</p>
                <p className="text-3xl font-black text-emerald-400">{fmt(income)}</p>
                <p className="text-emerald-500/60 text-xs mt-2 flex items-center gap-1">
                  <ArrowUpRight size={12} /> positive cashflow
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                <TrendingUp size={22} />
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Expense */}
        <motion.div variants={cardVariants}>
          <TiltCard glowColor="rgba(239,68,68,0.3)">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Total Expenses</p>
                <p className="text-3xl font-black text-red-400">{fmt(expense)}</p>
                <p className="text-red-500/60 text-xs mt-2 flex items-center gap-1">
                  <ArrowDownRight size={12} /> outgoing spend
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/20 text-red-400">
                <TrendingDown size={22} />
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </motion.div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Animated Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="glass p-6"
        >
          <h3 className="text-white font-bold text-lg mb-1">Income vs Expense</h3>
          <p className="text-slate-500 text-xs mb-4">Your financial ratio at a glance</p>
          <div style={{ height: 280 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={104}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={renderLabel}
                    shape={<AnimatedPieSlice />}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#e6edf3', fontSize: 13 }}
                    formatter={(v) => fmt(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                No transaction data yet
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-6 justify-center mt-2">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />Income
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />Expense
            </div>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="glass p-6"
        >
          <h3 className="text-white font-bold text-lg mb-1">Monthly Trends</h3>
          <p className="text-slate-500 text-xs mb-4">Income & expenses over time</p>
          <div style={{ height: 280 }}>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#e6edf3', fontSize: 13 }}
                    formatter={(v) => fmt(v)}
                  />
                  <Legend wrapperStyle={{ color: '#8b949e', fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="Income"  fill="#10b981" radius={[4,4,0,0]} />
                  <Bar dataKey="Expense" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-sm">No monthly data yet</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Category Breakdown ── */}
      {catData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-6"
        >
          <h3 className="text-white font-bold text-lg mb-1">Expense Categories</h3>
          <p className="text-slate-500 text-xs mb-4">Breakdown of where money is spent</p>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} dataKey="value" cx="50%" cy="50%" outerRadius={95} paddingAngle={3} shape={<AnimatedPieSlice />}>
                  {catData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#e6edf3', fontSize: 13 }}
                  formatter={(v) => fmt(v)}
                />
                <Legend wrapperStyle={{ color: '#8b949e', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ── Recent Activity Feed ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-bold text-lg">Recent Activity</h3>
            <p className="text-slate-500 text-xs">Latest transactions</p>
          </div>
          <motion.button whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }} onClick={fetch}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] transition-colors text-slate-400">
            <RefreshCcw size={15} />
          </motion.button>
        </div>

        <div className="space-y-1">
          {(data.recentTransactions || []).length === 0 ? (
            <p className="text-center text-slate-600 py-8 text-sm">No transactions yet</p>
          ) : (
            (data.recentTransactions || []).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.04)' }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl cursor-default border border-transparent hover:border-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${t.type === 'INCOME' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {t.type === 'INCOME' ? <ArrowUpRight size={16} className="text-emerald-400" /> : <ArrowDownRight size={16} className="text-red-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.category}</p>
                    <p className="text-xs text-slate-500">{t.createdByName} · {t.date}</p>
                  </div>
                </div>
                <p className={`font-bold text-sm ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
