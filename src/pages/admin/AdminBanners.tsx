import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Banner } from '../../lib/types';

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const emptyForm = { title: '', subtitle: '', image_url: '', link: '', sort_order: '0', is_active: true };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const { data } = await supabase.from('banners').select('*').order('sort_order');
    setBanners((data as Banner[]) || []);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, sort_order: Number(form.sort_order) };
    if (editing) {
      await supabase.from('banners').update(data).eq('id', editing.id);
    } else {
      await supabase.from('banners').insert(data);
    }
    setShowForm(false);
    load();
  };

  const del = async (b: Banner) => {
    if (!confirm(`Delete banner "${b.title}"?`)) return;
    await supabase.from('banners').delete().eq('id', b.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Banners ({banners.length})</h1>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition active:scale-95">
          <Plus size={18} /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-white dark:bg-ink-800/50 rounded-2xl border border-gray-100 dark:border-ink-700 overflow-hidden">
            <div className="relative h-40">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-display text-lg font-bold">{b.title}</h3>
                <p className="text-gray-200 text-sm">{b.subtitle}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle, image_url: b.image_url, link: b.link, sort_order: String(b.sort_order), is_active: b.is_active }); setShowForm(true); }} className="p-1.5 bg-white/80 text-blue-500 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => del(b)} className="p-1.5 bg-white/80 text-red-500 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">Link: {b.link || '-'}</span>
              <span className={`text-xs font-medium ${b.is_active ? 'text-green-600' : 'text-gray-400'}`}>{b.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-ink-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{editing ? 'Edit Banner' : 'Add Banner'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <input required type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
              <input type="text" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" />
              <input required type="text" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-field" />
              <input type="text" placeholder="Link (e.g. /shop)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input-field" />
              <input type="number" placeholder="Sort Order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input-field" />
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-gold-500" /> <span className="text-sm text-ink-700 dark:text-gray-300">Active</span></label>
              <button type="submit" className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition active:scale-95">{editing ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
