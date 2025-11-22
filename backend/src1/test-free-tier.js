// ============================================
// Test Free Tier Models Only
// Run: node src/test-free-tier.js
// ============================================
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env');
  process.exit(1);
}

console.log('🔍 Testing FREE TIER Gemini Models...\n');
console.log(`API Key: ${apiKey.substring(0, 20)}...\n`);

const genAI = new GoogleGenerativeAI(apiKey);

// Free tier models only (in order of likelihood to work)
const freeTierModels = [
  'gemini-1.5-flash',        // Most common free tier model
  'gemini-1.5-pro',          // Also available on free tier
  'gemini-1.5-flash-latest', // Latest version
  'gemini-1.5-pro-latest',   // Latest version
];

async function testModel(modelName) {
  try {
    console.log(`Testing: ${modelName.padEnd(30)} ... `);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say "Hello"');
    const response = await result.response;
    const text = response.text();
    console.log(`✅ WORKS! Response: "${text.trim()}"`);
    return { model: modelName, status: 'success' };
  } catch (error) {
    const errorMsg = error.message.split('\n')[0];
    if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('not supported')) {
      console.log(`❌ Not found`);
      return { model: modelName, status: 'not_found' };
    } else if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
      console.log(`⚠️  Quota/Rate limit (MODEL EXISTS - just wait a bit!)`);
      return { model: modelName, status: 'quota' };
    } else {
      console.log(`❌ Error: ${errorMsg.substring(0, 60)}...`);
      return { model: modelName, status: 'error', error: errorMsg };
    }
  }
}

async function testFreeTier() {
  console.log('Testing free tier models...\n');
  
  const results = [];
  
  for (const modelName of freeTierModels) {
    const result = await testModel(modelName);
    results.push(result);
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FREE TIER RESULTS\n');
  
  const working = results.filter(r => r.status === 'success');
  const quota = results.filter(r => r.status === 'quota');
  const notFound = results.filter(r => r.status === 'not_found');
  
  if (working.length > 0) {
    console.log('✅ WORKING MODELS (Use this in .env):');
    working.forEach(r => {
      console.log(`   GEMINI_MODEL=${r.model}`);
    });
    console.log(`\n💡 Copy the first one to your .env file!`);
  } else if (quota.length > 0) {
    console.log('⚠️  MODELS EXIST BUT HIT QUOTA:');
    quota.forEach(r => {
      console.log(`   - ${r.model}`);
    });
    console.log(`\n💡 These models work! Just wait 30-60 seconds and try again.`);
    console.log(`   Use this in .env: GEMINI_MODEL=${quota[0].model}`);
  } else {
    console.log('❌ No free tier models found');
    console.log('\n🔧 Possible fixes:');
    console.log('   1. Update package: npm install @google/generative-ai@latest');
    console.log('   2. Check API key is valid');
    console.log('   3. Verify free tier access in Google Cloud Console');
  }
  
  if (notFound.length > 0) {
    console.log(`\n❌ NOT FOUND: ${notFound.length} models`);
  }
  
  console.log('\n' + '='.repeat(60));
}

testFreeTier().catch(console.error);

