import { db } from '@/db';
import { orders } from '@/db/schema';

async function main() {
    const sampleOrders = [
        {
            productId: 7,
            customerName: 'Emily Chen',
            customerEmail: 'emily.chen@example.com',
            paymentStatus: 'completed',
            paymentMethod: 'paypal',
            paymentId: 'PAYID-MXK7LQA09876543',
            totalAmount: 95.00,
            createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000),
            updatedAt: Date.now() - (7 * 24 * 60 * 60 * 1000),
        },
        {
            productId: 8,
            customerName: 'Marcus Rodriguez',
            customerEmail: 'marcus.r@example.com',
            paymentStatus: 'completed',
            paymentMethod: 'paypal',
            paymentId: 'PAYID-NZP8MRB12345678',
            totalAmount: 85.00,
            createdAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
            updatedAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
        },
        {
            productId: 9,
            customerName: 'Sarah Kim',
            customerEmail: 'sarahkim@example.com',
            paymentStatus: 'completed',
            paymentMethod: 'paypal',
            paymentId: 'PAYID-OAQ9NSC98765432',
            totalAmount: 105.00,
            createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
            updatedAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
        }
    ];

    await db.insert(orders).values(sampleOrders);
    
    console.log('✅ Orders seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});