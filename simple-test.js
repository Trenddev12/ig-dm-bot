const https = require('https');

console.log('🧪 Simple Test for Instagram Bot...');

// Simple test data
const testData = JSON.stringify({
  target_username: 'uday_mehlawat',
  message: 'Hello from bot!'
});

console.log('📝 Test data:', testData);
console.log('📏 Length:', testData.length);

const options = {
  hostname: 'ig-dm-bot-0xvq.onrender.com',
  port: 443,
  path: '/send-dm',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  },
  timeout: 20000
};

console.log('📤 Sending request...');

const req = https.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('📝 Raw Response:');
    console.log(data);
    
    try {
      const parsed = JSON.parse(data);
      console.log('✅ Parsed Response:', JSON.stringify(parsed, null, 2));
      
      if (parsed.success) {
        console.log('🎉 SUCCESS! DM sent!');
      } else {
        console.log('⚠️ Error:', parsed.error);
      }
    } catch (e) {
      console.log('❌ JSON parse error:', e.message);
    }
  });
});

req.on('error', error => {
  console.log('❌ Request error:', error.message);
});

req.on('timeout', () => {
  console.log('⏰ Request timeout');
  req.destroy();
});

req.write(testData);
req.end();
