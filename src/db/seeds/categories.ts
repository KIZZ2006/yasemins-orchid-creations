import { db } from '@/db';
import { categories } from '@/db/schema';

async function main() {
    const sampleCategories = [
        {
            name: 'Digital Art',
            slug: 'digital-art',
            description: 'Pure digital artworks created with cutting-edge software',
            createdAt: Date.now(),
        },
        {
            name: 'Cyber Abstract',
            slug: 'cyber-abstract',
            description: 'Abstract compositions with cyberpunk aesthetics',
            createdAt: Date.now(),
        },
        {
            name: 'Neon Portraits',
            slug: 'neon-portraits',
            description: 'Futuristic portrait art with neon lighting',
            createdAt: Date.now(),
        },
        {
            name: 'Futuristic Landscapes',
            slug: 'futuristic-landscapes',
            description: 'Sci-fi cityscapes and otherworldly environments',
            createdAt: Date.now(),
        },
        {
            name: 'Geometric Fusion',
            slug: 'geometric-fusion',
            description: 'Geometric patterns blended with organic forms',
            createdAt: Date.now(),
        },
        {
            name: 'Orchid Dreams',
            slug: 'orchid-dreams',
            description: 'Delicate orchid-inspired digital compositions',
            createdAt: Date.now(),
        },
    ];

    await db.insert(categories).values(sampleCategories);
    
    console.log('✅ Categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});