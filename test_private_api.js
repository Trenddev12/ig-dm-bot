const https = require('https');

console.log('🧪 Testing Instagram Private API Bot...');
console.log('🎯 Target: uday_mehlawat');
console.log('💬 Message: Hello from Private API Bot!');
console.log('');

// Test data
const testData = JSON.stringify({
  target_username: 'uday_mehlawat',
  message: 'Hello Uday! 🚀 This is from the NEW Instagram Private API Bot! Much faster and more reliable than browser automation. Time: ' + new Date().toLocaleString(),
  session_id: '71638033137%3AFCZkHir9q9Ncz3%3A6%3AAYdJrK5lxkAFFunzXHWw_4Z92fQrbcy95UFG4gVzmQ'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/send-dm',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  },
  timeout: 15000
};

console.log('📤 Sending test request...');

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
      
      if (parsed.success) {
        console.log('');
        console.log('🎉 SUCCESS! Private API Bot is working!');
        console.log('✅ DM sent successfully');
        console.log('📱 Check Instagram DMs to confirm');
        console.log('🚀 Bot is ready for n8n integration!');
      } else {
        console.log('');
        console.log('⚠️ Error:', parsed.error);
      }
    } catch (e) {
      console.log('📄 Raw response:', responseData);
    }
    
    console.log('=' .repeat(50));
  });
});

req.on('error', error => {
  console.log('❌ Request error:', error.message);
  console.log('💡 Make sure the bot server is running: node instagram_private_api_bot.js');
});

req.on('timeout', () => {
  console.log('⏰ Request timeout');
  req.destroy();
});

req.write(testData);
req.end();
