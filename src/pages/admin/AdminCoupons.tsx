import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Coupon } from '../../lib/types';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const emptyForm = { code: '', description: '', discount_percent: '0', discount_amount: '0', is_active: true, valid_until: '' };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons((data as Coupon[]) || []);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, discount_percent: Number(form.discount_percent), discount_amount: Number(form.discount_amount), valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null };
    if (editing) {
      await supabase.from('coupons').update(data).eq('id', editing.id);
    } else {
      await supabase.from('coupons').insert(data);
    }
    setShowForm(false);
    load();
  };

  const del = async (c: Coupon) => {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    await supabase.from('coupons').delete().eq('id', c.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Coupons ({coupons.length})</h1>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition active:scale-95">
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className="bg-white dark:bg-ink-800/50 rounded-2xl p-5 border border-gray-100 dark:border-ink-700">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-mono font-bold text-lg text-gold-500">{c.code}</span>
                {c.discount_percent > 0 && <p className="text-2xl font-bold text-ink-900 dark:text-white mt-1">{c.discount_percent}% OFF</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(c); setForm({ code: c.code, description: c.description, discount_percent: String(c.discount_percent), discount_amount: String(c.discount_amount), is_active: c.is_active, valid_until: c.valid_until?.slice(0, 16) || '' }); setShowForm(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"><Edit2 size={16} /></button>
                <button onClick={() => del(c)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"><Trash2 size={16} /></button>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{c.description || 'No description'}</p>
            {c.valid_until && <p className="text-xs text-gray-400 mt-2">Valid until: {new Date(c.valid_until).toLocaleDateString('en-IN')}</p>}
            <span className={`inline-block mt-2 text-xs font-medium ${c.is_active ? 'text-green-600' : 'text-gray-400'}`}>{c.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-ink-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{editing ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <input required type="text" placeholder="Coupon Code (e.g. M2B10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field font-mono" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field resize-none" />
              <input type="number" placeholder="Discount %" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} className="input-field" />
              <input type="datetime-local" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className="input-field" />
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-gold-500" /> <span className="text-sm text-ink-700 dark:text-gray-300">Active</span></label>
              <button type="submit" className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition active:scale-95">{editing ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
