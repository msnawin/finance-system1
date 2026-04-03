import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Filter } from 'lucide-react';
import api from '../api';

const currency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n ?? 0);

const EMPTY = { amount: '', type: 'EXPENSE', category: '', date: '', notes: '', targetUserId: '' };

const inputCls = 'w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all bg-white/[0.04] border border-white/[0.06] focus:border-blue-500/50 focus:bg-white/[0.06]';
const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } } };

export default function Transactions({ user }) {
  const [rows,      setRows]      = useState([]);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [filters,   setFilters]   = useState({ type: '', category: '', startDate: '', endDate: '' });

  const isAdmin   = user?.role === 'ADMIN';
  const canCreate = isAdmin;

  /* ── Load transactions ── */
  const load = useCallback(() => {
    setLoading(true);
    const p = {};
    if (filters.type)      p.type      = filters.type;
    if (filters.category)  p.category  = filters.category;
    if (filters.startDate) p.startDate = filters.startDate;
    if (filters.endDate)   p.endDate   = filters.endDate;
    api.get('/transactions', { params: p })
      .then(r  => setRows(r.data.content ?? []))
      .catch(()  => {})
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    load();
    if (isAdmin) api.get('/users').then(r => setUsers(r.data ?? [])).catch(() => {});
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  /* ── Submit ── */
  const submit = (e) => {
    e.preventDefault();
    const payload = {
      amount:   parseFloat(form.amount),
      type:     form.type,
      category: form.category,
      date:     form.date,
      notes:    form.notes,
      ...(isAdmin && form.targetUserId ? { targetUserId: Number(form.targetUserId) } : {}),
    };
    api.post('/transactions', payload)
      .then(() => { setShowModal(false); setForm(EMPTY); load(); })
      .catch(err => alert('Error: ' + (err.response?.data?.message ?? err.message)));
  };

  const del = (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    api.delete(`/transactions/${id}`).then(load).catch(() => alert('Delete failed'));
  };

  const clearFilters = () => setFilters({ type: '', category: '', startDate: '', endDate: '' });

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Transactions</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin ? 'All system transactions' : 'Your personal transactions'}
          </p>
        </div>
        {canCreate && (
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(59,130,246,0.45)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 4px 18px rgba(59,130,246,0.25)' }}
          >
            <Plus size={15} /> Add Transaction
          </motion.button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass p-4 flex flex-wrap gap-3 items-end">
        <Filter size={14} className="text-slate-600 self-center mb-1 shrink-0" />

        <div>
          <label className={labelCls}>Type</label>
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            className="px-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/[0.06] text-white outline-none w-32">
            <option value="" className="bg-slate-900">All Types</option>
            <option value="INCOME"  className="bg-slate-900">Income</option>
            <option value="EXPENSE" className="bg-slate-900">Expense</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <input placeholder="e.g. Rent" value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
            className="px-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/[0.06] text-white placeholder-slate-600 outline-none w-32" />
        </div>

        <div>
          <label className={labelCls}>From</label>
          <input type="date" value={filters.startDate}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
            className="px-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/[0.06] text-white outline-none" />
        </div>

        <div>
          <label className={labelCls}>To</label>
          <input type="date" value={filters.endDate}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
            className="px-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/[0.06] text-white outline-none" />
        </div>

        <button onClick={clearFilters}
          className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-white hover:bg-white/[0.04] border border-transparent transition-all">
          Clear
        </button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
              className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {['Date','Type','Category','Amount','Belongs To','Notes', isAdmin && 'Actions']
                    .filter(Boolean).map(h => (
                    <th key={h} className="py-4 px-5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.length === 0 ? (
                    <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={isAdmin ? 7 : 6} className="py-16 text-center text-slate-700 text-sm">
                        No transactions found.
                      </td>
                    </motion.tr>
                  ) : rows.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24, height: 0 }}
                      transition={{ delay: i * 0.025, type: 'spring', stiffness: 240, damping: 22 }}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
                      className="border-b last:border-0"
                      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <td className="py-3.5 px-5 text-sm text-slate-400">{t.date}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                          t.type === 'INCOME'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-sm font-medium text-white">{t.category}</td>
                      <td className={`py-3.5 px-5 text-sm font-bold text-right ${
                        t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{currency(t.amount)}
                      </td>
                      <td className="py-3.5 px-5 text-sm text-slate-500">{t.createdByName ?? '—'}</td>
                      <td className="py-3.5 px-5 text-sm text-slate-600 max-w-[160px] truncate">{t.notes || '—'}</td>
                      {isAdmin && (
                        <td className="py-3.5 px-5">
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                            onClick={() => del(t.id)}
                            className="p-1.5 rounded-lg text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                            <Trash2 size={14} />
                          </motion.button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="w-full max-w-md rounded-2xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
              style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  {isAdmin ? 'Add Transaction' : 'New Transaction'}
                </h3>
                <button onClick={() => { setShowModal(false); setForm(EMPTY); }}
                  className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-500 hover:text-white transition-colors">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={submit} className="space-y-4">
                {isAdmin && (
                  <div>
                    <label className={labelCls}>Assign to User <span className="text-rose-400">*</span></label>
                    <select required value={form.targetUserId}
                      onChange={e => setForm(f => ({ ...f, targetUserId: e.target.value }))}
                      className={inputCls}>
                      <option value="" className="bg-slate-900">— Select a user —</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id} className="bg-slate-900">
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Amount</label>
                    <input required type="number" step="0.01" min="0.01" placeholder="0.00"
                      value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className={inputCls}>
                      <option value="EXPENSE" className="bg-slate-900">Expense</option>
                      <option value="INCOME"  className="bg-slate-900">Income</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Category</label>
                  <input required type="text" placeholder="e.g. Salary, Rent, Food…"
                    value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Date</label>
                  <input required type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Notes (optional)</label>
                  <input type="text" placeholder="Brief description…"
                    value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className={inputCls} />
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY); }}
                    className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-white border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                    Cancel
                  </button>
                  <motion.button type="submit"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(59,130,246,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
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
