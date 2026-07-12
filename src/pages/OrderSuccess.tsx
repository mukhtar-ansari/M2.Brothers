import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../lib/types';
import { formatPrice, formatDateTime, getDeliveryEstimate } from '../lib/utils';

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    (async () => {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .maybeSingle();
      if (orderData) {
        setOrder(orderData as Order);
        const { data: itemData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderData.id);
        setItems((itemData as OrderItem[]) || []);
      }
      setLoading(false);
    })();
  }, [orderNumber]);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20"><div className="h-96 skeleton rounded-2xl" /></div>;
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-ink-800 dark:text-white">Order not found</p>
        <Link to="/shop" className="text-gold-500 hover:underline mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8 animate-scale-in">
        <div className="relative inline-block">
          <CheckCircle size={80} className="text-green-500 mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 animate-ping" />
          </div>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink-900 dark:text-white mt-4 mb-2">Thank You for Shopping with M2 Brother's!</h1>
        <p className="text-gray-500 dark:text-gray-400">Your order has been successfully placed</p>
      </div>

      <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700 mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-ink-700">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
            <p className="font-bold text-ink-900 dark:text-white">{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
            <p className="font-medium text-ink-900 dark:text-white">{formatDateTime(order.created_at)}</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
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

        <div className="space-y-1 text-sm border-t border-gray-100 dark:border-ink-700 pt-4">
          <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Shipping</span><span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span></div>
          <div className="flex justify-between font-bold text-ink-900 dark:text-white pt-2 border-t border-gray-100 dark:border-ink-700 mt-2"><span>Total</span><span className="text-gold-500 text-lg">{formatPrice(order.total)}</span></div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Payment: {order.payment_method.toUpperCase()}</p>
        </div>
      </div>

      <div className="bg-gold-50 dark:bg-gold-900/20 rounded-2xl p-6 mb-6 flex items-center gap-4">
        <Truck className="text-gold-500 shrink-0" size={32} />
        <div>
          <p className="font-semibold text-ink-900 dark:text-white">Estimated Delivery</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{getDeliveryEstimate()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700 mb-6">
        <h3 className="font-semibold text-ink-900 dark:text-white mb-3 flex items-center gap-2"><MapPin size={18} /> Delivery Address</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {order.customer_name}<br />
          {order.house_number} {order.street}<br />
          {order.landmark && <>{order.landmark}<br /></>}
          {order.city}, {order.state} - {order.pin_code}<br />
          Mobile: {order.mobile}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/track-order" className="flex-1 py-3.5 bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-semibold rounded-xl text-center transition hover:bg-gold-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-white flex items-center justify-center gap-2">
          <Package size={20} /> Track Order
        </Link>
        <Link to="/shop" className="flex-1 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl text-center transition flex items-center justify-center gap-2">
          <ShoppingBag size={20} /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
