import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Package, CheckCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, useAuthStore } from '@/store';
import { useState, useEffect } from 'react';
import { getCategoryIcon } from '@/lib/constants';
import type { Product } from '@/types';
import { RatingStars } from '@/components/ui/rating-stars';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);
  const { user, isAuthenticated } = useAuthStore();

  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchProduct = async () => {
    try {
      const res = await fetch(`http://localhost:5216/api/Products/${id}`);
      if (res.ok) {
        setProduct(await res.json());
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAdd = () => {
    if (product) {
      addItem(product, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError('Comentariul nu poate fi gol.');
      return;
    }
    if (!user) {
      setReviewError('Trebuie să fii conectat pentru a lăsa o recenzie.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await fetch(`http://localhost:5216/api/Products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: id,
          userId: user.id,
          userName: user.name,
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 400 && errData.message === "User not found.") {
          useAuthStore.getState().logout();
          throw new Error("Contul dumneavoastră nu a fost găsit. Sesiunea a fost închisă, vă rugăm să vă conectați din nou.");
        }
        throw new Error(errData.message || 'Eroare la adăugarea recenziei.');
      }

      setReviewSuccess('Recenzia a fost adăugată cu succes!');
      setComment('');
      setRating(5);
      
      // Clear success message after 3 seconds
      setTimeout(() => setReviewSuccess(''), 3000);

      // Re-fetch product to show new review & update rating
      await fetchProduct();
    } catch (err: any) {
      console.error('Submit review error:', err);
      setReviewError(err.message || 'Nu s-a putut trimite recenzia. Asigură-te că API-ul rulează.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-[60vh] flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Se încarcă produsul...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-zinc-950 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Package className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 mb-3">Produsul nu a fost găsit.</p>
          <Link to="/products">
            <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white text-xs h-8">
              Înapoi la produse
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const specs = product.specs as Record<string, unknown> || {};
  const specEntries = Object.entries(specs).filter(([, v]) => v !== undefined && v !== null);

  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-5">
          <Link to="/products" className="hover:text-zinc-300 transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Produse
          </Link>
          <span>/</span>
          <span className="text-zinc-400">{product.category}</span>
          <span>/</span>
          <span className="text-zinc-300 truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-[400px_1fr] lg:grid-cols-[450px_1fr] gap-6">
          {/* Image area */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px] relative">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover max-h-[450px]"
              />
            ) : (
              <span className="text-8xl opacity-20">{getCategoryIcon(product.category)}</span>
            )}
          </div>

          {/* Product info */}
          <div>
            {/* Brand + category */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-sky-400 uppercase font-semibold">{product.brand}</span>
              <span className="text-[10px] text-zinc-600">|</span>
              <span className="text-[10px] text-zinc-500">{product.category}</span>
            </div>

            {/* Name */}
            <h1 className="text-xl font-bold text-zinc-100 mb-2">{product.name}</h1>

            {/* Rating */}
            <div className="mb-4">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={15} textSizeClass="text-xs text-zinc-400" />
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-400 leading-relaxed mb-5">{product.description}</p>

            {/* Price box */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-5">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-zinc-100">
                  {product.price.toLocaleString('ro-RO')} RON
                </span>
              </div>

              {/* Stock */}
              <div className="mt-3 flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-rose-500' : 'bg-red-500'}`} />
                <span className={`text-xs ${product.stock > 10 ? 'text-emerald-500' : product.stock > 0 ? 'text-sky-400' : 'text-red-400'}`}>
                  {product.stock > 10 ? 'În stoc' : product.stock > 0 ? `Stoc limitat: ${product.stock} buc.` : 'Indisponibil'}
                </span>
              </div>

              {/* Add to cart */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center border border-zinc-700 rounded">
                  <button
                    className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >−</button>
                  <span className="px-3 py-1.5 text-xs text-zinc-200 min-w-[2rem] text-center border-x border-zinc-700">{qty}</span>
                  <button
                    className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  >+</button>
                </div>
                <Button
                  className={`flex-1 h-10 gap-2 font-semibold transition-all ${
                    added
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                >
                  {added ? (
                    <><CheckCircle className="h-4 w-4" /> Adăugat în coș!</>
                  ) : (
                    <><ShoppingCart className="h-4 w-4" /> Adaugă în coș</>
                  )}
                </Button>
              </div>
            </div>

            {/* Specs */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-zinc-800">
                <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Specificații tehnice</h2>
              </div>
              <div className="divide-y divide-zinc-800/50">
                {specEntries.length > 0 ? specEntries.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs text-zinc-500 capitalize">{formatSpecKey(key)}</span>
                    <span className="text-xs text-zinc-200 font-medium">{formatSpecValue(value)}</span>
                  </div>
                )) : (
                  <div className="px-4 py-3 text-xs text-zinc-500">Nu există specificații detaliate.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 border-t border-zinc-800 pt-8">
          <h2 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sky-400" />
            Recenzii și comentarii ({product.reviews?.length || 0})
          </h2>

          <div className="grid md:grid-cols-[1fr_350px] gap-8 items-start">
            {/* Reviews list */}
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                [...product.reviews]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((rev) => (
                    <div key={rev.id} className="bg-zinc-900 border border-zinc-800/85 rounded-lg p-5 transition-all hover:border-zinc-800">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div>
                          <span className="text-sm font-semibold text-zinc-200">{rev.userName}</span>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < rev.rating ? 'text-sky-400 fill-sky-400' : 'text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(rev.createdAt).toLocaleDateString('ro-RO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{rev.comment}</p>
                    </div>
                  ))
              ) : (
                <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-lg p-8 text-center">
                  <MessageSquare className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Nu există nicio recenzie pentru acest produs.</p>
                  <p className="text-xs text-zinc-600 mt-1">Fii primul care își spune părerea!</p>
                </div>
              )}
            </div>

            {/* Add review form */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 sticky top-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4">Adaugă recenzia ta</h3>
              
              {isAuthenticated && user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="p-1 -ml-1 transition-transform hover:scale-110 focus:outline-none"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              star <= (hoverRating || rating)
                                ? 'text-sky-400 fill-sky-400'
                                : 'text-zinc-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-xs text-zinc-500 mb-1.5">Comentariu</label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Scrie experiența ta cu acest produs..."
                      required
                      className="w-full min-h-[100px] bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all resize-y"
                    />
                  </div>

                  {reviewError && (
                    <div className="text-[11px] text-red-400 bg-red-400/5 border border-red-500/10 rounded px-3 py-2">
                      {reviewError}
                    </div>
                  )}

                  {reviewSuccess && (
                    <div className="text-[11px] text-emerald-400 bg-emerald-400/5 border border-emerald-500/10 rounded px-3 py-2">
                      {reviewSuccess}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs h-9 font-semibold"
                  >
                    {submittingReview ? 'Se trimite...' : 'Trimite recenzia'}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-500 mb-4">Trebuie să fii conectat pentru a lăsa o recenzie.</p>
                  <Link to="/login" state={{ from: { pathname: `/products/${id}` } }}>
                    <Button size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs w-full">
                      Conectează-te
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatSpecKey(key: string): string {
  const map: Record<string, string> = {
    socket: 'Socket', cores: 'Nuclee', threads: 'Fire', baseClock: 'Frecvență bază (GHz)',
    boostClock: 'Frecvență boost (GHz)', tdp: 'TDP (W)', integratedGraphics: 'Grafică integrată',
    vram: 'VRAM (GB)', vramType: 'Tip VRAM', length: 'Lungime (mm)', slots: 'Sloturi ocupate',
    type: 'Tip', speed: 'Frecvență (MHz)', capacity: 'Capacitate/modul (GB)', modules: 'Module',
    latency: 'Latență', formFactor: 'Form Factor', chipset: 'Chipset', ramType: 'Tip RAM',
    ramSlots: 'Sloturi RAM', maxRam: 'RAM maxim (GB)', m2Slots: 'Sloturi M.2', pciSlots: 'Sloturi PCIe',
    wattage: 'Putere (W)', efficiency: 'Eficiență', modular: 'Modular', storageType: 'Tip',
    readSpeed: 'Viteză citire (MB/s)', writeSpeed: 'Viteză scriere (MB/s)', interface: 'Interfață',
    maxGPULength: 'Lungime max GPU (mm)', maxCoolerHeight: 'Înălțime max cooler (mm)', fans: 'Ventilatoare incluse',
    coolingType: 'Tip răcire', height: 'Înălțime (mm)', radiatorSize: 'Radiator (mm)', tdpRating: 'TDP suportat (W)',
  };
  return map[key] || key;
}

function formatSpecValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Da' : 'Nu';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}
