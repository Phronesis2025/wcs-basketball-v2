// scripts/check-stripe-payment-intents.js
// Simple script to check Stripe payment intents
// Run with: node scripts/check-stripe-payment-intents.js

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

async function checkPaymentIntents() {
  try {
    console.log('🔍 Fetching Stripe payment intents...\n');
    
    // Get payment intents with limit (default is 10, max is 100)
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 10, // Get last 10 payment intents
    });

    console.log(`📊 Found ${paymentIntents.data.length} payment intent(s):\n`);

    if (paymentIntents.data.length === 0) {
      console.log('ℹ️  No payment intents found in your Stripe account.\n');
      console.log('💡 This is normal if you haven\'t processed any payments yet.');
      return;
    }

    // Display each payment intent
    paymentIntents.data.forEach((pi, index) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Payment Intent #${index + 1}`);
      console.log(`${'='.repeat(60)}`);
      console.log(`ID: ${pi.id}`);
      console.log(`Status: ${pi.status}`);
      console.log(`Amount: $${(pi.amount / 100).toFixed(2)} ${pi.currency.toUpperCase()}`);
      console.log(`Created: ${new Date(pi.created * 1000).toLocaleString()}`);
      
      if (pi.description) {
        console.log(`Description: ${pi.description}`);
      }
      
      if (pi.customer) {
        console.log(`Customer: ${pi.customer}`);
      }
      
      if (pi.metadata && Object.keys(pi.metadata).length > 0) {
        console.log(`Metadata:`, JSON.stringify(pi.metadata, null, 2));
      }
      
      console.log(`Payment Method: ${pi.payment_method || 'Not attached'}`);
      
      // Payment status details
      if (pi.status === 'succeeded') {
        console.log(`✅ Payment successful`);
      } else if (pi.status === 'requires_payment_method') {
        console.log(`⚠️  Requires payment method`);
      } else if (pi.status === 'requires_confirmation') {
        console.log(`⚠️  Requires confirmation`);
      } else if (pi.status === 'canceled') {
        console.log(`❌ Payment canceled`);
      } else {
        console.log(`🔄 Status: ${pi.status}`);
      }
    });

    console.log(`\n\n📈 Summary:`);
    console.log(`   Total found: ${paymentIntents.data.length}`);
    console.log(`   Succeeded: ${paymentIntents.data.filter(pi => pi.status === 'succeeded').length}`);
    console.log(`   Pending: ${paymentIntents.data.filter(pi => pi.status !== 'succeeded' && pi.status !== 'canceled').length}`);
    console.log(`   Canceled: ${paymentIntents.data.filter(pi => pi.status === 'canceled').length}`);

  } catch (error) {
    console.error('❌ Error fetching payment intents:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n💡 Tip: Check that your STRIPE_SECRET_KEY in .env.local is correct.');
    } else if (error.type === 'StripeAPIError') {
      console.error('\n💡 Tip: Check your Stripe account status and API access.');
    }
    
    process.exit(1);
  }
}

// Run the check
checkPaymentIntents();

