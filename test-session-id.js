require('dotenv').config();
const puppeteer = require('puppeteer');
const SessionManager = require('./session-manager');

const IG_SESSION_ID = process.env.IG_SESSION_ID;

async function testSessionId() {
  console.log('🧪 Testing Instagram Session ID Login...\n');
  
  let browser;
  try {
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Keep visible for debugging
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
    
    console.log('🔑 Session ID:', IG_SESSION_ID);
    
    // Initialize session manager with session ID
    const sessionManager = new SessionManager(IG_SESSION_ID);
    
    console.log('🔄 Loading session with session ID...');
    const sessionLoaded = await sessionManager.loadSession(page);
    
    if (sessionLoaded) {
      console.log('✅ Session loaded successfully');
      
      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔍 Checking login status...');
      const isLoggedIn = await sessionManager.isLoggedIn(page);
      
      if (isLoggedIn) {
        console.log('🎉 SUCCESS! Session ID login working perfectly');
        
        // Try to get user info
        try {
          const userInfo = await page.evaluate(() => {
            // Try to find username in various places
            const usernameSelectors = [
              '[data-testid="user-avatar"]',
              '[href*="/accounts/edit/"]',
              'a[href*="/"] img[alt*="profile picture"]'
            ];
            
            for (const selector of usernameSelectors) {
              const element = document.querySelector(selector);
              if (element) {
                return {
                  found: true,
                  selector: selector,
                  alt: element.alt || '',
                  href: element.href || ''
                };
              }
            }
            return { found: false };
          });
          
          console.log('👤 User info found:', userInfo);
        } catch (e) {
          console.log('ℹ️ Could not extract user info, but login is confirmed');
        }
        
        // Take a screenshot
        await page.screenshot({ path: 'session-id-success.png', fullPage: true });
        console.log('📸 Screenshot saved as session-id-success.png');
        
      } else {
        console.log('❌ Session ID loaded but login verification failed');
        console.log('📍 Current URL:', page.url());
        
        // Take screenshot for debugging
        await page.screenshot({ path: 'session-id-failed.png', fullPage: true });
        console.log('📸 Debug screenshot saved as session-id-failed.png');
      }
    } else {
      console.log('❌ Failed to load session with session ID');
    }
    
    // Keep browser open for inspection
    console.log('\n⏳ Keeping browser open for 15 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }
  }
}

// Run the test
testSessionId();
