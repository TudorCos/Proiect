import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Product } from '@/types';
import { getCategoryIcon } from '@/lib/constants';

import { RatingStars } from '@/components/ui/rating-stars';

interface ProductCardProps {
  product: Product;
  isAdded?: boolean;
  onAddToCart?: (id: string) => void;
  hideAddButton?: boolean;
}

export function ProductCard({ product, isAdded = false, onAddToCart, hideAddButton = false }: ProductCardProps) {
  return (
    <Card className="group bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden flex flex-col h-full">
      <Link to={`/products/${product.id}`}>
        <div className="relative bg-zinc-800/50 flex items-center justify-center h-36 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">
              {getCategoryIcon(product.category)}
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="absolute top-2 right-2 bg-zinc-700 text-zinc-300 border-0 text-[10px]">
              Stoc: {product.stock}
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500/10 text-red-400 border-0 text-[10px]">
              Indisponibil
            </Badge>
          )}
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] text-sky-400 uppercase font-medium">{product.brand}</p>
        <Link to={`/products/${product.id}`}>
          <p className="text-xs text-zinc-300 font-medium line-clamp-2 leading-relaxed mt-0.5 min-h-[2.5rem] hover:text-zinc-100 transition-colors">
            {product.name}
          </p>
        </Link>
        <div className="mt-1.5">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={12} textSizeClass="text-[10px] text-zinc-500" />
        </div>
        <div className="mt-auto pt-2 flex items-end justify-between">
          <div>
            <span className="text-base font-bold text-zinc-100">
              {product.price.toLocaleString('ro-RO')}
            </span>
            <span className="text-[10px] text-zinc-500 ml-1">RON</span>
          </div>
          {!hideAddButton && onAddToCart && (
            <Button
              size="sm"
              className={`h-7 px-2 text-[10px] gap-1 transition-all ${
                isAdded
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(product.id);
              }}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-3 w-3" />
              {isAdded ? '✓' : 'Adaugă'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
