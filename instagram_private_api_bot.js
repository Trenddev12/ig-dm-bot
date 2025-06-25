/**
 * FREE Instagram DM Bot using Instagram-Private-API
 * Perfect for n8n integration - 100% FREE and RELIABLE
 * No browser needed - much faster than Puppeteer
 * Uses session cookies like your current setup
 */

const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  if (req.method === 'POST') {
    console.log('📝 Body:', req.body);
  }
  next();
});

class InstagramPrivateAPIBot {
    constructor() {
        this.ig = new IgApiClient();
        this.sessionFile = 'ig_private_session.json';
        this.isLoggedIn = false;
    }

    async loginWithCredentials(username, password) {
        try {
            console.log(`🔐 Logging in with username: ${username}`);
            
            // Generate device for this username
            this.ig.state.generateDevice(username);
            
            // Login
            await this.ig.account.login(username, password);
            
            // Save session
            const sessionData = await this.ig.state.serialize();
            fs.writeFileSync(this.sessionFile, JSON.stringify(sessionData, null, 2));
            
            this.isLoggedIn = true;
            console.log('✅ Login successful with credentials');
            return true;
            
        } catch (error) {
            console.log('❌ Credential login failed:', error.message);
            this.isLoggedIn = false;
            return false;
        }
    }

    async loginWithSession(sessionId) {
        try {
            console.log('📱 Attempting session-based login...');
            
            // Create session data structure
            const sessionData = {
                deviceString: this.ig.state.deviceString,
                deviceId: this.ig.state.deviceId,
                uuid: this.ig.state.uuid,
                phoneId: this.ig.state.phoneId,
                adid: this.ig.state.adid,
                sessionid: sessionId,
                cookies: `sessionid=${sessionId}; Path=/; Domain=.instagram.com; Secure; HttpOnly`
            };
            
            // Try to deserialize session
            await this.ig.state.deserialize(sessionData);
            
            // Test if session is valid by making a simple request
            await this.ig.user.info(this.ig.state.cookieUserId);
            
            this.isLoggedIn = true;
            console.log('✅ Session login successful');
            return true;
            
        } catch (error) {
            console.log('❌ Session login failed:', error.message);
            this.isLoggedIn = false;
            return false;
        }
    }

    async loadSavedSession() {
        try {
            if (fs.existsSync(this.sessionFile)) {
                console.log('📱 Loading saved session...');
                const sessionData = JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
                await this.ig.state.deserialize(sessionData);
                
                // Test session validity
                await this.ig.user.info(this.ig.state.cookieUserId);
                
                this.isLoggedIn = true;
                console.log('✅ Saved session loaded successfully');
                return true;
            }
        } catch (error) {
            console.log('⚠️ Saved session invalid:', error.message);
            if (fs.existsSync(this.sessionFile)) {
                fs.unlinkSync(this.sessionFile);
            }
        }
        return false;
    }

    async sendDM(targetUsername, message) {
        try {
            if (!this.isLoggedIn) {
                throw new Error('Not logged in to Instagram');
            }

            console.log(`🎯 Sending DM to @${targetUsername}`);
            console.log(`💬 Message: "${message}"`);

            // Get user ID by username
            const userId = await this.ig.user.getIdByUsername(targetUsername);
            console.log(`👤 Found user ID: ${userId}`);
            
            // Create direct thread and send message
            const thread = this.ig.entity.directThread([userId.toString()]);
            const result = await thread.broadcastText(message);

            console.log(`✅ DM sent successfully to @${targetUsername}`);
            return {
                success: true,
                message: "DM sent successfully",
                recipient: targetUsername,
                messageId: result.item_id,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.log(`❌ Failed to send DM: ${error.message}`);
            return {
                success: false,
                error: error.message,
                recipient: targetUsername,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Global bot instance
const bot = new InstagramPrivateAPIBot();

// Environment variables
const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;
const IG_SESSION_ID = process.env.IG_SESSION_ID || '71638033137%3AFCZkHir9q9Ncz3%3A6%3AAYdJrK5lxkAFFunzXHWw_4Z92fQrbcy95UFG4gVzmQ';

// Initialize login on startup
async function initializeBot() {
    console.log('🚀 Initializing Instagram Private API Bot...');
    
    // Try saved session first
    if (await bot.loadSavedSession()) {
        return;
    }
    
    // Try session ID
    if (IG_SESSION_ID) {
        console.log('🔑 Trying session ID login...');
        if (await bot.loginWithSession(IG_SESSION_ID)) {
            return;
        }
    }
    
    // Try credentials as fallback
    if (IG_USERNAME && IG_PASSWORD) {
        console.log('🔐 Trying credential login...');
        await bot.loginWithCredentials(IG_USERNAME, IG_PASSWORD);
    }
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'Instagram Private API Bot is running 🚀',
        version: '2.0',
        type: 'instagram-private-api',
        logged_in: bot.isLoggedIn,
        session_configured: !!IG_SESSION_ID,
        credentials_configured: !!(IG_USERNAME && IG_PASSWORD),
        timestamp: new Date().toISOString()
    });
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password, session_id } = req.body;
    
    try {
        let success = false;
        
        if (session_id) {
            console.log('🔑 Login with session ID...');
            success = await bot.loginWithSession(session_id);
        } else if (username && password) {
            console.log('🔐 Login with credentials...');
            success = await bot.loginWithCredentials(username, password);
        } else {
            return res.status(400).json({
                success: false,
                error: 'Provide either session_id OR username+password'
            });
        }
        
        res.json({
            success,
            message: success ? 'Login successful' : 'Login failed',
            logged_in: bot.isLoggedIn,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Send DM endpoint (perfect for n8n)
app.post('/send-dm', async (req, res) => {
    const { target_username, message, username, password, session_id } = req.body;
    
    if (!target_username || !message) {
        return res.status(400).json({
            success: false,
            error: 'target_username and message are required'
        });
    }

    try {
        // Auto-login if not logged in
        if (!bot.isLoggedIn) {
            console.log('🔄 Not logged in, attempting auto-login...');
            
            if (session_id) {
                await bot.loginWithSession(session_id);
            } else if (username && password) {
                await bot.loginWithCredentials(username, password);
            } else if (IG_SESSION_ID) {
                await bot.loginWithSession(IG_SESSION_ID);
            } else if (IG_USERNAME && IG_PASSWORD) {
                await bot.loginWithCredentials(IG_USERNAME, IG_PASSWORD);
            }
            
            if (!bot.isLoggedIn) {
                return res.status(401).json({
                    success: false,
                    error: 'Login required. Provide session_id or username+password'
                });
            }
        }

        // Send DM immediately and return response
        const result = await bot.sendDM(target_username, message);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            target_username,
            timestamp: new Date().toISOString()
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log('🚀 Instagram Private API Bot Server running on port', PORT);
    console.log('📡 Endpoints:');
    console.log('  GET  / - Health check');
    console.log('  POST /login - Login to Instagram');
    console.log('  POST /send-dm - Send DM (perfect for n8n!)');
    console.log('');
    console.log('🔥 Much faster than browser-based solutions!');
    console.log('💡 Perfect for n8n HTTP Request nodes');
    
    // Initialize bot
    await initializeBot();
    
    console.log('✅ Bot initialization complete');
});

module.exports = { InstagramPrivateAPIBot };
