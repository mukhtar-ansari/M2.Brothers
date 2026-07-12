import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const policies = [
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    content: [
      { q: 'How long does delivery take?', a: 'We typically deliver within 3-7 business days depending on your location. Metro cities usually receive orders faster.' },
      { q: 'What is your return policy?', a: 'We offer 7-day easy returns. If you\'re not satisfied with your purchase, you can return it within 7 days for a full refund or exchange.' },
      { q: 'How do I track my order?', a: 'You can track your order by visiting the "Track Order" page and entering your Order ID. You\'ll see real-time status updates.' },
      { q: 'Do you offer Cash on Delivery?', a: 'Yes, COD is available across India. You can also pay via UPI, cards, PhonePe, Google Pay, Paytm, or Razorpay.' },
      { q: 'Are there any shipping charges?', a: 'Shipping is FREE on all orders above ₹999. Orders below ₹999 incur a flat shipping fee of ₹49.' },
      { q: 'How do I know my size?', a: 'Each product page has a detailed size chart. If you\'re between sizes, we recommend going one size up for a comfortable fit.' },
    ],
  },
  {
    id: 'returns',
    title: 'Return Policy',
    content: [
      { q: 'What is the return period?', a: 'You can return any product within 7 days of delivery. The product must be unworn, unwashed, and with all original tags and packaging intact.' },
      { q: 'How do I initiate a return?', a: 'Go to your Orders page, select the order, and click "Return Item". Fill out the return reason and we\'ll arrange a pickup.' },
      { q: 'When will I get my refund?', a: 'Refunds are processed within 5-7 business days after we receive and inspect the returned product. The amount will be credited to your original payment method.' },
      { q: 'Can I exchange a product?', a: 'Yes, you can exchange for a different size or color of the same product. Just select "Exchange" instead of "Return" when initiating the request.' },
    ],
  },
  {
    id: 'exchange',
    title: 'Exchange Policy',
    content: [
      { q: 'What can be exchanged?', a: 'You can exchange for a different size or color of the same product within 7 days of delivery, subject to availability.' },
      { q: 'Is there a charge for exchange?', a: 'No, exchanges are free. We will arrange a pickup and delivery of the new size/color at no extra cost.' },
      { q: 'What if the exchanged item is out of stock?', a: 'If the item you want is out of stock, we\'ll offer you a store credit or a full refund instead.' },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping Policy',
    content: [
      { q: 'What are the shipping charges?', a: 'Shipping is FREE on orders above ₹999. For orders below ₹999, a flat shipping fee of ₹49 is applied.' },
      { q: 'How long does shipping take?', a: 'Orders are dispatched within 24 hours. Delivery typically takes 3-7 business days depending on your location.' },
      { q: 'Do you ship internationally?', a: 'Currently, we only ship within India. International shipping will be available soon.' },
      { q: 'Can I change my shipping address?', a: 'You can change your shipping address before the order is dispatched. Contact us immediately if you need to update the address.' },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    content: [
      { q: 'What information do we collect?', a: 'We collect your name, email, phone number, and shipping address when you place an order or create an account. This is used solely for processing your orders.' },
      { q: 'How do we use your data?', a: 'Your data is used to process orders, provide customer support, and send you updates about new collections and offers. We never sell your data to third parties.' },
      { q: 'Is my payment information secure?', a: 'Yes, all payments are processed through secure payment gateways. We do not store your card or banking details on our servers.' },
      { q: 'Can I delete my account?', a: 'Yes, you can request account deletion at any time by contacting us. We will remove your personal data from our systems.' },
    ],
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    content: [
      { q: 'Order Acceptance', a: 'All orders are subject to acceptance and availability. M2 Brother\'s reserves the right to cancel any order before dispatch.' },
      { q: 'Pricing', a: 'All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes. Prices may change without prior notice.' },
      { q: 'Product Colors', a: 'We strive to display product colors accurately. However, actual colors may vary slightly due to monitor settings and photography lighting.' },
      { q: 'Intellectual Property', a: 'All content on this website, including images, logos, and text, is the property of M2 Brother\'s and may not be used without permission.' },
    ],
  },
];

export default function HelpCenter() {
  const [openId, setOpenId] = useState<string | null>('faq-0');
  const [activeSection, setActiveSection] = useState('faq');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Help Center' }]} />

      <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-white mb-3">Help Center</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Find answers to common questions and learn about our policies</p>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
        {policies.map((p) => (
          <button
            key={p.id}
            onClick={() => { setActiveSection(p.id); setOpenId(`${p.id}-0`); }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              activeSection === p.id ? 'bg-ink-900 dark:bg-white text-white dark:text-ink-900' : 'bg-gray-100 dark:bg-ink-800 text-ink-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-ink-700'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {policies.filter((p) => p.id === activeSection).map((section) =>
          section.content.map((item, i) => {
            const id = `${section.id}-${i}`;
            const isOpen = openId === id;
            return (
              <div key={id} className="bg-white dark:bg-ink-800/50 rounded-2xl border border-gray-100 dark:border-ink-700 overflow-hidden">
                <button
                  onClick={() => setOpenId(isOpen ? null : id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-ink-900 dark:text-white">{item.q}</span>
                  <ChevronDown size={20} className={`text-gold-500 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed animate-slide-down">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
