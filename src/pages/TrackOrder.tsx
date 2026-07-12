import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle, Truck, Clock, XCircle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../lib/types';
import { formatPrice, formatDateTime } from '../lib/utils';
import Breadcrumbs from '../components/Breadcrumbs';

const statusSteps = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const trackOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber.trim())
      .maybeSingle();

    if (orderData) {
      setOrder(orderData as Order);
      const { data: itemData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderData.id);
      setItems((itemData as OrderItem[]) || []);
    } else {
      setOrder(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searchParams.get('id')) trackOrder();
  }, []);

  const currentStep = order ? statusSteps.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  const statusIcons = [Clock, CheckCircle, Package, Truck, Truck, MapPin];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Track Order' }]} />

      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white mb-3">Track Your Order</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Enter your Order ID to see real-time status</p>

      <form onSubmit={trackOrder} className="flex gap-2 mb-8">
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Enter Order ID (e.g. M2B-20260101-1234)"
          className="input-field"
        />
        <button type="submit" disabled={loading} className="px-6 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition active:scale-95 disabled:opacity-60 flex items-center gap-2">
          <Search size={18} /> Track
        </button>
      </form>

      {loading && <div className="h-64 skeleton rounded-2xl" />}

      {searched && !loading && !order && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-gray-300 dark:text-ink-600 mb-3" />
          <p className="text-ink-800 dark:text-gray-200 font-medium">Order not found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please check your Order ID and try again</p>
        </div>
      )}

      {order && !loading && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
                <p className="font-bold text-ink-900 dark:text-white">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                <p className="font-medium text-ink-900 dark:text-white">{formatDateTime(order.created_at)}</p>
              </div>
            </div>

            {isCancelled ? (
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 p-4 rounded-xl">
                <XCircle className="text-red-500" size={24} />
                <p className="text-red-700 dark:text-red-400 font-medium">This order has been cancelled</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {statusSteps.map((step, i) => {
                  const Icon = statusIcons[i];
                  const isDone = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center relative">
                      {i < statusSteps.length - 1 && (
                        <div className={`absolute top-5 left-1/2 w-full h-0.5 ${i < currentStep ? 'bg-gold-500' : 'bg-gray-200 dark:bg-ink-700'}`} />
                      )}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isDone ? 'bg-gold-500 text-white' : 'bg-gray-100 dark:bg-ink-800 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-gold-200 dark:ring-gold-900/40' : ''}`}>
                        <Icon size={18} />
                      </div>
                      <span className={`text-[10px] mt-2 text-center capitalize ${isDone ? 'text-ink-900 dark:text-white font-medium' : 'text-gray-400'}`}>
                        {step.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700">
            <h3 className="font-semibold text-ink-900 dark:text-white mb-4">Order Items</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 dark:bg-ink-800 shrink-0">
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-900 dark:text-white">{item.product_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.size} • {item.color} • Qty {item.quantity}</p>
                    <p className="text-sm font-semibold text-ink-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 dark:border-ink-700 pt-4 mt-4">
              <span className="font-bold text-ink-900 dark:text-white">Total</span>
              <span className="text-xl font-bold text-gold-500">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700">
            <h3 className="font-semibold text-ink-900 dark:text-white mb-3 flex items-center gap-2"><MapPin size={18} /> Delivery Address</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {order.customer_name}<br />
              {order.house_number} {order.street}<br />
              {order.landmark && <>{order.landmark}<br /></>}
              {order.city}, {order.state} - {order.pin_code}<br />
              Mobile: {order.mobile}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
