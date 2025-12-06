"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Image from 'next/image';

export default function AdminUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const authChecked = useRef(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    category: '',
    dimensions: '',
    medium: '',
    status: 'published',
  });

  useEffect(() => {
    // Only check auth once
    if (!authChecked.current) {
      authChecked.current = true;
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Only redirect on 401 Unauthorized, not on network errors
      if (response.status === 401) {
        console.log('Token invalid (401), redirecting to login');
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }

      if (!response.ok) {
        console.error('Auth verification failed with status:', response.status);
        // Don't redirect on network errors, just show error
        toast.error('Authentication check failed. Please try again.');
        setAuthenticated(true); // Allow user to continue and retry
        return;
      }

      // Auth successful
      console.log('Auth verified successfully');
      setAuthenticated(true);
      loadCategories();
    } catch (error) {
      console.error('Auth check error:', error);
      // On network error, don't log out - just show error and allow retry
      toast.error('Network error. Please check your connection.');
      setAuthenticated(true); // Allow user to continue
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const calculateAutoPrice = (title: string, category: string) => {
    // Auto-pricing algorithm based on category and complexity
    const basePrice = 50;
    const categoryMultipliers: Record<string, number> = {
      'Watercolor': 1.5,
      'Digital Art': 2.0,
      'Acrylic Painting': 2.5,
      'Pencil Sketch': 1.0,
    };
    
    const multiplier = categoryMultipliers[category] || 1.5;
    const titleLength = title.length;
    const complexityBonus = Math.floor(titleLength / 10) * 5;
    
    return Math.round(basePrice * multiplier + complexityBonus);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        setPreview(data.url);
        toast.success('Image uploaded successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setPreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify token exists before submitting
    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Session expired. Please login again.');
      router.push('/admin/login');
      return;
    }

    setLoading(true);

    try {
      // Auto-calculate price if not set
      let price = parseFloat(formData.price);
      if (!price || price === 0) {
        price = calculateAutoPrice(formData.title, formData.category);
        toast.info(`Auto-calculated price: $${price}`);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price,
        }),
      });

      // Handle 401 specifically
      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }

      if (response.ok) {
        toast.success('Product created successfully!');
        // Small delay to ensure toast is visible before navigation
        setTimeout(() => {
          router.push('/admin/products');
        }, 500);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/admin')}>← Back</Button>
          <h1 className="text-2xl font-bold inline-block ml-4">Upload New Artwork</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <Label className="mb-2 block">Upload Image *</Label>
            
            {!preview ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-1">
                      {uploading ? 'Uploading...' : 'Drop your image here, or click to browse'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports JPG, PNG, WebP, GIF (max 10MB)
                    </p>
                  </div>
                </label>
                
                {uploading && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium">Uploading...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Image uploaded successfully
                </p>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Beautiful Sunset"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A beautiful artwork description..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                     <SelectItem value="AI Image">AI Image</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Auto-calculated"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty for auto-pricing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                    placeholder="16x20 inches"
                  />
                </div>

                <div>
                  <Label htmlFor="medium">Medium</Label>
                  <Input
                    id="medium"
                    value={formData.medium}
                    onChange={(e) => setFormData(prev => ({ ...prev, medium: e.target.value }))}
                    placeholder="Watercolor on paper"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 orchid-gradient text-white"
              disabled={loading || uploading || !formData.imageUrl}
            >
              <Upload className="mr-2 h-4 w-4" />
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}