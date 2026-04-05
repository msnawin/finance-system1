import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Search, X } from 'lucide-react';
import { cn } from '../utils/ui';

interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  date: string;
  notes?: string;
  createdById?: number;
  createdByName?: string;
  targetUserId?: number; 
}

export const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [systemUsers, setSystemUsers] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({ notes: '', amount: '', category: '', type: 'EXPENSE', date: '', targetUserId: '' });

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchTransactions();
    if (isAdmin) {
      api.get('/users').then(res => setSystemUsers(res.data)).catch(() => {});
    }
  }, [isAdmin]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions');
      setTransactions(response.data.content || response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch transactions', error);
      toast.error(error.response?.data?.error || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        toast.success('Transaction deleted');
        fetchTransactions();
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };

  const handleOpenAdd = () => {
    setEditTx(null);
    setFormData({ notes: '', amount: '', category: '', type: 'EXPENSE', date: new Date().toISOString().split('T')[0], targetUserId: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Transaction) => {
    setEditTx(t);
    setFormData({ 
      notes: t.notes || '', 
      amount: String(Math.abs(t.amount)), 
      category: t.category, 
      type: t.type, 
      date: t.date,
      targetUserId: t.targetUserId ? String(t.targetUserId) : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        notes: formData.notes,
        amount: Math.abs(Number(formData.amount)),  // Always positive — backend uses 'type' for direction
        category: formData.category,
        type: formData.type,
        date: formData.date
      };
      if (isAdmin && formData.targetUserId) {
        payload.targetUserId = Number(formData.targetUserId);
      }

      if (editTx) {
        await api.put(`/transactions/${editTx.id}`, payload);
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', payload);
        toast.success('Transaction created');
      }
      setIsModalOpen(false);
      fetchTransactions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save transaction');
    }
  };

  const filtered = transactions.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (t.createdByName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-textMain tracking-tight">Transactions</h2>
          <p className="text-textMuted text-sm mt-1">Manage and view your financial records.</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-primary/20">
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-cardContent">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input 
              type="text" 
              placeholder="Search descriptions, categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-textMain placeholder-textMuted"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-textMuted">Loading transactions...</div>
          ) : (
            <table className="w-full text-left text-sm text-textMain">
              <thead className="bg-background/50 border-b border-border text-textMuted">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  {isAdmin && <th className="px-6 py-4 font-medium">Owner</th>}
                  <th className="px-6 py-4 text-right font-medium">Amount</th>
                  {isAdmin && <th className="px-6 py-4 text-right font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-background/40 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-textMuted">{t.date}</td>
                    <td className="px-6 py-4 font-medium">{t.notes || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background border border-border text-textMain">
                        {t.category}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-textMuted">
                        {t.createdByName || 'Self'}
                      </td>
                    )}
                    <td className={cn(
                      "px-6 py-4 text-right font-bold whitespace-nowrap",
                      t.type === 'INCOME' ? 'text-success' : 'text-textMain'
                    )}>
                      {t.type === 'INCOME' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(t)} className="p-2 text-textMuted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="p-2 text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-textMuted">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-textMuted hover:text-textMain">
              <X className="w-5 h-5"/>
            </button>
            <h2 className="text-xl font-bold text-textMain mb-6">{editTx ? 'Edit Transaction' : 'Record Transaction'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, type: 'INCOME'})}
                  className={cn("py-2 text-sm font-medium rounded-lg border", formData.type==='INCOME' ? 'bg-success/10 text-success border-success/30' : 'bg-background text-textMuted border-border')}
                >
                  Income
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                  className={cn("py-2 text-sm font-medium rounded-lg border", formData.type==='EXPENSE' ? 'bg-danger/10 text-danger border-danger/30' : 'bg-background text-textMuted border-border')}
                >
                  Expense
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted">$</span>
                  <input required min="0" step="0.01" type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-textMain focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Category</label>
                <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Software, Salary" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Description (Optional)</label>
                <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:outline-none focus:border-primary" />
              </div>
              <div>
               <label className="block text-sm font-medium text-textMain mb-1">Date</label>
               <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:outline-none focus:border-primary [color-scheme:dark]" />
              </div>

              {isAdmin && (
                <div>
                 <label className="block text-sm font-medium text-textMain mb-1">Assign to User (Optional)</label>
                 <select value={formData.targetUserId} onChange={e => setFormData({...formData, targetUserId: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:outline-none focus:border-primary">
                   <option value="">Default (Self)</option>
                   {systemUsers.map(u => (
                     <option key={u.id} value={u.id}>{u.name}</option>
                   ))}
                 </select>
                </div>
              )}

              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-textMuted hover:bg-background transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primaryHover transition-colors font-medium shadow-sm">{editTx ? 'Save Changes' : 'Save Transaction'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
