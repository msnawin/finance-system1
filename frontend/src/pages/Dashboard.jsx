import { useState, useEffect } from 'react';
import api from '../api';
import { Wallet, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api.get('/dashboard/summary')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard data load failed", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-pulse flex gap-4 p-4"><div className="h-32 w-full bg-slate-200 rounded-xl"></div></div>;
  }

  if (!data) return <div>Failed to load data.</div>;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 font-medium">Net Balance</p>
              <h3 className="text-3xl font-bold mt-2">${data.netBalance?.toLocaleString()}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl"><Wallet size={24} /></div>
          </div>
        </div>
        
        <div className="card glass-panel">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--secondary-foreground)] opacity-70 font-medium">Total Income</p>
              <h3 className="text-2xl font-bold mt-2 text-[var(--success)]">${data.totalIncome?.toLocaleString()}</h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 text-[var(--success)] p-3 rounded-xl"><TrendingUp size={24} /></div>
          </div>
        </div>
        
        <div className="card glass-panel">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[var(--secondary-foreground)] opacity-70 font-medium">Total Expense</p>
              <h3 className="text-2xl font-bold mt-2 text-[var(--danger)]">${data.totalExpense?.toLocaleString()}</h3>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 text-[var(--danger)] p-3 rounded-xl"><TrendingDown size={24} /></div>
          </div>
        </div>
      </div>

      {/* Charts Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="card glass-panel">
          <h3 className="text-lg font-bold mb-4">Monthly Trends (Income vs Expense)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyTrends?.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="currentColor" opacity={0.5} />
                <YAxis stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--secondary)' }} />
                <Bar dataKey="income" fill="var(--success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass-panel">
          <h3 className="text-lg font-bold mb-4">Total Income vs Expenses</h3>
          <div className="h-72">
            {(data.totalIncome > 0 || data.totalExpense > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Income', value: data.totalIncome },
                      { name: 'Expense', value: data.totalExpense }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label
                  >
                    {/* Income -> Success Green, Expense -> Danger Red */}
                    <Cell fill="var(--success)" />
                    <Cell fill="var(--danger)" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)' }} formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex h-full items-center justify-center opacity-50">No transactions recorded yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card glass-panel">
         <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold">Recent Transactions</h3>
           <button onClick={fetchData} className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors">
              <RefreshCcw size={18} />
           </button>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--secondary)] text-[var(--secondary-foreground)] opacity-70">
                  <th className="pb-3 px-4 font-medium">Date</th>
                  <th className="pb-3 px-4 font-medium">Category</th>
                  <th className="pb-3 px-4 font-medium">Notes</th>
                  <th className="pb-3 px-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions?.map(t => (
                  <tr key={t.id} className="border-b border-[var(--secondary)]/50 hover:bg-[var(--secondary)]/30 transition-colors">
                    <td className="py-4 px-4">{t.date}</td>
                    <td className="py-4 px-4">
                      <span className="bg-[var(--secondary)] px-3 py-1 rounded-full text-xs font-semibold">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 opacity-80 max-w-xs truncate">{t.notes}</td>
                    <td className={`py-4 px-4 text-right font-bold ${t.type === 'INCOME' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
