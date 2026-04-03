import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, Filter } from 'lucide-react';

export default function Transactions({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'EXPENSE', category: '', date: '', notes: '' });

  // Filter States
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });

  const fetchTransactions = () => {
    setLoading(true);
    
    // Construct valid params
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    api.get('/transactions', { params })
      .then(res => {
        setTransactions(res.data.content || []);
      })
      .catch(err => {
        console.error("Failed to fetch transactions", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/transactions', form)
      .then(() => {
        setShowModal(false);
        setForm({ amount: '', type: 'EXPENSE', category: '', date: '', notes: '' });
        fetchTransactions();
      })
      .catch(err => alert("Failed to add transaction. Admins only? " + err.message));
  };

  const handleDelete = (id) => {
    if(!window.confirm("Are you sure?")) return;
    api.delete(`/transactions/${id}`)
       .then(() => fetchTransactions())
       .catch(err => alert("Failed to delete. Only Admins can delete."));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transactions</h2>
        {(user.role === 'ADMIN') && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
          >
            <Plus size={18} /> Add Transaction
          </button>
        )}
      </div>

      <div className="card glass-panel p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
          <select 
            className="border rounded-lg p-2 bg-transparent text-sm w-36"
            value={filters.type} 
            onChange={e => setFilters({...filters, type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
          <input 
            type="text" 
            placeholder="e.g. Salary"
            className="border rounded-lg p-2 bg-transparent text-sm w-40"
            value={filters.category} 
            onChange={e => setFilters({...filters, category: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
          <input 
            type="date" 
            className="border rounded-lg p-2 bg-transparent text-sm"
            value={filters.startDate} 
            onChange={e => setFilters({...filters, startDate: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
          <input 
            type="date" 
            className="border rounded-lg p-2 bg-transparent text-sm"
            value={filters.endDate} 
            onChange={e => setFilters({...filters, endDate: e.target.value})}
          />
        </div>

        <button onClick={() => setFilters({ type: '', category: '', startDate: '', endDate: '' })} className="text-sm text-gray-500 hover:text-gray-800 p-2">
          Clear Filters
        </button>
      </div>

      <div className="card glass-panel overflow-hidden">
        {loading ? (
           <div className="p-8 text-center animate-pulse">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--secondary)]/50">
                <tr>
                  <th className="py-3 px-4 font-medium uppercase text-xs tracking-wider">Date</th>
                  <th className="py-3 px-4 font-medium uppercase text-xs tracking-wider">Type</th>
                  <th className="py-3 px-4 font-medium uppercase text-xs tracking-wider">Category</th>
                  <th className="py-3 px-4 font-medium uppercase text-xs tracking-wider text-right">Amount</th>
                  <th className="py-3 px-4 font-medium uppercase text-xs tracking-wider">Created By</th>
                  {user.role === 'ADMIN' && <th className="py-3 px-4 font-medium uppercase text-xs tracking-wider text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="border-b border-[var(--secondary)] last:border-0 hover:bg-[var(--secondary)]/20 transition-colors">
                    <td className="py-4 px-4">{t.date}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium">{t.category}</td>
                    <td className={`py-4 px-4 text-right font-bold ${t.type === 'INCOME' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      ${t.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm opacity-80">{t.createdByName}</td>
                    {user.role === 'ADMIN' && (
                      <td className="py-4 px-4 text-right">
                        <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {transactions.length === 0 && (
                   <tr><td colSpan="6" className="py-8 text-center text-gray-500">No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-[var(--card)] p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold mb-6">New Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input required type="number" step="0.01" className="w-full border rounded-lg p-2 bg-transparent border-gray-300 dark:border-gray-700" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full border rounded-lg p-2 bg-transparent border-gray-300 dark:border-gray-700" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input required type="text" className="w-full border rounded-lg p-2 bg-transparent border-gray-300 dark:border-gray-700" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input required type="date" className="w-full border rounded-lg p-2 bg-transparent border-gray-300 dark:border-gray-700" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input type="text" className="w-full border rounded-lg p-2 bg-transparent border-gray-300 dark:border-gray-700" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
