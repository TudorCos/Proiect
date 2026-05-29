import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product, ProductCategory } from '@/types';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/constants';
import { ProductCard } from '@/components/product/ProductCard';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5216/api/Products');
        if (res.ok) {
          setProducts(await res.json());
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const popularProducts = [...products]
    .sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.reviewCount - a.reviewCount;
    })
    .slice(0, 5);
  const mainCategories: ProductCategory[] = ['CPU', 'GPU', 'RAM', 'Motherboard', 'PSU', 'Storage', 'Case', 'Cooling'];

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Se încarcă magazinul...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen">
      {/* Hero — compact, product-focused */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Main hero card */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 p-6 md:p-8 flex flex-col justify-center">
              <Badge className="w-fit bg-sky-400/10 text-sky-400 border-sky-400/20 mb-3 text-[10px] uppercase tracking-wider">
                Configurator inteligent
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 leading-tight mb-2">
                Asamblează-ți PC-ul
                <br />
                piesa cu piesa.
              </h1>
              <p className="text-zinc-400 text-sm max-w-md mb-5">
                Verificare automată de compatibilitate între componente.
                Alege socket-ul, verifică TDP-ul, lansează comanda.
              </p>
              <div className="flex gap-2">
                <Link to="/builder">
                  <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white font-semibold gap-1.5 h-9">
                    🔧 Deschide Builder
                  </Button>
                </Link>
                <Link to="/products">
                  <Button size="sm" variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 h-9 gap-1.5">
                    Toate produsele
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
              {/* Decorative */}
              <div className="absolute right-0 bottom-0 w-48 h-48 opacity-[0.03]">
                <Cpu className="w-full h-full" />
              </div>
            </div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Categorii</h2>
            <Link to="/products" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
              Vezi toate →
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {mainCategories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              return (
                <Link
                  key={cat}
                  to={`/products?category=${cat}`}
                  className="group rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-3 text-center transition-all hover:bg-zinc-800/50"
                >
                  <span className="text-2xl block mb-1">{CATEGORY_ICONS[cat]}</span>
                  <p className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100">{CATEGORY_LABELS[cat]}</p>
                  <p className="text-[10px] text-zinc-600">{count} prod.</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured / Popular products */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-4 w-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Produse populare</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {popularProducts.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} hideAddButton={true} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
