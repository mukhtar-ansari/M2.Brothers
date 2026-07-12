import { useEffect, useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDateTime } from '../../lib/utils';
import type { Order, OrderItem } from '../../lib/types';

const statusOptions = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [viewItems, setViewItems] = useState<OrderItem[]>([]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders(orders.map((o) => o.id === orderId ? { ...o, status: status as Order['status'] } : o));
    if (viewOrder?.id === orderId) setViewOrder({ ...viewOrder, status: status as Order['status'] });
  };

  const viewDetails = async (order: Order) => {
    setViewOrder(order);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setViewItems((data as OrderItem[]) || []);
  };

  const exportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Mobile', 'Email', 'City', 'Total', 'Payment', 'Status', 'Date'];
    const rows = filtered.map((o) => [o.order_number, o.customer_name, o.mobile, o.email, o.city, o.total, o.payment_method, o.status, formatDateTime(o.created_at)]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.order_number.toLowerCase().includes(search.toLowerCase()) || o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.mobile.includes(search);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    packed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    out_for_delivery: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Orders ({filtered.length})</h1>
        <button onClick={exportCSV} className="px-4 py-2.5 bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-semibold rounded-lg transition hover:bg-gold-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-white text-sm">Export CSV</button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID, name, mobile..." className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field max-w-[200px]">
          <option value="">All Status</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
      ) : (
        <div className="bg-white dark:bg-ink-800/50 rounded-2xl border border-gray-100 dark:border-ink-700 overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-ink-800">
              <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-ink-700">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-ink-800/30">
                  <td className="px-4 py-3 text-sm font-medium text-ink-900 dark:text-white">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-ink-900 dark:text-white">{o.customer_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{o.mobile}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-ink-900 dark:text-white">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 uppercase">{o.payment_method}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer capitalize ${statusColors[o.status]}`}>
                      {statusOptions.map((s) => <option key={s} value={s} className="bg-white dark:bg-ink-900 text-ink-900 dark:text-white capitalize">{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDateTime(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => viewDetails(o)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewOrder(null)} />
          <div className="relative bg-white dark:bg-ink-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">Order Details</h2>
              <button onClick={() => setViewOrder(null)} className="p-2 text-gray-400"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Order ID:</span><span className="font-semibold text-ink-900 dark:text-white">{viewOrder.order_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date:</span><span className="text-ink-900 dark:text-white">{formatDateTime(viewOrder.created_at)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="text-ink-900 dark:text-white">{viewOrder.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Mobile:</span><span className="text-ink-900 dark:text-white">{viewOrder.mobile}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="text-ink-900 dark:text-white">{viewOrder.email || '-'}</span></div>
              <div className="border-t border-gray-100 dark:border-ink-700 pt-3">
                <p className="text-gray-500 mb-1">Address:</p>
                <p className="text-ink-900 dark:text-white">{viewOrder.house_number} {viewOrder.street}, {viewOrder.landmark && `${viewOrder.landmark}, `}{viewOrder.city}, {viewOrder.state} - {viewOrder.pin_code}</p>
              </div>
              <div className="border-t border-gray-100 dark:border-ink-700 pt-3">
                <p className="text-gray-500 mb-2">Items:</p>
                {viewItems.map((item) => (
                  <div key={item.id} className="flex gap-2 mb-2">
                    <img src={item.image_url} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium text-ink-900 dark:text-white">{item.product_name}</p>
                      <p className="text-xs text-gray-500">{item.size} • {item.color} • Qty {item.quantity} • {formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-ink-700 pt-3 space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal:</span><span className="text-ink-900 dark:text-white">{formatPrice(viewOrder.subtotal)}</span></div>
                {viewOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span><span>-{formatPrice(viewOrder.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Shipping:</span><span className="text-ink-900 dark:text-white">{viewOrder.shipping === 0 ? 'FREE' : formatPrice(viewOrder.shipping)}</span></div>
                <div className="flex justify-between font-bold text-base pt-1"><span className="text-ink-900 dark:text-white">Total:</span><span className="text-gold-500">{formatPrice(viewOrder.total)}</span></div>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-ink-700">
                <span className="text-gray-500">Payment:</span>
                <span className="text-ink-900 dark:text-white uppercase">{viewOrder.payment_method}</span>
              </div>
              <button onClick={() => window.print()} className="w-full py-3 bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-semibold rounded-xl mt-4 transition hover:bg-gold-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-white">Print Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
