"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b-2 border-primary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold neon-text-cyan tracking-wider">
            YASEMIN<span className="neon-text-magenta">.</span>CYBER
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-semibold tracking-wide">
              HOME
            </Link>
            <Link href="/gallery" className="text-foreground hover:text-primary transition-colors font-semibold tracking-wide">
              GALLERY
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors font-semibold tracking-wide">
              ABOUT
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors font-semibold tracking-wide">
              CONTACT
            </Link>
            <Link href="/admin/login" className="text-accent hover:text-accent/80 transition-colors font-semibold tracking-wide flex items-center gap-1">
              <Shield className="h-4 w-4" />
              ADMIN
            </Link>
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative border-2 border-primary/50 hover:border-primary hover:bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center neon-glow-magenta">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-primary/30 bg-card/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              className="block text-foreground hover:text-primary transition-colors font-semibold tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              HOME
            </Link>
            <Link
              href="/gallery"
              className="block text-foreground hover:text-primary transition-colors font-semibold tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              GALLERY
            </Link>
            <Link
              href="/about"
              className="block text-foreground hover:text-primary transition-colors font-semibold tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              ABOUT
            </Link>
            <Link
              href="/contact"
              className="block text-foreground hover:text-primary transition-colors font-semibold tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              CONTACT
            </Link>
            <Link
              href="/admin/login"
              className="block text-accent hover:text-accent/80 transition-colors font-semibold tracking-wide flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield className="h-4 w-4" />
              ADMIN
            </Link>
            <Link
              href="/cart"
              className="block text-foreground hover:text-primary transition-colors font-semibold tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              CART {cartCount > 0 && <span className="neon-text-magenta">({cartCount})</span>}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}