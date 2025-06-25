require('dotenv').config();
const puppeteer = require('puppeteer');
const SessionManager = require('./session-manager');

const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

async function setupSession() {
  console.log('🔧 Instagram Session Setup Tool');
  console.log('This tool will help you establish a valid Instagram session');
  console.log('You may need to manually complete 2FA/challenges\n');
  
  const sessionManager = new SessionManager();
  let browser;
  
  try {
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Keep visible for manual interaction
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ],
      executablePath: puppeteer.executablePath(),
      timeout: 60000,
      defaultViewport: null
    });

    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📱 Navigating to Instagram login...');
    await page.goto('https://www.instagram.com/accounts/login/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    console.log('🔍 Waiting for login form...');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    
    console.log('👤 Filling credentials...');
    await page.type('input[name="username"]', IG_USERNAME, { delay: 100 });
    await page.type('input[name="password"]', IG_PASSWORD, { delay: 100 });
    
    console.log('🔐 Clicking login...');
    await page.click('button[type="submit"]');
    
    console.log('\n⚠️  MANUAL INTERVENTION REQUIRED');
    console.log('📋 Please complete the following steps manually in the browser:');
    console.log('   1. Complete any 2FA/challenge if prompted');
    console.log('   2. Navigate to Instagram homepage');
    console.log('   3. Ensure you are fully logged in');
    console.log('   4. Press ENTER in this terminal when ready');
    
    // Wait for user input
    await new Promise((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
    
    console.log('\n🔍 Checking login status...');
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Navigate to homepage to ensure we're logged in
    if (!currentUrl.includes('instagram.com') || currentUrl.includes('/accounts/login/')) {
      console.log('🏠 Navigating to homepage...');
      await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
    }
    
    const isLoggedIn = await sessionManager.isLoggedIn(page);
    
    if (isLoggedIn) {
      console.log('✅ Login verified! Saving session...');
      await sessionManager.saveSession(page);
      console.log('💾 Session saved successfully!');
      console.log('\n🎉 Setup complete! You can now use the DM bot without manual login.');
    } else {
      console.log('❌ Login verification failed. Please try again.');
      console.log('💡 Make sure you are fully logged in to Instagram');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      await browser.close();
    }
  }
}

console.log('🚀 Starting session setup...');
console.log('Press Ctrl+C to cancel\n');

setupSession();
