import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
const SAPPHIRE = '#0A84FF';
const EMERALD  = '#30D158';
const RUBY     = '#FF453A';
const PALETTE  = ['#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2', '#FF453A', '#64D2FF'];

/* ─── Premium Card ────────────────────────── */
function PremiumCard({ children, className = '' }) {
  return (
    <div className={`glass-panel p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Custom Tooltip ────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3 shadow-2xl">
      {label && <p className="text-slate-400 text-xs mb-1.5 font-medium">{label}</p>}
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color || '#fff' }} className="text-sm font-semibold">
          {p.name}: {shortMoney(p.value)}
        </p>
      ))}
    </div>
  );
};

/* ─── Stat Card ─────────────────────────── */
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'tween', ease: 'easeOut', duration: 0.4 } } };

function StatCard({ label, value, sub, icon: Icon, iconBg, valCol }) {
  return (
    <motion.div variants={fadeUp}>
      <PremiumCard>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
            <p className={`text-[28px] font-semibold tracking-tight ${valCol} leading-tight`}>{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-2 font-medium">{sub}</p>}
          </div>
          <div className="p-3 rounded-full shrink-0 border border-[#222]" style={{ backgroundColor: '#111' }}>
            <Icon size={20} style={{ color: iconBg }} />
          </div>
        </div>
      </PremiumCard>
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

  if (loading) return (
    <div className="flex h-full min-h-screen items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-white" />
    </div>
  );

  if (error) return (
    <div className="flex h-full min-h-screen items-center justify-center text-slate-400 text-sm">{error}</div>
  );

  const income  = Number(data?.totalIncome  ?? 0);
  const expense = Number(data?.totalExpense ?? 0);
  const balance = Number(data?.netBalance   ?? 0);
  const isAdmin = user?.role === 'ADMIN';

  const pieData = [
    { name: 'Income',  value: income  },
    { name: 'Expense', value: expense },
  ].filter(d => d.value > 0);

  const catData = (data?.categoryTotals ?? [])
    .filter(c => Number(c.totalAmount) > 0)
    .map(c => ({ name: c.category, value: Number(c.totalAmount) }));

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
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-[26px] font-bold text-white tracking-tight">{isAdmin ? 'Platform Overview' : 'Dashboard'}</h1>
          <p className="text-slate-500 text-[13px] mt-1 font-medium">
            {isAdmin ? 'Aggregated system analytics.' : `Welcome back, ${user?.name}. Here is your financial summary.`}
          </p>
        </div>
        <button onClick={fetchData} className="p-2.5 rounded-full bg-[#111] hover:bg-[#222] border border-[#222] text-slate-400 hover:text-white transition-all">
          <RefreshCw size={16} />
        </button>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label={isAdmin ? 'Platform Balance' : 'Net Balance'}
          value={currency(balance)}
          icon={Wallet}
          iconBg={balance >= 0 ? EMERALD : RUBY}
          valCol={balance >= 0 ? 'text-white' : 'text-white'}
        />
        <StatCard
          label="Total Income"
          value={currency(income)}
          icon={TrendingUp}
          iconBg={SAPPHIRE}
          valCol="text-white"
        />
        <StatCard
          label="Total Expenses"
          value={currency(expense)}
          icon={TrendingDown}
          iconBg={RUBY}
          valCol="text-white"
        />
      </motion.div>

      {/* ── CHARTS: PIE + BAR ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* PIE */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="glass-panel p-6">
          <h3 className="text-white font-semibold text-[15px] mb-1">Cash Flow</h3>
          <p className="text-slate-500 text-[13px] mb-6 font-medium">Ratio of total income to total expenses.</p>
          {hasPie ? (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={pieData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={75} outerRadius={100}
                    paddingAngle={2} stroke="none"
                    isAnimationActive={true} animationDuration={1000} animationEasing="ease-out"
                  >
                    <Cell fill={SAPPHIRE} />
                    <Cell fill={RUBY} />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#888', fontSize: 13, fontWeight: 500 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 260 }} className="flex items-center justify-center text-slate-600 text-[13px]">No data available.</div>
          )}
        </motion.div>

        {/* BAR */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="glass-panel p-6">
          <h3 className="text-white font-semibold text-[15px] mb-1">Monthly Trends</h3>
          <p className="text-slate-500 text-[13px] mb-6 font-medium">Performance over the last 6 periods.</p>
          {hasBar ? (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="#222" strokeDasharray="4 4" />
                  <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tickFormatter={shortMoney} tick={{ fill: '#888', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={45} dx={-10} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#888', fontSize: 13, fontWeight: 500 }}>{v}</span>} />
                  <Bar dataKey="Income"  fill={SAPPHIRE} radius={[4,4,0,0]} maxBarSize={32} />
                  <Bar dataKey="Expense" fill={RUBY} radius={[4,4,0,0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 260 }} className="flex items-center justify-center text-slate-600 text-[13px]">No data available.</div>
          )}
        </motion.div>
      </div>

      {/* ── CATEGORIES ── */}
      {hasCat && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="glass-panel p-6">
          <h3 className="text-white font-semibold text-[15px] mb-1">Expense by Category</h3>
          <p className="text-slate-500 text-[13px] mb-6 font-medium">Historical breakdown of your spending areas.</p>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={90} paddingAngle={2} stroke="none"
                  isAnimationActive animationDuration={1000}
                >
                  {catData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#888', fontSize: 13, fontWeight: 500 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ── RECENT ACTIVITY ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }} className="glass-panel p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-[#222] flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-[15px] mb-1">Recent Activity</h3>
            <p className="text-slate-500 text-[13px] font-medium">Latest processed transactions</p>
          </div>
        </div>
        {!hasRecent ? (
          <p className="text-center text-slate-500 text-[13px] py-12">No recent transactions to display.</p>
        ) : (
          <div className="divide-y divide-[#222]">
            {data.recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#111] transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  t.type === 'INCOME' ? 'bg-[#30D158]/10 text-[#30D158]' : 'bg-[#FF453A]/10 text-[#FF453A]'}`}>
                  {t.type === 'INCOME' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-white tracking-tight">{t.category}</p>
                  <p className="text-[13px] text-slate-500 font-medium">{t.createdByName} <span className="opacity-50 mx-1">•</span> {t.date}</p>
                </div>
                <p className={`text-[15px] font-semibold tracking-tight shrink-0 ${t.type === 'INCOME' ? 'text-white' : 'text-white'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{currency(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
