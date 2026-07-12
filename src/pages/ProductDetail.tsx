import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, ZoomIn, Star, Truck, RefreshCw, Shield, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Review } from '../lib/types';
import { useCartStore } from '../lib/cart-store';
import { useWishlistStore } from '../lib/wishlist-store';
import { useAuthStore } from '../lib/auth-store';
import { formatPrice, getDeliveryEstimate } from '../lib/utils';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, title: '', body: '' });

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setActiveImage(0);
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);

    (async () => {
      const select = '*, images:product_images(*), sizes:product_sizes(*), colors:product_colors(*), category:categories(*)';
      const { data } = await supabase.from('products').select(select).eq('slug', slug).maybeSingle();
      if (data) {
        setProduct(data as Product);
        if (data.sizes?.length) setSelectedSize(data.sizes[0].size);
        if (data.colors?.length) setSelectedColor(data.colors[0].color);

        const { data: revData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', data.id)
          .order('created_at', { ascending: false });
        setReviews((revData as Review[]) || []);

        if (data.category_id) {
          const relSelect = 'id, name, slug, price, original_price, discount_percent, stock, is_new, is_bestseller, is_trending, is_active, category_id, images:product_images(image_url, label, sort_order), sizes:product_sizes(size), colors:product_colors(color, hex_code)';
          const { data: relData } = await supabase
            .from('products')
            .select(relSelect)
            .eq('is_active', true)
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .limit(4);
          setRelated((relData as Product[]) || []);
        }
      }
      setLoading(false);
    })();
  }, [slug]);

  const handleAddCart = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) return;
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      original_price: product.original_price,
      image_url: product.images?.[0]?.image_url || '',
      size: selectedSize,
      color: selectedColor,
      quantity,
      stock: product.stock || 99,
    });
  };

  const handleBuyNow = () => {
    handleAddCart();
    window.location.href = '/cart';
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !profile) return;
    const { data } = await supabase
      .from('reviews')
      .insert({
        product_id: product.id,
        user_id: profile.id,
        user_name: profile.full_name || profile.email,
        rating: reviewData.rating,
        title: reviewData.title,
        body: reviewData.body,
      })
      .select('*')
      .single();
    if (data) {
      setReviews([data as Review, ...reviews]);
      setShowReviewForm(false);
      setReviewData({ rating: 5, title: '', body: '' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[3/4] rounded-2xl skeleton" />
          <div className="space-y-4">
            <div className="h-8 skeleton rounded" />
            <div className="h-4 skeleton rounded w-1/2" />
            <div className="h-20 skeleton rounded" />
            <div className="h-12 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-ink-800 dark:text-white">Product not found</p>
        <Link to="/shop" className="text-gold-500 hover:underline mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const savings = product.original_price > product.price ? product.original_price - product.price : 0;
  const isWishlisted = has(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[
        { label: 'Home', to: '/' },
        { label: 'Shop', to: '/shop' },
        ...(product.category ? [{ label: product.category.name, to: `/shop?category=${product.category.slug}` }] : []),
        { label: product.name },
      ]} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div
            className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 dark:bg-ink-800 cursor-zoom-in group"
            onClick={() => setZoom(true)}
          >
            <img
              src={product.images?.[activeImage]?.image_url || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 dark:bg-ink-900/80 flex items-center justify-center text-ink-800 dark:text-white opacity-0 group-hover:opacity-100 transition">
              <ZoomIn size={18} />
            </div>
            {product.discount_percent > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full">-{product.discount_percent}%</div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${i === activeImage ? 'border-gold-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.image_url} alt={img.label || `View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex gap-2 mb-3">
            {product.is_new && <span className="px-2.5 py-1 bg-gold-500 text-white text-xs font-bold rounded-full uppercase">New</span>}
            {product.is_bestseller && <span className="px-2.5 py-1 bg-ink-900 text-white text-xs font-bold rounded-full uppercase">Best Seller</span>}
            {product.is_trending && <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full uppercase">Trending</span>}
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink-900 dark:text-white mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Brand: M2 Brother's</p>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className={s <= Math.round(avgRating) ? 'text-gold-500 fill-gold-500' : 'text-gray-300 dark:text-ink-600'} />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-ink-900 dark:text-white">{formatPrice(product.price)}</span>
            {product.original_price > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.original_price)}</span>
                <span className="text-sm text-green-600 font-semibold">Save {formatPrice(savings)}</span>
              </>
            )}
          </div>

          {product.fabric && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"><span className="font-semibold text-ink-800 dark:text-gray-200">Fabric:</span> {product.fabric}</p>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-ink-800 dark:text-gray-200 mb-2">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s.size)}
                    className={`min-w-[3rem] px-4 py-2.5 rounded-lg text-sm font-medium transition-all border-2 ${
                      selectedSize === s.size
                        ? 'border-gold-500 bg-gold-500 text-white'
                        : 'border-gray-200 dark:border-ink-700 text-ink-700 dark:text-gray-300 hover:border-gold-400'
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-ink-800 dark:text-gray-200 mb-2">Select Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.color)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                      selectedColor === c.color ? 'border-gold-500' : 'border-gray-200 dark:border-ink-700'
                    }`}
                  >
                    {c.hex_code && <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: c.hex_code }} />}
                    {c.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-semibold text-ink-800 dark:text-gray-200 mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-200 dark:border-ink-700 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-ink-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-ink-800 rounded-l-lg">-</button>
                <span className="w-12 text-center font-medium text-ink-900 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-ink-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-ink-800 rounded-r-lg">+</button>
              </div>
              {product.stock > 0 ? (
                <span className="text-sm text-green-600 flex items-center gap-1"><Check size={16} /> In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-sm text-red-500">Out of Stock</span>
              )}
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={handleAddCart}
              className="flex-1 py-3.5 bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-semibold rounded-xl transition-all hover:bg-gold-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-white active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-all active:scale-95"
            >
              Buy Now
            </button>
            <button
              onClick={() => toggle(product.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isWishlisted ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-ink-800 text-ink-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-ink-700'
              }`}
            >
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 py-4 border-y border-gray-100 dark:border-ink-700 mb-6">
            <div className="text-center"><Truck className="mx-auto text-gold-500 mb-1" size={20} /><p className="text-xs text-gray-600 dark:text-gray-400">Free Shipping ₹999+</p></div>
            <div className="text-center"><RefreshCw className="mx-auto text-gold-500 mb-1" size={20} /><p className="text-xs text-gray-600 dark:text-gray-400">7-Day Exchange</p></div>
            <div className="text-center"><Shield className="mx-auto text-gold-500 mb-1" size={20} /><p className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</p></div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold text-ink-800 dark:text-gray-200">Estimated Delivery:</span> {getDeliveryEstimate()}</p>
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-ink-900 dark:text-white uppercase tracking-wide mb-2">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.washing_instructions && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-ink-900 dark:text-white uppercase tracking-wide mb-2">Washing Instructions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{product.washing_instructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Customer Reviews</h2>
          {profile && (
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-lg transition">
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        {showReviewForm && profile && (
          <form onSubmit={submitReview} className="bg-gray-50 dark:bg-ink-800/50 rounded-2xl p-6 mb-6 space-y-4 animate-slide-down">
            <div>
              <label className="text-sm font-medium text-ink-800 dark:text-gray-200 mb-2 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setReviewData({ ...reviewData, rating: s })}>
                    <Star size={28} className={s <= reviewData.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-300 dark:text-ink-600'} />
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="Review title"
              value={reviewData.title}
              onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
              className="input-field"
            />
            <textarea
              placeholder="Share your experience..."
              value={reviewData.body}
              onChange={(e) => setReviewData({ ...reviewData, body: e.target.value })}
              rows={4}
              className="input-field resize-none"
            />
            <button type="submit" className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg transition">Submit Review</button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-gray-50 dark:bg-ink-800/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-ink-900 dark:text-white">{r.user_name}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={s <= r.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-300 dark:text-ink-600'} />
                    ))}
                  </div>
                </div>
                {r.title && <p className="font-medium text-ink-800 dark:text-gray-200 mb-1">{r.title}</p>}
                {r.body && <p className="text-sm text-gray-600 dark:text-gray-400">{r.body}</p>}
                {r.image_url && <img src={r.image_url} alt="Review" className="mt-3 w-24 h-24 rounded-lg object-cover" />}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Fullscreen Zoom */}
      {zoom && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setZoom(false)}>
          <button className="absolute top-4 right-4 text-white p-2" onClick={() => setZoom(false)}>✕</button>
          <img
            src={product.images?.[activeImage]?.image_url || ''}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
