import { useState, useEffect } from 'react';

import {
  AlertTriangle,
  CheckCircle,
  X,
  ShoppingCart,
  Save,
  RotateCcw,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/ui/rating-stars';

import { Input } from '@/components/ui/input';
import { useBuildStore, useCartStore } from '@/store';
import type { Product, ProductCategory } from '@/types';

interface SlotConfig {
  key: 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'psu' | 'case' | 'cooling';
  label: string;
  category: ProductCategory;
  icon: string;
  setter: (p: Product | undefined) => void;
}

export function BuilderPage() {
  const build = useBuildStore((s) => s.currentBuild);
  const setCPU = useBuildStore((s) => s.setCPU);
  const setGPU = useBuildStore((s) => s.setGPU);
  const setMotherboard = useBuildStore((s) => s.setMotherboard);
  const setRAM = useBuildStore((s) => s.setRAM);
  const setPSU = useBuildStore((s) => s.setPSU);
  const setCase = useBuildStore((s) => s.setCase);
  const setCooling = useBuildStore((s) => s.setCooling);
  const addStorage = useBuildStore((s) => s.addStorage);
  const removeStorage = useBuildStore((s) => s.removeStorage);
  const resetBuild = useBuildStore((s) => s.resetBuild);
  const saveBuild = useBuildStore((s) => s.saveBuild);
  const savedBuilds = useBuildStore((s) => s.savedBuilds);
  const loadBuild = useBuildStore((s) => s.loadBuild);
  const deleteBuild = useBuildStore((s) => s.deleteBuild);
  const addCartItem = useCartStore((s) => s.addItem);

  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const [slotSearch, setSlotSearch] = useState('');
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

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

  const slots: SlotConfig[] = [
    { key: 'cpu', label: 'Procesor', category: 'CPU', icon: '🔲', setter: setCPU },
    { key: 'motherboard', label: 'Placă de bază', category: 'Motherboard', icon: '🖥️', setter: setMotherboard },
    { key: 'gpu', label: 'Placă video', category: 'GPU', icon: '🎮', setter: setGPU },
    { key: 'ram', label: 'Memorie RAM', category: 'RAM', icon: '💾', setter: setRAM },
    { key: 'cooling', label: 'Cooler', category: 'Cooling', icon: '❄️', setter: setCooling },
    { key: 'psu', label: 'Sursă', category: 'PSU', icon: '⚡', setter: setPSU },
    { key: 'case', label: 'Carcasă', category: 'Case', icon: '📦', setter: setCase },
  ];

  const handleSelectProduct = (slot: SlotConfig, product: Product) => {
    slot.setter(product);
    setOpenSlot(null);
    setSlotSearch('');
  };

  const handleRemoveProduct = (slot: SlotConfig) => {
    slot.setter(undefined);
  };

  const handleSave = () => {
    if (saveName.trim()) {
      saveBuild(saveName.trim());
      setSaveName('');
      setShowSaveInput(false);
    }
  };

  const handleAddAllToCart = () => {
    const parts = [build.cpu, build.gpu, build.motherboard, build.ram, build.psu, build.case, build.cooling];
    parts.forEach((p) => { if (p) addCartItem(p); });
    build.storage?.forEach((s) => addCartItem(s));
  };

  const getSlotProduct = (key: string): Product | undefined => {
    return build[key as keyof typeof build] as Product | undefined;
  };

  const errIssues = build.compatibilityIssues.filter((i) => !i.includes('recomandat'));
  const warnIssues = build.compatibilityIssues.filter((i) => i.includes('recomandat') || i.includes('limită'));
  const filledSlots = slots.filter((s) => getSlotProduct(s.key)).length + (build.storage?.length || 0);

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-[60vh] flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Se încarcă componentele...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-sky-400">🔧</span>
            <h1 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">PC Builder</h1>
            <span className="text-[10px] text-zinc-600">{filledSlots} componente selectate</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-zinc-300 h-8 gap-1.5" onClick={resetBuild}>
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
            {!showSaveInput ? (
              <Button variant="ghost" size="sm" className="text-xs text-sky-400 hover:text-sky-300 hover:bg-zinc-800 h-8 gap-1.5" onClick={() => setShowSaveInput(true)}>
                <Save className="h-3 w-3" /> Salvează
              </Button>
            ) : (
              <div className="flex items-center gap-1.5">
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Numele build-ului..."
                  className="h-8 w-40 bg-zinc-900 border-zinc-700 text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <Button size="sm" className="h-8 bg-rose-500 hover:bg-rose-600 text-white text-xs" onClick={handleSave}>
                  OK
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-zinc-500" onClick={() => setShowSaveInput(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-5">
          {/* Main builder area */}
          <div className="space-y-2">
            {/* Component slots */}
            {slots.map((slot) => {
              const selected = getSlotProduct(slot.key);
              const isOpen = openSlot === slot.key;
              const available = products.filter((p) => p.category === slot.category);
              const filtered = slotSearch
                ? available.filter((p) => p.name.toLowerCase().includes(slotSearch.toLowerCase()) || p.brand.toLowerCase().includes(slotSearch.toLowerCase()))
                : available;

              return (
                <div key={slot.key} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  {/* Slot header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                    onClick={() => { if (!selected) { setOpenSlot(isOpen ? null : slot.key); setSlotSearch(''); } }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{slot.icon}</span>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">{slot.label}</p>
                        {selected ? (
                          <p className="text-sm text-zinc-200 font-medium">{selected.name}</p>
                        ) : (
                          <p className="text-xs text-zinc-600 italic">Nicio componentă selectată</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selected && (
                        <>
                          <span className="text-sm font-bold text-zinc-200">
                            {selected.price.toLocaleString('ro-RO')} RON
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                            onClick={(e) => { e.stopPropagation(); handleRemoveProduct(slot); }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {!selected && (
                        <ChevronDown className={`h-4 w-4 text-zinc-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </div>

                  {/* Dropdown selector */}
                  {isOpen && !selected && (
                    <div className="border-t border-zinc-800">
                      <div className="p-3">
                        <Input
                          value={slotSearch}
                          onChange={(e) => setSlotSearch(e.target.value)}
                          placeholder={`Caută ${slot.label.toLowerCase()}...`}
                          className="h-8 bg-zinc-800 border-zinc-700 text-xs"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filtered.map((product) => (
                          <button
                            key={product.id}
                            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800/50 transition-colors text-left border-t border-zinc-800/30"
                            onClick={() => handleSelectProduct(slot, product)}
                          >
                            <div>
                              <p className="text-[10px] text-sky-400 uppercase">{product.brand}</p>
                              <p className="text-xs text-zinc-300">{product.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={10} textSizeClass="text-[10px] text-zinc-500" />
                                <span className="text-[10px] text-zinc-600">•</span>
                                <span className="text-[10px] text-zinc-600">Stoc: {product.stock}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-sm text-zinc-100">{product.price.toLocaleString('ro-RO')} RON</p>
                            </div>
                          </button>
                        ))}
                        {filtered.length === 0 && (
                          <p className="px-4 py-3 text-xs text-zinc-600 text-center">Niciun produs găsit.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Storage (multiple) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                onClick={() => { setOpenSlot(openSlot === 'storage' ? null : 'storage'); setSlotSearch(''); }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">💿</span>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Stocare</p>
                    {build.storage && build.storage.length > 0 ? (
                      <div className="space-y-0.5 mt-0.5">
                        {build.storage.map((s) => (
                          <div key={s.id} className="flex items-center gap-2">
                            <p className="text-sm text-zinc-200">{s.name}</p>
                            <span className="text-xs text-zinc-500">{s.price.toLocaleString('ro-RO')} RON</span>
                            <button
                              className="text-zinc-600 hover:text-red-400"
                              onClick={(e) => { e.stopPropagation(); removeStorage(s.id); }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-600 italic">Nicio componentă selectată</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {build.storage && build.storage.length > 0 && (
                    <span className="text-sm font-bold text-zinc-200">
                      {build.storage.reduce((s, p) => s + p.price, 0).toLocaleString('ro-RO')} RON
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-zinc-600 transition-transform ${openSlot === 'storage' ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {openSlot === 'storage' && (
                <div className="border-t border-zinc-800">
                  <div className="p-3">
                    <Input
                      value={slotSearch}
                      onChange={(e) => setSlotSearch(e.target.value)}
                      placeholder="Caută stocare..."
                      className="h-8 bg-zinc-800 border-zinc-700 text-xs"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {products
                      .filter((p) => p.category === 'Storage')
                      .filter((p) => !slotSearch || p.name.toLowerCase().includes(slotSearch.toLowerCase()))
                      .map((product) => (
                        <button
                          key={product.id}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800/50 transition-colors text-left border-t border-zinc-800/30"
                          onClick={() => { addStorage(product); setOpenSlot(null); setSlotSearch(''); }}
                        >
                          <div>
                            <p className="text-[10px] text-sky-400 uppercase">{product.brand}</p>
                            <p className="text-xs text-zinc-300">{product.name}</p>
                          </div>
                          <p className="text-sm font-bold text-zinc-200">{product.price.toLocaleString('ro-RO')} RON</p>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: summary + compatibility */}
          <div className="space-y-4">
            {/* Price summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Sumar configurare</h2>
              <div className="space-y-1.5">
                {slots.map((slot) => {
                  const p = getSlotProduct(slot.key);
                  return (
                    <div key={slot.key} className="flex justify-between text-xs">
                      <span className="text-zinc-500">{slot.label}</span>
                      <span className={p ? 'text-zinc-200' : 'text-zinc-700'}>
                        {p ? `${p.price.toLocaleString('ro-RO')} RON` : '—'}
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Stocare</span>
                  <span className={build.storage?.length ? 'text-zinc-200' : 'text-zinc-700'}>
                    {build.storage?.length
                      ? `${build.storage.reduce((s, p) => s + p.price, 0).toLocaleString('ro-RO')} RON`
                      : '—'}
                  </span>
                </div>
              </div>
              <div className="border-t border-zinc-800 mt-3 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-zinc-300">Total</span>
                <span className="text-lg font-bold text-sky-400">
                  {build.totalPrice.toLocaleString('ro-RO')} RON
                </span>
              </div>
              <Button
                className="w-full mt-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold h-9 gap-2 text-xs"
                disabled={filledSlots === 0}
                onClick={handleAddAllToCart}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Adaugă tot în coș
              </Button>
            </div>

            {/* Compatibility */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Compatibilitate</h2>
              {filledSlots < 2 ? (
                <div className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-zinc-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-zinc-600">Selectează cel puțin 2 componente pentru verificare.</p>
                </div>
              ) : build.isCompatible && warnIssues.length === 0 ? (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-500">Toate componentele sunt compatibile!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {errIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 bg-red-500/5 rounded p-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-red-400">{issue}</p>
                    </div>
                  ))}
                  {warnIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 bg-rose-500/5 rounded p-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-sky-400">{issue}</p>
                    </div>
                  ))}
                  {build.isCompatible && errIssues.length === 0 && (
                    <div className="flex items-start gap-2 mt-1">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-emerald-500">Compatibil (cu atenționări)</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Saved builds */}
            {savedBuilds.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Build-uri salvate</h2>
                <div className="space-y-2">
                  {savedBuilds.map((b) => (
                    <div key={b.id} className="flex items-center justify-between bg-zinc-800/50 rounded p-2.5">
                      <div>
                        <p className="text-xs text-zinc-200 font-medium">{b.name}</p>
                        <p className="text-[10px] text-zinc-600">{b.totalPrice.toLocaleString('ro-RO')} RON</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-sky-400 hover:bg-zinc-700" onClick={() => loadBuild(b.id)}>
                          Încarcă
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-zinc-600 hover:text-red-400 hover:bg-zinc-700" onClick={() => deleteBuild(b.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
