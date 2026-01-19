// test-prisma.js
require('dotenv').config(); // Load .env

const { PrismaClient } = require('@prisma/client');

console.log('🔍 Checking environment...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

async function test() {
  console.log('\n🔗 Testing Prisma connection...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database version:', result[0].version);
    
    // Check users
    const users = await prisma.user.findMany();
    console.log(`✅ Found ${users.length} users`);
    // Add this after connecting
const dbInfo = await prisma.$queryRaw`SELECT current_database(), current_user`;
console.log('📊 Database info:', dbInfo[0]);
    
    users.forEach(user => {
      console.log(`   👤 ${user.email} (${user.name})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('✅ Connection closed');
  }
}

test();