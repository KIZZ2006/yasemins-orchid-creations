"use client";

import { useState } from 'react';
import { Mail, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Thank you for subscribing! Check your email for updates.');
        setEmail('');
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative border-2 border-primary/50 p-8 text-center overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent" />
      
      <div className="relative z-10">
        <div className="flex justify-center gap-3 mb-4">
          <Mail className="h-10 w-10 text-primary animate-pulse" />
          <Zap className="h-10 w-10 text-secondary animate-pulse" />
        </div>
        <h3 className="text-3xl font-bold mb-2 uppercase tracking-wider">Stay Updated</h3>
        <p className="text-muted-foreground mb-6 font-light max-w-xl mx-auto">
          Subscribe to get notified about new <span className="text-gradient font-semibold">digital artworks</span>, exclusive offers, and special collections from the neon underground
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
          <Input
            type="email"
            placeholder="ENTER YOUR EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 border-2 border-primary/50 bg-background/50 backdrop-blur-sm focus:border-primary focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] uppercase text-xs tracking-wider font-semibold placeholder:text-muted-foreground/50"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="cyber-button cyber-glow px-6"
          >
            {loading ? 'SENDING...' : 'SUBSCRIBE'}
          </button>
        </form>
      </div>
    </div>
  );
}