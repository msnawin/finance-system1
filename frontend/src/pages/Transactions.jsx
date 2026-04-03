import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, Calendar, ChevronRight } from 'lucide-react';
import api from '../api';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n ?? 0);

/* ─── Premium Modal ───────────────────────── */
function StandardModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
          className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#222] rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
            <h3 className="text-[15px] font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Transactions({ user }) {
  const [txs, setTxs]         = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData]     = useState({ amount: '', type: 'EXPENSE', category: '', description: '', userId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const fetchData = useCallback(() => {
    setLoading(true);
    const reqs = [api.get('/transactions')];
    if (isAdmin) reqs.push(api.get('/users'));

    Promise.all(reqs)
      .then((res) => {
        setTxs(res[0].data.content || res[0].data);
        if (isAdmin && res[1]) setUsers(res[1].data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load data.');
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        date: new Date().toISOString().split('T')[0],
        notes: formData.description,
        targetUserId: isAdmin && formData.userId ? Number(formData.userId) : undefined
      };
      await api.post('/transactions', payload);
      setModalOpen(false);
      setFormData({ amount: '', type: 'EXPENSE', category: '', description: '', userId: '' });
      fetchData();
    } catch {
      alert('Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTxs = txs.filter(t => 
    (t.category || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.notes || t.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls = "w-full px-4 py-2.5 rounded-lg bg-[#111] border border-[#222] text-sm text-white outline-none focus:border-[#0A84FF] transition-colors placeholder-slate-600";
  const selectCls = "w-full px-4 py-2.5 rounded-lg bg-[#111] border border-[#222] text-sm text-white outline-none focus:border-[#0A84FF] transition-colors appearance-none";

  if (loading) return (
    <div className="flex h-full min-h-screen items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-white" />
    </div>
  );

  if (error) return <div className="p-8 text-rose-500">{error}</div>;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen flex flex-col">

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-white tracking-tight">Ledger</h1>
          <p className="text-slate-500 text-[13px] mt-1 font-medium">Your chronological transaction history.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text" placeholder="Search activity..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-64 pl-9 pr-4 py-2 rounded-lg bg-[#111] border border-[#222] text-[13px] text-white outline-none focus:border-[#0A84FF] transition-colors placeholder-slate-600"
            />
          </div>
          {isAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A84FF] text-white text-[13px] font-semibold hover:bg-[#0070E0] transition-colors"
            >
              <Plus size={14} /> New Record
            </button>
          )}
        </div>
      </motion.div>

      {/* DATA GRID */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="flex-1 glass-panel p-0 overflow-hidden flex flex-col">
        {filteredTxs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20">
            <p className="text-[13px] font-medium">No transactions found.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#222] bg-[#0a0a0a]">
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  {isAdmin && <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">User</th>}
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                <AnimatePresence>
                  {filteredTxs.map((t, index) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                      className="hover:bg-[#111] transition-colors group cursor-default"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium">
                          <Calendar size={14} className="opacity-50" /> {t.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-semibold text-white truncate max-w-[200px]">{t.category}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">{t.notes || t.description || 'No description'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          t.type === 'INCOME' ? 'text-[#30D158] border-[#30D158]/30 bg-[#30D158]/10' : 'text-[#FF453A] border-[#FF453A]/30 bg-[#FF453A]/10'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-[13px] text-slate-300">
                          {t.createdByName}
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <p className={`text-[14px] font-semibold ${t.type === 'INCOME' ? 'text-[#30D158]' : 'text-white'}`}>
                          {t.type === 'INCOME' ? '+' : '-'}{currency(t.amount)}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* CREATE MODAL */}
      <StandardModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="New Transaction">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-2">
            <button type="button" onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all border ${
                formData.type === 'EXPENSE' ? 'bg-[#FF453A] text-white border-[#FF453A]' : 'bg-[#111] text-slate-400 border-[#222] hover:bg-[#222]'
              }`}>
              Expense
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, type: 'INCOME' })}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all border ${
                formData.type === 'INCOME' ? 'bg-[#30D158] text-white border-[#30D158]' : 'bg-[#111] text-slate-400 border-[#222] hover:bg-[#222]'
              }`}>
              Income
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                <input
                  type="number" step="0.01" required min="0.01" placeholder="0.00"
                  value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className={`${inputCls} pl-8`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Category</label>
              <input
                type="text" required placeholder="e.g. Server Hosting"
                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Description (Optional)</label>
              <input
                type="text" placeholder="Extra details..."
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                className={inputCls}
              />
            </div>

            {isAdmin && (
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Assign User</label>
                <div className="relative">
                  <select
                    required value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })}
                    className={selectCls}
                  >
                    <option value="" disabled className="bg-[#111] text-slate-500">Select a user</option>
                    {users.map(u => <option key={u.id} value={u.id} className="bg-[#111]">{u.name} ({u.email})</option>)}
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-500 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit" disabled={submitting}
              className="w-full py-3 rounded-lg bg-[#0A84FF] hover:bg-[#0070E0] text-white text-[13px] font-bold transition-all disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </StandardModal>
    </div>
  );
}
