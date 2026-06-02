import { Link } from 'react-router-dom';
import logoUrl from '@/assets/logo.webp';

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={logoUrl} alt="MacLaren's PC Store" className="h-16 w-auto" />
              <span className="font-bold text-base text-zinc-100 tracking-tight">
                MacLaren's <span className="text-rose-500">PC Store</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Magazin online de componente PC. Configurator inteligent cu verificare de compatibilitate.
            </p>
          </div>

          <div className="flex gap-16 md:gap-32">
            {/* Magazin */}
            <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Magazin</h4>
            <ul className="space-y-1.5">
              {[
                { to: '/products', label: 'Toate produsele' },
                { to: '/builder', label: 'PC Builder' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informații */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Informații</h4>
            <ul className="space-y-1.5 text-xs text-zinc-500">
              <li>Plată securizată online</li>
              <li>Livrare gratuită {'>'} 500 RON</li>
              <li>Retur gratuit 30 zile</li>
              <li>Garanție 2-5 ani</li>
              <li>Plata în rate fără dobândă</li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
