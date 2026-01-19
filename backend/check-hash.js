// check-hash.js
const bcrypt = require('bcrypt');

const hashFromDB = '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mrq1V1zHaiB.wfvvUOO2p5eC55Qr7Ca';

// Test common passwords
const testPasswords = [
  'admin123',
  'password',
  'admin',
  'Admin123',
  'birdview',
  'Birdview123',
  'admin@birdview',
  'Admin@123',
  '123456',
  'admin@2024'
];

async function test() {
  console.log('🔍 Testing which password matches the hash...');
  console.log('Hash from DB:', hashFromDB);
  
  for (const password of testPasswords) {
    const match = await bcrypt.compare(password, hashFromDB);
    if (match) {
      console.log(`✅ FOUND MATCH: "${password}"`);
      return password;
    }
  }
  
  console.log('❌ No match found for common passwords');
  return null;
}

test().then(foundPassword => {
  if (!foundPassword) {
    console.log('\n🔑 Generating new hash for "admin123"...');
    bcrypt.hash('admin123', 10, (err, newHash) => {
      console.log('New hash for "admin123":', newHash);
      console.log('\n📝 Use this SQL to update:');
      console.log(`UPDATE users SET password = '${newHash}' WHERE email = 'admin@birdview.com';`);
    });
  }
});