import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2 } from 'lucide-react';

const fmt = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const EMPTY_FORM = { amount: '', type: 'EXPENSE', category: '', date: '', notes: '', targetUserId: '' };

export default function Transactions({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers]               = useState([]);   // for admin user-picker
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [filters, setFilters]           = useState({ type: '', category: '', startDate: '', endDate: '' });

  const isAdmin = user?.role === 'ADMIN';

  /* ─── Fetch transactions ─── */
  const fetchTransactions = () => {
    setLoading(true);
    const params = {};
    if (filters.type)      params.type      = filters.type;
    if (filters.category)  params.category  = filters.category;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate)   params.endDate   = filters.endDate;

    api.get('/transactions', { params })
      .then(res  => setTransactions(res.data.content || []))
      .catch(err => console.error('Failed to fetch transactions', err))
      .finally(()  => setLoading(false));
  };

  /* ─── Load users list for admin dropdown ─── */
  const fetchUsers = () => {
    if (!isAdmin) return;
    api.get('/users').then(res => setUsers(res.data || [])).catch(() => {});
  };

  useEffect(() => {
    fetchTransactions();
    fetchUsers();
  }, []);                      // eslint-disable-line

  useEffect(() => {
    fetchTransactions();
  }, [filters]);               // eslint-disable-line

  /* ─── Submit ─── */
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      amount:       parseFloat(form.amount),
      type:         form.type,
      category:     form.category,
      date:         form.date,
      notes:        form.notes,
      // Only admin sends targetUserId; backend ignores it for non-admins
      ...(isAdmin && form.targetUserId ? { targetUserId: Number(form.targetUserId) } : {}),
    };

    api.post('/transactions', payload)
      .then(() => {
        setShowModal(false);
        setForm(EMPTY_FORM);
        fetchTransactions();
      })
      .catch(err => alert('Failed to add transaction: ' + (err.response?.data?.error || err.message)));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    api.delete(`/transactions/${id}`)
      .then(() => fetchTransactions())
      .catch(() => alert('Could not delete transaction.'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-sm opacity-60 mt-1">
            {isAdmin ? 'Showing all user transactions' : 'Showing your personal transactions'}
          </p>
        </div>
        {(isAdmin || user?.role === 'ANALYST') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Transaction
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card glass-panel flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase opacity-60">Type</label>
          <select
            className="border rounded-xl p-2 bg-transparent text-sm w-36"
            value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase opacity-60">Category</label>
          <input
            type="text"
            placeholder="e.g. Salary"
            className="border rounded-xl p-2 bg-transparent text-sm w-40"
            value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase opacity-60">From</label>
          <input
            type="date"
            className="border rounded-xl p-2 bg-transparent text-sm"
            value={filters.startDate}
            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase opacity-60">To</label>
          <input
            type="date"
            className="border rounded-xl p-2 bg-transparent text-sm"
            value={filters.endDate}
            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>

        <button
          onClick={() => setFilters({ type: '', category: '', startDate: '', endDate: '' })}
          className="text-sm opacity-60 hover:opacity-100 px-3 py-2 rounded-xl hover:bg-[var(--secondary)] transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="card glass-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center animate-pulse opacity-50">Loading transactions…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--secondary)]/40 text-xs uppercase tracking-wider opacity-70">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Belongs To</th>
                  <th className="py-3 px-4">Notes</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center opacity-40">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.map(t => (
                    <tr
                      key={t.id}
                      className="border-b border-[var(--secondary)] last:border-0 hover:bg-[var(--secondary)]/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm">{t.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{t.category}</td>
                      <td className={`py-3 px-4 text-right font-bold ${t.type === 'INCOME' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm opacity-70">{t.createdByName || '—'}</td>
                      <td className="py-3 px-4 text-sm opacity-60 max-w-xs truncate">{t.notes || '—'}</td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Add Transaction Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--card)] p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-6">
              {isAdmin ? 'Add Transaction (Assign to User)' : 'Add My Transaction'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Admin: pick the user this transaction belongs to */}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Assign to User <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    className="w-full border rounded-xl p-2.5 bg-transparent border-gray-300 dark:border-gray-600"
                    value={form.targetUserId}
                    onChange={e => setForm({ ...form, targetUserId: e.target.value })}
                  >
                    <option value="">— Select a user —</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — {u.role}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1">Amount</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full border rounded-xl p-2.5 bg-transparent border-gray-300 dark:border-gray-600"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Type</label>
                <select
                  className="w-full border rounded-xl p-2.5 bg-transparent border-gray-300 dark:border-gray-600"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Salary, Rent, Food…"
                  className="w-full border rounded-xl p-2.5 bg-transparent border-gray-300 dark:border-gray-600"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Date</label>
                <input
                  required
                  type="date"
                  className="w-full border rounded-xl p-2.5 bg-transparent border-gray-300 dark:border-gray-600"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Notes (optional)</label>
                <input
                  type="text"
                  className="w-full border rounded-xl p-2.5 bg-transparent border-gray-300 dark:border-gray-600"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                  className="flex-1 px-4 py-2.5 border rounded-xl hover:bg-[var(--secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl hover:bg-blue-600 transition-colors shadow-md"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
