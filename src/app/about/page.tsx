import Image from 'next/image';
import Link from 'next/link';
import { Palette, Heart, Award, Mail, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-accent/10 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.15),transparent_50%)]" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 neon-text-cyan">ABOUT THE ARTIST</h1>
            <p className="text-xl text-muted-foreground">Passion, creativity, and dedication in every stroke</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">
        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative h-[500px] rounded-lg overflow-hidden cyber-border bg-gradient-to-br from-primary/20 to-accent/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <Zap className="h-32 w-32 neon-text-cyan mx-auto mb-6" />
                <p className="neon-text-magenta text-2xl font-bold tracking-widest">CYBER ARTIST</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-bold mb-6 neon-text-magenta">MY JOURNEY</h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                Welcome to Yasemin's Creations! I'm Yasemin, and art has been my passion for as long as I can remember. 
                What started as childhood doodles has blossomed into a lifelong journey of creative expression.
              </p>
              <p>
                Every piece I create is infused with emotion, care, and countless hours of dedication. 
                From delicate watercolors that capture the ephemeral beauty of flowers to bold acrylics 
                that express raw emotion, each artwork tells its own unique story.
              </p>
              <p>
                My inspiration comes from nature, emotions, and the beauty I see in everyday moments. 
                I believe art should not only be beautiful but also meaningful, evoking feelings and 
                creating connections between the artwork and its viewer.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center cyber-card p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-none border-2 border-primary mb-4 neon-glow-cyan">
              <Palette className="h-8 w-8 neon-text-cyan" />
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-wider">UNIQUE CREATIONS</h3>
            <p className="text-muted-foreground">
              Each piece is one-of-a-kind, created with meticulous attention to detail and artistic vision.
            </p>
          </div>

          <div className="text-center cyber-card p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-none border-2 border-accent mb-4 neon-glow-magenta">
              <Heart className="h-8 w-8 neon-text-magenta" />
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-wider">MADE WITH LOVE</h3>
            <p className="text-muted-foreground">
              Every artwork is crafted with passion, dedication, and a genuine love for the artistic process.
            </p>
          </div>

          <div className="text-center cyber-card p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-none border-2 border-primary mb-4 neon-glow-cyan">
              <Award className="h-8 w-8 neon-text-cyan" />
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-wider">QUALITY GUARANTEED</h3>
            <p className="text-muted-foreground">
              Using premium materials and techniques to ensure your artwork lasts for generations.
            </p>
          </div>
        </div>

        {/* Process Section */}
        <div className="cyber-border p-8 md:p-12 mb-20 bg-gradient-to-br from-primary/5 to-accent/5">
          <h2 className="text-4xl font-bold mb-8 text-center neon-text-cyan">MY CREATIVE PROCESS</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-4xl font-bold neon-text-cyan mb-2">01</div>
              <h3 className="text-xl font-bold mb-2 tracking-wider">INSPIRATION</h3>
              <p className="text-muted-foreground">
                Finding beauty in nature, emotions, and everyday moments.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold neon-text-magenta mb-2">02</div>
              <h3 className="text-xl font-bold mb-2 tracking-wider">SKETCHING</h3>
              <p className="text-muted-foreground">
                Rough drafts and planning the composition and color palette.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold neon-text-cyan mb-2">03</div>
              <h3 className="text-xl font-bold mb-2 tracking-wider">CREATION</h3>
              <p className="text-muted-foreground">
                Bringing the vision to life with careful technique and passion.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold neon-text-magenta mb-2">04</div>
              <h3 className="text-xl font-bold mb-2 tracking-wider">FINISHING</h3>
              <p className="text-muted-foreground">
                Adding final touches and ensuring every detail is perfect.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6 neon-text-magenta">LET'S CONNECT</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Have questions about a piece or interested in custom work? I'd love to hear from you!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/gallery">
              <Button size="lg" className="neon-button bg-transparent hover:bg-primary hover:text-primary-foreground">
                BROWSE GALLERY
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" className="neon-button bg-transparent hover:bg-accent hover:text-accent-foreground border-accent">
                <Mail className="mr-2 h-5 w-5" />
                CONTACT ME
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}