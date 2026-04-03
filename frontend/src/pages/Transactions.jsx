import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { Plus, Trash2, X } from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);

const EMPTY = { amount: '', type: 'EXPENSE', category: '', date: '', notes: '', targetUserId: '' };

const inputCls = `w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm outline-none transition-all`;
const inputSty = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' };

export default function Transactions({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [form,         setForm]         = useState(EMPTY);
  const [filters,      setFilters]      = useState({ type:'', category:'', startDate:'', endDate:'' });

  const isAdmin   = user?.role === 'ADMIN';
  const canCreate = isAdmin || user?.role === 'ANALYST';

  const load = () => {
    setLoading(true);
    const p = {};
    if (filters.type)      p.type      = filters.type;
    if (filters.category)  p.category  = filters.category;
    if (filters.startDate) p.startDate = filters.startDate;
    if (filters.endDate)   p.endDate   = filters.endDate;
    api.get('/transactions', { params: p })
      .then(r  => setTransactions(r.data.content || []))
      .catch(()  => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (isAdmin) api.get('/users').then(r => setUsers(r.data || [])).catch(() => {});
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [filters]); // eslint-disable-line

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(form.amount), type: form.type,
      category: form.category, date: form.date, notes: form.notes,
      ...(isAdmin && form.targetUserId ? { targetUserId: Number(form.targetUserId) } : {}),
    };
    api.post('/transactions', payload)
      .then(() => { setShowModal(false); setForm(EMPTY); load(); })
      .catch(err => alert('Error: ' + (err.response?.data?.error || err.message)));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    api.delete(`/transactions/${id}`).then(load).catch(() => alert('Could not delete.'));
  };

  const labelCls = 'block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5 ml-0.5';

  return (
    <div className="p-6 lg:p-8 space-y-6 min-h-full">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin ? 'All system transactions' : 'Your personal transactions'}
          </p>
        </div>
        {canCreate && (
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59,130,246,0.5)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 4px 20px rgba(59,130,246,0.25)' }}
          >
            <Plus size={16} /> Add Transaction
          </motion.button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
        className="glass p-4 flex flex-wrap gap-4 items-end">
        {[
          { label:'Type', type:'select', key:'type', opts:[['','All Types'],['INCOME','Income'],['EXPENSE','Expense']] },
        ].map(f => (
          <div key={f.key} className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{f.label}</label>
            <select className="px-3 py-2 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-white outline-none"
              value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
              {f.opts.map(([v,l]) => <option key={v} value={v} className="bg-[#161b22]">{l}</option>)}
            </select>
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Category</label>
          <input placeholder="e.g. Salary" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}
            className="px-3 py-2 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 outline-none w-36" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">From</label>
          <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})}
            className="px-3 py-2 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-white outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">To</label>
          <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})}
            className="px-3 py-2 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-white outline-none" />
        </div>
        <button onClick={() => setFilters({type:'',category:'',startDate:'',endDate:''})}
          className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors">
          Clear
        </button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="glass overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-600 text-sm">Loading…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-widest text-slate-600">
                <th className="py-4 px-5 text-left font-semibold">Date</th>
                <th className="py-4 px-5 text-left font-semibold">Type</th>
                <th className="py-4 px-5 text-left font-semibold">Category</th>
                <th className="py-4 px-5 text-right font-semibold">Amount</th>
                <th className="py-4 px-5 text-left font-semibold">Belongs To</th>
                <th className="py-4 px-5 text-left font-semibold">Notes</th>
                {isAdmin && <th className="py-4 px-5 text-right font-semibold">Actions</th>}
              </tr>
            </thead>
            <AnimatePresence>
              <tbody>
                {transactions.length === 0 ? (
                  <motion.tr key="empty">
                    <td colSpan="7" className="py-16 text-center text-slate-600 text-sm">No transactions found.</td>
                  </motion.tr>
                ) : (
                  transactions.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity:0, y:10 }}
                      animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0, x:-20 }}
                      transition={{ delay: i * 0.03, type:'spring', stiffness:200, damping:22 }}
                      whileHover={{ backgroundColor:'rgba(255,255,255,0.03)', y:-1 }}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className="py-4 px-5 text-sm text-slate-400">{t.date}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${t.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm font-medium text-white">{t.category}</td>
                      <td className={`py-4 px-5 text-right font-bold text-sm ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-500">{t.createdByName || '—'}</td>
                      <td className="py-4 px-5 text-sm text-slate-600 max-w-[180px] truncate">{t.notes || '—'}</td>
                      {isAdmin && (
                        <td className="py-4 px-5 text-right">
                          <motion.button whileHover={{ scale:1.15 }} whileTap={{ scale:0.9 }}
                            onClick={() => handleDelete(t.id)}
                            className="p-2 rounded-lg text-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={15} />
                          </motion.button>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </AnimatePresence>
          </table>
        )}
      </motion.div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              key="modal-card"
              initial={{ opacity:0, scale:0.92, y:30 }}
              animate={{ opacity:1, scale:1,    y:0  }}
              exit={{ opacity:0, scale:0.92, y:20 }}
              transition={{ type:'spring', stiffness:280, damping:24 }}
              className="w-full max-w-md rounded-2xl p-8"
              style={{ background:'rgba(22,27,34,0.95)', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 32px 80px rgba(0,0,0,0.6)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {isAdmin ? 'Add Transaction' : 'My New Transaction'}
                </h3>
                <button onClick={() => { setShowModal(false); setForm(EMPTY); }}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isAdmin && (
                  <div>
                    <label className={labelCls}>Assign to User <span className="text-red-400">*</span></label>
                    <select required value={form.targetUserId} onChange={e => setForm({...form, targetUserId: e.target.value})}
                      className={inputCls} style={inputSty}>
                      <option value="" className="bg-[#161b22]">— Select a user —</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id} className="bg-[#161b22]">
                          {u.name} — {u.role}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Amount</label>
                    <input required type="number" step="0.01" min="0.01" placeholder="0.00"
                      value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                      className={inputCls} style={inputSty} />
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                      className={inputCls} style={inputSty}>
                      <option value="EXPENSE" className="bg-[#161b22]">Expense</option>
                      <option value="INCOME"  className="bg-[#161b22]">Income</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Category</label>
                  <input required type="text" placeholder="e.g. Salary, Rent, Food…"
                    value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className={inputCls} style={inputSty} />
                </div>

                <div>
                  <label className={labelCls}>Date</label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                    className={inputCls} style={inputSty} />
                </div>

                <div>
                  <label className={labelCls}>Notes (optional)</label>
                  <input type="text" placeholder="Brief description…"
                    value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                    className={inputCls} style={inputSty} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY); }}
                    className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white border border-white/[0.08] hover:bg-white/[0.05] transition-colors">
                    Cancel
                  </button>
                  <motion.button type="submit"
                    whileHover={{ scale:1.03, boxShadow:'0 0 24px rgba(59,130,246,0.4)' }}
                    whileTap={{ scale:0.97 }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background:'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
                    Save Transaction
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
