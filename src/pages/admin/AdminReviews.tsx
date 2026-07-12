import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDateTime } from '../../lib/utils';
import type { Review } from '../../lib/types';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<(Review & { product_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, product:products(name)')
      .order('created_at', { ascending: false });
    setReviews((data?.map((r: any) => ({ ...r, product_name: r.product?.name })) as (Review & { product_name?: string })[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const del = async (r: Review) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', r.id);
    load();
  };

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-6">Reviews ({reviews.length})</h1>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">No reviews yet</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white dark:bg-ink-800/50 rounded-2xl p-5 border border-gray-100 dark:border-ink-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-ink-900 dark:text-white">{r.user_name}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={s <= r.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-300 dark:text-ink-600'} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">• {r.product_name}</span>
                  </div>
                  {r.title && <p className="font-medium text-ink-800 dark:text-gray-200">{r.title}</p>}
                  {r.body && <p className="text-sm text-gray-600 dark:text-gray-400">{r.body}</p>}
                  {r.image_url && <img src={r.image_url} alt="Review" className="mt-2 w-20 h-20 rounded-lg object-cover" />}
                  <p className="text-xs text-gray-400 mt-2">{formatDateTime(r.created_at)}</p>
                </div>
                <button onClick={() => del(r)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
