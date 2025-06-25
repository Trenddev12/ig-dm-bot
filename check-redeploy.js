const axios = require('axios');

async function checkRedeploy() {
  console.log('🔄 Checking if redeploy is complete...\n');
  
  const renderUrl = 'https://ig-dm-bot.onrender.com';
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(renderUrl, { timeout: 10000 });
    console.log('✅ Health check:', healthResponse.data);
    
    // Test Chrome detection with a quick DM request
    console.log('\n2️⃣ Testing Chrome detection...');
    console.log('📤 Sending test request to trigger Chrome detection...');
    
    const startTime = Date.now();
    
    try {
      const dmResponse = await axios.post(`${renderUrl}/send-instagram-dm`, {
        username: 'nonexistent_test_user_12345',
        message: 'Chrome detection test'
      }, {
        timeout: 45000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const duration = (Date.now() - startTime) / 1000;
      console.log(`⏱️ Request completed in ${duration}s`);
      console.log('📊 Response:', dmResponse.data);
      
    } catch (dmError) {
      const duration = (Date.now() - startTime) / 1000;
      console.log(`⏱️ Request completed in ${duration}s`);
      
      if (dmError.response) {
        console.log('📊 Status:', dmError.response.status);
        console.log('📝 Response:', dmError.response.data);
        
        const errorMessage = dmError.response.data.error || '';
        
        if (errorMessage.includes('executablePath') || errorMessage.includes('Browser was not found')) {
          console.log('\n❌ Chrome installation still has issues');
          console.log('🔧 The Chrome path detection is still failing');
          console.log('💡 Check Render deployment logs for more details');
          
          console.log('\n🛠️ Possible solutions:');
          console.log('1. Wait a few more minutes for deployment to complete');
          console.log('2. Check Render logs for Chrome installation messages');
          console.log('3. Try manual deploy if auto-deploy failed');
          
        } else if (errorMessage.includes('Profile') || errorMessage.includes('not found') || errorMessage.includes('Message button')) {
          console.log('\n✅ Chrome appears to be working now!');
          console.log('🎯 The error is expected (test user doesn\'t exist)');
          console.log('🚀 Ready to test with real Instagram accounts');
          
        } else {
          console.log('\n⚠️ Different error detected:');
          console.log('📝 Error:', errorMessage);
        }
      } else {
        console.log('\n❌ Network error:', dmError.message);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Health check failed:', error.message);
    console.log('🔄 Service might still be redeploying...');
  }
}

console.log('🚀 Checking redeploy status...');
console.log('📋 This will test if the Chrome fixes are working\n');

checkRedeploy();
