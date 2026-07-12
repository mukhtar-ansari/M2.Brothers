import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDateTime } from '../../lib/utils';
import type { ContactMessage } from '../../lib/types';

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    setMessages((data as ContactMessage[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const del = async (m: ContactMessage) => {
    if (!confirm('Delete this message?')) return;
    await supabase.from('contact_messages').delete().eq('id', m.id);
    load();
  };

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-6">Contact Messages ({messages.length})</h1>

      {messages.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">No messages yet</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="bg-white dark:bg-ink-800/50 rounded-2xl p-5 border border-gray-100 dark:border-ink-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-ink-900 dark:text-white">{m.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{m.email}</span>
                    {m.phone && <span className="text-sm text-gray-500 dark:text-gray-400">• {m.phone}</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{m.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDateTime(m.created_at)}</p>
                </div>
                <button onClick={() => del(m)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
