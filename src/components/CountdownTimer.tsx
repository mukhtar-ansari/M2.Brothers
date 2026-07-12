import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Offer } from '../lib/types';

export default function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(endDate).getTime() - Date.now();
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
  }, [endDate]);

  return (
    <div className="flex items-center gap-2">
      <Clock size={18} className="text-gold-500" />
      <div className="flex gap-1.5">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hrs', value: timeLeft.hours },
          { label: 'Min', value: timeLeft.minutes },
          { label: 'Sec', value: timeLeft.seconds },
        ].map((item, i) => (
          <div key={i} className="text-center">
            <div className="bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-bold text-sm md:text-base rounded px-2 py-1 min-w-[2.5rem]">
              {String(item.value).padStart(2, '0')}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActiveCountdownTimer() {
  const [offer, setOffer] = useState<Offer | null>(null);

  useEffect(() => {
    supabase
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .not('end_date', 'is', null)
      .in('type', ['flash_sale', 'limited_time', 'festival'])
      .order('sort_order')
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setOffer(data[0] as Offer);
      });
  }, []);

  if (!offer?.end_date) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-3">
      <span className="text-sm font-medium text-ink-800 dark:text-gray-200">{offer.title}</span>
      <CountdownTimer endDate={offer.end_date} />
    </div>
  );
}
