import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../lib/types';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const filter = searchParams.get('filter') || '';
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');
  const [showDiscountOnly, setShowDiscountOnly] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const select = 'id, name, slug, price, original_price, discount_percent, stock, is_new, is_bestseller, is_trending, is_active, category_id, fabric, washing_instructions, description, created_at, images:product_images(image_url, label, sort_order), sizes:product_sizes(size), colors:product_colors(color, hex_code)';

    let query = supabase.from('products').select(select).eq('is_active', true);

    if (q) query = query.ilike('name', `%${q}%`);

    if (categorySlug) {
      const cat = categories.find((c) => c.slug === categorySlug);
      if (cat) query = query.eq('category_id', cat.id);
    }

    if (filter === 'new') query = query.eq('is_new', true);
    if (filter === 'trending') query = query.eq('is_trending', true);
    if (filter === 'bestseller') query = query.eq('is_bestseller', true);

    query.order('created_at', { ascending: false }).then(({ data }) => {
      setProducts((data as Product[]) || []);
      setLoading(false);
    });
  }, [q, categorySlug, filter, categories]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedSizes.length > 0) {
      result = result.filter((p) => p.sizes?.some((s) => selectedSizes.includes(s.size)));
    }
    if (showDiscountOnly) {
      result = result.filter((p) => p.discount_percent > 0);
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'discount': result.sort((a, b) => b.discount_percent - a.discount_percent); break;
      default: break;
    }
    return result;
  }, [products, selectedSizes, priceRange, showDiscountOnly, sortBy]);

  const updateCategory = (slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug) newParams.set('category', slug);
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  };

  const allSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} />

      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink-900 dark:text-white">
          {categorySlug ? categories.find((c) => c.slug === categorySlug)?.name || 'Shop' : 'All Products'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{filtered.length} products</p>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
        <button
          onClick={() => updateCategory('')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!categorySlug ? 'bg-ink-900 dark:bg-white text-white dark:text-ink-900' : 'bg-gray-100 dark:bg-ink-800 text-ink-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-ink-700'}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${categorySlug === cat.slug ? 'bg-ink-900 dark:bg-white text-white dark:text-ink-900' : 'bg-gray-100 dark:bg-ink-800 text-ink-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-ink-700'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort & Filter Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-ink-800 rounded-lg text-sm font-medium text-ink-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-ink-700 transition"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-gray-100 dark:bg-ink-800 rounded-lg text-sm font-medium text-ink-700 dark:text-gray-300 border-0 focus:ring-2 focus:ring-gold-400 outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterPanel
            allSizes={allSizes}
            selectedSizes={selectedSizes}
            toggleSize={toggleSize}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            showDiscountOnly={showDiscountOnly}
            setShowDiscountOnly={setShowDiscountOnly}
          />
        </aside>

        {/* Mobile Filter Drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-ink-900 p-6 overflow-y-auto animate-slide-down">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-ink-900 dark:text-white">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 text-ink-700 dark:text-gray-300"><X size={20} /></button>
              </div>
              <FilterPanel
                allSizes={allSizes}
                selectedSizes={selectedSizes}
                toggleSize={toggleSize}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                showDiscountOnly={showDiscountOnly}
                setShowDiscountOnly={setShowDiscountOnly}
              />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search size={48} className="text-gray-300 dark:text-ink-600 mb-4" />
              <p className="text-lg font-medium text-ink-800 dark:text-gray-200">No products found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({ allSizes, selectedSizes, toggleSize, priceRange, setPriceRange, showDiscountOnly, setShowDiscountOnly }: {
  allSizes: string[];
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  showDiscountOnly: boolean;
  setShowDiscountOnly: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-ink-900 dark:text-white mb-3 uppercase tracking-wide">Sizes</h4>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                selectedSizes.includes(size)
                  ? 'bg-gold-500 text-white'
                  : 'bg-gray-100 dark:bg-ink-800 text-ink-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-ink-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-ink-900 dark:text-white mb-3 uppercase tracking-wide">Price Range</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-white outline-none focus:ring-1 focus:ring-gold-400"
              placeholder="Min"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-white outline-none focus:ring-1 focus:ring-gold-400"
              placeholder="Max"
            />
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="500"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-gold-500"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDiscountOnly}
            onChange={(e) => setShowDiscountOnly(e.target.checked)}
            className="w-4 h-4 accent-gold-500 rounded"
          />
          <span className="text-sm text-ink-700 dark:text-gray-300">Discounted items only</span>
        </label>
      </div>
    </div>
  );
}
