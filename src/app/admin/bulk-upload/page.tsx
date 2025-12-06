"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageData {
  id: string;
  file: File;
  preview: string;
  uploadedUrl?: string;
  uploading?: boolean;
  uploaded?: boolean;
  title: string;
  description: string;
  category: string;
  price: string;
  dimensions: string;
  medium: string;
  status: string;
  expanded?: boolean;
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const authChecked = useRef(false);

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
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        console.log('Token verification failed, redirecting to login');
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
        return;
      }

      // Auth successful
      console.log('Auth verified successfully');
      setAuthenticated(true);
      loadCategories();
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
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

  const handleFiles = (files: FileList) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const newImages: ImageData[] = [];
    
    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        return;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large (max 10MB)`);
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const preview = URL.createObjectURL(file);
      
      newImages.push({
        id,
        file,
        preview,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: '',
        category: categories[0]?.name || '',
        price: '',
        dimensions: '',
        medium: '',
        status: 'published',
        expanded: true,
      });
    });

    setImages(prev => [...prev, ...newImages]);
    toast.success(`${newImages.length} images added`);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [categories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const updateImage = (id: string, updates: Partial<ImageData>) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const toggleExpanded = (id: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, expanded: !img.expanded } : img));
  };

  const uploadAllImages = async () => {
    setUploading(true);
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.uploaded) continue;

      updateImage(img.id, { uploading: true });

      try {
        const formData = new FormData();
        formData.append('file', img.file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          updateImage(img.id, { 
            uploadedUrl: data.url, 
            uploaded: true, 
            uploading: false 
          });
        } else {
          toast.error(`Failed to upload ${img.title}`);
          updateImage(img.id, { uploading: false });
        }
      } catch (error) {
        toast.error(`Error uploading ${img.title}`);
        updateImage(img.id, { uploading: false });
      }
    }

    setUploading(false);
    toast.success('All images uploaded!');
  };

  const publishAll = async () => {
    // First upload all images
    const hasUnuploaded = images.some(img => !img.uploaded);
    if (hasUnuploaded) {
      await uploadAllImages();
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setPublishing(true);
    let successCount = 0;
    let failCount = 0;

    for (const img of images) {
      if (!img.uploadedUrl) {
        failCount++;
        continue;
      }

      try {
        const price = parseFloat(img.price) || calculateAutoPrice(img.title, img.category);

        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: img.title,
            description: img.description,
            imageUrl: img.uploadedUrl,
            price,
            category: img.category,
            dimensions: img.dimensions,
            medium: img.medium,
            status: img.status,
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    setPublishing(false);
    
    if (failCount === 0) {
      toast.success(`🎉 All ${successCount} products published successfully!`);
      router.push('/admin/products');
    } else {
      toast.error(`Published ${successCount} products, ${failCount} failed`);
    }
  };

  const expandAll = () => {
    setImages(prev => prev.map(img => ({ ...img, expanded: true })));
  };

  const collapseAll = () => {
    setImages(prev => prev.map(img => ({ ...img, expanded: false })));
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
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.push('/admin')}>← Back</Button>
            <h1 className="text-2xl font-bold inline-block ml-4">Bulk Upload Artworks</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {images.length} image{images.length !== 1 ? 's' : ''} ready
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        {images.length === 0 ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
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
              multiple
            />
            
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold mb-2">
                  Drop all your images here, or click to browse
                </p>
                <p className="text-muted-foreground">
                  Upload up to 100 images at once • JPG, PNG, WebP, GIF (max 10MB each)
                </p>
              </div>
            </label>
          </div>
        ) : (
          <>
            {/* Action Bar */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-2">
                <input
                  type="file"
                  id="add-more"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <label htmlFor="add-more">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Add More Images
                    </span>
                  </Button>
                </label>
                <Button variant="outline" onClick={expandAll}>
                  <Eye className="mr-2 h-4 w-4" />
                  Expand All
                </Button>
                <Button variant="outline" onClick={collapseAll}>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Collapse All
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={uploadAllImages}
                  disabled={uploading || images.every(img => img.uploaded)}
                >
                  {uploading ? 'Uploading...' : 'Upload All'}
                </Button>
                <Button
                  className="orchid-gradient text-white"
                  onClick={publishAll}
                  disabled={publishing || uploading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {publishing ? 'Publishing...' : `Publish All ${images.length} Products`}
                </Button>
              </div>
            </div>

            {/* Images List */}
            <div className="space-y-4">
              {images.map((img, index) => (
                <div key={img.id} className="bg-card border border-border rounded-lg overflow-hidden">
                  {/* Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExpanded(img.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                        <Image
                          src={img.preview}
                          alt={img.title || 'Preview'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {index + 1}. {img.title || 'Untitled'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {img.uploaded && <CheckCircle2 className="inline h-3 w-3 text-green-500 mr-1" />}
                          {img.uploading ? 'Uploading...' : img.uploaded ? 'Uploaded' : 'Not uploaded'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(img.id);
                        }}
                      >
                        {img.expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Form */}
                  {img.expanded && (
                    <div className="p-4 border-t border-border bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Title *</Label>
                          <Input
                            value={img.title}
                            onChange={(e) => updateImage(img.id, { title: e.target.value })}
                            placeholder="Artwork title"
                          />
                        </div>

                        <div>
                          <Label>Category *</Label>
                          <Select
                            value={img.category}
                            onValueChange={(value) => updateImage(img.id, { category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-2">
                          <Label>Description *</Label>
                          <Textarea
                            value={img.description}
                            onChange={(e) => updateImage(img.id, { description: e.target.value })}
                            placeholder="Describe the artwork..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label>Price (USD)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={img.price}
                            onChange={(e) => updateImage(img.id, { price: e.target.value })}
                            placeholder="Auto-calculated"
                          />
                        </div>

                        <div>
                          <Label>Dimensions</Label>
                          <Input
                            value={img.dimensions}
                            onChange={(e) => updateImage(img.id, { dimensions: e.target.value })}
                            placeholder="16x20 inches"
                          />
                        </div>

                        <div>
                          <Label>Medium</Label>
                          <Input
                            value={img.medium}
                            onChange={(e) => updateImage(img.id, { medium: e.target.value })}
                            placeholder="Watercolor on paper"
                          />
                        </div>

                        <div>
                          <Label>Status</Label>
                          <Select
                            value={img.status}
                            onValueChange={(value) => updateImage(img.id, { status: value })}
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
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}