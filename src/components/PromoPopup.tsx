import { useEffect, useState } from 'react';
import { X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Offer } from '../lib/types';

export default function PromoPopup() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const seen = sessionStorage.getItem('m2-popup');
    if (seen) return;

    supabase
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .in('type', ['flash_sale', 'limited_time', 'festival'])
      .order('sort_order')
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setOffer(data[0] as Offer);
          setTimeout(() => setShow(true), 3000);
        }
      });
  }, []);

  useEffect(() => {
    if (!offer?.end_date) return;
    const timer = setInterval(() => {
      const diff = new Date(offer.end_date!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [offer]);

  if (!show || !offer) return null;

  const close = () => {
    setShow(false);
    sessionStorage.setItem('m2-popup', '1');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-white dark:bg-ink-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        <button onClick={close} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-ink-800/80 flex items-center justify-center text-ink-800 dark:text-white hover:bg-gray-100 dark:hover:bg-ink-700 transition">
          <X size={20} />
        </button>
        {offer.image_url && (
          <div className="h-48 overflow-hidden">
            <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 text-center">
          <span className="inline-block px-3 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-xs font-bold rounded-full uppercase tracking-wide mb-3">
            {offer.type.replace('_', ' ')}
          </span>
          <h3 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-2">{offer.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{offer.description}</p>
          {offer.discount_percent > 0 && (
            <p className="text-3xl font-bold text-gold-500 mb-4">{offer.discount_percent}% OFF</p>
          )}
          {offer.end_date && (
            <div className="flex items-center justify-center gap-2 mb-4 text-sm text-ink-700 dark:text-gray-300">
              <Clock size={16} className="text-gold-500" />
              <span>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
            </div>
          )}
          <Link
            to="/shop"
            onClick={close}
            className="block w-full py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02]"
          >
            Shop the Sale
          </Link>
        </div>
      </div>
    </div>
  );
}
