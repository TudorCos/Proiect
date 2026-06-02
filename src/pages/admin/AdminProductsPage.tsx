import { useState, useEffect } from 'react';
import { Package, Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/ui/rating-stars';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Product, ProductCategory } from '@/types';

import { CATEGORY_LABELS, getCategoryLabel } from '@/lib/constants';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ProductCategory | ''>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState<string>('CPU');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.id.includes(q);
    const matchCategory = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const openCreate = () => {
    setFormName(''); setFormBrand(''); setFormCategory('CPU');
    setFormPrice(''); setFormStock(''); setFormDescription('');
    setFormImage('');
    setEditingProduct(null); setIsCreating(true);
  };

  const openEdit = (product: Product) => {
    setFormName(product.name); setFormBrand(product.brand);
    setFormCategory(product.category); setFormPrice(product.price.toString());
    setFormStock(product.stock.toString()); setFormDescription(product.description);
    setFormImage(product.image);
    setEditingProduct(product); setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formName || !formBrand || !formPrice || !formStock) return;

    const payload = {
      name: formName,
      brand: formBrand,
      category: formCategory,
      price: Number(formPrice),
      stock: Number(formStock),
      description: formDescription,
      image: formImage || '',
      specs: editingProduct?.specs || {},
      rating: editingProduct?.rating || 0,
      reviewCount: editingProduct?.reviewCount || 0,
      featured: editingProduct?.featured || false,
      createdAt: editingProduct?.createdAt || new Date().toISOString()
    };

    try {
      if (editingProduct) {
        const res = await fetch(`http://localhost:5216/api/Products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload })
        });
        if (res.ok) {
          fetchProducts();
        }
      } else {
        const res = await fetch('http://localhost:5216/api/Products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          fetchProducts();
        }
      }
    } catch (err) {
      console.error('Error saving product:', err);
    }

    setIsCreating(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest produs?')) return;
    try {
      const res = await fetch(`http://localhost:5216/api/Products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const categories = [...new Set(products.map((p) => p.category))].sort() as ProductCategory[];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500 text-xs">Se încarcă produsele...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-zinc-100">
          <Package className="h-4 w-4 inline mr-2 text-sky-400" />
          Produse
          <span className="text-xs text-zinc-500 font-normal ml-2">{products.length} total</span>
        </h1>
        <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white h-8 text-xs gap-1.5 font-semibold" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> Adaugă produs
        </Button>
      </div>

      {/* Create/Edit modal */}
      {isCreating && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">
              {editingProduct ? 'Editează produs' : 'Produs nou'}
            </h2>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-300" onClick={() => setIsCreating(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase">Nume</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1 h-8 bg-zinc-800 border-zinc-700 text-xs" placeholder="Nume produs" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase">Brand</Label>
              <Input value={formBrand} onChange={(e) => setFormBrand(e.target.value)} className="mt-1 h-8 bg-zinc-800 border-zinc-700 text-xs" placeholder="Brand" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase">Categorie</Label>
              <input
                list="category-suggestions"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="mt-1 w-full h-8 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 px-2 outline-none focus:ring-1 focus:ring-sky-400/30"
                placeholder="Scrie sau alege o categorie..."
              />
              <datalist id="category-suggestions">
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
                {categories.filter(c => !CATEGORY_LABELS[c]).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </datalist>
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase">Preț (RON)</Label>
              <Input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="mt-1 h-8 bg-zinc-800 border-zinc-700 text-xs" placeholder="0" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase">Stoc</Label>
              <Input type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} className="mt-1 h-8 bg-zinc-800 border-zinc-700 text-xs" placeholder="0" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase">Descriere</Label>
              <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="mt-1 h-8 bg-zinc-800 border-zinc-700 text-xs" placeholder="Descriere produs" />
            </div>
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase">Imagine (cale/URL)</Label>
              <Input value={formImage} onChange={(e) => setFormImage(e.target.value)} className="mt-1 h-8 bg-zinc-800 border-zinc-700 text-xs" placeholder="/images/products/..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white h-8 text-xs font-semibold" onClick={handleSave}>
              {editingProduct ? 'Salvează modificările' : 'Creează produs'}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-500" onClick={() => setIsCreating(false)}>
              Anulează
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută produs sau ID..."
            className="pl-8 h-8 bg-zinc-900 border-zinc-800 text-xs"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ProductCategory | '')}
          className="h-8 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 px-2"
        >
          <option value="">Toate categoriile</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[60px_1fr_100px_100px_80px_80px_80px] gap-2 px-4 py-2.5 text-[10px] text-zinc-600 uppercase tracking-wider border-b border-zinc-800 bg-zinc-900">
          <span>ID</span>
          <span>Produs</span>
          <span>Categorie</span>
          <span className="text-right">Preț</span>
          <span className="text-right">Stoc</span>
          <span className="text-center">Rating</span>
          <span className="text-center">Acțiuni</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-800/50">
          {filtered.map((product) => (
            <div key={product.id} className="grid md:grid-cols-[60px_1fr_100px_100px_80px_80px_80px] gap-2 px-4 py-2.5 items-center hover:bg-zinc-800/20 transition-colors">
              <span className="text-[10px] text-zinc-600 font-mono truncate">{product.id.slice(0, 8)}</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm opacity-50">📦</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-sky-400 uppercase">{product.brand}</p>
                  <p className="text-xs text-zinc-200 truncate">{product.name}</p>
                </div>
              </div>
              <Badge className="w-fit text-[10px] bg-zinc-800 text-zinc-400 border-zinc-700">
                {product.category}
              </Badge>
              <span className="text-xs text-zinc-200 font-medium text-right">{product.price.toLocaleString('ro-RO')}</span>
              <span className={`text-xs text-right font-medium ${product.stock <= 5 ? 'text-red-400' : product.stock <= 15 ? 'text-sky-400' : 'text-zinc-300'}`}>
                {product.stock}
              </span>
              <div className="flex justify-center">
                <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={10} showScoreText={false} />
              </div>
              <div className="flex justify-center gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-zinc-500 hover:text-sky-400 hover:bg-zinc-800" onClick={() => openEdit(product)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-zinc-500 hover:text-red-400 hover:bg-zinc-800" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-zinc-600">Niciun produs găsit.</div>
        )}
      </div>
    </div>
  );
}
