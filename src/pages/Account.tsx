import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, Trash2 } from 'lucide-react';
import { useAuthStore } from '../lib/auth-store';
import { supabase } from '../lib/supabase';
import type { Order, Address } from '../lib/types';
import { formatPrice, formatDateTime } from '../lib/utils';

export default function Account() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const tab = searchParams.get('tab') || 'profile';

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      setOrders((orderData as Order[]) || []);

      const { data: addrData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      setAddresses((addrData as Address[]) || []);
    })();
  }, [profile]);

  if (!profile) {
    navigate('/login');
    return null;
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-4 border border-gray-100 dark:border-ink-700">
            <div className="text-center pb-4 border-b border-gray-100 dark:border-ink-700 mb-3">
              <div className="w-16 h-16 rounded-full bg-gold-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-2">
                {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
              </div>
              <p className="font-semibold text-ink-900 dark:text-white">{profile.full_name || 'Customer'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{profile.email}</p>
            </div>
            <div className="space-y-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSearchParams({ tab: t.id })}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      tab === t.id ? 'bg-gold-500 text-white' : 'text-ink-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-ink-700'
                    }`}
                  >
                    <Icon size={18} /> {t.label}
                  </button>
                );
              })}
              <button onClick={() => signOut()} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {tab === 'profile' && (
            <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700">
              <h3 className="font-display text-xl font-bold text-ink-900 dark:text-white mb-4">Profile Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                  <p className="text-ink-900 dark:text-white">{profile.full_name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-ink-900 dark:text-white">{profile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-ink-900 dark:text-white">{profile.phone || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-12 text-center border border-gray-100 dark:border-ink-700">
                  <Package size={48} className="mx-auto text-gray-300 dark:text-ink-600 mb-3" />
                  <p className="text-ink-800 dark:text-gray-200">No orders yet</p>
                  <Link to="/shop" className="text-gold-500 hover:underline text-sm mt-2 inline-block">Start Shopping</Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white dark:bg-ink-800/50 rounded-2xl p-5 border border-gray-100 dark:border-ink-700">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-ink-900 dark:text-white">{order.order_number}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(order.created_at)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status]}`}>{order.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.payment_method.toUpperCase()} • {order.customer_name}</p>
                      <p className="font-bold text-ink-900 dark:text-white">{formatPrice(order.total)}</p>
                    </div>
                    <Link to={`/track-order?id=${order.order_number}`} className="text-sm text-gold-500 hover:underline mt-2 inline-block">Track Order →</Link>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'addresses' && (
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-12 text-center border border-gray-100 dark:border-ink-700">
                  <MapPin size={48} className="mx-auto text-gray-300 dark:text-ink-600 mb-3" />
                  <p className="text-ink-800 dark:text-gray-200">No saved addresses</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="bg-white dark:bg-ink-800/50 rounded-2xl p-5 border border-gray-100 dark:border-ink-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-ink-900 dark:text-white">{addr.full_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {addr.house_number} {addr.street}<br />
                          {addr.landmark && <>{addr.landmark}<br /></>}
                          {addr.city}, {addr.state} - {addr.pin_code}<br />
                          {addr.phone}
                        </p>
                      </div>
                      <button onClick={async () => { await supabase.from('addresses').delete().eq('id', addr.id); setAddresses(addresses.filter((a) => a.id !== addr.id)); }} className="text-red-500 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'wishlist' && (
            <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 text-center border border-gray-100 dark:border-ink-700">
              <Heart size={48} className="mx-auto text-gray-300 dark:text-ink-600 mb-3" />
              <p className="text-ink-800 dark:text-gray-200">View your saved items</p>
              <Link to="/wishlist" className="text-gold-500 hover:underline text-sm mt-2 inline-block">Go to Wishlist →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
