const https = require('https');

console.log('🧪 Testing POST endpoint functionality...');

// Test 1: Simple test endpoint
console.log('\n1️⃣ Testing /test endpoint...');

const testData = JSON.stringify({
  test: 'hello',
  timestamp: new Date().toISOString()
});

const testOptions = {
  hostname: 'ig-dm-bot-0xvq.onrender.com',
  port: 443,
  path: '/test',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  },
  timeout: 10000
};

const testReq = https.request(testOptions, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('📝 Response:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ POST endpoint is working!');
      
      // Test 2: Main DM endpoint
      console.log('\n2️⃣ Testing /send-instagram-dm endpoint...');
      testDmEndpoint();
    } else {
      console.log('❌ POST endpoint failed');
    }
  });
});

testReq.on('error', err => {
  console.log('❌ Test endpoint error:', err.message);
});

testReq.on('timeout', () => {
  console.log('⏰ Test endpoint timeout');
  testReq.destroy();
});

testReq.write(testData);
testReq.end();

function testDmEndpoint() {
  const dmData = JSON.stringify({
    username: 'uday_mehlawat',
    message: 'Test message'
  });

  const dmOptions = {
    hostname: 'ig-dm-bot-0xvq.onrender.com',
    port: 443,
    path: '/send-instagram-dm',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dmData.length
    },
    timeout: 15000  // 15 second timeout for initial response
  };

  const dmReq = https.request(dmOptions, (res) => {
    console.log(`📊 DM Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('📝 DM Response:', data);
      
      if (res.statusCode === 200) {
        console.log('🎉 DM endpoint accepted request and processing!');
      } else if (res.statusCode === 400) {
        console.log('⚠️ Validation error - check request format');
      } else if (res.statusCode === 500) {
        console.log('⚠️ Server error - but request was processed');
      }
    });
  });

  dmReq.on('error', err => {
    console.log('❌ DM endpoint error:', err.message);
  });

  dmReq.on('timeout', () => {
    console.log('⏰ DM endpoint timeout - this might mean it\'s processing');
    dmReq.destroy();
  });

  dmReq.write(dmData);
  dmReq.end();
}
