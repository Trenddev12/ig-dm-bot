require('dotenv').config();
const puppeteer = require('puppeteer');
const SessionManager = require('./session-manager');

const IG_SESSION_ID = process.env.IG_SESSION_ID;

async function testMessageButton() {
  console.log('🧪 Testing Message Button Detection...\n');
  
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
    
    // Initialize session manager with session ID
    const sessionManager = new SessionManager(IG_SESSION_ID);
    
    console.log('🔄 Loading session...');
    await sessionManager.loadSession(page);
    
    // Test with Instagram's official account
    const testUsername = 'instagram';
    console.log(`🎯 Navigating to @${testUsername}'s profile...`);
    
    await page.goto(`https://www.instagram.com/${testUsername}/`, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot of the profile
    await page.screenshot({ path: 'profile-page.png', fullPage: true });
    console.log('📸 Profile screenshot saved');
    
    console.log('🔍 Looking for Message button...');
    
    // Try multiple selectors for the Message button
    const selectors = [
      "//button[contains(., 'Message')]",
      "//div[contains(., 'Message')]//button",
      "//a[contains(@href, '/direct/')]",
      "[data-testid='message-button']",
      "button[type='button']:has-text('Message')",
      "div[role='button']:has-text('Message')"
    ];
    
    let messageButton = null;
    let foundSelector = null;
    
    for (const selector of selectors) {
      try {
        console.log(`🔍 Trying selector: ${selector}`);
        
        if (selector.startsWith('//')) {
          const buttons = await page.$x(selector);
          if (buttons.length > 0) {
            messageButton = buttons[0];
            foundSelector = selector;
            console.log(`✅ Found Message button with XPath: ${selector}`);
            break;
          }
        } else {
          messageButton = await page.$(selector);
          if (messageButton) {
            foundSelector = selector;
            console.log(`✅ Found Message button with CSS: ${selector}`);
            break;
          }
        }
        console.log(`❌ No match for: ${selector}`);
      } catch (e) {
        console.log(`❌ Error with selector ${selector}:`, e.message);
      }
    }
    
    if (!messageButton) {
      console.log('❌ Message button not found with any selector');
      
      // Let's analyze what buttons are available
      console.log('🔍 Analyzing available buttons...');
      const buttonAnalysis = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a[role="button"], div[role="button"]'));
        return buttons.map(btn => ({
          tagName: btn.tagName,
          textContent: btn.textContent?.trim(),
          className: btn.className,
          href: btn.href || '',
          ariaLabel: btn.getAttribute('aria-label'),
          dataTestId: btn.getAttribute('data-testid'),
          type: btn.type || ''
        })).filter(btn => btn.textContent || btn.ariaLabel || btn.href);
      });
      
      console.log('📋 Available buttons/links:');
      buttonAnalysis.forEach((btn, index) => {
        console.log(`${index + 1}. ${btn.tagName}: "${btn.textContent}" (aria-label: "${btn.ariaLabel}", href: "${btn.href}")`);
      });
      
    } else {
      console.log('✅ Message button found!');
      
      // Get button details
      const buttonDetails = await page.evaluate(btn => ({
        tagName: btn.tagName,
        textContent: btn.textContent?.trim(),
        className: btn.className,
        href: btn.href || '',
        ariaLabel: btn.getAttribute('aria-label'),
        dataTestId: btn.getAttribute('data-testid')
      }), messageButton);
      
      console.log('📋 Button details:', buttonDetails);
      
      // Try clicking it
      console.log('💬 Attempting to click Message button...');
      await messageButton.click();
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if DM interface opened
      const currentUrl = page.url();
      console.log(`📍 URL after click: ${currentUrl}`);
      
      if (currentUrl.includes('/direct/')) {
        console.log('✅ Successfully opened DM interface!');
        await page.screenshot({ path: 'dm-interface.png', fullPage: true });
        console.log('📸 DM interface screenshot saved');
      } else {
        console.log('❌ DM interface did not open');
        await page.screenshot({ path: 'after-click.png', fullPage: true });
        console.log('📸 After-click screenshot saved');
      }
    }
    
    // Keep browser open for inspection
    console.log('\n⏳ Keeping browser open for 20 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
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
testMessageButton();
