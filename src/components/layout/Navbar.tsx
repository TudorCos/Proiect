import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, ChevronDown, LogOut, Settings } from 'lucide-react';
import logoUrl from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCartStore, useAuthStore } from '@/store';
import { useState } from 'react';
import type { ProductCategory } from '@/types';

const categories: { label: string; value: ProductCategory }[] = [
  { label: 'Procesoare', value: 'CPU' },
  { label: 'Plăci video', value: 'GPU' },
  { label: 'Memorii RAM', value: 'RAM' },
  { label: 'Plăci de bază', value: 'Motherboard' },
  { label: 'Surse', value: 'PSU' },
  { label: 'Stocare', value: 'Storage' },
  { label: 'Carcase', value: 'Case' },
  { label: 'Coolere', value: 'Cooling' },
];

export function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50">

      {/* Main navbar */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="mx-auto max-w-[1400px] px-4 h-20 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 mr-2">
            <img src={logoUrl} alt="PC Garage" className="h-16 w-auto" />
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="flex w-full">
              <Input
                type="text"
                placeholder="Caută produse: RTX 4090, Ryzen 9, DDR5..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-r-none bg-zinc-800 border-zinc-700 text-sm h-9 focus-visible:ring-sky-400/30 placeholder:text-zinc-500"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-l-none bg-rose-500 hover:bg-rose-600 text-white h-9 px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* User */}
            {user ? (
              <div className="hidden md:flex items-center gap-1">
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-zinc-800 h-9 gap-1.5 text-xs">
                      <Settings className="h-3.5 w-3.5" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 h-9 gap-1.5 text-xs">
                    <User className="h-3.5 w-3.5" />
                    Contul meu
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 h-9 text-xs gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block">
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 h-9 gap-1.5 text-xs">
                  <User className="h-3.5 w-3.5" />
                  Conectare
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-zinc-800 h-9 gap-2 text-xs text-zinc-300"
                id="navbar-cart-btn"
              >
                <div className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems() > 0 && (
                    <Badge className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[9px] bg-rose-500 text-white border-0">
                      {totalItems()}
                    </Badge>
                  )}
                </div>
                <span className="hidden lg:inline">
                  {totalItems() > 0 ? `${totalPrice().toLocaleString('ro-RO')} RON` : 'Coș'}
                </span>
              </Button>
            </Link>

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-300 hover:bg-zinc-800 h-9 w-9"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Category bar */}
      <div className="bg-zinc-900/95 backdrop-blur border-b border-zinc-800/50">
        <div className="mx-auto max-w-[1400px] px-4">
          <nav className="hidden md:flex items-center h-10 gap-0 -mx-2 relative">
            <div className="relative">
              <button
                className="flex items-center gap-1 px-3 h-10 text-xs font-medium text-sky-400 hover:bg-zinc-800/60 transition-colors whitespace-nowrap"
                onClick={() => setShowCategories(!showCategories)}
              >
                <Menu className="h-3.5 w-3.5" />
                Categorii
                <ChevronDown className={`h-3 w-3 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
              </button>

              {showCategories && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl py-1 z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat.value}
                      to={`/products?category=${cat.value}`}
                      className="block px-4 py-2.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
                      onClick={() => setShowCategories(false)}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-zinc-700 mx-1" />
            
            <Link
              to="/products"
              state={{ resetFilters: true }}
              className="px-3 h-10 flex items-center text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors whitespace-nowrap"
            >
              Toate produsele
            </Link>

            <div className="w-px h-5 bg-zinc-700 mx-1" />
            
            <Link
              to="/builder"
              className="px-3 h-10 flex items-center text-xs font-medium text-rose-400 hover:bg-zinc-800/60 transition-colors whitespace-nowrap gap-1"
            >
              🔧 PC Builder
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800 px-4 pb-3 pt-1">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="flex mb-3">
            <Input
              type="text"
              placeholder="Caută produse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-r-none bg-zinc-800 border-zinc-700 text-sm h-9"
            />
            <Button type="submit" size="sm" className="rounded-l-none bg-rose-500 hover:bg-rose-600 text-white h-9">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <nav className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1">Categorii</span>
            {categories.map((cat) => (
              <Link
                key={cat.value}
                to={`/products?category=${cat.value}`}
                className="px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded"
                onClick={() => setMobileOpen(false)}
              >
                {cat.label}
              </Link>
            ))}
            <div className="h-px bg-zinc-800 my-1" />
            <Link to="/products" state={{ resetFilters: true }} className="px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded" onClick={() => setMobileOpen(false)}>
              📦 Toate produsele
            </Link>
            <div className="h-px bg-zinc-800 my-1" />
            <Link to="/builder" className="px-2 py-1.5 text-sm text-rose-400 font-medium hover:bg-zinc-800 rounded" onClick={() => setMobileOpen(false)}>
              🔧 PC Builder
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded" onClick={() => setMobileOpen(false)}>
                  Contul meu
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="px-2 py-1.5 text-sm text-left text-red-400 hover:bg-zinc-800 rounded">
                  Deconectare
                </button>
              </>
            ) : (
              <Link to="/login" className="px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded" onClick={() => setMobileOpen(false)}>
                Conectare
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
