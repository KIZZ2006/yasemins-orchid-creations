import type { Metadata } from "next";
import "./globals.css";
import "./globals-protection.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yaseminscreations.com'),
  title: {
    default: "Yasemin's Creations - Unique Digital Art & AI-Generated Drawings",
    template: "%s | Yasemin's Creations"
  },
  description: "Discover stunning digital artworks and AI-generated drawings by Yasemin. Each piece is unique, handcrafted with love, bringing beauty and elegance to your space. Shop original art online.",
  keywords: "digital art, AI art, AI-generated drawings, unique artwork, handcrafted art, digital drawings, wall art, home decor, yasemin art, buy art online, original artwork",
  authors: [{ name: "Yasemin's Creations" }],
  creator: "Yasemin's Creations",
  publisher: "Yasemin's Creations",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: "Yasemin's Creations",
    title: "Yasemin's Creations - Unique Digital Art & AI-Generated Drawings",
    description: "Discover stunning digital artworks and AI-generated drawings. Shop unique, handcrafted pieces that bring beauty to your space.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "Yasemin's Creations - Digital Art Gallery",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Yasemin's Creations - Unique Digital Art",
    description: "Discover stunning digital artworks and AI-generated drawings",
    images: ['/og-image.jpg'],
    creator: '@yaseminscreate',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics - Add your tracking ID */}
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
        <Toaster />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}