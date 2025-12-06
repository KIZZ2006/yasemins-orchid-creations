"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Testimonials from '@/components/Testimonials';
import NewsletterSignup from '@/components/NewsletterSignup';

interface Product {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  status: string;
  isSold?: number;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?status=published&limit=6')
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setFeaturedProducts([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen scanline">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-6 w-6 neon-text-cyan" />
              <span className="neon-text-cyan font-bold tracking-widest text-sm">EXCLUSIVE DIGITAL ART</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight glitch neon-text-cyan" data-text="YASEMIN'S CREATIONS">
              YASEMIN'S CREATIONS
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground font-light">
              Enter the digital realm. Unique cyber artworks - each piece exists only once. 
              Own something truly <span className="neon-text-magenta font-semibold">EXCLUSIVE</span> in the metaverse.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/gallery">
                <Button size="lg" className="neon-button bg-transparent hover:bg-primary hover:text-primary-foreground neon-glow-cyan">
                  EXPLORE GALLERY
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all">
                  LEARN MORE
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-text-cyan">FEATURED ARTWORKS</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Curated digital masterpieces from the cyber realm - each available <span className="neon-text-magenta">ONLY ONCE</span>
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-muted animate-pulse h-96 cyber-border" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground mb-4">No artworks available yet</p>
            <p className="text-muted-foreground">Check back soon for exclusive digital creations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        {featuredProducts.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/gallery">
              <Button size="lg" className="neon-button bg-transparent hover:bg-primary hover:text-primary-foreground">
                VIEW ALL ARTWORKS
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* About Preview */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] overflow-hidden cyber-border bg-gradient-to-br from-primary/20 to-accent/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <Zap className="h-20 w-20 neon-text-cyan mx-auto mb-4" />
                  <p className="neon-text-cyan text-xl font-bold tracking-widest">DIGITAL ARTISTRY</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6 neon-text-magenta">THE ARTIST'S MANIFESTO</h2>
              <p className="text-lg text-muted-foreground mb-6 font-light">
                Every piece you witness here is a unique creation - merging human creativity 
                with cutting-edge AI technology. Yasemin's Creations delivers exclusive digital artworks 
                that transcend reality and ignite emotions.
              </p>
              <p className="text-lg text-muted-foreground mb-8 font-light">
                Each artwork is sold <span className="neon-text-cyan font-semibold">ONLY ONCE</span>, making your acquisition truly one-of-a-kind. 
                Once claimed, it vanishes from the marketplace forever, ensuring ultimate exclusivity for collectors.
              </p>
              <Link href="/about">
                <Button size="lg" className="neon-button bg-transparent hover:bg-accent hover:text-accent-foreground neon-glow-magenta">
                  DISCOVER THE ARTIST
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="container mx-auto px-4 py-20">
        <NewsletterSignup />
      </section>

      <Footer />
    </div>
  );
}