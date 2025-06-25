const fs = require('fs').promises;
const path = require('path');

class SessionManager {
  constructor(sessionId = null) {
    this.sessionFile = path.join(__dirname, 'instagram-session.json');
    this.sessionId = sessionId;
  }

  async saveSession(page) {
    try {
      const cookies = await page.cookies();
      const sessionData = {
        cookies,
        timestamp: Date.now(),
        userAgent: await page.evaluate(() => navigator.userAgent)
      };
      
      await fs.writeFile(this.sessionFile, JSON.stringify(sessionData, null, 2));
      console.log('💾 Session saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to save session:', error.message);
      return false;
    }
  }

  async loadSession(page) {
    try {
      // If we have a session ID, use it directly
      if (this.sessionId) {
        console.log('🔑 Using provided session ID...');
        return await this.loadSessionFromId(page, this.sessionId);
      }

      // Otherwise try to load from file
      const sessionData = await fs.readFile(this.sessionFile, 'utf8');
      const { cookies, timestamp, userAgent } = JSON.parse(sessionData);

      // Check if session is less than 24 hours old
      const sessionAge = Date.now() - timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > maxAge) {
        console.log('⏰ Session expired, will need fresh login');
        return false;
      }

      // Set user agent
      if (userAgent) {
        await page.setUserAgent(userAgent);
      }

      // Set cookies
      await page.setCookie(...cookies);
      console.log('🔄 Session loaded successfully');
      return true;
    } catch (error) {
      console.log('📝 No existing session found, will need fresh login');
      return false;
    }
  }

  async loadSessionFromId(page, sessionId) {
    try {
      console.log('🍪 Setting up Instagram session with session ID...');

      // Decode the session ID if it's URL encoded
      const decodedSessionId = decodeURIComponent(sessionId);
      console.log('🔑 Decoded session ID:', decodedSessionId);

      // First navigate to Instagram to set the domain
      await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });

      // Create the sessionid cookie
      const sessionCookie = {
        name: 'sessionid',
        value: decodedSessionId,
        domain: '.instagram.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'None'
      };

      // Set additional Instagram cookies that are typically present
      const additionalCookies = [
        {
          name: 'csrftoken',
          value: this.generateCSRFToken(),
          domain: '.instagram.com',
          path: '/',
          secure: true,
          sameSite: 'Lax'
        },
        {
          name: 'mid',
          value: this.generateMachineId(),
          domain: '.instagram.com',
          path: '/',
          secure: true,
          sameSite: 'None'
        }
      ];

      // Set all cookies
      await page.setCookie(sessionCookie, ...additionalCookies);

      console.log('✅ Session ID cookies set successfully');

      // Reload the page to apply the session
      await page.reload({ waitUntil: 'networkidle2' });

      return true;
    } catch (error) {
      console.error('❌ Failed to load session from ID:', error.message);
      return false;
    }
  }

  generateCSRFToken() {
    // Generate a random CSRF token similar to Instagram's format
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  generateMachineId() {
    // Generate a random machine ID similar to Instagram's format
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < 22; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async clearSession() {
    try {
      await fs.unlink(this.sessionFile);
      console.log('🗑️ Session cleared');
    } catch (error) {
      // File doesn't exist, that's fine
    }
  }

  async isLoggedIn(page) {
    try {
      // Check if we're on Instagram and not on login page
      const currentUrl = page.url();
      console.log(`🔍 Checking login status for URL: ${currentUrl}`);

      if (!currentUrl.includes('instagram.com')) {
        console.log('❌ Not on Instagram domain');
        return false;
      }

      if (currentUrl.includes('/accounts/login/') || currentUrl.includes('/challenge/')) {
        console.log('❌ On login or challenge page');
        return false;
      }

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Look for multiple indicators of being logged in
      const indicators = await page.evaluate(() => {
        const results = {
          userAvatar: !!document.querySelector('[data-testid="user-avatar"]'),
          profileLink: !!document.querySelector('[href*="/accounts/edit/"]'),
          homeIcon: !!document.querySelector('[aria-label="Home"], [data-testid="home-icon"]'),
          searchBox: !!document.querySelector('input[placeholder*="Search"], [placeholder*="search"]'),
          newPostButton: !!document.querySelector('[aria-label*="New post"], [data-testid="new-post"]'),
          navigationBar: !!document.querySelector('nav, [role="navigation"]'),
          feedContent: !!document.querySelector('[role="main"], main, [data-testid="feed"]'),
          // Check for login-specific elements (should NOT be present)
          loginForm: !!document.querySelector('input[name="username"], input[name="password"]'),
          loginButton: !!document.querySelector('button[type="submit"]'),
          // Check for common logged-in page elements
          storyTray: !!document.querySelector('[data-testid="story-tray"]'),
          sideNav: !!document.querySelector('[data-testid="sidenav"]')
        };

        // Count positive indicators
        const positiveCount = Object.entries(results)
          .filter(([key, value]) => !['loginForm', 'loginButton'].includes(key) && value)
          .length;

        results.positiveCount = positiveCount;
        results.hasLoginElements = results.loginForm || results.loginButton;

        return results;
      });

      console.log('🔍 Login indicators:', indicators);

      // If we have login elements, definitely not logged in
      if (indicators.hasLoginElements) {
        console.log('❌ Login form detected - not logged in');
        return false;
      }

      // If we have multiple positive indicators, likely logged in
      if (indicators.positiveCount >= 2) {
        console.log(`✅ Found ${indicators.positiveCount} login indicators - logged in`);
        return true;
      }

      // Additional check: try to access a logged-in only endpoint
      try {
        const response = await page.evaluate(async () => {
          const response = await fetch('/api/v1/users/self/', {
            credentials: 'include'
          });
          return response.status;
        });

        if (response === 200) {
          console.log('✅ API endpoint accessible - logged in');
          return true;
        }
      } catch (e) {
        console.log('ℹ️ API check failed, using other indicators');
      }

      console.log(`❌ Only ${indicators.positiveCount} indicators found - likely not logged in`);
      return false;

    } catch (error) {
      console.error('❌ Error checking login status:', error.message);
      return false;
    }
  }
}

module.exports = SessionManager;
