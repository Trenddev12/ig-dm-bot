const axios = require('axios');

// Test Chrome installation on Render
async function testChromeOnRender() {
  console.log('🧪 Testing Chrome Installation on Render...\n');
  
  const renderUrl = 'https://ig-dm-bot.onrender.com';
  
  try {
    // Test a simple DM request to see Chrome detection logs
    console.log('📤 Sending test request to trigger Chrome detection...');
    
    const response = await axios.post(`${renderUrl}/send-instagram-dm`, {
      username: 'test_user_that_does_not_exist',
      message: 'Chrome test'
    }, {
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('📊 Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Response:', error.response.data);
      
      if (error.response.data.error && error.response.data.error.includes('executablePath')) {
        console.log('\n❌ Chrome installation issue detected');
        console.log('🔧 The Chrome path detection is still failing');
        console.log('💡 Check Render logs for Chrome detection messages');
      } else {
        console.log('\n✅ Chrome appears to be working');
        console.log('🎯 The error is likely due to the test username or other factors');
      }
    } else {
      console.error('❌ Request failed:', error.message);
    }
  }
}

console.log('🚀 This test will help diagnose Chrome installation on Render');
console.log('📋 Make sure you have pushed the latest code and redeployed\n');

testChromeOnRender();
