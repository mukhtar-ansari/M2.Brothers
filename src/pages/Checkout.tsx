import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, Banknote, Check, Shield } from 'lucide-react';
import { useCartStore } from '../lib/cart-store';
import { useAuthStore } from '../lib/auth-store';
import { supabase } from '../lib/supabase';
import { formatPrice, generateOrderNumber, getDeliveryEstimate } from '../lib/utils';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, couponCode, couponDiscount, clearCart } = useCartStore();
  const { profile, session } = useAuthStore();

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    mobile: profile?.phone || '',
    alt_mobile: '',
    email: profile?.email || '',
    house_number: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pin_code: '',
    payment_method: 'cod',
    save_address: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shipping = subtotal() >= 999 || subtotal() === 0 ? 0 : 49;
  const discount = (subtotal() * couponDiscount) / 100;
  const total = subtotal() - discount + shipping;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderNumber = generateOrderNumber();
      const userId = session?.user?.id || null;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: userId,
          customer_name: form.full_name,
          mobile: form.mobile,
          alt_mobile: form.alt_mobile,
          email: form.email,
          house_number: form.house_number,
          street: form.street,
          landmark: form.landmark,
          city: form.city,
          state: form.state,
          pin_code: form.pin_code,
          payment_method: form.payment_method,
          subtotal: subtotal(),
          discount,
          shipping,
          coupon_code: couponCode,
          total,
          status: 'pending',
        })
        .select('*')
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        image_url: item.image_url,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
      }));

      await supabase.from('order_items').insert(orderItems);

      if (form.save_address && userId) {
        await supabase.from('addresses').insert({
          user_id: userId,
          full_name: form.full_name,
          phone: form.mobile,
          house_number: form.house_number,
          street: form.street,
          landmark: form.landmark,
          city: form.city,
          state: form.state,
          pin_code: form.pin_code,
          is_default: false,
        });
      }

      clearCart();
      navigate(`/order-success/${orderNumber}`);
    } catch (err) {
      setError('Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
    { id: 'upi', label: 'UPI', icon: Smartphone },
    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
    { id: 'netbanking', label: 'Net Banking', icon: Wallet },
    { id: 'phonepe', label: 'PhonePe', icon: Smartphone },
    { id: 'gpay', label: 'Google Pay', icon: Smartphone },
    { id: 'paytm', label: 'Paytm', icon: Smartphone },
    { id: 'razorpay', label: 'Razorpay', icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700">
            <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white mb-4">Delivery Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">Full Name *</label>
                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">Mobile Number *</label>
                <input required type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">Alternate Mobile</label>
                <input type="tel" value={form.alt_mobile} onChange={(e) => setForm({ ...form, alt_mobile: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">House Number</label>
                <input value={form.house_number} onChange={(e) => setForm({ ...form, house_number: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">Street Address *</label>
                <input required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">Landmark</label>
                <input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">City *</label>
                <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">State *</label>
                <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 dark:text-gray-300 mb-1 block">PIN Code *</label>
                <input required value={form.pin_code} onChange={(e) => setForm({ ...form, pin_code: e.target.value })} className="input-field" />
              </div>
            </div>
            {session && (
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input type="checkbox" checked={form.save_address} onChange={(e) => setForm({ ...form, save_address: e.target.checked })} className="w-4 h-4 accent-gold-500 rounded" />
                <span className="text-sm text-ink-700 dark:text-gray-300">Save this address for future orders</span>
              </label>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700">
            <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white mb-4">Payment Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMethods.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setForm({ ...form, payment_method: m.id })}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      form.payment_method === m.id
                        ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20'
                        : 'border-gray-200 dark:border-ink-700 hover:border-gold-400'
                    }`}
                  >
                    <Icon size={20} className={form.payment_method === m.id ? 'text-gold-500' : 'text-gray-400'} />
                    <span className={`text-sm font-medium ${form.payment_method === m.id ? 'text-ink-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{m.label}</span>
                    {form.payment_method === m.id && <Check size={18} className="ml-auto text-gold-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700 sticky top-24">
            <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white mb-4">Your Order</h3>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 dark:bg-ink-800 shrink-0">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 dark:text-white line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.size} • {item.color} • Qty {item.quantity}</p>
                    <p className="text-sm font-semibold text-ink-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm border-t border-gray-100 dark:border-ink-700 pt-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>{formatPrice(subtotal())}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({couponCode})</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 dark:border-ink-700 pt-4 mt-4">
              <span className="font-bold text-ink-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-gold-500">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Est. Delivery: {getDeliveryEstimate()}</p>

            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
            <p className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-3"><Shield size={14} /> Secure checkout</p>
          </div>
        </div>
      </form>
    </div>
  );
}
