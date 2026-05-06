import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store';
import type { Product, ProductCategory, SortOption } from '@/types';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/constants';
import { ProductCard } from '@/components/product/ProductCard';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'price-asc', label: 'Preț crescător' },
  { value: 'price-desc', label: 'Preț descrescător' },
  { value: 'name-asc', label: 'Nume A-Z' },
  { value: 'name-desc', label: 'Nume Z-A' },
  { value: 'rating-desc', label: 'Rating' },
  { value: 'newest', label: 'Cele mai noi' },
];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const addItem = useCartStore((s) => s.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state from URL
  const urlCategory = searchParams.get('category') as ProductCategory | null;
  const urlSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(urlCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
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

  // Compute derived filters
  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products]);
  const allCategories = useMemo(() => [...new Set(products.map((p) => p.category))].sort() as ProductCategory[], [products]);

  // Sync state with URL params when they change externally (e.g. from navbar)
  useEffect(() => {
    // If we're passed the resetFilters flag, reset all local non-URL states too
    if (location.state?.resetFilters) {
      setSearch('');
      setSelectedCategory(null);
      setSelectedBrands([]);
      setInStockOnly(false);
      setSort('newest');
      // Clear the search params
      setSearchParams({}, { replace: true });
      // Clear state so it doesn't trigger again
      window.history.replaceState({}, '');
      return;
    }

    setSearch(urlSearch);
    setSelectedCategory(urlCategory);
  }, [urlSearch, urlCategory, location.state, setSearchParams]);

  const filteredProducts = useMemo(() => {
    let results = [...products];

    // Search
    const q = search.toLowerCase().trim();
    if (q) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory) {
      results = results.filter((p) => p.category === selectedCategory);
    }

    // Brands
    if (selectedBrands.length > 0) {
      results = results.filter((p) => selectedBrands.includes(p.brand));
    }

    // In stock
    if (inStockOnly) {
      results = results.filter((p) => p.stock > 0);
    }

    // Sort
    switch (sort) {
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        results.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating-desc':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return results;
  }, [products, search, selectedCategory, selectedBrands, sort, inStockOnly]);

  const handleCategoryClick = (cat: ProductCategory | null) => {
    setSelectedCategory(cat);
    if (cat) {
      searchParams.set('category', cat);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams, { replace: true });
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addItem(product);
      setAddedIds((prev) => new Set(prev).add(productId));
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, 1500);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setSelectedBrands([]);
    setInStockOnly(false);
    setSort('newest');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = search || selectedCategory || selectedBrands.length > 0 || inStockOnly;

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Se încarcă produsele...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
              Produse
            </h1>
            <span className="text-xs text-zinc-600">
              {filteredProducts.length} din {products.length} produse
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 h-8 gap-1.5 md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtre
            </Button>
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 pl-3 pr-7 h-8 focus:outline-none focus:ring-1 focus:ring-sky-400/30 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Sidebar filters */}
          <aside className={`w-52 shrink-0 space-y-4 ${showFilters ? 'block' : 'hidden'} md:block`}>
            {/* Search */}
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1.5 block">
                Caută
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Caută produs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 bg-zinc-900 border-zinc-800 h-8 text-xs placeholder:text-zinc-600 focus-visible:ring-sky-400/30"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1.5 block">
                Categorie
              </label>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
                    !selectedCategory
                      ? 'bg-rose-500/10 text-sky-400 font-medium'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  Toate categoriile
                </button>
                {allCategories.map((cat) => {
                  const count = products.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                        selectedCategory === cat
                          ? 'bg-rose-500/10 text-sky-400 font-medium'
                          : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      }`}
                    >
                      <span>{CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}</span>
                      <span className="text-[10px] text-zinc-600">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1.5 block">
                Brand
              </label>
              <div className="space-y-0.5">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer rounded hover:bg-zinc-900"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="rounded border-zinc-700 bg-zinc-800 text-sky-400 focus:ring-sky-400/30 h-3 w-3"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="flex items-center gap-2 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-800 text-sky-400 focus:ring-sky-400/30 h-3 w-3"
                />
                Doar în stoc
              </label>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-zinc-500 hover:text-zinc-300 w-full justify-start gap-1.5 h-7"
                onClick={clearFilters}
              >
                <X className="h-3 w-3" />
                Resetează filtrele
              </Button>
            )}
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {/* Active filter tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedCategory && (
                  <Badge className="bg-sky-400/10 text-sky-400 border-sky-400/20 text-[10px] gap-1 cursor-pointer hover:bg-sky-400/20" onClick={() => handleCategoryClick(null)}>
                    {CATEGORY_LABELS[selectedCategory]} <X className="h-2.5 w-2.5" />
                  </Badge>
                )}
                {selectedBrands.map((b) => (
                  <Badge key={b} className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] gap-1 cursor-pointer hover:bg-zinc-700" onClick={() => toggleBrand(b)}>
                    {b} <X className="h-2.5 w-2.5" />
                  </Badge>
                ))}
                {search && (
                  <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] gap-1 cursor-pointer hover:bg-zinc-700" onClick={() => setSearch('')}>
                    "{search}" <X className="h-2.5 w-2.5" />
                  </Badge>
                )}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
                <p className="text-sm text-zinc-500">Nu s-au găsit produse.</p>
                <Button variant="ghost" size="sm" className="text-xs text-sky-400 mt-2" onClick={clearFilters}>
                  Resetează filtrele
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => {
                  const isAdded = addedIds.has(product.id);

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isAdded={isAdded}
                      onAddToCart={handleAddToCart}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
