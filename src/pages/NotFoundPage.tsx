import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center bg-zinc-950">
      <AlertTriangle className="h-10 w-10 text-zinc-600 mb-4" />
      <h1 className="text-2xl font-bold text-zinc-100 mb-1">404</h1>
      <p className="text-sm text-zinc-500 mb-5">Pagina nu a fost găsită.</p>
      <Link to="/">
        <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white font-semibold h-8 text-xs">
          Înapoi la magazin
        </Button>
      </Link>
    </div>
  );
}
