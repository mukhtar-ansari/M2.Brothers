import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWishlistStore } from '../lib/wishlist-store';
import type { Product } from '../lib/types';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { productIds } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    (async () => {
      const select = 'id, name, slug, price, original_price, discount_percent, stock, is_new, is_bestseller, is_trending, is_active, category_id, images:product_images(image_url, label, sort_order), sizes:product_sizes(size), colors:product_colors(color, hex_code)';
      const { data } = await supabase.from('products').select(select).in('id', productIds).eq('is_active', true);
      setProducts((data as Product[]) || []);
      setLoading(false);
    })();
  }, [productIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white mb-2">My Wishlist</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{products.length} items saved</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={64} className="mx-auto text-gray-300 dark:text-ink-600 mb-4" />
          <p className="text-lg font-medium text-ink-800 dark:text-gray-200">Your wishlist is empty</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Save items you love for later</p>
          <Link to="/shop" className="inline-block mt-6 px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-full transition">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
