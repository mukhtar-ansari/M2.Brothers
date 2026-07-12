import { useState } from 'react';
import { Mail, Phone, MessageCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('contact_messages').insert(form);
    setSent(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />

      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-white mb-3">Get in Touch</h1>
        <p className="text-gray-500 dark:text-gray-400">We'd love to hear from you. Reach out anytime.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700 text-center card-hover">
          <div className="w-12 h-12 rounded-full bg-gold-100 dark:bg-gold-900/30 text-gold-500 flex items-center justify-center mx-auto mb-3">
            <Mail size={24} />
          </div>
          <h3 className="font-semibold text-ink-900 dark:text-white mb-1">Email Us</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">mukhtaransari797064@gmail.com</p>
        </div>
        <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700 text-center card-hover">
          <div className="w-12 h-12 rounded-full bg-gold-100 dark:bg-gold-900/30 text-gold-500 flex items-center justify-center mx-auto mb-3">
            <Phone size={24} />
          </div>
          <h3 className="font-semibold text-ink-900 dark:text-white mb-1">Call Us</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">7970643462</p>
        </div>
        <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-6 border border-gray-100 dark:border-ink-700 text-center card-hover">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={24} />
          </div>
          <h3 className="font-semibold text-ink-900 dark:text-white mb-1">WhatsApp</h3>
          <a href="https://wa.me/917970643462" target="_blank" rel="noopener" className="text-sm text-green-500 hover:underline">Chat with us</a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-8 border border-gray-100 dark:border-ink-700">
          <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-6">Send a Message</h2>
          {sent && (
            <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-4 rounded-lg mb-4 animate-fade-in">
              Thank you! Your message has been sent. We'll get back to you soon.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            <input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            <textarea required placeholder="Your Message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field resize-none" />
            <button type="submit" className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 active:scale-95">
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-ink-800/50 rounded-2xl p-2 border border-gray-100 dark:border-ink-700 overflow-hidden">
          <div className="aspect-square lg:aspect-auto lg:h-full min-h-[400px] rounded-xl overflow-hidden">
            <iframe
              title="M2 Brother's Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.876!2d75.7871!3d26.9124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDU0JzQ0LjYiTiA3NcKwNDcnMTMuNiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
