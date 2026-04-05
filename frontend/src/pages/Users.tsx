import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Trash2, Edit2, ShieldAlert, X } from 'lucide-react';
import { cn } from '../utils/ui';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export const Users = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'VIEWER', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('User deleted');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const openAddModal = () => {
    setEditUser(null);
    setFormData({ name: '', email: '', role: 'VIEWER', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserData) => {
    setEditUser(u);
    setFormData({ name: u.name, email: u.email, role: u.role, password: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, { ...formData });
        toast.success('User updated successfully');
      } else {
        await api.post('/users', formData);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save user');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-4">
        <div className="p-2 bg-primary/20 rounded-lg text-primary mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-textMain">Admin Control Panel</h3>
          <p className="text-sm text-textMuted mt-1">
            You are viewing this page because you have the <strong>ADMIN</strong> role. Manage system access and permissions here.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-textMain tracking-tight">User Management</h2>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-textMain hover:bg-textMain/90 text-card px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-8 text-center text-textMuted">Loading users...</div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-colors group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/80 to-blue-500/80 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                  {u.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(u)} className="p-1.5 text-textMuted hover:text-primary hover:bg-background rounded-md transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="p-1.5 text-textMuted hover:text-danger hover:bg-background rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4 flex-1">
                <h3 className="font-bold text-textMain text-lg truncate">{u.name}</h3>
                <p className="text-sm text-textMuted truncate">{u.email}</p>
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Role</span>
                <span className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-bold",
                  u.role === 'ADMIN' ? 'bg-primary/10 text-primary border border-primary/20' : 
                  u.role === 'ANALYST' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                  'bg-background border border-border text-textMuted'
                )}>
                  {u.role}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-textMuted hover:text-textMain">
              <X className="w-5 h-5"/>
            </button>
            <h2 className="text-xl font-bold text-textMain mb-6">{editUser ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:outline-none focus:border-primary">
                  <option value="ADMIN">ADMIN</option>
                  <option value="ANALYST">ANALYST</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
              {!editUser && (
                 <div>
                   <label className="block text-sm font-medium text-textMain mb-1">Initial Password</label>
                   <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:outline-none focus:border-primary" />
                 </div>
              )}
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-textMuted hover:bg-background transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primaryHover transition-colors font-medium shadow-sm">{editUser ? 'Save Changes' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
