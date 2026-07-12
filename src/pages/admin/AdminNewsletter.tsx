import { useEffect, useState } from 'react';
import { Trash2, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import type { NewsletterSubscriber } from '../../lib/types';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    setSubscribers((data as NewsletterSubscriber[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const del = async (s: NewsletterSubscriber) => {
    await supabase.from('newsletter_subscribers').delete().eq('id', s.id);
    load();
  };

  const exportCSV = () => {
    const csv = ['Email,Subscribed Date', ...subscribers.map((s) => `"${s.email}","${s.created_at}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
  };

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Newsletter ({subscribers.length})</h1>
        {subscribers.length > 0 && (
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-semibold rounded-lg transition hover:bg-gold-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-white text-sm">
            <Download size={16} /> Export
          </button>
        )}
      </div>

      {subscribers.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">No subscribers yet</p>
      ) : (
        <div className="bg-white dark:bg-ink-800/50 rounded-2xl border border-gray-100 dark:border-ink-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-ink-800">
              <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Subscribed</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-ink-700">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-ink-800/30">
                  <td className="px-4 py-3 text-sm font-medium text-ink-900 dark:text-white">{s.email}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => del(s)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
