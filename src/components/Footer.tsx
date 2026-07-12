import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category } from '../lib/types';

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await supabase.from('newsletter_subscribers').insert({ email });
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="bg-ink-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-4">M2 <span className="text-gold-500">Brother's</span></h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Premium fashion for the modern man. Quality clothing that defines your style.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-ink-800 hover:bg-gold-500 flex items-center justify-center transition-colors"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-ink-800 hover:bg-gold-500 flex items-center justify-center transition-colors"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-ink-800 hover:bg-gold-500 flex items-center justify-center transition-colors"><Twitter size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">All Products</Link></li>
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}><Link to={`/shop?category=${cat.slug}`} className="text-sm text-gray-400 hover:text-gold-400 transition-colors">{cat.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">FAQ</Link></li>
              <li><Link to="/help#returns" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Return Policy</Link></li>
              <li><Link to="/help#exchange" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Exchange Policy</Link></li>
              <li><Link to="/help#shipping" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/help#privacy" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/help#terms" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/track-order" className="text-sm text-gray-400 hover:text-gold-400 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start gap-2 text-sm text-gray-400"><Mail size={16} className="mt-0.5 shrink-0" /> mukhtaransari797064@gmail.com</li>
              <li className="flex items-start gap-2 text-sm text-gray-400"><Phone size={16} className="mt-0.5 shrink-0" /> 7970643462</li>
              <li className="flex items-start gap-2 text-sm text-gray-400"><MapPin size={16} className="mt-0.5 shrink-0" /> India</li>
            </ul>
            <form onSubmit={subscribe} className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Subscribe for offers & new collections</p>
              {subscribed ? (
                <p className="text-sm text-gold-400 font-medium animate-fade-in">Subscribed! Thank you.</p>
              ) : (
                <div className="flex gap-2">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="flex-1 px-3 py-2 text-sm rounded-lg bg-ink-800 border border-ink-700 text-white focus:ring-1 focus:ring-gold-400 outline-none" />
                  <button type="submit" className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-lg transition-colors">Subscribe</button>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ink-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} M2 Brother's. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>COD Available</span>
            <span>•</span>
            <span>UPI / Cards / Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
