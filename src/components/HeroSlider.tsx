import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Banner } from '../lib/types';

export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBanners(data as Banner[]);
        } else {
          setBanners([
            { id: '1', title: 'New Collection 2026', subtitle: 'Premium fashion for the modern man', image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1920', link: '/shop', sort_order: 0, is_active: true, created_at: '' },
            { id: '2', title: 'Up to 50% Off', subtitle: 'Flash Sale on select items', image_url: 'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg?auto=compress&cs=tinysrgb&w=1920', link: '/shop', sort_order: 1, is_active: true, created_at: '' },
            { id: '3', title: 'Baggy Jeans Collection', subtitle: 'Trendy, comfortable, stylish', image_url: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=1920', link: '/shop?category=baggy-jeans', sort_order: 2, is_active: true, created_at: '' },
          ]);
        }
        setLoading(false);
      });
  }, []);

  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (loading) {
    return <div className="h-[400px] md:h-[600px] skeleton" />;
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative h-[400px] md:h-[600px] overflow-hidden bg-ink-900">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="absolute inset-0">
            <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          </div>
          <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
            <div className="max-w-xl">
              <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 animate-slide-up">{banner.title}</h2>
              <p className="text-lg md:text-xl text-gray-200 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>{banner.subtitle}</p>
              <Link
                to={banner.link || '/shop'}
                className="inline-block px-8 py-4 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{ animationDelay: '0.2s' }}
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-all z-10">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white flex items-center justify-center transition-all z-10">
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-8 bg-gold-500' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
