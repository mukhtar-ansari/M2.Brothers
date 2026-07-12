import { useEffect, useState } from 'react';
import { Truck, Tag, Zap, Gift } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Offer } from '../lib/types';

export default function AnnouncementBar() {
  const [offers, setOffers] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data) {
          const msgs = (data as Offer[]).map((o) => o.title);
          setOffers(msgs.length > 0 ? msgs : [
            'Free Shipping on orders above ₹999',
            'Use code M2B10 for 10% off your first order',
            'Flash Sale: Up to 50% off select items',
          ]);
        }
      });
  }, []);

  const icons = [Truck, Tag, Zap, Gift];

  return (
    <div className="bg-gold-500 text-white overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {[...offers, ...offers, ...offers, ...offers].map((msg, i) => {
          const Icon = icons[i % icons.length];
          return (
            <span key={i} className="inline-flex items-center gap-2 px-8 text-sm font-medium">
              <Icon size={14} /> {msg}
            </span>
          );
        })}
      </div>
    </div>
  );
}
