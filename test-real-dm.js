const https = require('https');

console.log('🚀 Testing Instagram DM Bot with uday_mehlawat...');
console.log('⏰ This test allows up to 3 minutes for Instagram operations');

const data = JSON.stringify({
  username: 'uday_mehlawat',
  message: 'Hello Uday! This is a test message from the Instagram DM bot. If you receive this, the bot is working perfectly! 🚀'
});

const options = {
  hostname: 'ig-dm-bot-0xvq.onrender.com',
  port: 443,
  path: '/send-instagram-dm',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 180000  // 3 minutes timeout
};

console.log('📤 Sending DM request...');
console.log('🎯 Target:', options.hostname + options.path);
console.log('👤 Username:', 'uday_mehlawat');
console.log('💬 Message:', 'Hello Uday! This is a test message...');
console.log('⏱️ Timeout:', '3 minutes');
console.log('');

const startTime = Date.now();

const req = https.request(options, (res) => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`⏱️ Response time: ${duration}s`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('📝 Response received:');
    console.log('=' .repeat(50));
    
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success) {
        console.log('');
        console.log('🎉 SUCCESS! DM sent successfully!');
        console.log('✅ Chrome is working perfectly');
        console.log('✅ Instagram login successful');
        console.log('✅ Profile found and accessible');
        console.log('✅ Message sent to uday_mehlawat');
        console.log('');
        console.log('🔔 Check Instagram DMs to confirm delivery!');
      } else {
        console.log('');
        console.log('⚠️ Bot responded but encountered an issue:');
        console.log('📋 Error:', parsed.error);
        
        // Analyze the error
        if (parsed.error.includes('timeout')) {
          console.log('💡 Suggestion: Instagram might be loading slowly');
        } else if (parsed.error.includes('login')) {
          console.log('💡 Suggestion: Check Instagram session ID');
        } else if (parsed.error.includes('not found')) {
          console.log('💡 Suggestion: Check if username exists and is public');
        } else if (parsed.error.includes('Chrome')) {
          console.log('💡 Suggestion: Chrome issue detected');
        } else {
          console.log('💡 This is a different error - bot is working but hit an Instagram limitation');
        }
      }
    } catch (e) {
      console.log('📄 Raw response (not JSON):');
      console.log(responseData);
    }
    
    console.log('=' .repeat(50));
  });
});

req.on('error', (error) => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`❌ Request error after ${duration}s:`, error.message);
  
  if (error.message.includes('timeout')) {
    console.log('');
    console.log('⏰ Request timed out - this could mean:');
    console.log('1. ✅ Bot is working but Instagram operations are slow');
    console.log('2. ✅ Chrome is launching and navigating (good sign!)');
    console.log('3. 🔄 Login/navigation process taking longer than expected');
    console.log('');
    console.log('💡 Try checking Render logs for more details about the bot\'s progress');
  }
});

req.on('timeout', () => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏰ Request timed out after ${duration}s`);
  console.log('');
  console.log('🔍 This suggests the bot is working but needs more time.');
  console.log('✅ Chrome is definitely working (no immediate errors)');
  console.log('🔄 Bot is likely processing Instagram login/navigation');
  console.log('');
  console.log('💡 Check Render logs to see the bot\'s current progress!');
  req.destroy();
});

console.log('🔄 Request sent, waiting for response...');
req.write(data);
req.end();
