import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, UserRound } from 'lucide-react';
import logoUrl from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store';
import type { UserRole } from '@/types';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }

    if (password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5216/api/Users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(errBody || 'Eroare la crearea contului în baza de date.');
      }

      const newUser = await response.json();
      console.log('Utilizator salvat în DB:', newUser);

      // Setăm utilizatorul în store-ul local
      setUser(newUser);

      // Navigăm utilizatorul – adminii merg la dashboard
      if (newUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Eroare de conexiune la baza de date. Asigură-te că API-ul C# rulează.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 bg-zinc-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={logoUrl} alt="MacLaren's PC Store" className="h-24 w-auto" />
        </Link>

        {/* Form card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h1 className="text-lg font-semibold text-zinc-100 mb-1">Creează Cont</h1>
          <p className="text-xs text-zinc-500 mb-5">
            Alătură-te comunității MacLaren's PC Store.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Role selector */}
            <div>
              <Label className="text-xs text-zinc-400 mb-2 block">Tip Cont</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="role-customer-btn"
                  onClick={() => setRole('customer')}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                    role === 'customer'
                      ? 'border-sky-400/50 bg-sky-400/10 text-sky-400 ring-1 ring-sky-400/20'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  <UserRound className="h-4 w-4" />
                  Client
                </button>
                <button
                  type="button"
                  id="role-admin-btn"
                  onClick={() => setRole('admin')}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                    role === 'admin'
                      ? 'border-rose-400/50 bg-rose-400/10 text-rose-400 ring-1 ring-rose-400/20'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="name" className="text-xs text-zinc-400">Nume Complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Numele tău"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 bg-zinc-800 border-zinc-700 h-9 text-sm placeholder:text-zinc-600 focus-visible:ring-sky-400/30"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs text-zinc-400">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 bg-zinc-800 border-zinc-700 h-9 text-sm placeholder:text-zinc-600 focus-visible:ring-sky-400/30"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs text-zinc-400">Parolă</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 bg-zinc-800 border-zinc-700 h-9 text-sm placeholder:text-zinc-600 focus-visible:ring-sky-400/30"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-xs text-zinc-400">Confirmă Parola</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 bg-zinc-800 border-zinc-700 h-9 text-sm placeholder:text-zinc-600 focus-visible:ring-sky-400/30"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold h-9 mt-4 disabled:opacity-50"
              id="register-submit-btn"
            >
              {loading ? 'Se creează contul...' : 'Creează contul'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-[11px] text-zinc-600">Ai deja cont? </span>
            <Link to="/login" className="text-[11px] text-sky-400 cursor-pointer hover:underline">
              Conectare
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
