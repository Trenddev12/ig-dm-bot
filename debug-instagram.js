require('dotenv').config();
const puppeteer = require('puppeteer');

const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

async function debugInstagram() {
  console.log('🔍 Instagram UI Debug Tool...\n');
  
  let browser;
  try {
    console.log('🌐 Launching browser in non-headless mode...');
    browser = await puppeteer.launch({
      headless: false, // Keep visible for debugging
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor'
      ],
      executablePath: puppeteer.executablePath(),
      timeout: 60000,
      defaultViewport: null // Use full screen
    });

    const page = await browser.newPage();
    
    // Set user agent and other headers to look more human
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });
    
    console.log('📱 Navigating to Instagram...');
    await page.goto('https://www.instagram.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Take initial screenshot
    await page.screenshot({ path: 'debug-1-homepage.png', fullPage: true });
    console.log('📸 Screenshot 1: Homepage saved');

    // Look for login link/button
    console.log('🔍 Looking for login options...');
    
    const loginSelectors = [
      'a[href="/accounts/login/"]',
      'a[href*="login"]',
      'button:contains("Log in")',
      'a:contains("Log in")'
    ];
    
    let loginFound = false;
    for (const selector of loginSelectors) {
      try {
        if (selector.includes(':contains')) {
          const elements = await page.$x(`//a[contains(text(), 'Log in')] | //button[contains(text(), 'Log in')]`);
          if (elements.length > 0) {
            console.log(`✅ Found login with XPath`);
            await elements[0].click();
            loginFound = true;
            break;
          }
        } else {
          const element = await page.$(selector);
          if (element) {
            console.log(`✅ Found login with: ${selector}`);
            await element.click();
            loginFound = true;
            break;
          }
        }
      } catch (e) {
        console.log(`❌ Login selector failed: ${selector}`);
      }
    }

    if (!loginFound) {
      console.log('🔗 Navigating directly to login page...');
      await page.goto('https://www.instagram.com/accounts/login/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'debug-2-login-page.png', fullPage: true });
    console.log('📸 Screenshot 2: Login page saved');

    // Analyze login form
    console.log('🔍 Analyzing login form...');
    
    const usernameSelectors = [
      'input[name="username"]',
      'input[type="text"]',
      'input[placeholder*="username"]',
      'input[placeholder*="email"]'
    ];
    
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]'
    ];
    
    let usernameField = null;
    let passwordField = null;
    
    for (const selector of usernameSelectors) {
      try {
        usernameField = await page.$(selector);
        if (usernameField) {
          console.log(`✅ Found username field: ${selector}`);
          break;
        }
      } catch (e) {}
    }
    
    for (const selector of passwordSelectors) {
      try {
        passwordField = await page.$(selector);
        if (passwordField) {
          console.log(`✅ Found password field: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    if (usernameField && passwordField) {
      console.log('👤 Filling login form...');
      await page.focus('input[name="username"]');
      await page.type('input[name="username"]', IG_USERNAME, { delay: 100 });
      await page.focus('input[name="password"]');
      await page.type('input[name="password"]', IG_PASSWORD, { delay: 100 });
      
      await page.screenshot({ path: 'debug-3-form-filled.png', fullPage: true });
      console.log('📸 Screenshot 3: Form filled');
      
      // Find submit button
      const submitSelectors = [
        'button[type="submit"]',
        'button:contains("Log in")',
        'input[type="submit"]',
        '[role="button"]:contains("Log in")'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          if (selector.includes(':contains')) {
            const elements = await page.$x(`//button[contains(text(), 'Log in')] | //button[contains(text(), 'Log In')]`);
            if (elements.length > 0) {
              submitButton = elements[0];
              console.log(`✅ Found submit button with XPath`);
              break;
            }
          } else {
            submitButton = await page.$(selector);
            if (submitButton) {
              console.log(`✅ Found submit button: ${selector}`);
              break;
            }
          }
        } catch (e) {}
      }
      
      if (submitButton) {
        console.log('🔐 Clicking login button...');
        await submitButton.click();
        
        // Wait for response
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const currentUrl = page.url();
        console.log(`📍 URL after login attempt: ${currentUrl}`);
        
        await page.screenshot({ path: 'debug-4-after-login.png', fullPage: true });
        console.log('📸 Screenshot 4: After login attempt');
        
        // Check for various outcomes
        if (currentUrl.includes('/challenge/')) {
          console.log('🔐 2FA/Challenge detected');
        } else if (currentUrl.includes('/accounts/login/')) {
          console.log('❌ Still on login page - check for errors');
          
          // Look for error messages
          const errorSelectors = [
            '[role="alert"]',
            '.error-message',
            '[data-testid="login-error"]',
            'div:contains("incorrect")',
            'div:contains("error")'
          ];
          
          for (const selector of errorSelectors) {
            try {
              if (selector.includes(':contains')) {
                const elements = await page.$x(`//div[contains(text(), 'incorrect')] | //div[contains(text(), 'error')] | //div[contains(text(), 'wrong')]`);
                for (const element of elements) {
                  const text = await page.evaluate(el => el.textContent, element);
                  console.log(`🚨 Error found: ${text}`);
                }
              } else {
                const elements = await page.$$(selector);
                for (const element of elements) {
                  const text = await page.evaluate(el => el.textContent, element);
                  if (text.trim()) {
                    console.log(`🚨 Error found: ${text}`);
                  }
                }
              }
            } catch (e) {}
          }
        } else {
          console.log('✅ Login appears successful!');
        }
      } else {
        console.log('❌ Could not find submit button');
      }
    } else {
      console.log('❌ Could not find login form fields');
    }
    
    // Keep browser open for manual inspection
    console.log('\n⏳ Browser will stay open for 30 seconds for manual inspection...');
    console.log('💡 You can manually interact with the page to test the flow');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }
  }
}

// Run the debug
debugInstagram();
