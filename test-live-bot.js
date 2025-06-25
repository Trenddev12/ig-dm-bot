const https = require('https');

console.log('🧪 Testing LIVE Instagram Private API Bot...');
console.log('🌐 URL: https://ig-dm-bot-0xvq.onrender.com');
console.log('🎯 Target: uday_mehlawat');
console.log('');

// Test 1: Health Check
console.log('1️⃣ Testing health endpoint...');

const healthReq = https.request({
  hostname: 'ig-dm-bot-0xvq.onrender.com',
  port: 443,
  path: '/',
  method: 'GET',
  timeout: 10000
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('📊 Health Status:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('✅ Bot Status:', parsed.status);
      console.log('🔑 Logged In:', parsed.logged_in);
      console.log('📱 Session Configured:', parsed.session_configured);
      
      if (parsed.logged_in) {
        console.log('🎉 Bot is logged in! Testing DM...');
        testDM();
      } else {
        console.log('⚠️ Bot not logged in, testing DM with session...');
        testDMWithSession();
      }
    } catch (e) {
      console.log('📄 Raw response:', data);
      testDMWithSession();
    }
  });
});

healthReq.on('error', err => console.log('❌ Health check error:', err.message));
healthReq.on('timeout', () => {
  console.log('⏰ Health check timeout');
  healthReq.destroy();
});

healthReq.end();

function testDM() {
  console.log('\n2️⃣ Testing DM (bot already logged in)...');
  
  const dmData = JSON.stringify({
    target_username: 'uday_mehlawat',
    message: 'Hello Uday! 🚀 This is from the NEW Instagram Private API Bot! Much faster than the old browser version. Time: ' + new Date().toLocaleString()
  });

  const dmReq = https.request({
    hostname: 'ig-dm-bot-0xvq.onrender.com',
    port: 443,
    path: '/send-dm',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dmData.length
    },
    timeout: 30000
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('📊 DM Status:', res.statusCode);
      try {
        const parsed = JSON.parse(data);
        console.log('📝 Response:', JSON.stringify(parsed, null, 2));
        
        if (parsed.success) {
          console.log('🎉 SUCCESS! DM sent successfully!');
          console.log('📱 Check Instagram DMs to confirm delivery');
        } else {
          console.log('⚠️ Error:', parsed.error);
        }
      } catch (e) {
        console.log('📄 Raw response:', data);
      }
    });
  });

  dmReq.on('error', err => console.log('❌ DM error:', err.message));
  dmReq.on('timeout', () => {
    console.log('⏰ DM timeout');
    dmReq.destroy();
  });

  dmReq.write(dmData);
  dmReq.end();
}

function testDMWithSession() {
  console.log('\n2️⃣ Testing DM with session ID...');
  
  const dmData = JSON.stringify({
    target_username: 'uday_mehlawat',
    message: 'Hello Uday! 🚀 This is from the Instagram Private API Bot with session login! Time: ' + new Date().toLocaleString(),
    session_id: '71638033137%3AFCZkHir9q9Ncz3%3A6%3AAYdJrK5lxkAFFunzXHWw_4Z92fQrbcy95UFG4gVzmQ'
  });

  const dmReq = https.request({
    hostname: 'ig-dm-bot-0xvq.onrender.com',
    port: 443,
    path: '/send-dm',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dmData.length
    },
    timeout: 30000
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('📊 DM Status:', res.statusCode);
      try {
        const parsed = JSON.parse(data);
        console.log('📝 Response:', JSON.stringify(parsed, null, 2));
        
        if (parsed.success) {
          console.log('🎉 SUCCESS! DM sent with session!');
          console.log('📱 Check Instagram DMs to confirm delivery');
          console.log('✅ Bot is ready for n8n integration!');
        } else {
          console.log('⚠️ Error:', parsed.error);
        }
      } catch (e) {
        console.log('📄 Raw response:', data);
      }
    });
  });

  dmReq.on('error', err => console.log('❌ DM error:', err.message));
  dmReq.on('timeout', () => {
    console.log('⏰ DM timeout');
    dmReq.destroy();
  });

  dmReq.write(dmData);
  dmReq.end();
}
