// test-simple.ts
const Prisma = require('@prisma/client');
console.log('All exports:', Object.keys(Prisma));
console.log('\nChecking for UserRole...');

// Try different ways to access
if (Prisma.UserRole) {
  console.log('UserRole found directly:', Prisma.UserRole);
} else if (Prisma.Prisma?.UserRole) {
  console.log('UserRole found in Prisma namespace:', Prisma.Prisma.UserRole);
} else {
  console.log('Checking all properties...');
  for (const key in Prisma) {
    if (key.includes('Role') || key.includes('role')) {
      console.log(`Found related key: ${key} =`, Prisma[key]);
    }
  }
}