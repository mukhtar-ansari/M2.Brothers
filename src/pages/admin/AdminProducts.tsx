import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { slugify, formatPrice } from '../../lib/utils';
import type { Product, Category } from '../../lib/types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  const emptyForm = {
    name: '', slug: '', description: '', fabric: '', washing_instructions: '',
    category_id: '', price: '', original_price: '', discount_percent: '0',
    stock: '', is_new: false, is_bestseller: false, is_trending: false, is_active: true,
  };
  const [form, setForm] = useState(emptyForm);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<{ color: string; hex: string }[]>([]);

  const load = async () => {
    setLoading(true);
    const select = '*, category:categories(name), images:product_images(image_url), sizes:product_sizes(size), colors:product_colors(color, hex_code)';
    const { data } = await supabase.from('products').select(select).order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    const { data: catData } = await supabase.from('categories').select('*').order('name');
    setCategories((catData as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description, fabric: p.fabric,
      washing_instructions: p.washing_instructions, category_id: p.category_id || '',
      price: String(p.price), original_price: String(p.original_price),
      discount_percent: String(p.discount_percent), stock: String(p.stock),
      is_new: p.is_new, is_bestseller: p.is_bestseller, is_trending: p.is_trending, is_active: p.is_active,
    });
    setImageUrls(p.images?.map((i) => i.image_url) || ['']);
    setSizes(p.sizes?.map((s) => s.size) || []);
    setColors(p.colors?.map((c) => ({ color: c.color, hex: c.hex_code })) || []);
    setShowForm(true);
  };

  const startAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageUrls(['']);
    setSizes([]);
    setColors([]);
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      fabric: form.fabric,
      washing_instructions: form.washing_instructions,
      category_id: form.category_id || null,
      price: Number(form.price),
      original_price: Number(form.original_price) || Number(form.price),
      discount_percent: Number(form.discount_percent),
      stock: Number(form.stock),
      is_new: form.is_new,
      is_bestseller: form.is_bestseller,
      is_trending: form.is_trending,
      is_active: form.is_active,
    };

    if (editing) {
      const { data: updated } = await supabase.from('products').update(data).eq('id', editing.id).select('*').single();
      await supabase.from('product_images').delete().eq('product_id', editing.id);
      await supabase.from('product_sizes').delete().eq('product_id', editing.id);
      await supabase.from('product_colors').delete().eq('product_id', editing.id);
      if (updated) await insertRelations(updated.id);
    } else {
      const { data: created } = await supabase.from('products').insert(data).select('*').single();
      if (created) await insertRelations(created.id);
    }
    setShowForm(false);
    load();
  };

  const insertRelations = async (productId: string) => {
    const imgs = imageUrls.filter((u) => u.trim()).map((url, i) => ({ product_id: productId, image_url: url, sort_order: i }));
    if (imgs.length) await supabase.from('product_images').insert(imgs);
    const sz = sizes.filter((s) => s.trim()).map((s) => ({ product_id: productId, size: s }));
    if (sz.length) await supabase.from('product_sizes').insert(sz);
    const cls = colors.filter((c) => c.color.trim()).map((c) => ({ product_id: productId, color: c.color, hex_code: c.hex }));
    if (cls.length) await supabase.from('product_colors').insert(cls);
  };

  const del = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await supabase.from('products').delete().eq('id', p.id);
    load();
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Products ({products.length})</h1>
        <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition active:scale-95">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-10 max-w-md" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
      ) : (
        <div className="bg-white dark:bg-ink-800/50 rounded-2xl border border-gray-100 dark:border-ink-700 overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-ink-800">
              <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-ink-700">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-ink-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]?.image_url || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=100'} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="text-sm font-medium text-ink-900 dark:text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{p.category?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-ink-900 dark:text-white">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3"><span className={`text-sm font-medium ${p.stock < 10 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>{p.stock}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.is_new && <span className="px-1.5 py-0.5 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-[10px] font-bold rounded">NEW</span>}
                      {p.is_bestseller && <span className="px-1.5 py-0.5 bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-gray-300 text-[10px] font-bold rounded">BEST</span>}
                      {p.is_trending && <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-bold rounded">TREND</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"><Edit2 size={16} /></button>
                      <button onClick={() => del(p)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-ink-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-ink-900 dark:hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input required type="text" placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} className="input-field" />
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Fabric Material" value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} className="input-field" />
                <input type="text" placeholder="Washing Instructions" value={form.washing_instructions} onChange={(e) => setForm({ ...form, washing_instructions: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input required type="number" step="0.01" placeholder="Selling Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                <input type="number" step="0.01" placeholder="Original Price" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="input-field" />
                <input type="number" placeholder="Discount %" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} className="input-field" />
              </div>
              <input required type="number" placeholder="Stock Quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />

              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">Image URLs</label>
                {imageUrls.map((url, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" placeholder={`Image URL ${i + 1}`} value={url} onChange={(e) => { const v = [...imageUrls]; v[i] = e.target.value; setImageUrls(v); }} className="input-field" />
                    {imageUrls.length > 1 && <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))} className="p-2 text-red-500"><X size={18} /></button>}
                  </div>
                ))}
                <button type="button" onClick={() => setImageUrls([...imageUrls, ''])} className="text-sm text-gold-500 hover:underline">+ Add Image</button>
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">Sizes (comma separated)</label>
                <input type="text" placeholder="S, M, L, XL, XXL" value={sizes.join(', ')} onChange={(e) => setSizes(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} className="input-field" />
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">Colors</label>
                {colors.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" placeholder="Color name" value={c.color} onChange={(e) => { const v = [...colors]; v[i] = { ...c, color: e.target.value }; setColors(v); }} className="input-field" />
                    <input type="text" placeholder="Hex (#000000)" value={c.hex} onChange={(e) => { const v = [...colors]; v[i] = { ...c, hex: e.target.value }; setColors(v); }} className="input-field" />
                    <button type="button" onClick={() => setColors(colors.filter((_, idx) => idx !== i))} className="p-2 text-red-500"><X size={18} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setColors([...colors, { color: '', hex: '' }])} className="text-sm text-gold-500 hover:underline">+ Add Color</button>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} className="w-4 h-4 accent-gold-500" /> <span className="text-sm text-ink-700 dark:text-gray-300">New Arrival</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} className="w-4 h-4 accent-gold-500" /> <span className="text-sm text-ink-700 dark:text-gray-300">Best Seller</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_trending} onChange={(e) => setForm({ ...form, is_trending: e.target.checked })} className="w-4 h-4 accent-gold-500" /> <span className="text-sm text-ink-700 dark:text-gray-300">Trending</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-gold-500" /> <span className="text-sm text-ink-700 dark:text-gray-300">Active</span></label>
              </div>

              <button type="submit" className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition active:scale-95">{editing ? 'Update Product' : 'Create Product'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
