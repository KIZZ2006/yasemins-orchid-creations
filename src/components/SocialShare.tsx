"use client";

import { Facebook, Twitter, Share2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export default function SocialShare({ url, title, description }: SocialShareProps) {
  const fullUrl = typeof window !== 'undefined' ? window.location.origin + url : url;

  const handleShare = async (platform: 'facebook' | 'twitter' | 'copy' | 'native') => {
    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      
      case 'twitter':
        const twitterText = `${title} - ${description || ''}`;
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(twitterText)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      
      case 'copy':
        try {
          await navigator.clipboard.writeText(fullUrl);
          toast.success('Link copied to clipboard!');
        } catch (err) {
          toast.error('Failed to copy link');
        }
        break;
      
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text: description,
              url: fullUrl,
            });
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              toast.error('Failed to share');
            }
          }
        } else {
          toast.error('Sharing not supported on this device');
        }
        break;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium">Share:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('copy')}
        aria-label="Copy link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      {typeof navigator !== 'undefined' && navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('native')}
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
