import { db } from '@/db';
import { admins, products, categories, discountCodes } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.delete(discountCodes);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(admins);
    console.log('✅ Cleared existing data\n');

    // Seed Admins
    console.log('👤 Seeding admins...');
    const now = Date.now();
    
    // Hash the new password
    const passwordHash = await bcrypt.hash('Yasemin@08081999', 10);
    
    await db.insert(admins).values({
      username: 'Krish',
      email: 'Krish@yasemin.com',
      passwordHash: passwordHash,
      createdAt: now,
      updatedAt: now,
    });
    console.log('✅ Admin account created (email: Krish@yasemin.com, password: Yasemin@08081999)\n');

    // Seed Categories
    console.log('📁 Seeding categories...');
    await db.insert(categories).values([
      {
        name: 'Watercolor',
        slug: 'watercolor',
        description: 'Beautiful watercolor paintings with vibrant colors and delicate brushwork',
        createdAt: now,
      },
      {
        name: 'Digital Art',
        slug: 'digital-art',
        description: 'Contemporary digital artworks created with modern design tools',
        createdAt: now,
      },
      {
        name: 'Acrylic Painting',
        slug: 'acrylic-painting',
        description: 'Bold and expressive acrylic paintings with rich textures',
        createdAt: now,
      },
      {
        name: 'Pencil Sketch',
        slug: 'pencil-sketch',
        description: 'Detailed pencil drawings showcasing technical mastery',
        createdAt: now,
      }
    ]);
    console.log('✅ 4 categories created\n');

    // Products - No sample products for production
    console.log('🎨 Products: Starting with empty gallery (production-ready)\n');

    // Seed Discount Codes
    console.log('🎟️  Seeding discount codes...');
    await db.insert(discountCodes).values([
      {
        code: 'WELCOME10',
        discountPercent: 10,
        expiresAt: null,
        isActive: 1,
        usageCount: 0,
        createdAt: now,
      },
      {
        code: 'SUMMER20',
        discountPercent: 20,
        expiresAt: null,
        isActive: 1,
        usageCount: 0,
        createdAt: now,
      },
    ]);
    console.log('✅ 2 discount codes created (WELCOME10, SUMMER20)\n');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Production Ready:');
    console.log('   ✅ Gallery starts empty - ready for your artworks');
    console.log('   ✅ Admin login: http://localhost:3000/admin/login');
    console.log('   ✅ Email: Krish@yasemin.com');
    console.log('   ✅ Password: Yasemin@08081999');
    console.log('   ✅ Upload artworks: http://localhost:3000/admin/upload');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();