import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoUrl from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:5216/api/Users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Email sau parolă incorectă.');
        } else {
          setError('A apărut o eroare de conexiune la server.');
        }
        return;
      }

      const user = await response.json();
      setUser(user);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Eroare de conexiune la baza de date. Asigură-te că API-ul C# rulează.');
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
          <h1 className="text-lg font-semibold text-zinc-100 mb-1">Conectare</h1>
          <p className="text-xs text-zinc-500 mb-5">
            Accesează contul tău pentru comenzi și configurări salvate.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
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

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold h-9"
              id="login-submit-btn"
            >
              Conectare
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-[11px] text-zinc-600">Nu ai cont? </span>
            <Link to="/register" className="text-[11px] text-sky-400 cursor-pointer hover:underline">
              Creează cont
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
