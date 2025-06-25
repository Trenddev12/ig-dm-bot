require('dotenv').config();
const puppeteer = require('puppeteer');

const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

async function testInstagramLogin() {
  console.log('🧪 Testing Instagram Login Flow...\n');
  
  let browser;
  try {
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Set to false for debugging
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
      executablePath: puppeteer.executablePath(),
      timeout: 60000
    });

    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('📱 Navigating to Instagram login page...');
    await page.goto('https://www.instagram.com/accounts/login/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    console.log('🔍 Waiting for login form...');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    
    console.log('👤 Entering credentials...');
    await page.type('input[name="username"]', IG_USERNAME, { delay: 100 });
    await page.type('input[name="password"]', IG_PASSWORD, { delay: 100 });
    
    console.log('🔐 Clicking login button...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation or error
    console.log('⏳ Waiting for login result...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/accounts/login/')) {
      console.log('❌ Still on login page - login failed');
      
      // Check for error messages
      const errorElements = await page.$$('div[role="alert"], .error-message, [data-testid="login-error"]');
      if (errorElements.length > 0) {
        for (const element of errorElements) {
          const text = await page.evaluate(el => el.textContent, element);
          console.log(`🚨 Error message: ${text}`);
        }
      }
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'login-error.png' });
      console.log('📸 Screenshot saved as login-error.png');
      
    } else if (currentUrl.includes('/challenge/')) {
      console.log('🔐 2FA/Challenge required');
      await page.screenshot({ path: 'challenge-required.png' });
      console.log('📸 Screenshot saved as challenge-required.png');
      
    } else if (currentUrl.includes('instagram.com') && !currentUrl.includes('/accounts/login/')) {
      console.log('✅ Login successful!');
      console.log(`📍 Redirected to: ${currentUrl}`);
      
      // Try to find user indicator
      const userIndicators = await page.$$('[data-testid="user-avatar"], [aria-label*="profile"]');
      if (userIndicators.length > 0) {
        console.log('👤 User avatar/profile found - definitely logged in');
      }
      
      await page.screenshot({ path: 'login-success.png' });
      console.log('📸 Screenshot saved as login-success.png');
    }
    
    // Keep browser open for 10 seconds for manual inspection
    console.log('⏳ Keeping browser open for 10 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }
  }
}

// Run the test
testInstagramLogin();
