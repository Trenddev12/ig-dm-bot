require('dotenv').config();
const puppeteer = require('puppeteer');

// Configure Chrome path for production environment BEFORE any Puppeteer operations
if (process.env.NODE_ENV === 'production') {
  console.log('🔧 Configuring Chrome for production environment...');

  // Set Puppeteer cache directory
  process.env.PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';

  // Try to find Chrome executable
  const fs = require('fs');
  const possibleChromePaths = [
    '/opt/render/.cache/puppeteer/chrome/linux-137.0.7151.119/chrome-linux64/chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];

  let chromeExecutablePath = null;
  for (const chromePath of possibleChromePaths) {
    try {
      if (fs.existsSync(chromePath)) {
        chromeExecutablePath = chromePath;
        console.log(`✅ Found Chrome at: ${chromePath}`);
        break;
      }
    } catch (error) {
      // Continue to next path
    }
  }

  if (chromeExecutablePath) {
    process.env.PUPPETEER_EXECUTABLE_PATH = chromeExecutablePath;
    console.log(`🎯 Set PUPPETEER_EXECUTABLE_PATH to: ${chromeExecutablePath}`);
  } else {
    console.log('⚠️ No Chrome found at expected paths');
  }
}
const express = require('express');
const bodyParser = require('body-parser');
const SessionManager = require('./session-manager');

const app = express();
app.use(bodyParser.json());

const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;
const IG_SESSION_ID = process.env.IG_SESSION_ID || '71638033137%3AFCZkHir9q9Ncz3%3A6%3AAYdJrK5lxkAFFunzXHWw_4Z92fQrbcy95UFG4gVzmQ';

// Initialize session manager with session ID
const sessionManager = new SessionManager(IG_SESSION_ID);

// Login function with session management
async function loginToInstagram(page) {
  console.log('🔐 Starting Instagram login process...');

  // Try to load session (either from session ID or saved cookies)
  const sessionLoaded = await sessionManager.loadSession(page);

  if (sessionLoaded) {
    console.log('🔄 Checking if session is valid...');

    // Wait a bit for the page to load with the session
    await new Promise(resolve => setTimeout(resolve, 3000));

    const isLoggedIn = await sessionManager.isLoggedIn(page);
    if (isLoggedIn) {
      console.log('✅ Session is valid, login successful');
      return true;
    } else {
      console.log('❌ Session invalid, checking current page...');
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);

      // If we have a session ID, the login should work, so this might be a detection issue
      if (sessionManager.sessionId) {
        throw new Error('Session ID provided but login verification failed. The session might be expired or invalid.');
      }
    }
  }

  // Fresh login required
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
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
  ]);

  // Check login result
  const currentUrl = page.url();
  console.log(`📍 Current URL after login: ${currentUrl}`);

  if (currentUrl.includes('/challenge/')) {
    throw new Error('2FA/Challenge required. Please complete the challenge manually and try again later.');
  }

  if (currentUrl.includes('/accounts/login/')) {
    throw new Error('Login failed - check credentials or account status');
  }

  // Login successful, save session
  console.log('✅ Login successful, saving session...');
  await sessionManager.saveSession(page);

  return true;
}

// Root route to verify server is live
app.get("/", (req, res) => {
  res.send("FluxDX IG DM bot is live 🚀");
});

// Clear session endpoint
app.post('/clear-session', async (req, res) => {
  try {
    await sessionManager.clearSession();
    res.status(200).json({
      success: true,
      message: "Session cleared successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Main POST endpoint to send DM
app.post('/send-instagram-dm', async (req, res) => {
  const { username, message } = req.body;

  // Input validation
  if (!username || !message) {
    console.log('❌ Missing required fields: username or message');
    return res.status(400).send("Missing required fields: username and message");
  }

  console.log(`🚀 Starting DM process for @${username}`);
  console.log(`📝 Message: "${message}"`);

  let browser;
  try {
    console.log('🌐 Launching browser...');

    // Render-compatible browser configuration
    const browserOptions = {
      headless: 'new', // Use new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ],
      timeout: 60000
    };

    // Chrome executable path is already configured via environment variable
    console.log('🚀 Launching browser with configured settings...');
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      console.log(`🎯 Using Chrome at: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
    }

    browser = await puppeteer.launch(browserOptions);

    const page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Login to Instagram using session management
    await loginToInstagram(page);

    console.log(`🎯 Navigating to @${username}'s profile...`);
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Check if profile exists
    const profileExists = await page.$('h2') !== null;
    if (!profileExists) {
      throw new Error(`Profile @${username} not found or is private`);
    }

    console.log('⏳ Waiting for page to load completely...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔍 Looking for Message button...');

    // Try multiple selectors for the Message button
    let messageButton = null;
    const selectors = [
      "//button[contains(., 'Message')]",
      "//div[contains(., 'Message')]//button",
      "//a[contains(@href, '/direct/')]",
      "[data-testid='message-button']"
    ];

    for (const selector of selectors) {
      try {
        if (selector.startsWith('//')) {
          const buttons = await page.$x(selector);
          if (buttons.length > 0) {
            messageButton = buttons[0];
            console.log(`✅ Found Message button with XPath: ${selector}`);
            break;
          }
        } else {
          messageButton = await page.$(selector);
          if (messageButton) {
            console.log(`✅ Found Message button with CSS: ${selector}`);
            break;
          }
        }
      } catch (e) {
        console.log(`❌ Selector failed: ${selector}`);
      }
    }

    if (!messageButton) {
      // Take a screenshot for debugging
      await page.screenshot({ path: 'debug-profile.png' });
      throw new Error("Message button not found - user might not allow DMs or profile structure changed");
    }

    console.log('💬 Clicking Message button...');
    await messageButton.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('📝 Looking for message input field...');

    // Try multiple selectors for the textarea
    let messageInput = null;
    const textareaSelectors = [
      'textarea[placeholder*="Message"]',
      'textarea',
      '[contenteditable="true"]',
      'div[role="textbox"]'
    ];

    for (const selector of textareaSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        messageInput = await page.$(selector);
        if (messageInput) {
          console.log(`✅ Found message input with: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ Input selector failed: ${selector}`);
      }
    }

    if (!messageInput) {
      await page.screenshot({ path: 'debug-dm.png' });
      throw new Error("Message input field not found");
    }

    console.log('⌨️ Typing message...');
    await page.focus('textarea, [contenteditable="true"], div[role="textbox"]');
    await page.type('textarea, [contenteditable="true"], div[role="textbox"]', message, { delay: 50 });

    console.log('📤 Sending message...');
    await page.keyboard.press('Enter');

    // Wait a bit to ensure message is sent
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(`✅ DM sent successfully to @${username}`);
    res.status(200).json({
      success: true,
      message: "DM sent successfully",
      recipient: username,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(`❌ Error sending DM to @${username}:`, err.message);
    console.error('Stack trace:', err.stack);

    res.status(500).json({
      success: false,
      error: err.message,
      recipient: username,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Instagram DM Bot Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Session ID configured: ${IG_SESSION_ID ? 'Yes' : 'No'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/`);
  console.log(`📡 DM endpoint: http://localhost:${PORT}/send-instagram-dm`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
