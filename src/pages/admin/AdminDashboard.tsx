import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingCart, Users, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDateTime } from '../../lib/utils';
import type { Order, Product } from '../../lib/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [ordersRes, productsRes, customersRes, profilesRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*'),
        supabase.from('orders').select('total, created_at').eq('status', 'delivered'),
        supabase.from('profiles').select('id, role').eq('role', 'customer'),
      ]);

      const allOrders = (ordersRes.data as Order[]) || [];
      const allProducts = (productsRes.data as Product[]) || [];
      const deliveredOrders = (customersRes.data as { total: number }[]) || [];
      const customers = profilesRes.data || [];

      setStats({
        totalSales: deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        totalOrders: allOrders.length,
        totalProducts: allProducts.length,
        totalCustomers: customers.length,
      });
      setRecentOrders(allOrders.slice(0, 5));
      setLowStock(allProducts.filter((p) => p.stock < 10).slice(0, 5));
      setLoading(false);
    })();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalSales), icon: DollarSign, color: 'green' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'blue' },
    { label: 'Products', value: stats.totalProducts.toString(), icon: Package, color: 'gold' },
    { label: 'Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'purple' },
  ];

  const colorMap: Record<string, string> = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    gold: 'bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

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
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-6">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white dark:bg-ink-800/50 rounded-2xl p-5 border border-gray-100 dark:border-ink-700 card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[card.color]}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-ink-900 dark:text-white">{card.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-ink-900 dark:text-white">Recent Orders</h3>
                <Link to="/admin/orders" className="text-sm text-gold-500 hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No orders yet</p>
                ) : (
                  recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-ink-700 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-ink-900 dark:text-white">{o.order_number}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{o.customer_name} • {formatDateTime(o.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColors[o.status]}`}>{o.status.replace('_', ' ')}</span>
                        <span className="text-sm font-bold text-ink-900 dark:text-white">{formatPrice(o.total)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-ink-900 dark:text-white flex items-center gap-2"><Clock size={18} className="text-red-500" /> Low Stock Alert</h3>
                <Link to="/admin/products" className="text-sm text-gold-500 hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                {lowStock.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">All products well stocked</p>
                ) : (
                  lowStock.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-ink-700 last:border-0">
                      <p className="text-sm font-medium text-ink-900 dark:text-white">{p.name}</p>
                      <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>{p.stock} left</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
