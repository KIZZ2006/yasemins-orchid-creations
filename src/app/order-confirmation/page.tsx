"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: number;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('orderNumber');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) {
      router.push('/');
      return;
    }

    // In a real app, you'd fetch by order number
    // For now, we'll show a success message
    setLoading(false);
  }, [orderNumber, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6 neon-glow-cyan">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-4xl font-bold mb-4 neon-text-cyan">ORDER CONFIRMED!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Thank you for your purchase. Your digital artwork is ready for download.
        </p>

        <div className="bg-card/50 cyber-border p-8 mb-8">
          <div className="grid gap-4 text-left">
            <div>
              <span className="text-muted-foreground text-sm tracking-wider">ORDER NUMBER</span>
              <p className="font-bold text-lg neon-text-magenta">{orderNumber}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm tracking-wider">STATUS</span>
              <p className="font-semibold text-primary">COMPLETED ✓</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-primary/5 cyber-border rounded-lg p-6">
            <Mail className="h-8 w-8 neon-text-cyan mb-3 mx-auto" />
            <h3 className="font-bold mb-2 tracking-wide">CHECK YOUR EMAIL</h3>
            <p className="text-sm text-muted-foreground">
              Download links have been sent to your email address. Check your inbox (and spam folder).
            </p>
          </div>

          <div className="bg-accent/5 cyber-border rounded-lg p-6">
            <Download className="h-8 w-8 neon-text-magenta mb-3 mx-auto" />
            <h3 className="font-bold mb-2 tracking-wide">INSTANT ACCESS</h3>
            <p className="text-sm text-muted-foreground">
              Your high-resolution digital files are ready. Download links valid for 30 days.
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚡ EXCLUSIVE:</strong> This artwork is now permanently removed from the marketplace. You own the only copy!
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/gallery">
            <Button size="lg" className="neon-button bg-transparent hover:bg-primary hover:text-primary-foreground neon-glow-cyan">
              EXPLORE MORE ARTWORKS
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all">
              BACK TO HOME
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen scanline">
      <Navbar />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">Loading order details...</div>
        </div>
      }>
        <OrderConfirmationContent />
      </Suspense>
      <Footer />
    </div>
  );
}