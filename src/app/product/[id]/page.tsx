"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, ArrowLeft, Package, Download, Shield, Zap, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import ContentProtection from '@/components/ContentProtection';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface Product {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  dimensions?: string;
  medium?: string;
  isSold?: number;
  soldAt?: number;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`/api/products?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching product:', error);
        setLoading(false);
      });
  }, [params.id]);

  const isProductSold = product?.isSold === 1;

  const handleAddToCart = () => {
    if (product) {
      if (isProductSold) {
        toast.error('This artwork has already been sold');
        return;
      }
      
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
      });
      toast.success('Added to cart!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-muted rounded-lg h-[600px]" />
              <div className="space-y-4">
                <div className="bg-muted h-8 w-3/4 rounded" />
                <div className="bg-muted h-6 w-1/4 rounded" />
                <div className="bg-muted h-32 w-full rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => router.push('/gallery')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ContentProtection />
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {isProductSold && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200 font-medium">
              This artwork has been sold and is no longer available for purchase.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image with protection */}
          <div className="relative aspect-square rounded-lg overflow-hidden border border-border select-none bg-muted">
            {isProductSold && (
              <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                SOLD
              </div>
            )}
            {!imageError ? (
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className={`object-cover pointer-events-none ${isProductSold ? 'opacity-60 grayscale' : ''}`}
                priority
                unoptimized
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onError={() => setImageError(true)}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground">Image unavailable</p>
              </div>
            )}
            {isProductSold && !imageError && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">SOLD OUT</span>
              </div>
            )}
            {/* Watermark overlay */}
            {!imageError && (
              <div className="absolute inset-0 pointer-events-none select-none" style={{
                background: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(221, 160, 221, 0.03) 100px, rgba(221, 160, 221, 0.03) 200px)',
              }} />
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.category}
              </p>
              <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
              <p className="text-3xl font-bold text-primary mb-4">${product.price}</p>
              
              {/* Availability Badge */}
              {!isProductSold ? (
                <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Available Now - One of a Kind
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <AlertCircle className="w-4 h-4" />
                  Sold Out - No Longer Available
                </div>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-lg text-muted-foreground">{product.description}</p>
            </div>

            {/* Digital Delivery Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
              <div className="text-center">
                <Download className="h-8 w-8 mx-auto mb-2 text-primary neon-text-cyan" />
                <p className="text-xs font-medium">Instant Download</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary neon-text-cyan" />
                <p className="text-xs font-medium">Secure Payment</p>
              </div>
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-primary neon-text-cyan" />
                <p className="text-xs font-medium">High Resolution</p>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              {product.dimensions && (
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary neon-text-cyan" />
                  <div>
                    <p className="font-semibold">File Format</p>
                    <p className="text-muted-foreground">High-resolution digital file ({product.dimensions})</p>
                  </div>
                </div>
              )}
              
              {product.medium && (
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary neon-text-cyan" />
                  <div>
                    <p className="font-semibold">Creation Method</p>
                    <p className="text-muted-foreground">{product.medium}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-primary neon-text-cyan" />
                <div>
                  <p className="font-semibold">Digital Delivery</p>
                  <p className="text-muted-foreground">Instant access via email after purchase - download link valid for 30 days</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary neon-text-magenta" />
                <div>
                  <p className="font-semibold">Exclusivity</p>
                  <p className="text-muted-foreground">One-time purchase only - Once sold, never available again</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-6">
              {!isProductSold ? (
                <>
                  <Button
                    size="lg"
                    className="w-full neon-button bg-transparent hover:bg-primary hover:text-primary-foreground text-lg py-6 neon-glow-cyan"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart - ${product.price}
                  </Button>
                  <Button
                    size="lg"
                    className="w-full border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all"
                    onClick={() => {
                      handleAddToCart();
                      router.push('/cart');
                    }}
                  >
                    Buy Now
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  className="w-full text-lg py-6"
                  disabled
                  variant="secondary"
                >
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Sold Out - No Longer Available
                </Button>
              )}
            </div>

            {/* Social Share */}
            <div className="pt-6 border-t border-border">
              <SocialShare 
                url={`/product/${product.id}`}
                title={product.title}
                description={product.description}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}