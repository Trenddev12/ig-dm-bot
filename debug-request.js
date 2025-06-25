const https = require('https');

// Test 1: Check if the endpoint accepts our request format
console.log('🔍 Debug Test 1: Basic request validation');

const testData = JSON.stringify({
  username: 'uday_mehlawat',
  message: 'Test message'
});

console.log('📝 Request body:', testData);
console.log('📏 Content length:', testData.length);

const options = {
  hostname: 'ig-dm-bot-0xvq.onrender.com',
  port: 443,
  path: '/send-instagram-dm',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length,
    'User-Agent': 'Node.js Test Client'
  },
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('📝 Response:');
    console.log(data);
    
    // Check if it's the validation error
    if (data.includes('Missing required fields')) {
      console.log('❌ Validation error - request format issue');
    } else if (data.includes('Bad Request')) {
      console.log('❌ Bad Request - possible middleware issue');
    } else {
      console.log('✅ Request accepted, processing started');
    }
  });
});

req.on('error', err => {
  console.log('❌ Request error:', err.message);
});

req.on('timeout', () => {
  console.log('⏰ Request timeout');
  req.destroy();
});

req.write(testData);
req.end();
