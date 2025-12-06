import { db } from '@/db';
import { admins } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const password = 'Yasemin@08081999';
    const passwordHash = await bcrypt.hash(password, 10);
    
    const adminData = {
        username: 'yasemin',
        email: 'krish@yasemin.com',
        passwordHash: passwordHash,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await db.insert(admins).values(adminData);
    
    const isValid = await bcrypt.compare(password, passwordHash);
    console.log('Password verification:', isValid ? 'SUCCESS ✅' : 'FAILED ❌');
    
    console.log('✅ Admin seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});