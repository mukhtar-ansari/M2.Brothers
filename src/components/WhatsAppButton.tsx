import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/917970643462?text=${encodeURIComponent('Hello M2 Brother\'s, I have a question.')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center text-white transition-all hover:scale-110 group"
      aria-label="WhatsApp Chat"
    >
      <MessageCircle size={28} />
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us
      </span>
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
    </a>
  );
}
