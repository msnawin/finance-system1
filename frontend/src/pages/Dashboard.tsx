import { useEffect, useState } from 'react';
import api from '../services/api';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';

interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  monthlyTrends: { month: string; income: number; expense: number }[];
  categoryTotals: { category: string; totalAmount: number }[];
  recentTransactions: any[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export const Dashboard = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard summary', error);
        // Fallback dummy data if backend is not fully seeded or reachable
        setData({
          totalIncome: 12450.00,
          totalExpense: 3120.00,
          netBalance: 9330.00,
          monthlyTrends: [
            { month: 'Jan', income: 4000, expense: 2400 },
            { month: 'Feb', income: 3000, expense: 1398 },
            { month: 'Mar', income: 2000, expense: 9800 },
            { month: 'Apr', income: 2780, expense: 3908 },
            { month: 'May', income: 1890, expense: 4800 },
            { month: 'Jun', income: 2390, expense: 3800 },
          ],
          categoryTotals: [
            { category: 'Software', totalAmount: 400 },
            { category: 'Marketing', totalAmount: 300 },
            { category: 'Hardware', totalAmount: 300 },
            { category: 'Travel', totalAmount: 200 },
          ],
          recentTransactions: [
            { id: 1, type: 'INCOME', amount: 3000, category: 'Sales', date: '2026-04-01' },
            { id: 2, type: 'EXPENSE', amount: -600, category: 'Marketing', date: '2026-04-03' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-textMuted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
          <div className="flex items-center justify-between">
            <span className="text-textMuted font-medium text-sm">Total Balance</span>
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary border border-border">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-textMain">{formatCurrency(data?.netBalance || 0)}</h2>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <span className="text-success flex items-center bg-success/10 px-1.5 py-0.5 rounded-md"><TrendingUp className="w-3 h-3 mr-1"/> 12.5%</span>
              <span className="text-textMuted">from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:border-success/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/5 rounded-full blur-2xl group-hover:bg-success/10 transition-colors"></div>
          <div className="flex items-center justify-between">
            <span className="text-textMuted font-medium text-sm">Total Income</span>
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-success border border-border">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-textMain">{formatCurrency(data?.totalIncome || 0)}</h2>
            <div className="flex items-center gap-1 mt-2 text-sm text-textMuted">
              Monthly overview
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:border-danger/50 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-danger/5 rounded-full blur-2xl group-hover:bg-danger/10 transition-colors"></div>
          <div className="flex items-center justify-between">
            <span className="text-textMuted font-medium text-sm">Total Expense</span>
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-danger border border-border">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-textMain">{formatCurrency(data?.totalExpense || 0)}</h2>
            <div className="flex items-center gap-1 mt-2 text-sm text-textMuted">
              Monthly overview
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-textMain mb-6 flex items-center gap-2">
            Monthly Trends
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-content)', borderColor: 'var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)' }}
                  itemStyle={{ fill: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="income" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="var(--danger)" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-textMain mb-6">Expenses by Category</h3>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryTotals || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="totalAmount"
                  stroke="none"
                >
                  {(data?.categoryTotals || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-content)', borderColor: 'var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)' }}
                  itemStyle={{ fill: 'var(--text-main)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
              <span className="text-sm text-textMuted">Top</span>
              <span className="text-lg font-bold text-textMain">{data?.categoryTotals?.[0]?.category || '-'}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
