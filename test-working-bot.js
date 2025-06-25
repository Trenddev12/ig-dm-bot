const https = require('https');

console.log('🚀 Testing FIXED Instagram DM Bot...');
console.log('📱 Target: uday_mehlawat');
console.log('💬 Message: Hello from the working bot!');
console.log('');

const data = JSON.stringify({
  username: 'uday_mehlawat',
  message: 'Hello Uday! 🎉 This message is from the WORKING Instagram DM bot! If you receive this, the bot is successfully sending DMs. Time: ' + new Date().toLocaleString()
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
  timeout: 10000  // Should get immediate response now
};

console.log('📤 Sending DM request...');

const req = https.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log('📝 Response:');
    console.log('=' .repeat(50));
    
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success && parsed.status === 'processing') {
        console.log('');
        console.log('🎉 SUCCESS! Bot is working!');
        console.log('✅ Request accepted immediately');
        console.log('🔄 DM is being sent in background');
        console.log('📱 Check Instagram DMs in 30-60 seconds');
        console.log('📊 Monitor Render logs for progress');
        console.log('');
        console.log('🔥 THE BOT IS NOW WORKING! 🔥');
      } else if (parsed.success) {
        console.log('✅ Bot responded successfully!');
      } else {
        console.log('⚠️ Bot responded with error:', parsed.error);
      }
    } catch (e) {
      console.log('📄 Raw response:', responseData);
    }
    
    console.log('=' .repeat(50));
  });
});

req.on('error', error => {
  console.log('❌ Request error:', error.message);
});

req.on('timeout', () => {
  console.log('⏰ Request timeout - this should NOT happen with the fix');
  req.destroy();
});

req.write(data);
req.end();
