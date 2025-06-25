/**
 * FREE Instagram DM Bot using Instagram-Private-API
 * Perfect for n8n integration - 100% FREE and RELIABLE
 * No browser needed - much faster than Puppeteer
 */

const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const fs = require('fs');

const app = express();
app.use(express.json());

class InstagramDMBot {
    constructor() {
        this.ig = new IgApiClient();
        this.sessionFile = 'ig_session.json';
    }

    async loginWithSession(username, password) {
        try {
            // Try to load existing session
            if (fs.existsSync(this.sessionFile)) {
                console.log('📱 Loading existing session...');
                const sessionData = JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
                await this.ig.state.deserialize(sessionData);
                console.log('✅ Logged in with saved session');
                return true;
            }
        } catch (error) {
            console.log('⚠️ Session load failed:', error.message);
        }

        try {
            // Fresh login
            console.log('🔐 Performing fresh login...');
            this.ig.state.generateDevice(username);
            await this.ig.account.login(username, password);
            
            // Save session
            const sessionData = await this.ig.state.serialize();
            fs.writeFileSync(this.sessionFile, JSON.stringify(sessionData));
            console.log('✅ Login successful, session saved');
            return true;
            
        } catch (error) {
            console.log('❌ Login failed:', error.message);
            return false;
        }
    }

    async sendDM(username, message) {
        try {
            console.log(`🎯 Sending DM to @${username}`);
            console.log(`💬 Message: ${message}`);

            // Get user ID
            const userId = await this.ig.user.getIdByUsername(username);
            
            // Send message
            const thread = this.ig.entity.directThread([userId.toString()]);
            await thread.broadcastText(message);

            console.log(`✅ DM sent successfully to @${username}`);
            return {
                success: true,
                message: "DM sent successfully",
                recipient: username,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.log(`❌ Failed to send DM: ${error.message}`);
            return {
                success: false,
                error: error.message,
                recipient: username,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Global bot instance
const bot = new InstagramDMBot();
let isLoggedIn = false;

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'Instagram DM Bot API is running',
        version: '2.0',
        type: 'instagram-private-api',
        logged_in: isLoggedIn,
        timestamp: new Date().toISOString()
    });
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Username and password required'
        });
    }

    console.log(`🔐 Login attempt for @${username}`);
    
    try {
        const success = await bot.loginWithSession(username, password);
        isLoggedIn = success;
        
        res.json({
            success,
            message: success ? 'Login successful' : 'Login failed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Send DM endpoint (perfect for n8n)
app.post('/send-dm', async (req, res) => {
    const { username, password, target_username, message } = req.body;
    
    if (!target_username || !message) {
        return res.status(400).json({
            success: false,
            error: 'target_username and message are required'
        });
    }

    try {
        // Auto-login if credentials provided
        if (username && password && !isLoggedIn) {
            console.log('🔐 Auto-login with provided credentials...');
            isLoggedIn = await bot.loginWithSession(username, password);
            
            if (!isLoggedIn) {
                return res.status(401).json({
                    success: false,
                    error: 'Login failed with provided credentials'
                });
            }
        }

        if (!isLoggedIn) {
            return res.status(401).json({
                success: false,
                error: 'Not logged in. Please login first or provide credentials.'
            });
        }

        // Send DM
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
            timestamp: new Date().toISOString()
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 Instagram DM Bot API Server running on port', PORT);
    console.log('📡 Endpoints:');
    console.log('  GET  / - Health check');
    console.log('  POST /login - Login to Instagram');
    console.log('  POST /send-dm - Send DM');
    console.log('');
    console.log('🔥 Perfect for n8n integration!');
    console.log('💡 Much faster than browser-based solutions');
});

module.exports = { InstagramDMBot };
