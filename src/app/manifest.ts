import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yasemin's Creations - Digital Art Gallery",
    short_name: "Yasemin's Art",
    description: "Discover stunning digital artworks and AI-generated drawings by Yasemin",
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFF0',
    theme_color: '#DDA0DD',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
