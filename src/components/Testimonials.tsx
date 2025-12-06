"use client";

import { Star, User } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Digital Art Collector',
    content: 'Absolutely mind-blowing cyber aesthetics! The quality exceeded my expectations. Yasemin\'s futuristic vision is unmatched.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Tech Designer',
    content: 'I\'ve acquired multiple pieces for my projects. The unique cyber style and neon colors make each piece a showstopper.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'NFT Enthusiast',
    content: 'These artworks transformed my digital collection! Fast delivery, secure transactions, and absolutely stunning pieces.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,0,255,0.08),transparent_50%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-wider neon-text-cyan">CLIENT TESTIMONIALS</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Join hundreds of satisfied collectors who have <span className="neon-text-magenta font-semibold">elevated</span> their digital spaces
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="cyber-card p-6 relative group"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic font-light leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-none overflow-hidden bg-muted border-2 border-primary/50 group-hover:border-primary transition-colors flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold tracking-wider text-primary uppercase text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground font-light uppercase tracking-wider">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}