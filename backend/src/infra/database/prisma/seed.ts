// src/infra/database/prisma/seed.ts - FINAL VERSION
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding database...');
  
  try {
    // 1. Hash password for admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // 2. Create admin user
    const adminUser = await prisma.user.upsert({
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
    console.log('✅ Created admin user:', adminUser.email);
    
    // 3. Create recipients (email is @unique so upsert works)
    const recipients = await Promise.all([
      prisma.recipient.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
      }),
      prisma.recipient.upsert({
        where: { email: 'jane@example.com' },
        update: {},
        create: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+0987654321',
        },
      }),
    ]);
    
    console.log(`✅ Created ${recipients.length} recipients`);
    
    // 4. Create email templates
    const templates = await Promise.all([
      prisma.emailTemplate.upsert({
        where: { name: 'Welcome Email' },
        update: {},
        create: {
          name: 'Welcome Email',
          subject: 'Welcome {{name}}!',
          htmlBody: '<h1>Welcome {{name}}!</h1><p>Thank you for joining us.</p>',
          textBody: 'Welcome {{name}}! Thank you for joining us.',
          variables: ['name', 'email'],
        },
      }),
      prisma.emailTemplate.upsert({
        where: { name: 'Password Reset' },
        update: {},
        create: {
          name: 'Password Reset',
          subject: 'Reset Your Password',
          htmlBody: '<p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>',
          textBody: 'Reset link: {{resetLink}}',
          variables: ['resetLink'],
        },
      }),
    ]);
    
    console.log(`✅ Created ${templates.length} email templates`);
    console.log('🎉 Database seeding completed!');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });