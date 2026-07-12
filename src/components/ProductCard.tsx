import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '../lib/types';
import { useWishlistStore } from '../lib/wishlist-store';
import { useCartStore } from '../lib/cart-store';
import { formatPrice } from '../lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const { toggle, has } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const imageUrl = product.images?.[0]?.image_url || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600';
  const isWishlisted = has(product.id);

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      original_price: product.original_price,
      image_url: imageUrl,
      size: product.sizes?.[0]?.size || 'M',
      color: product.colors?.[0]?.color || 'Default',
      quantity: 1,
      stock: product.stock || 99,
    });
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-ink-800 card-hover">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new && <span className="px-2.5 py-1 bg-gold-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">New</span>}
          {product.is_bestseller && <span className="px-2.5 py-1 bg-ink-900 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">Best Seller</span>}
          {product.is_trending && <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">Trending</span>}
        </div>

        {product.discount_percent > 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            -{product.discount_percent}%
          </div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
          className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 dark:bg-ink-900/80 text-ink-800 dark:text-white hover:bg-white dark:hover:bg-ink-900'
          }`}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        <button
          onClick={handleAddCart}
          className="absolute bottom-3 left-3 right-14 py-2 bg-ink-900/90 dark:bg-white/90 text-white dark:text-ink-900 text-sm font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gold-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-white"
        >
          <ShoppingBag size={16} /> Add
        </button>
      </div>

      <div className="mt-3 px-1">
        <h3 className="text-sm font-medium text-ink-900 dark:text-white line-clamp-1 group-hover:text-gold-500 transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-base font-bold text-ink-900 dark:text-white">{formatPrice(product.price)}</span>
          {product.original_price > product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
