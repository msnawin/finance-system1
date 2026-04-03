import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, RefreshCcw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../api';

/* ─── Formatters ─────────────────────────── */
const currency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);

const shortMoney = (v) => {
  const n = Number(v);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

/* ─── Colours ────────────────────────────── */
const EMERALD = '#10b981';
const ROSE    = '#f43f5e';
const BLUE    = '#3b82f6';
const PALETTE = ['#3b82f6','#8b5cf6','#f59e0b','#06b6d4','#f97316','#ec4899','#10b981'];

/* ─── Tilt Card ─────────────────────────── */
function TiltCard({ children, glow = BLUE, className = '' }) {
  const ref = useRef(null);

  const move = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width  - 0.5) * 14;
    const y = ((e.clientY - top)  / height - 0.5) * -14;
    el.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) scale(1.02)`;
    el.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.08), 0 20px 50px rgba(0,0,0,0.4), 0 0 60px -15px ${glow}55`;
  }, [glow]);

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)';
    el.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.3)';
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={reset}
      className={`glass p-6 transition-transform duration-200 cursor-default ${className}`}
      style={{ willChange: 'transform', boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.3)' }}
    >
      {children}
    </div>
  );
}

/* ─── Custom Tooltip ────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
      {label && <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>}
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color || '#e2e8f0', fontWeight: 600 }}>
          {p.name}: {shortMoney(p.value)}
        </p>
      ))}
    </div>
  );
};

/* ─── Stat Card ─────────────────────────── */
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } } };

function StatCard({ label, value, sub, icon: Icon, iconBg, valueColor }) {
  return (
    <motion.div variants={fadeUp}>
      <TiltCard glow={iconBg}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">{label}</p>
            <p className={`text-2xl font-black ${valueColor} leading-tight`}>{value}</p>
            {sub && <p className="text-xs text-slate-600 mt-1.5">{sub}</p>}
          </div>
          <div className="p-3 rounded-xl shrink-0" style={{ background: `${iconBg}22` }}>
            <Icon size={20} style={{ color: iconBg }} />
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function Dashboard({ user }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true); setError(null);
    api.get('/dashboard/summary')
      .then(r  => { setData(r.data); })
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Loading */
  if (loading) return (
    <div className="flex h-full min-h-screen items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        className="w-9 h-9 rounded-full border-[3px] border-blue-500 border-t-transparent" />
    </div>
  );

  /* Error */
  if (error) return (
    <div className="flex h-full min-h-screen items-center justify-center text-rose-400 text-sm">{error}</div>
  );

  const income  = Number(data?.totalIncome  ?? 0);
  const expense = Number(data?.totalExpense ?? 0);
  const balance = Number(data?.netBalance   ?? 0);
  const isAdmin = user?.role === 'ADMIN';

  /* ── Pie data: Income vs Expense ── */
  const pieData = [
    { name: 'Income',  value: income  },
    { name: 'Expense', value: expense },
  ].filter(d => d.value > 0);

  /* ── Category pie data ── */
  const catData = (data?.categoryTotals ?? [])
    .filter(c => Number(c.totalAmount) > 0)
    .map(c => ({ name: c.category, value: Number(c.totalAmount) }));

  /* ── Bar chart data (chronological order) ── */
  const barData = (data?.monthlyTrends ?? [])
    .slice()
    .reverse()
    .map(m => ({
      month:   m.month,
      Income:  Number(m.income  ?? 0),
      Expense: Number(m.expense ?? 0),
    }));

  const hasPie    = pieData.length > 0;
  const hasCat    = catData.length > 0;
  const hasBar    = barData.length > 0;
  const hasRecent = (data?.recentTransactions ?? []).length > 0;

  return (
    <div className="p-6 lg:p-8 space-y-7">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">{isAdmin ? 'Platform Overview' : 'My Dashboard'}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin ? 'Viewing aggregated data for all users' : `Viewing data for ${user?.name}`}
          </p>
        </div>
        <motion.button whileHover={{ rotate: 180 }} transition={{ duration: 0.35 }} onClick={fetchData}
          className="p-2.5 glass text-slate-500 hover:text-white transition-colors rounded-xl">
          <RefreshCcw size={16} />
        </motion.button>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          label={isAdmin ? 'Platform Balance' : 'Net Balance'}
          value={currency(balance)}
          sub={balance >= 0 ? '▲ Positive overall' : '▼ In the red'}
          icon={Wallet}
          iconBg={balance >= 0 ? EMERALD : ROSE}
          valueColor={balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}
        />
        <StatCard
          label="Total Income"
          value={currency(income)}
          sub="All inflow transactions"
          icon={TrendingUp}
          iconBg={EMERALD}
          valueColor="text-emerald-400"
        />
        <StatCard
          label="Total Expenses"
          value={currency(expense)}
          sub="All outflow transactions"
          icon={TrendingDown}
          iconBg={ROSE}
          valueColor="text-rose-400"
        />
      </motion.div>

      {/* ── CHARTS: PIE + BAR ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* PIE — Income vs Expense */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="glass p-6">
          <h3 className="text-white font-bold text-base mb-0.5">Income vs Expense</h3>
          <p className="text-slate-500 text-xs mb-5">Spending ratio at a glance</p>

          {hasPie ? (
            /* KEY FIX: explicit pixel height on wrapper, NOT a % inside flexbox */
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={900}
                    animationEasing="ease-out"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                  >
                    <Cell fill={EMERALD} />
                    <Cell fill={ROSE} />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 260 }} className="flex items-center justify-center text-slate-700 text-sm">
              No transaction data yet
            </div>
          )}
        </motion.div>

        {/* BAR — Monthly Trends */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="glass p-6">
          <h3 className="text-white font-bold text-base mb-0.5">Monthly Trends</h3>
          <p className="text-slate-500 text-xs mb-5">Income & expenses over time</p>

          {hasBar ? (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#475569', fontSize: 11 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tickFormatter={shortMoney}
                    tick={{ fill: '#475569', fontSize: 11 }}
                    axisLine={false} tickLine={false}
                    width={50}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend iconType="circle" iconSize={8}
                    formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                  <Bar dataKey="Income"  name="Income"  fill={EMERALD} radius={[4,4,0,0]} maxBarSize={32} />
                  <Bar dataKey="Expense" name="Expense" fill={ROSE}    radius={[4,4,0,0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 260 }} className="flex items-center justify-center text-slate-700 text-sm">
              No monthly data yet
            </div>
          )}
        </motion.div>
      </div>

      {/* ── CATEGORY BREAKDOWN ── */}
      {hasCat && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass p-6">
          <h3 className="text-white font-bold text-base mb-0.5">Expense by Category</h3>
          <p className="text-slate-500 text-xs mb-5">Breakdown of spending categories</p>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={85}
                  paddingAngle={3}
                  isAnimationActive animationBegin={0} animationDuration={900}
                  label={({ name, percent }) => percent > 0.04 ? `${name} ${(percent*100).toFixed(0)}%` : ''}
                  labelLine={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
                >
                  {catData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ── RECENT ACTIVITY ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-bold text-base">Recent Activity</h3>
            <p className="text-slate-500 text-xs">Latest transactions</p>
          </div>
          <motion.button whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }} onClick={fetchData}
            className="p-2 glass rounded-xl text-slate-600 hover:text-white transition-colors text-xs">
            <RefreshCcw size={14} />
          </motion.button>
        </div>

        {!hasRecent ? (
          <p className="text-center text-slate-700 text-sm py-10">No recent transactions</p>
        ) : (
          <div className="space-y-1">
            {data.recentTransactions.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -1, backgroundColor: 'rgba(255,255,255,0.03)' }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 22 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent hover:border-white/[0.05] transition-all cursor-default"
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  t.type === 'INCOME' ? 'bg-emerald-500/15' : 'bg-rose-500/15'}`}>
                  {t.type === 'INCOME'
                    ? <ArrowUpRight   size={16} className="text-emerald-400" />
                    : <ArrowDownRight size={16} className="text-rose-400" />}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{t.category}</p>
                  <p className="text-xs text-slate-600">{t.createdByName} · {t.date}</p>
                </div>
                {/* Amount */}
                <p className={`text-sm font-bold shrink-0 ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{currency(t.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
