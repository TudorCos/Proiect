import { useEffect, useState, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore, useBuildStore, useCartStore } from '@/store';
import { ShoppingCart } from 'lucide-react';

export function ClientLayout() {
  const user = useAuthStore((s) => s.user);
  const fetchSavedBuilds = useBuildStore((s) => s.fetchSavedBuilds);
  const location = useLocation();

  const [loadingScreen, setLoadingScreen] = useState(false);
  const showToast = useCartStore((s) => s.showToast);
  const setShowToast = useCartStore((s) => s.setShowToast);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (user?.id) {
      fetchSavedBuilds(user.id);
    }
  }, [user?.id, fetchSavedBuilds]);

  // Page transition loading screen
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    setLoadingScreen(true);
    const timer = setTimeout(() => {
      setLoadingScreen(false);
    }, 600); // 600ms page loading duration

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Auto-dismiss Cart Toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000); // show for 4 seconds
      return () => clearTimeout(timer);
    }
  }, [showToast, setShowToast]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 relative">
      {/* Page transition loading screen (z-[100] is over Navbar z-50) */}
      {loadingScreen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-sm transition-opacity duration-300">
          <img
            src="/logo.png"
            alt="MacLaren's Logo"
            className="h-16 w-auto animate-logo-pulse"
          />
        </div>
      )}

      {/* Cart toast popup (z-[110] is over everything) */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[110] flex items-center gap-3 bg-zinc-900 border border-emerald-500/20 text-zinc-100 px-4 py-3 rounded-lg shadow-lg shadow-black/50 animate-toast-in">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <ShoppingCart className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold tracking-wide">Produs adăugat în coș</span>
        </div>
      )}

      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
