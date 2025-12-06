import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t-2 border-primary/50 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,255,255,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,0,255,0.05),transparent_50%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-6 w-6 neon-text animate-pulse" />
              <h3 className="text-lg font-bold text-gradient uppercase tracking-wider">Yasemin's Creations</h3>
            </div>
            <p className="text-muted-foreground mb-4 font-light">
              Handcrafted digital artworks from the neon underground. Bringing cyberpunk beauty to your space.
            </p>
            
            <div className="flex gap-3">
              <a
                href="https://facebook.com/yaseminscreations"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-2 border-primary/50 hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-primary" />
              </a>
              <a
                href="https://instagram.com/yaseminscreations"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/10 flex items-center justify-center transition-all hover:shadow-[0_0_15px_rgba(255,0,255,0.5)]"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-secondary" />
              </a>
              <a
                href="https://twitter.com/yaseminscreate"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-2 border-accent/50 hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all hover:shadow-[0_0_15px_rgba(176,38,255,0.5)]"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-accent" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:neon-text transition-colors uppercase text-xs tracking-wider">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-muted-foreground hover:neon-text transition-colors uppercase text-xs tracking-wider">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:neon-text transition-colors uppercase text-xs tracking-wider">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:neon-text transition-colors uppercase text-xs tracking-wider">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/gallery" className="text-muted-foreground hover:neon-text transition-colors uppercase text-xs tracking-wider">
                  All Artworks
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-muted-foreground hover:neon-text transition-colors uppercase text-xs tracking-wider">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted-foreground hover:neon-text transition-colors uppercase text-xs tracking-wider">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Contact</h4>
            <div className="space-y-2">
              <a 
                href="mailto:contact@yaseminscreations.com" 
                className="flex items-center gap-2 text-muted-foreground hover:neon-text transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">contact@yaseminscreations.com</span>
              </a>
              <p className="text-muted-foreground text-xs mt-4 font-light">
                Follow us for updates, new artworks, and exclusive offers from the digital underground!
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t-2 border-primary/30 mt-8 pt-8 text-center text-muted-foreground">
          <p className="uppercase tracking-wider text-xs font-bold">&copy; {new Date().getFullYear()} Yasemin's Creations. All rights reserved.</p>
          <p className="text-xs mt-2 font-light">Made with <span className="neon-text">⚡</span> for digital art lovers everywhere</p>
        </div>
      </div>
    </footer>
  );
}