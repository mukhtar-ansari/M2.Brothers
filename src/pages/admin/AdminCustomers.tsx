import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDateTime } from '../../lib/utils';
import type { Profile } from '../../lib/types';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setCustomers((data as Profile[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-6">Customers ({customers.length})</h1>

      <div className="bg-white dark:bg-ink-800/50 rounded-2xl border border-gray-100 dark:border-ink-700 overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-ink-800">
            <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-ink-700">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-ink-800/30">
                <td className="px-4 py-3 text-sm font-medium text-ink-900 dark:text-white">{c.full_name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{c.phone || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${c.role === 'admin' ? 'bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400' : 'bg-gray-100 dark:bg-ink-700 text-gray-600 dark:text-gray-400'}`}>{c.role}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDateTime(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
