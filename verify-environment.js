#!/usr/bin/env node

/**
 * Quick Environment Verification Script
 * Run this to see what environment your app will use
 */

console.log('='.repeat(80));
console.log('ENVIRONMENT VERIFICATION (Simplified)');
console.log('='.repeat(80));
console.log('');

// Check NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
console.log('📦 NODE_ENV:');
console.log(`   Value: "${nodeEnv}"`);
console.log('');
console.log('   Controls:');
console.log('   • Next.js build optimizations (dev/prod mode)');
console.log('   • Firebase collections (users_{NODE_ENV}, accounts_{NODE_ENV})');
console.log('');

// Determine Firebase environment based on NODE_ENV
const firebaseEnv = nodeEnv === 'production' ? 'production' : 'development';

// Summary
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log('');
console.log(`Current Environment: ${nodeEnv}`);
console.log('');
console.log('Firebase Collections:');
console.log(`   • accounts_${firebaseEnv}`);
console.log(`   • users_${firebaseEnv}`);
console.log(`   • stories_gen_${firebaseEnv}`);
console.log('');

if (firebaseEnv === 'development') {
  console.log('⚠️  Using DEVELOPMENT collections');
  console.log('');
  console.log('To use PRODUCTION collections:');
  console.log('   npm run build    # Sets NODE_ENV=production');
  console.log('   npm run start');
  console.log('');
} else {
  console.log('✅ Using PRODUCTION collections');
  console.log('');
  console.log('To use DEVELOPMENT collections:');
  console.log('   npm run dev      # Sets NODE_ENV=development');
  console.log('');
}

console.log('='.repeat(80));
console.log('');
console.log('How it works:');
console.log('  npm run dev   → NODE_ENV=development → development collections');
console.log('  npm run build → NODE_ENV=production  → production collections');
console.log('');
console.log('='.repeat(80));

