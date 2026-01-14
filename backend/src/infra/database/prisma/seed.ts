// src/infra/database/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding database...');
  
  try {
    // 1. Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.upsert({
      where: { email: 'admin@birdview.com' },
      update: {},
      create: {
        email: 'admin@birdview.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isVerified: true,
      },
    });
    console.log('✅ Created admin user');
    
    // 2. Create recipients (simple create - will error on duplicates)
    const recipients = [
      { name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321' },
    ];
    
    for (const recipient of recipients) {
      try {
        await prisma.recipient.create({ data: recipient });
        console.log(`✅ Created recipient: ${recipient.email}`);
      } catch {
        console.log(`⚠️ Skipped ${recipient.email} (may already exist)`);
      }
    }
    
    console.log('🎉 Seeding complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main()
  .finally(() => prisma.$disconnect());