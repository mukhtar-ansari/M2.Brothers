import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Offer } from '../../lib/types';

const offerTypes = ['discount', 'flash_sale', 'limited_time', 'bogo', 'free_shipping', 'festival'];

export default function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const emptyForm = { title: '', description: '', type: 'discount', discount_percent: '0', image_url: '', start_date: '', end_date: '', is_active: true, sort_order: '0' };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const { data } = await supabase.from('offers').select('*').order('sort_order');
    setOffers((data as Offer[]) || []);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (o: Offer) => {
    setEditing(o);
    setForm({ title: o.title, description: o.description, type: o.type, discount_percent: String(o.discount_percent), image_url: o.image_url, start_date: o.start_date?.slice(0, 16) || '', end_date: o.end_date?.slice(0, 16) || '', is_active: o.is_active, sort_order: String(o.sort_order) });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, discount_percent: Number(form.discount_percent), sort_order: Number(form.sort_order), start_date: form.start_date ? new Date(form.start_date).toISOString() : new Date().toISOString(), end_date: form.end_date ? new Date(form.end_date).toISOString() : null };
    if (editing) {
      await supabase.from('offers').update(data).eq('id', editing.id);
    } else {
      await supabase.from('offers').insert(data);
    }
    setShowForm(false);
    load();
  };

  const del = async (o: Offer) => {
    if (!confirm(`Delete "${o.title}"?`)) return;
    await supabase.from('offers').delete().eq('id', o.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Offers ({offers.length})</h1>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition active:scale-95">
          <Plus size={18} /> Add Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((o) => (
          <div key={o.id} className="bg-white dark:bg-ink-800/50 rounded-2xl p-5 border border-gray-100 dark:border-ink-700">
            <div className="flex items-start justify-between mb-2">
              <span className="px-2 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-xs font-bold rounded-full uppercase">{o.type.replace('_', ' ')}</span>
              <div className="flex gap-1">
                <button onClick={() => startEdit(o)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"><Edit2 size={16} /></button>
                <button onClick={() => del(o)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="font-semibold text-ink-900 dark:text-white">{o.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{o.description}</p>
            {o.discount_percent > 0 && <p className="text-2xl font-bold text-gold-500 mt-2">{o.discount_percent}% OFF</p>}
            {o.end_date && <p className="text-xs text-gray-400 mt-2">Ends: {new Date(o.end_date).toLocaleDateString('en-IN')}</p>}
            <span className={`inline-block mt-2 text-xs font-medium ${o.is_active ? 'text-green-600' : 'text-gray-400'}`}>{o.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-ink-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{editing ? 'Edit Offer' : 'Add Offer'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <input required type="text" placeholder="Offer Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field resize-none" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                {offerTypes.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
              <input type="number" placeholder="Discount %" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} className="input-field" />
              <input type="text" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-field" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                  <input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                  <input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="input-field" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-gold-500" /> <span className="text-sm text-ink-700 dark:text-gray-300">Active</span></label>
              <button type="submit" className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition active:scale-95">{editing ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
