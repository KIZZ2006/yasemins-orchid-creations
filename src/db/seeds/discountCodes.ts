import { db } from '@/db';
import { discountCodes } from '@/db/schema';

async function main() {
    const sampleDiscountCodes = [
        {
            code: 'WELCOME10',
            discountPercent: 10,
            expiresAt: null,
            isActive: 1,
            usageCount: 0,
            createdAt: Date.now(),
        },
        {
            code: 'VIP20',
            discountPercent: 20,
            expiresAt: null,
            isActive: 1,
            usageCount: 0,
            createdAt: Date.now(),
        }
    ];

    await db.insert(discountCodes).values(sampleDiscountCodes);
    
    console.log('✅ Discount codes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});