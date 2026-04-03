import { useState, useEffect } from 'react';
import api from '../api';
import { Wallet, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const PIE_COLORS = ['#10b981', '#ef4444']; // green = income, red = expense
const BAR_COLORS = { income: '#10b981', expense: '#ef4444' };
const CAT_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#f97316'];

const fmt = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    api.get('/dashboard/summary')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard load failed', err);
        setError('Failed to load dashboard data.');
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500">{error || 'No data available.'}</div>;
  }

  const incomeExpensePieData = [
    { name: 'Income', value: Number(data.totalIncome || 0) },
    { name: 'Expense', value: Number(data.totalExpense || 0) },
  ];

  const hasPieData = incomeExpensePieData.some(d => d.value > 0);
  const hasBarData = data.monthlyTrends?.length > 0;

  const barData = (data.monthlyTrends || [])
    .slice()
    .reverse()
    .map(m => ({
      month: m.month,
      income: Number(m.income || 0),
      expense: Number(m.expense || 0),
    }));

  const catData = (data.categoryTotals || []).map(c => ({
    name: c.category,
    value: Number(c.totalAmount || 0),
  }));

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 font-medium text-sm">
                {isAdmin ? 'Platform Net Balance' : 'My Net Balance'}
              </p>
              <h3 className="text-3xl font-bold mt-1">{fmt(data.netBalance)}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl"><Wallet size={24} /></div>
          </div>
        </div>

        <div className="card glass-panel">
          <div className="flex justify-between items-start">
            <div>
              <p className="opacity-70 font-medium text-sm">{isAdmin ? 'Total Platform Income' : 'My Total Income'}</p>
              <h3 className="text-2xl font-bold mt-1 text-[var(--success)]">{fmt(data.totalIncome)}</h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 text-[var(--success)] p-3 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="card glass-panel">
          <div className="flex justify-between items-start">
            <div>
              <p className="opacity-70 font-medium text-sm">{isAdmin ? 'Total Platform Expenses' : 'My Total Expenses'}</p>
              <h3 className="text-2xl font-bold mt-1 text-[var(--danger)]">{fmt(data.totalExpense)}</h3>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 text-[var(--danger)] p-3 rounded-xl">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart – Monthly Trends */}
        <div className="card glass-panel">
          <h3 className="text-lg font-bold mb-4">Monthly Trends</h3>
          <div style={{ width: '100%', height: 280 }}>
            {hasBarData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--secondary)', borderRadius: '8px' }}
                    formatter={(v) => fmt(v)}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill={BAR_COLORS.income} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill={BAR_COLORS.expense} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center opacity-40 text-sm">
                No monthly data yet
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart – Income vs Expense */}
        <div className="card glass-panel">
          <h3 className="text-lg font-bold mb-4">Income vs Expense</h3>
          <div style={{ width: '100%', height: 280 }}>
            {hasPieData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeExpensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {incomeExpensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--secondary)', borderRadius: '8px' }}
                    formatter={(v, name) => [fmt(v), name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center opacity-40 text-sm">
                No transactions recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expense by Category — only if there is data */}
      {catData.length > 0 && (
        <div className="card glass-panel">
          <h3 className="text-lg font-bold mb-4">Expenses by Category</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {catData.map((_, i) => (
                    <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--secondary)', borderRadius: '8px' }}
                  formatter={(v, name) => [fmt(v), name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card glass-panel">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
          <button
            onClick={fetchData}
            className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors"
            title="Refresh"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--secondary)] text-sm opacity-60">
                <th className="pb-3 px-3 font-medium">Date</th>
                <th className="pb-3 px-3 font-medium">Category</th>
                <th className="pb-3 px-3 font-medium">User</th>
                <th className="pb-3 px-3 font-medium">Notes</th>
                <th className="pb-3 px-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(data.recentTransactions || []).length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center opacity-40">No transactions yet</td>
                </tr>
              ) : (
                data.recentTransactions.map(t => (
                  <tr
                    key={t.id}
                    className="border-b border-[var(--secondary)]/50 hover:bg-[var(--secondary)]/30 transition-colors"
                  >
                    <td className="py-3 px-3 text-sm">{t.date}</td>
                    <td className="py-3 px-3">
                      <span className="bg-[var(--secondary)] px-2 py-0.5 rounded-full text-xs font-semibold">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm opacity-70">{t.createdByName}</td>
                    <td className="py-3 px-3 text-sm opacity-70 max-w-xs truncate">{t.notes || '—'}</td>
                    <td className={`py-3 px-3 text-right font-bold ${t.type === 'INCOME' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
