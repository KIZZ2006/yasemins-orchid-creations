"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { useState } from 'react';

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  category: string;
  isSold?: number;
}

export default function ProductCard({ id, title, price, imageUrl, category, isSold }: ProductCardProps) {
  const { addItem } = useCart();
  const isProductSold = isSold === 1;
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isProductSold) {
      toast.error('This artwork has been claimed');
      return;
    }
    
    addItem({ id, title, price, imageUrl });
    toast.success('Added to cart!');
  };

  return (
    <Link href={`/product/${id}`}>
      <div className="group cyber-card overflow-hidden relative">
        {isProductSold && (
          <div className="absolute top-4 right-4 z-10 bg-destructive text-white px-3 py-1 text-sm font-bold shadow-lg neon-glow-magenta">
            CLAIMED
          </div>
        )}
        
        <div className="relative aspect-square overflow-hidden bg-muted">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className={`object-cover transition-transform duration-500 ${
                isProductSold ? 'opacity-40 grayscale' : 'group-hover:scale-110'
              }`}
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <p className="text-muted-foreground text-sm">Image unavailable</p>
            </div>
          )}
          {isProductSold && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold neon-text-magenta tracking-widest">SOLD OUT</span>
            </div>
          )}
          {!isProductSold && !imageError && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.2),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          )}
        </div>
        
        <div className="p-4 bg-gradient-to-br from-card to-card/80">
          <p className="text-xs text-primary uppercase tracking-widest mb-1 font-bold">{category}</p>
          <h3 className="font-bold text-lg mb-2 line-clamp-1 tracking-wide">{title}</h3>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold neon-text-cyan">${price}</span>
            <Button
              size="icon"
              variant="default"
              className={`border-2 border-primary bg-transparent hover:bg-primary hover:text-primary-foreground transition-all ${
                isProductSold ? 'opacity-30 cursor-not-allowed' : 'neon-glow-cyan'
              }`}
              onClick={handleAddToCart}
              disabled={isProductSold}
              aria-label={isProductSold ? 'Sold out' : 'Add to cart'}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}