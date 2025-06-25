const axios = require('axios');

// Test configuration
const TEST_CONFIG = {
  serverUrl: 'http://localhost:3000',
  testUsername: 'instagram', // Using Instagram's official account for testing
  testMessage: 'Hello! This is a test message from our DM bot. 🤖',
  // Alternative test accounts (use accounts that allow DMs)
  alternativeUsers: ['natgeo', 'nasa', 'therock']
};

async function testDMBot() {
  console.log('🧪 Starting DM Bot Test...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connectivity...');
    const healthCheck = await axios.get(TEST_CONFIG.serverUrl);
    console.log('✅ Server is running:', healthCheck.data);
    console.log('');

    // Test 2: Test DM sending
    console.log('2️⃣ Testing DM sending functionality...');
    console.log(`📤 Sending DM to @${TEST_CONFIG.testUsername}`);
    console.log(`💬 Message: "${TEST_CONFIG.testMessage}"`);
    console.log('');

    const startTime = Date.now();
    
    const response = await axios.post(`${TEST_CONFIG.serverUrl}/send-instagram-dm`, {
      username: TEST_CONFIG.testUsername,
      message: TEST_CONFIG.testMessage
    }, {
      timeout: 120000 // 2 minutes timeout
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('✅ DM Test Results:');
    console.log(`⏱️ Duration: ${duration} seconds`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`📝 Response:`, response.data);

    // Test with alternative users if main test fails
    if (response.status !== 200) {
      console.log('\n🔄 Main test failed, trying alternative users...');

      for (const altUser of TEST_CONFIG.alternativeUsers) {
        try {
          console.log(`\n📤 Testing with @${altUser}...`);
          const altResponse = await axios.post(`${TEST_CONFIG.serverUrl}/send-instagram-dm`, {
            username: altUser,
            message: `Test message to ${altUser} - ${new Date().toISOString()}`
          }, {
            timeout: 120000
          });

          console.log(`✅ Success with @${altUser}:`, altResponse.data);
          break;
        } catch (altError) {
          console.log(`❌ Failed with @${altUser}:`, altError.response?.data || altError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test Failed:');
    
    if (error.response) {
      console.error(`📊 Status: ${error.response.status}`);
      console.error(`📝 Response:`, error.response.data);
    } else if (error.request) {
      console.error('📡 No response received from server');
      console.error('🔍 Check if server is running on port 3000');
    } else {
      console.error('⚠️ Error:', error.message);
    }
    
    console.error('\n🔧 Debugging Tips:');
    console.error('1. Make sure the server is running: npm start');
    console.error('2. Check Instagram credentials in .env file');
    console.error('3. Verify Instagram account is not blocked/restricted');
    console.error('4. Check for CAPTCHA or 2FA requirements');
  }
}

// Run the test
testDMBot();
