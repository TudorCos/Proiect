import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import logoUrl from '@/assets/logo.webp';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Produse', end: false },
  { to: '/admin/orders', icon: ClipboardList, label: 'Comenzi', end: false },
];

export function AdminSidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex h-screen w-56 flex-col bg-zinc-950 border-r border-zinc-800">
      {/* Header */}
      <div className="h-20 flex items-center px-4 border-b border-zinc-800">
        <img src={logoUrl} alt="MacLaren's PC Store" className="h-14 w-auto" />
        <span className="ml-1 text-[9px] font-bold uppercase tracking-widest text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded">
          Admin
        </span>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-zinc-800/50">
        <p className="text-xs text-zinc-400 truncate">{user?.name}</p>
        <p className="text-[10px] text-zinc-600 truncate">{user?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-sky-400/10 text-sky-400'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`
            }
          >
            <link.icon className="h-3.5 w-3.5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 space-y-0.5">
        <NavLink
          to="/"
          className="flex items-center gap-2.5 rounded px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Înapoi la magazin
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-xs text-red-400/70 hover:bg-zinc-900 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Deconectare
        </button>
      </div>
    </aside>
  );
}
