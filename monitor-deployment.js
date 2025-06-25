const axios = require('axios');

// Configuration
const MONITOR_CONFIG = {
  renderUrl: 'https://ig-dm-bot-xxxx.onrender.com', // Update with your URL
  checkInterval: 30000, // 30 seconds
  maxFailures: 3,
  testAccounts: ['natgeo', 'nasa', 'therock'] // Safe accounts for testing
};

class RenderMonitor {
  constructor(config) {
    this.config = config;
    this.failures = 0;
    this.isRunning = false;
    this.stats = {
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      avgResponseTime: 0,
      lastCheck: null,
      uptime: 0
    };
    this.startTime = Date.now();
  }

  async healthCheck() {
    try {
      const startTime = Date.now();
      const response = await axios.get(this.config.renderUrl, {
        timeout: 10000
      });
      const responseTime = Date.now() - startTime;
      
      this.stats.totalChecks++;
      this.stats.successfulChecks++;
      this.stats.avgResponseTime = (this.stats.avgResponseTime + responseTime) / 2;
      this.stats.lastCheck = new Date().toISOString();
      this.failures = 0;
      
      console.log(`✅ Health check passed - ${responseTime}ms - ${response.data}`);
      return true;
    } catch (error) {
      this.stats.totalChecks++;
      this.stats.failedChecks++;
      this.failures++;
      
      console.error(`❌ Health check failed (${this.failures}/${this.config.maxFailures}):`, error.message);
      
      if (this.failures >= this.config.maxFailures) {
        console.error('🚨 SERVICE DOWN - Multiple consecutive failures!');
        this.sendAlert('Service appears to be down');
      }
      
      return false;
    }
  }

  async testDMFunctionality() {
    try {
      const testAccount = this.config.testAccounts[Math.floor(Math.random() * this.config.testAccounts.length)];
      const testMessage = `Monitor test - ${new Date().toISOString()}`;
      
      console.log(`🧪 Testing DM functionality with @${testAccount}...`);
      
      const response = await axios.post(`${this.config.renderUrl}/send-instagram-dm`, {
        username: testAccount,
        message: testMessage
      }, {
        timeout: 60000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 200 && response.data.success) {
        console.log('✅ DM functionality test passed');
        return true;
      } else {
        console.log('⚠️ DM functionality test failed:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ DM functionality test error:', error.response?.data || error.message);
      return false;
    }
  }

  sendAlert(message) {
    console.log(`🚨 ALERT: ${message}`);
    // Here you could integrate with email, Slack, Discord, etc.
    // For now, just log to console
  }

  printStats() {
    const uptime = (Date.now() - this.startTime) / 1000 / 60; // minutes
    const successRate = this.stats.totalChecks > 0 ? 
      (this.stats.successfulChecks / this.stats.totalChecks * 100).toFixed(2) : 0;
    
    console.log('\n📊 MONITORING STATS:');
    console.log(`⏱️ Uptime: ${uptime.toFixed(1)} minutes`);
    console.log(`✅ Success Rate: ${successRate}%`);
    console.log(`📈 Total Checks: ${this.stats.totalChecks}`);
    console.log(`🎯 Successful: ${this.stats.successfulChecks}`);
    console.log(`❌ Failed: ${this.stats.failedChecks}`);
    console.log(`⚡ Avg Response: ${this.stats.avgResponseTime.toFixed(0)}ms`);
    console.log(`🕐 Last Check: ${this.stats.lastCheck || 'Never'}`);
    console.log('');
  }

  async start() {
    if (this.isRunning) {
      console.log('Monitor is already running');
      return;
    }

    console.log('🚀 Starting Render deployment monitor...');
    console.log(`📍 Monitoring: ${this.config.renderUrl}`);
    console.log(`⏱️ Check interval: ${this.config.checkInterval / 1000}s`);
    console.log('');

    this.isRunning = true;

    // Initial health check
    await this.healthCheck();

    // Set up periodic monitoring
    const healthInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(healthInterval);
        return;
      }
      
      await this.healthCheck();
    }, this.config.checkInterval);

    // Set up periodic DM testing (every 5 minutes)
    const dmTestInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(dmTestInterval);
        return;
      }
      
      await this.testDMFunctionality();
    }, 5 * 60 * 1000); // 5 minutes

    // Set up stats reporting (every minute)
    const statsInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(statsInterval);
        return;
      }
      
      this.printStats();
    }, 60 * 1000); // 1 minute

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping monitor...');
      this.isRunning = false;
      clearInterval(healthInterval);
      clearInterval(dmTestInterval);
      clearInterval(statsInterval);
      this.printStats();
      process.exit(0);
    });
  }
}

// Check if URL is configured
if (MONITOR_CONFIG.renderUrl.includes('xxxx')) {
  console.log('⚠️ Please update MONITOR_CONFIG.renderUrl with your actual Render URL');
  console.log('Example: https://ig-dm-bot-abc123.onrender.com');
  process.exit(1);
}

// Start monitoring
const monitor = new RenderMonitor(MONITOR_CONFIG);
monitor.start();

console.log('💡 Press Ctrl+C to stop monitoring');
console.log('📊 Stats will be displayed every minute');
console.log('🧪 DM tests will run every 5 minutes');
console.log('');
