import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Award, Timer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category, Offer } from '../lib/types';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import CountdownTimer, { ActiveCountdownTimer } from '../components/CountdownTimer';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const imgSelect = 'id, name, slug, price, original_price, discount_percent, stock, is_new, is_bestseller, is_trending, is_active, category_id, images:product_images(image_url, label, sort_order), sizes:product_sizes(size), colors:product_colors(color, hex_code)';

      const [newRes, trendRes, bestRes, featRes, catRes, offRes] = await Promise.all([
        supabase.from('products').select(imgSelect).eq('is_active', true).eq('is_new', true).order('created_at', { ascending: false }).limit(8),
        supabase.from('products').select(imgSelect).eq('is_active', true).eq('is_trending', true).order('created_at', { ascending: false }).limit(8),
        supabase.from('products').select(imgSelect).eq('is_active', true).eq('is_bestseller', true).order('created_at', { ascending: false }).limit(8),
        supabase.from('products').select(imgSelect).eq('is_active', true).order('created_at', { ascending: false }).limit(8),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('offers').select('*').eq('is_active', true).order('sort_order'),
      ]);

      setNewArrivals((newRes.data as Product[]) || []);
      setTrending((trendRes.data as Product[]) || []);
      setBestSellers((bestRes.data as Product[]) || []);
      setFeatured((featRes.data as Product[]) || []);
      setCategories((catRes.data as Category[]) || []);
      setOffers((offRes.data as Offer[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <HeroSlider />

      <div className="bg-ink-50 dark:bg-ink-800/50 border-y border-gray-100 dark:border-ink-700">
        <div className="max-w-7xl mx-auto px-4">
          <ActiveCountdownTimer />
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="section-title">Shop by Category</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Explore our curated collections</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden card-hover"
              >
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <span className="font-display text-2xl text-white">{cat.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-display text-xl font-semibold">{cat.name}</h3>
                  <span className="text-white/80 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Shop Now <ArrowRight size={14} /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Offer Banners */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.slice(0, 4).map((offer) => (
              <div key={offer.id} className="relative h-48 md:h-56 rounded-2xl overflow-hidden group">
                {offer.image_url ? (
                  <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-ink-800 to-ink-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-6">
                  <span className="text-gold-400 text-xs font-bold uppercase tracking-wider mb-1">{offer.type.replace('_', ' ')}</span>
                  <h3 className="text-white font-display text-2xl font-bold mb-1">{offer.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{offer.description}</p>
                  {offer.discount_percent > 0 && <p className="text-gold-400 text-2xl font-bold">{offer.discount_percent}% OFF</p>}
                  {offer.end_date && <div className="mt-2"><CountdownTimer endDate={offer.end_date} /></div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <ProductSection title="New Arrivals" subtitle="Fresh styles just dropped" icon={<Sparkles className="text-gold-500" />} products={newArrivals} loading={loading} viewAllLink="/shop?filter=new" />

      {/* Trending */}
      <ProductSection title="Trending Collection" subtitle="What everyone's loving right now" icon={<TrendingUp className="text-gold-500" />} products={trending} loading={loading} viewAllLink="/shop?filter=trending" bg />

      {/* Best Sellers */}
      <ProductSection title="Best Sellers" subtitle="Our most-loved pieces" icon={<Award className="text-gold-500" />} products={bestSellers} loading={loading} viewAllLink="/shop?filter=bestseller" />

      {/* Featured */}
      <ProductSection title="Featured Products" subtitle="Handpicked for you" icon={<Sparkles className="text-gold-500" />} products={featured} loading={loading} viewAllLink="/shop" bg />

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-ink-800 to-ink-900 flex items-center justify-center text-center">
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <Timer className="text-gold-500 mx-auto mb-3" size={40} />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">Limited Time Offer</h2>
            <p className="text-gray-300 mb-6">Get up to 50% off on select items. Hurry, before it's gone!</p>
            <Link to="/shop" className="inline-block px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-full transition-all hover:scale-105">
              Shop the Sale
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductSection({ title, subtitle, icon, products, loading, viewAllLink, bg }: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  products: Product[];
  loading: boolean;
  viewAllLink: string;
  bg?: boolean;
}) {
  if (!loading && products.length === 0) return null;

  return (
    <section className={`py-16 ${bg ? 'bg-gray-50 dark:bg-ink-800/30' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-bold uppercase tracking-wider text-gold-500">{title}</span></div>
            <h2 className="section-title">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          </div>
          <Link to={viewAllLink} className="hidden sm:flex items-center gap-1 text-sm font-medium text-gold-600 dark:text-gold-400 hover:gap-2 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        <div className="text-center mt-8 sm:hidden">
          <Link to={viewAllLink} className="inline-flex items-center gap-1 text-sm font-medium text-gold-600 dark:text-gold-400">
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
