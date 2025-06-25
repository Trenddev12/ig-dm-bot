const axios = require('axios');

// Configuration for testing Render deployment
const RENDER_CONFIG = {
  // Your actual Render URL from the deployment
  baseUrl: 'https://ig-dm-bot.onrender.com',
  testUsername: 'natgeo', // Safe account to test with
  testMessage: 'Hello from Render deployment! 🚀'
};

async function testRenderDeployment() {
  console.log('🧪 Testing Render Deployment...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(RENDER_CONFIG.baseUrl, {
      timeout: 30000
    });
    
    if (healthResponse.status === 200) {
      console.log('✅ Health check passed:', healthResponse.data);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
      return;
    }
    
    console.log('');
    
    // Test 2: DM Sending
    console.log('2️⃣ Testing DM sending...');
    console.log(`📤 Sending test DM to @${RENDER_CONFIG.testUsername}`);
    console.log(`💬 Message: "${RENDER_CONFIG.testMessage}"`);
    
    const startTime = Date.now();
    
    const dmResponse = await axios.post(`${RENDER_CONFIG.baseUrl}/send-instagram-dm`, {
      username: RENDER_CONFIG.testUsername,
      message: RENDER_CONFIG.testMessage
    }, {
      timeout: 120000, // 2 minutes timeout for DM sending
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n✅ Render Deployment Test Results:');
    console.log(`⏱️ Duration: ${duration} seconds`);
    console.log(`📊 Status: ${dmResponse.status}`);
    console.log(`📝 Response:`, dmResponse.data);
    
    if (dmResponse.status === 200 && dmResponse.data.success) {
      console.log('\n🎉 DEPLOYMENT SUCCESSFUL! 🎉');
      console.log('✅ Health endpoint working');
      console.log('✅ DM sending working');
      console.log('✅ Session ID authentication working');
      console.log('✅ Ready for production use!');
    } else {
      console.log('\n⚠️ Deployment partially working:');
      console.log('✅ Server is running');
      console.log('❌ DM sending has issues');
      console.log('💡 Check logs in Render dashboard');
    }
    
  } catch (error) {
    console.error('\n❌ Deployment Test Failed:');
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error('🌐 Connection Error:');
      console.error('   - Check if the Render URL is correct');
      console.error('   - Verify the service is deployed and running');
      console.error('   - Make sure the service is not sleeping (free tier)');
    } else if (error.response) {
      console.error(`📊 HTTP Error: ${error.response.status}`);
      console.error(`📝 Response:`, error.response.data);
      
      if (error.response.status === 500) {
        console.error('\n🔧 Possible Issues:');
        console.error('   - Session ID not set or invalid');
        console.error('   - Environment variables missing');
        console.error('   - Instagram account restrictions');
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Timeout Error:');
      console.error('   - DM sending took too long');
      console.error('   - Instagram might be slow');
      console.error('   - Check Render logs for details');
    } else {
      console.error('⚠️ Unknown Error:', error.message);
    }
    
    console.error('\n🔧 Debugging Steps:');
    console.error('1. Check Render dashboard for service status');
    console.error('2. Verify environment variables are set');
    console.error('3. Check service logs for error messages');
    console.error('4. Ensure session ID is valid and not expired');
    console.error('5. Try with a different target username');
  }
}

// Instructions for updating the URL
console.log('📋 BEFORE RUNNING THIS TEST:');
console.log('1. Deploy your service to Render');
console.log('2. Get your Render URL (e.g., https://ig-dm-bot-xxxx.onrender.com)');
console.log('3. Update RENDER_CONFIG.baseUrl in this file');
console.log('4. Run: node test-render-deployment.js\n');

// Check if URL has been updated
if (RENDER_CONFIG.baseUrl.includes('xxxx')) {
  console.log('⚠️ Please update RENDER_CONFIG.baseUrl with your actual Render URL');
  console.log('Example: https://ig-dm-bot-abc123.onrender.com\n');
  process.exit(1);
}

// Run the test
testRenderDeployment();
