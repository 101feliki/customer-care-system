// run-dev.js - Direct ts-node runner
const { spawn } = require('child_process');

console.log('🚀 Starting NestJS with ts-node...');

const child = spawn('npx', [
  'ts-node',
  '-r', 'tsconfig-paths/register',
  'src/main.ts'
], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

child.on('error', (error) => {
  console.error('Failed to start:', error);
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});