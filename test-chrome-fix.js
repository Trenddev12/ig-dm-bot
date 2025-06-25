const https = require('https');

console.log('🧪 Testing Chrome fix with proper request...');

const data = JSON.stringify({
  username: 'uday_mehlawat',  // Testing with the specified username
  message: 'Hello! This is a test message from the Instagram DM bot.'
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
  timeout: 90000  // 90 second timeout for Instagram operations
};

console.log('📤 Sending test request...');
console.log('🎯 Target:', options.hostname + options.path);
console.log('📝 Payload:', data);

const req = https.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('📝 Response:', responseData);
    
    try {
      const parsed = JSON.parse(responseData);
      console.log('✅ Parsed response:', JSON.stringify(parsed, null, 2));
      
      if (parsed.success) {
        console.log('🎉 SUCCESS: Chrome is working and bot sent DM!');
      } else if (parsed.error && !parsed.error.includes('Could not find Chrome')) {
        console.log('✅ PROGRESS: Chrome is working, but got different error:', parsed.error);
      } else {
        console.log('❌ Chrome issue still exists:', parsed.error);
      }
    } catch (e) {
      console.log('📄 Raw response (not JSON):', responseData);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request error:', error.message);
});

req.on('timeout', () => {
  console.log('⏰ Request timed out - this might mean Chrome is working but taking time');
  req.destroy();
});

req.write(data);
req.end();
