import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { slugify } from '../../lib/utils';
import type { Category } from '../../lib/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', sort_order: '0' });

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories((data as Category[]) || []);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description, image_url: c.image_url, sort_order: String(c.sort_order) });
    setShowForm(true);
  };

  const startAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', image_url: '', sort_order: '0' });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: form.name, slug: form.slug || slugify(form.name), description: form.description, image_url: form.image_url, sort_order: Number(form.sort_order) };
    if (editing) {
      await supabase.from('categories').update(data).eq('id', editing.id);
    } else {
      await supabase.from('categories').insert(data);
    }
    setShowForm(false);
    load();
  };

  const del = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"? Products in this category will be unassigned.`)) return;
    await supabase.from('categories').delete().eq('id', c.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Categories ({categories.length})</h1>
        <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition active:scale-95">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white dark:bg-ink-800/50 rounded-2xl p-4 border border-gray-100 dark:border-ink-700 card-hover">
            <div className="flex items-start gap-3">
              {c.image_url ? (
                <img src={c.image_url} alt={c.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-display text-xl">{c.name[0]}</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-ink-900 dark:text-white">{c.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{c.description || 'No description'}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"><Edit2 size={16} /></button>
                <button onClick={() => del(c)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-ink-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <input required type="text" placeholder="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} className="input-field" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field resize-none" />
              <input type="text" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-field" />
              <input type="number" placeholder="Sort Order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input-field" />
              <button type="submit" className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition active:scale-95">{editing ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
