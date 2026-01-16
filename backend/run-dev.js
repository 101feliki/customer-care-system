const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // load .env

console.log('Loaded SMTP_HOST:', process.env.SMTP_HOST); // debug

const child = spawn('npx', [
  'ts-node',
  '-r', 'tsconfig-paths/register',
  'src/main.ts'
], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' } // IMPORTANT: pass loaded env
});

child.on('error', console.error);
child.on('close', (code) => console.log(`Process exited with code ${code}`));
