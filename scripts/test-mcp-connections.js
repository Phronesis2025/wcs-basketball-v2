// scripts/test-mcp-connections.js
// Test script to verify environment variables are set correctly
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking MCP Environment Variables\n');
console.log('='.repeat(60));

const checks = [
  {
    name: 'Stripe MCP',
    envVar: 'STRIPE_SECRET_KEY',
    required: true,
    hint: 'Get from: https://dashboard.stripe.com/apikeys'
  },
  {
    name: 'Postman MCP',
    envVar: 'POSTMAN_API_KEY',
    required: true,
    hint: 'Get from: https://www.postman.com/settings/api-keys'
  },
  {
    name: 'Supabase MCP',
    envVar: 'SUPABASE_ACCESS_TOKEN',
    required: false,
    hint: 'Already configured in mcp.json'
  },
  {
    name: 'Resend MCP',
    envVar: 'RESEND_API_KEY',
    required: false,
    hint: 'Hardcoded in mcp.json'
  },
  {
    name: 'Magic MCP',
    envVar: 'OPENAI_API_KEY',
    required: false,
    hint: 'Optional - for AI component generation'
  }
];

let allGood = true;
const results = [];

checks.forEach(check => {
  const value = process.env[check.envVar];
  const exists = !!value;
  const status = exists ? '✅' : (check.required ? '❌' : '⚠️ ');
  
  results.push({
    status,
    name: check.name,
    envVar: check.envVar,
    exists,
    required: check.required,
    hint: check.hint
  });
  
  if (check.required && !exists) {
    allGood = false;
  }
});

// Display results
results.forEach(result => {
  console.log(`${result.status} ${result.name}`);
  console.log(`   Environment Variable: ${result.envVar}`);
  
  if (result.exists) {
    const preview = process.env[result.envVar]?.substring(0, 20) + '...';
    console.log(`   Value: ${preview}`);
    console.log(`   Status: ✓ Set`);
  } else {
    console.log(`   Status: ${result.required ? '✗ MISSING (Required)' : '○ Not Set (Optional)'}`);
    if (result.hint) {
      console.log(`   💡 ${result.hint}`);
    }
  }
  console.log('');
});

console.log('='.repeat(60));

if (allGood) {
  console.log('\n✅ All required environment variables are set!');
  console.log('💡 If MCPs still don\'t work, try restarting Cursor completely.');
} else {
  console.log('\n❌ Some required environment variables are missing.');
  console.log('💡 Add the missing variables to your .env.local file and restart Cursor.');
}

console.log('\n📝 Note: MCP servers may need environment variables to be:');
console.log('   1. Set in system environment (Windows: setx command)');
console.log('   2. OR loaded from .env.local (may require Cursor restart)');
console.log('   3. OR hardcoded in mcp.json (less secure)');

