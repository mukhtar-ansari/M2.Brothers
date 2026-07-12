import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, Tag, Image, Ticket, Star, ShoppingCart, Users, MessageSquare, Mail, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../lib/auth-store';
import { useState } from 'react';

export default function AdminLayout() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!profile || profile.role !== 'admin') {
    navigate('/');
    return null;
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/offers', label: 'Offers', icon: Tag },
    { to: '/admin/banners', label: 'Banners', icon: Image },
    { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { to: '/admin/reviews', label: 'Reviews', icon: Star },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-ink-900 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-ink-900 text-white z-50 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-ink-800">
          <span className="font-display text-xl font-bold">M2 <span className="text-gold-500">Admin</span></span>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-gold-500 text-white' : 'text-gray-400 hover:bg-ink-800 hover:text-white'
                }`}
              >
                <Icon size={18} /> {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t border-ink-800">
          <button onClick={() => { signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 transition">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white dark:bg-ink-800 border-b border-gray-100 dark:border-ink-700 px-4 lg:px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-ink-800 dark:text-white"><Menu size={20} /></button>
          <div className="hidden lg:block">
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, <span className="font-semibold text-ink-900 dark:text-white">{profile.full_name || 'Admin'}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-xs font-bold rounded-full">ADMIN</span>
          </div>
        </header>
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
