import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, UserPlus, X, CheckCircle, XCircle } from 'lucide-react';
import api from '../api';

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
          className="relative w-full max-w-md bg-[#0a0a0a] border border-[#222] rounded-xl shadow-2xl overflow-hidden"
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

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VIEWER' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = (id, currentStatus) => {
    if(!window.confirm(`Are you sure you want to ${currentStatus === 'ACTIVE' ? 'deactivate' : 'activate'} this user?`)) return;
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    api.patch(`/users/${id}/status?status=${newStatus}`)
      .then(() => fetchUsers());
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setSubmitting(true);
    api.post('/users', form)
       .then(() => {
         setShowModal(false);
         setForm({ name: '', email: '', password: '', role: 'VIEWER' });
         fetchUsers();
       })
       .catch(err => alert("Failed to add user. " + err.message))
       .finally(() => setSubmitting(false));
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg bg-[#111] border border-[#222] text-sm text-white outline-none focus:border-[#0A84FF] transition-colors placeholder-slate-600";
  const selectCls = "w-full px-4 py-2.5 rounded-lg bg-[#111] border border-[#222] text-sm text-white outline-none focus:border-[#0A84FF] transition-colors appearance-none";

  if (loading) return (
    <div className="flex h-full min-h-screen items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-white" />
    </div>
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
           <h1 className="text-[26px] font-bold text-white tracking-tight flex items-center gap-3">
             <Shield size={24} className="text-[#0A84FF]" /> Access Management
           </h1>
           <p className="text-slate-500 text-[13px] mt-1 font-medium">Admin-only area for managing system users.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A84FF] text-white text-[13px] font-semibold hover:bg-[#0070E0] transition-colors"
        >
          <UserPlus size={14} /> New User
        </button>
      </motion.div>

      {/* USER GRIDS */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
           <div key={u.id} className={`glass-panel p-6 flex flex-col justify-between ${u.status === 'INACTIVE' ? 'opacity-50' : ''}`}>
             <div>
               <div className="flex items-start justify-between mb-4">
                  <div>
                     <h3 className="font-semibold text-[16px] text-white tracking-tight">{u.name}</h3>
                     <p className="text-[13px] text-slate-500">{u.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-opacity-30 ${u.role === 'ADMIN' ? 'bg-[#BF5AF2]/10 text-[#BF5AF2] border-[#BF5AF2]' : u.role === 'ANALYST' ? 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    {u.role}
                  </span>
               </div>
             </div>
             
             <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#222]">
                <span className={`flex items-center gap-1.5 text-[12px] font-semibold tracking-wide ${u.status === 'ACTIVE' ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                   {u.status === 'ACTIVE' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                   {u.status}
                </span>
                <button 
                  onClick={() => toggleStatus(u.id, u.status)}
                  className="text-[12px] px-3 py-1.5 rounded bg-[#111] border border-[#222] hover:bg-[#222] transition-colors font-semibold text-white"
                >
                  {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
             </div>
           </div>
        ))}
      </motion.div>

      {/* CREATE MODAL */}
      <StandardModal isOpen={showModal} onClose={() => setShowModal(false)} title="Create System User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Full Name</label>
            <input required type="text" className={inputCls} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Email Address</label>
            <input required type="email" className={inputCls} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane@finance.com" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Password</label>
            <input required type="password" placeholder="At least 6 characters" className={inputCls} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">System Role</label>
            <select className={selectCls} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="VIEWER" className="bg-[#111]">Viewer (Dashboard Only)</option>
              <option value="ADMIN" className="bg-[#111]">Admin (Full Access)</option>
            </select>
          </div>
          
          <div className="pt-2">
            <button type="submit" disabled={submitting} className="w-full py-3 rounded-lg bg-[#0A84FF] text-white text-[13px] font-bold hover:bg-[#0070E0] transition-colors disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </StandardModal>
    </div>
  );
}
