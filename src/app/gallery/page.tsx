"use client";

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function GalleryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set page metadata dynamically
    document.title = "Art Gallery - Browse All Artworks | Yasemin's Creations";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Browse our complete collection of exclusive one-time digital artworks. Each piece is sold only once.');
    }
  }, []);

  useEffect(() => {
    // Fetch categories with error handling
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        // Check if response is an array (success) or error object
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('Categories API error:', data);
          setCategories([]); // Set empty array on error
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        setCategories([]); // Set empty array on error
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = '/api/products?status=published&limit=50';
    
    if (selectedCategory !== 'all') {
      url += `&category=${selectedCategory}`;
    }
    
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }

    if (showAvailableOnly) {
      url += `&availableOnly=true`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Check if response is an array (success) or error object
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Products API error:', data);
          setProducts([]);
          setError(data.error || 'Failed to load products');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setProducts([]);
        setError('Failed to load products');
        setLoading(false);
      });
  }, [selectedCategory, searchQuery, showAvailableOnly]);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Art Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our collection of exclusive digital artworks - each piece sold only once
          </p>
        </div>

        {/* Database Error Warning */}
        {error && error.includes('database') && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive rounded-lg text-center">
            <p className="text-destructive font-semibold">⚠️ Database Connection Error</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please set up your Turso database to view artworks. See conversation history for setup instructions.
            </p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search artworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'orchid-gradient text-white' : ''}
            >
              All
            </Button>
            {Array.isArray(categories) && categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.name)}
                className={selectedCategory === category.name ? 'orchid-gradient text-white' : ''}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Availability Filter */}
          <div className="flex justify-center">
            <Button
              variant={showAvailableOnly ? 'default' : 'outline'}
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={showAvailableOnly ? 'orchid-gradient text-white' : ''}
            >
              {showAvailableOnly ? '✓ Available Only' : 'Show Available Only'}
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-96" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">No artworks found</p>
            <p className="text-muted-foreground mt-2">
              {error ? 'Database connection issue. Please check your setup.' : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}