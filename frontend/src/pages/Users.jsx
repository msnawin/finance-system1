import { useState, useEffect } from 'react';
import api from '../api';
import { Shield, UserPlus, CheckCircle, XCircle } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VIEWER' });

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
    api.post('/users', form)
       .then(() => {
         setShowModal(false);
         setForm({ name: '', email: '', password: '', role: 'VIEWER' });
         fetchUsers();
       })
       .catch(err => alert("Failed to add user. " + err.message));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="text-[var(--primary)]" />  Access Management</h2>
           <p className="text-sm opacity-70">Admin-only area for managing system users</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
        >
          <UserPlus size={18} /> New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
           <div key={u.id} className={`card glass-panel relative overflow-hidden ${u.status === 'INACTIVE' ? 'opacity-60 saturate-50' : ''}`}>
             <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-transparent opacity-10 rounded-bl-full" />
             <div className="flex items-start justify-between mb-4">
                <div>
                   <h3 className="font-bold text-lg">{u.name}</h3>
                   <p className="text-sm opacity-70">{u.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'ANALYST' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                  {u.role}
                </span>
             </div>
             
             <div className="flex items-center justify-between pt-4 border-t border-[var(--secondary)]">
                <span className={`flex items-center gap-1 text-sm font-semibold ${u.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>
                   {u.status === 'ACTIVE' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                   {u.status}
                </span>
                <button 
                  onClick={() => toggleStatus(u.id, u.status)}
                  className="text-sm px-3 py-1 rounded hover:bg-[var(--secondary)] transition-colors font-medium text-[var(--primary)]"
                >
                  {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
             </div>
           </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-[var(--card)] p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold mb-6">Create System User</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input required type="text" className="w-full border rounded-lg p-2 bg-transparent border-gray-300" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input required type="email" className="w-full border rounded-lg p-2 bg-transparent border-gray-300" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input required type="password" placeholder="At least 6 characters" className="w-full border rounded-lg p-2 bg-transparent border-gray-300" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">System Role</label>
                <select className="w-full border rounded-lg p-2 bg-transparent border-gray-300" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="VIEWER">Viewer (Dashboard Only)</option>
                  <option value="ANALYST">Analyst (View Data)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
