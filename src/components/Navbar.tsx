import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon, Package } from 'lucide-react';
import { useCartStore } from '../lib/cart-store';
import { useWishlistStore } from '../lib/wishlist-store';
import { useThemeStore } from '../lib/theme-store';
import { useAuthStore } from '../lib/auth-store';
import { supabase } from '../lib/supabase';
import type { Category, Product } from '../lib/types';

export default function Navbar() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const totalItems = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const { theme, toggle } = useThemeStore();
  const { profile, signOut } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price, original_price, discount_percent')
        .ilike('name', `%${searchQuery}%`)
        .eq('is_active', true)
        .limit(6);
      setSearchResults((data as Product[]) || []);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 dark:bg-ink-900/95 backdrop-blur-lg shadow-lg' : 'bg-white dark:bg-ink-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 text-ink-800 dark:text-white">
                <Menu size={24} />
              </button>
              <Link to="/" className="flex items-center gap-2">
                <span className="font-display text-2xl md:text-3xl font-bold text-ink-900 dark:text-white">
                  M2 <span className="text-gold-500">Brother's</span>
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-ink-700 dark:text-gray-200 hover:text-gold-500 transition-colors">Home</Link>
              <Link to="/shop" className="text-sm font-medium text-ink-700 dark:text-gray-200 hover:text-gold-500 transition-colors">Shop All</Link>
              {categories.slice(0, 5).map((cat) => (
                <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="text-sm font-medium text-ink-700 dark:text-gray-200 hover:text-gold-500 transition-colors whitespace-nowrap">
                  {cat.name}
                </Link>
              ))}
              <Link to="/contact" className="text-sm font-medium text-ink-700 dark:text-gray-200 hover:text-gold-500 transition-colors">Contact</Link>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-ink-800 dark:text-white hover:text-gold-500 transition-colors">
                <Search size={20} />
              </button>
              <button onClick={toggle} className="p-2 text-ink-800 dark:text-white hover:text-gold-500 transition-colors">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link to="/wishlist" className="relative p-2 text-ink-800 dark:text-white hover:text-gold-500 transition-colors">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative p-2 text-ink-800 dark:text-white hover:text-gold-500 transition-colors">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              {profile ? (
                <div className="relative group">
                  <button className="p-2 text-ink-800 dark:text-white hover:text-gold-500 transition-colors">
                    <User size={20} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-ink-800 rounded-xl shadow-2xl border border-gray-100 dark:border-ink-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-gray-100 dark:border-ink-700">
                      <p className="text-sm font-semibold text-ink-900 dark:text-white">{profile.full_name || 'Customer'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{profile.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/account" className="block px-3 py-2 text-sm text-ink-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-ink-700 rounded-lg transition">My Account</Link>
                      <Link to="/account?tab=orders" className="block px-3 py-2 text-sm text-ink-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-ink-700 rounded-lg transition">My Orders</Link>
                      <Link to="/track-order" className="block px-3 py-2 text-sm text-ink-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-ink-700 rounded-lg transition">Track Order</Link>
                      {profile.role === 'admin' && (
                        <Link to="/admin" className="block px-3 py-2 text-sm text-gold-600 dark:text-gold-400 font-semibold hover:bg-gray-50 dark:hover:bg-ink-700 rounded-lg transition flex items-center gap-2">
                          <Package size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <button onClick={() => signOut()} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition">Sign Out</button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="p-2 text-ink-800 dark:text-white hover:text-gold-500 transition-colors">
                  <User size={20} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-ink-900 shadow-xl border-t border-gray-100 dark:border-ink-700 animate-slide-down">
            <div className="max-w-2xl mx-auto p-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-4 py-3 pr-10 rounded-full border border-gray-200 dark:border-ink-600 bg-gray-50 dark:bg-ink-800 text-ink-900 dark:text-white focus:ring-2 focus:ring-gold-400 outline-none"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-500">
                  <Search size={20} />
                </button>
              </form>
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-1">
                  {searchResults.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-ink-800 rounded-lg transition"
                    >
                      <span className="text-sm font-medium text-ink-800 dark:text-white">{p.name}</span>
                      <span className="text-sm text-gold-600 dark:text-gold-400">₹{p.price}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className={`fixed inset-0 z-[60] lg:hidden ${mobileOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileOpen(false)} />
        <div className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-ink-900 shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-ink-700">
            <span className="font-display text-xl font-bold text-ink-900 dark:text-white">M2 <span className="text-gold-500">Brother's</span></span>
            <button onClick={() => setMobileOpen(false)} className="p-2 text-ink-800 dark:text-white"><X size={24} /></button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-65px)]">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block py-3 text-base font-medium text-ink-800 dark:text-white border-b border-gray-50 dark:border-ink-800">Home</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="block py-3 text-base font-medium text-ink-800 dark:text-white border-b border-gray-50 dark:border-ink-800">Shop All</Link>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`} onClick={() => setMobileOpen(false)} className="block py-3 text-base font-medium text-ink-700 dark:text-gray-300 border-b border-gray-50 dark:border-ink-800">
                {cat.name}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="block py-3 text-base font-medium text-ink-800 dark:text-white border-b border-gray-50 dark:border-ink-800">Contact</Link>
            <Link to="/track-order" onClick={() => setMobileOpen(false)} className="block py-3 text-base font-medium text-ink-800 dark:text-white border-b border-gray-50 dark:border-ink-800">Track Order</Link>
            <Link to="/help" onClick={() => setMobileOpen(false)} className="block py-3 text-base font-medium text-ink-800 dark:text-white">Help Center</Link>
          </div>
        </div>
      </div>
      <div className="h-16 md:h-20" />
    </>
  );
}
