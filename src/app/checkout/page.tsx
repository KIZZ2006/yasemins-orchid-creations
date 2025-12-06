"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Download, CreditCard, Smartphone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { PayPalButton } from '@/components/PayPalButton';
import { UpiPayment } from '@/components/UpiPayment';

type PaymentMethod = 'paypal' | 'upi';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [verifying, setVerifying] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('paypal');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  // Verify all items are still available before allowing checkout
  useEffect(() => {
    const verifyAvailability = async () => {
      if (items.length === 0) {
        router.push('/cart');
        return;
      }

      setVerifying(true);
      let hasUnavailable = false;

      for (const item of items) {
        try {
          const response = await fetch(`/api/products?id=${item.id}`);
          const product = await response.json();
          
          if (product.isSold === 1) {
            hasUnavailable = true;
            toast.error(`"${product.title}" is no longer available`);
          }
        } catch (error) {
          console.error('Error verifying product:', error);
        }
      }

      if (hasUnavailable) {
        toast.error('Some items are no longer available. Redirecting to cart...');
        setTimeout(() => router.push('/cart'), 2000);
        return;
      }

      setVerifying(false);
    };

    verifyAvailability();
  }, [items, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isFormValid = () => {
    return formData.customerName && formData.customerEmail;
  };

  const handlePayPalSuccess = async (paypalOrderId: string, captureId: string) => {
    setProcessingOrder(true);
    
    try {
      // Create order in database
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          shippingAddress: 'Digital Delivery',
          total: total(),
          items: JSON.stringify(items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          }))),
          paymentMethod: 'paypal',
          paymentStatus: 'completed',
          paymentId: captureId,
          status: 'paid',
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        if (orderData.code === 'PRODUCT_ALREADY_SOLD') {
          toast.error(orderData.error);
          setTimeout(() => router.push('/cart'), 2000);
          return;
        }
        throw new Error(orderData.error || 'Failed to create order');
      }

      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/order-confirmation?orderNumber=${orderData.orderNumber}`);
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Payment succeeded but order creation failed. Please contact support with PayPal transaction ID: ' + captureId);
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleUpiSuccess = async (transactionId: string) => {
    setProcessingOrder(true);
    
    try {
      // Create order with pending status
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          shippingAddress: 'Digital Delivery',
          total: total(),
          items: JSON.stringify(items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          }))),
          paymentMethod: 'upi',
          paymentStatus: 'pending',
          paymentId: transactionId,
          status: 'pending',
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        if (orderData.code === 'PRODUCT_ALREADY_SOLD') {
          toast.error(orderData.error);
          setTimeout(() => router.push('/cart'), 2000);
          return;
        }
        throw new Error(orderData.error || 'Failed to create order');
      }

      clearCart();
      toast.success('Payment submitted! We will verify and process your order shortly.');
      router.push(`/order-confirmation?orderNumber=${orderData.orderNumber}`);
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order. Please contact support with transaction ID: ' + transactionId);
    } finally {
      setProcessingOrder(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error('Payment failed: ' + error);
  };

  if (verifying) {
    return (
      <div className="min-h-screen scanline">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">VERIFYING ITEM AVAILABILITY...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen scanline">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 neon-text-cyan">SECURE CHECKOUT</h1>

        {/* Digital Delivery Notice */}
        <Alert className="mb-8 border-primary/30 bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
          <AlertDescription>
            <span className="font-bold text-primary">DIGITAL PRODUCT:</span> You will receive instant download links via email after purchase. No physical shipping required.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <div className="bg-card/50 cyber-border p-6">
              <h2 className="text-2xl font-bold mb-6 neon-text-magenta">CONTACT INFORMATION</h2>
              <p className="text-sm text-muted-foreground mb-4">
                We'll send your download links to this email address
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName" className="text-sm font-semibold tracking-wider">FULL NAME *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="JOHN DOE"
                    className="mt-1 bg-input border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail" className="text-sm font-semibold tracking-wider">EMAIL ADDRESS *</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="mt-1 bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ✉️ Download links will be sent here immediately after payment
                  </p>
                </div>
                <div>
                  <Label htmlFor="customerPhone" className="text-sm font-semibold tracking-wider">PHONE NUMBER (OPTIONAL)</Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1 bg-input border-border"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-card/50 cyber-border p-6">
              <h2 className="text-2xl font-bold mb-6 neon-text-magenta">SELECT PAYMENT METHOD</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('paypal')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'paypal'
                      ? 'border-primary bg-primary/10 neon-glow-cyan'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <CreditCard className={`h-8 w-8 mx-auto mb-2 ${
                    selectedPaymentMethod === 'paypal' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <p className={`font-bold text-sm ${
                    selectedPaymentMethod === 'paypal' ? 'neon-text-cyan' : 'text-muted-foreground'
                  }`}>
                    PAYPAL
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">International</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'upi'
                      ? 'border-accent bg-accent/10 neon-glow-magenta'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <Smartphone className={`h-8 w-8 mx-auto mb-2 ${
                    selectedPaymentMethod === 'upi' ? 'text-accent' : 'text-muted-foreground'
                  }`} />
                  <p className={`font-bold text-sm ${
                    selectedPaymentMethod === 'upi' ? 'neon-text-magenta' : 'text-muted-foreground'
                  }`}>
                    UPI
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">India Only</p>
                </button>
              </div>

              {!isFormValid() && (
                <Alert className="mb-4 border-yellow-500/50 bg-yellow-950/20">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-sm text-yellow-300">
                    PLEASE FILL IN ALL REQUIRED FIELDS ABOVE BEFORE PROCEEDING WITH PAYMENT.
                  </AlertDescription>
                </Alert>
              )}

              {/* Payment Method Components */}
              {selectedPaymentMethod === 'paypal' && (
                <div>
                  <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded">
                    <p className="text-sm text-primary font-semibold">
                      🔒 SECURE PAYPAL CHECKOUT - LIVE PAYMENTS ENABLED
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay securely with PayPal. Your payment will be processed immediately.
                    </p>
                  </div>

                  <PayPalButton
                    amount={total().toString()}
                    description={`Purchase of ${items.length} digital artwork(s) from Yasemin's Creations`}
                    onSuccess={handlePayPalSuccess}
                    onError={handlePaymentError}
                    disabled={!isFormValid() || processingOrder}
                  />
                </div>
              )}

              {selectedPaymentMethod === 'upi' && (
                <UpiPayment
                  amount={total().toString()}
                  description={`Purchase of ${items.length} digital artwork(s) from Yasemin's Creations`}
                  onSuccess={handleUpiSuccess}
                  onError={handlePaymentError}
                  disabled={!isFormValid() || processingOrder}
                />
              )}
              
              {processingOrder && (
                <div className="mt-4 text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">PROCESSING YOUR ORDER...</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card/50 cyber-border p-6 sticky top-20">
              <h2 className="text-2xl font-bold mb-6 neon-text-cyan">ORDER SUMMARY</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.title} x{item.quantity}
                    </span>
                    <span className="font-semibold neon-text-cyan">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL</span>
                  <span className="neon-text-magenta">${total().toFixed(2)}</span>
                </div>
              </div>

              <Alert className="border-primary/30 bg-primary/5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-xs">
                  🔒 SECURE CHECKOUT. EACH DIGITAL ARTWORK CAN ONLY BE PURCHASED ONCE.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}