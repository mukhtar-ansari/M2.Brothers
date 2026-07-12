import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, Tag, X } from 'lucide-react';
import { useCartStore } from '../lib/cart-store';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal, couponCode, couponDiscount, setCoupon, clearCoupon } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const shipping = subtotal() >= 999 || subtotal() === 0 ? 0 : 49;
  const discount = (subtotal() * couponDiscount) / 100;
  const total = subtotal() - discount + shipping;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setCoupon(data.code, data.discount_percent);
      setCouponError('');
    } else {
      setCouponError('Invalid or expired coupon code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-ink-600 mb-4" />
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't added anything yet</p>
        <Link to="/shop" className="inline-block px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-full transition">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-4 bg-white dark:bg-ink-800/50 rounded-2xl p-4 border border-gray-100 dark:border-ink-700">
              <Link to={`/product/${item.slug}`} className="w-24 h-32 rounded-xl overflow-hidden shrink-0 bg-gray-50 dark:bg-ink-800">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.slug}`} className="font-medium text-ink-900 dark:text-white hover:text-gold-500 transition line-clamp-1">{item.name}</Link>
                <div className="flex gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span>Color: {item.color}</span>}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-ink-900 dark:text-white">{formatPrice(item.price)}</span>
                  {item.original_price > item.price && <span className="text-sm text-gray-400 line-through">{formatPrice(item.original_price)}</span>}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border-2 border-gray-200 dark:border-ink-700 rounded-lg">
                    <button onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-ink-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-ink-800 rounded-l-lg">
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-medium text-ink-900 dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-ink-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-ink-800 rounded-r-lg">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.product_id, item.size, item.color)} className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 transition">
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700 sticky top-24">
            <h3 className="font-display text-xl font-bold text-ink-900 dark:text-white mb-4">Order Summary</h3>

            <div className="mb-4">
              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-lg">
                  <span className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2"><Tag size={14} /> {couponCode} ({couponDiscount}% off)</span>
                  <button onClick={() => { clearCoupon(); setCouponInput(''); }} className="text-red-500"><X size={16} /></button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon code"
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-white outline-none focus:ring-1 focus:ring-gold-400"
                    />
                    <button onClick={applyCoupon} className="px-4 py-2 bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-semibold rounded-lg transition hover:bg-gold-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-white">Apply</button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm border-t border-gray-100 dark:border-ink-700 pt-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span className="font-medium text-ink-900 dark:text-white">{formatPrice(subtotal())}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({couponDiscount}%)</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Shipping</span><span className="font-medium text-ink-900 dark:text-white">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              {shipping === 0 && subtotal() > 0 && <p className="text-xs text-green-600">Free shipping applied!</p>}
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 dark:border-ink-700 pt-4 mt-4">
              <span className="font-bold text-ink-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-gold-500">{formatPrice(total)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-6 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-all active:scale-95"
            >
              Proceed to Checkout
            </button>
            <Link to="/shop" className="block text-center mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 transition">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
