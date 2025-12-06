"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [soldItems, setSoldItems] = useState<number[]>([]);
  const [checking, setChecking] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Check if any items have been sold
  useEffect(() => {
    const checkAvailability = async () => {
      setChecking(true);
      const soldItemIds: number[] = [];
      
      for (const item of items) {
        try {
          const response = await fetch(`/api/products?id=${item.id}`);
          const product = await response.json();
          
          if (product.isSold === 1) {
            soldItemIds.push(item.id);
          }
        } catch (error) {
          console.error('Error checking product:', error);
        }
      }
      
      setSoldItems(soldItemIds);
      setChecking(false);
      
      // Notify user about sold items
      if (soldItemIds.length > 0) {
        toast.error(`${soldItemIds.length} item(s) in your cart have been sold to someone else`);
      }
    };
    
    if (items.length > 0) {
      checkAvailability();
    } else {
      setChecking(false);
    }
  }, [items.length]);

  const subtotal = total();
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal - discountAmount;
  const hasUnavailableItems = soldItems.length > 0;

  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    try {
      const response = await fetch(`/api/discount-codes?validate=true&code=${discountCode.trim()}`);
      const data = await response.json();

      if (data.valid) {
        setDiscount(data.discountPercent);
        setDiscountApplied(true);
        toast.success(`${data.discountPercent}% discount applied!`);
      } else {
        toast.error(data.reason || 'Invalid discount code');
        setDiscount(0);
        setDiscountApplied(false);
      }
    } catch (error) {
      toast.error('Failed to validate discount code');
    }
  };

  const removeSoldItems = () => {
    soldItems.forEach(id => removeItem(id));
    toast.success('Unavailable items removed from cart');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any artworks to your cart yet.
          </p>
          <Button onClick={() => router.push('/gallery')} className="orchid-gradient text-white">
            Browse Gallery
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {hasUnavailableItems && (
          <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Some items are no longer available.</strong> These artworks have been sold to other customers.
              Please remove them to continue checkout.
              <Button 
                variant="outline" 
                size="sm" 
                onClick={removeSoldItems}
                className="ml-4 border-red-600 text-red-600 hover:bg-red-100"
              >
                Remove Unavailable Items
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const isSold = soldItems.includes(item.id);
              const hasImageError = imageErrors[item.id];
              return (
                <div 
                  key={item.id} 
                  className={`bg-card border rounded-lg p-4 flex gap-4 ${
                    isSold ? 'border-red-500 opacity-60' : 'border-border'
                  }`}
                >
                  <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-muted">
                    {!hasImageError ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className={`object-cover ${isSold ? 'grayscale' : ''}`}
                        unoptimized
                        onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                    {isSold && !hasImageError && (
                      <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">SOLD</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-1">
                      {item.title}
                      {isSold && (
                        <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                          (No longer available)
                        </span>
                      )}
                    </h3>
                    <p className="text-primary font-bold">${item.price}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {!isSold && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              onClick={() => clearCart()}
              className="w-full"
            >
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {discountApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Discount Code</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={discountApplied}
                  />
                  <Button
                    onClick={applyDiscount}
                    variant="outline"
                    disabled={discountApplied}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <Button
                className="w-full orchid-gradient text-white hover:orchid-glow"
                size="lg"
                onClick={() => router.push('/checkout')}
                disabled={hasUnavailableItems || checking}
              >
                {checking ? 'Checking availability...' : hasUnavailableItems ? 'Remove unavailable items' : 'Proceed to Checkout'}
              </Button>

              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => router.push('/gallery')}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}