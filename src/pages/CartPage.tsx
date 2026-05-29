import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, ArrowRight, PackageOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore, useAuthStore } from '@/store';
import { CATEGORY_ICONS } from '@/lib/constants';

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems());
  const totalPrice = useCartStore((s) => s.totalPrice());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  // Shipping form
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [county, setCounty] = useState(user?.address?.county || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ramburs'>('ramburs');

  const shippingCost = totalPrice >= 500 ? 0 : 29.99;
  const grandTotal = totalPrice + shippingCost;

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (!street || !city || !county) {
      setError('Completează adresa de livrare.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        userId: user.id,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total: grandTotal,
        status: 'pending',
        shippingAddress: {
          street,
          city,
          county,
          postalCode,
          country: 'România',
        },
        paymentMethod,
      };

      const response = await fetch('http://localhost:5216/api/Orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Eroare la plasarea comenzii. Status: ${response.status}. Mesaj: ${errorText}`);
      }

      const savedOrder = await response.json();

      setOrderId(savedOrder.id);
      setOrderPlaced(true);
      clearCart();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Eroare la plasarea comenzii. Verifică conexiunea la server.');
    } finally {
      setLoading(false);
    }
  };

  // ── Succes ──
  if (orderPlaced) {
    return (
      <div className="bg-zinc-950 min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">Comandă plasată cu succes!</h2>
          <p className="text-xs text-zinc-500 mb-2">ID comandă: <span className="text-sky-400 font-mono">{orderId}</span></p>
          <p className="text-xs text-zinc-600 mb-5">
            Poți urmări statusul comenzii din profilul tău.
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/profile">
              <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white text-xs h-8">
                Contul meu
              </Button>
            </Link>
            <Link to="/products">
              <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs h-8">
                Continuă cumpărăturile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Coș gol ──
  if (items.length === 0) {
    return (
      <div className="bg-zinc-950 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <PackageOpen className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-zinc-300 mb-1">Coșul tău e gol</h2>
          <p className="text-sm text-zinc-500 mb-5">Adaugă componente din magazin sau Builder.</p>
          <div className="flex gap-2 justify-center">
            <Link to="/products">
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white text-xs h-8 gap-1.5">
                <ArrowLeft className="h-3 w-3" /> Vezi produsele
              </Button>
            </Link>
            <Link to="/builder">
              <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs h-8">
                🔧 PC Builder
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Coș cu produse ──
  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-sky-400" />
            <h1 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Coș</h1>
            <span className="text-xs text-zinc-600">{totalItems} produse</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-500 hover:text-red-400 h-8 gap-1.5"
            onClick={clearCart}
          >
            <Trash2 className="h-3 w-3" /> Golește coșul
          </Button>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-5">
          {/* Cart items */}
          <div className="space-y-2">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_120px_140px_100px_40px] gap-3 px-4 py-2 text-[10px] text-zinc-600 uppercase tracking-wider">
              <span>Produs</span>
              <span className="text-right">Preț unitar</span>
              <span className="text-center">Cantitate</span>
              <span className="text-right">Subtotal</span>
              <span></span>
            </div>

            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 grid md:grid-cols-[1fr_120px_140px_100px_40px] gap-3 items-center"
              >
                {/* Product info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl opacity-50">{CATEGORY_ICONS[item.product.category] || '📦'}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-sky-400 uppercase">{item.product.brand}</p>
                    <Link to={`/products/${item.product.id}`}>
                      <p className="text-xs text-zinc-200 font-medium hover:text-sky-400 transition-colors truncate">
                        {item.product.name}
                      </p>
                    </Link>
                    <p className="text-[10px] text-zinc-600">{item.product.category}</p>
                  </div>
                </div>

                {/* Unit price */}
                <div className="text-right">
                  <span className="text-xs text-zinc-300">{item.product.price.toLocaleString('ro-RO')} RON</span>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center border border-zinc-700 rounded">
                    <button
                      className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 py-1 text-xs text-zinc-200 min-w-[2rem] text-center border-x border-zinc-700">
                      {item.quantity}
                    </span>
                    <button
                      className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <span className="text-sm font-bold text-zinc-100">
                    {(item.product.price * item.quantity).toLocaleString('ro-RO')} RON
                  </span>
                </div>

                {/* Remove */}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-zinc-600 hover:text-red-400 hover:bg-zinc-800"
                    onClick={() => removeItem(item.product.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary + Shipping form */}
          <div className="space-y-4">
            {/* Shipping details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Adresă de livrare</h2>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="street" className="text-[11px] text-zinc-500">Stradă</Label>
                  <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Str. Exemplu, nr. 1" className="mt-0.5 bg-zinc-800 border-zinc-700 h-8 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="city" className="text-[11px] text-zinc-500">Oraș</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cluj-Napoca" className="mt-0.5 bg-zinc-800 border-zinc-700 h-8 text-xs" />
                  </div>
                  <div>
                    <Label htmlFor="county" className="text-[11px] text-zinc-500">Județ</Label>
                    <Input id="county" value={county} onChange={(e) => setCounty(e.target.value)} placeholder="Cluj" className="mt-0.5 bg-zinc-800 border-zinc-700 h-8 text-xs" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="postalCode" className="text-[11px] text-zinc-500">Cod poștal</Label>
                  <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="400000" className="mt-0.5 bg-zinc-800 border-zinc-700 h-8 text-xs" />
                </div>
              </div>

              {/* Payment method */}
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-4 mb-2">Metodă de plată</h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ramburs')}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    paymentMethod === 'ramburs'
                      ? 'border-sky-400/50 bg-sky-400/10 text-sky-400'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  💵 Ramburs
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    paymentMethod === 'card'
                      ? 'border-sky-400/50 bg-sky-400/10 text-sky-400'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  💳 Card
                </button>
              </div>
            </div>

            {/* Price summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 sticky top-36">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Sumar comandă</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Subtotal ({totalItems} produse)</span>
                  <span className="text-zinc-200">{totalPrice.toLocaleString('ro-RO')} RON</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Livrare</span>
                  <span className={totalPrice >= 500 ? 'text-emerald-500' : 'text-zinc-200'}>
                    {totalPrice >= 500 ? 'Gratuită' : '29,99 RON'}
                  </span>
                </div>
                {totalPrice < 500 && (
                  <p className="text-[10px] text-sky-400">
                    Mai adaugă {(500 - totalPrice).toLocaleString('ro-RO')} RON pentru livrare gratuită
                  </p>
                )}
              </div>

              <div className="border-t border-zinc-800 pt-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-zinc-300">Total</span>
                  <span className="text-xl font-bold text-sky-400">
                    {grandTotal.toLocaleString('ro-RO', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })} RON
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 rounded px-3 py-2 mb-3">{error}</p>
              )}

              <Button
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold h-10 gap-2 disabled:opacity-50"
                disabled={loading}
                onClick={handlePlaceOrder}
              >
                {loading ? (
                  'Se procesează...'
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Finalizează comanda
                  </>
                )}
              </Button>

              <Link to="/products" className="block mt-2">
                <Button variant="ghost" className="w-full text-xs text-zinc-500 hover:text-zinc-300 h-8 gap-1.5">
                  <ArrowLeft className="h-3 w-3" /> Continuă cumpărăturile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
