#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Installing Chrome for Puppeteer...');

// Set environment variables for Render
process.env.PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'false';

try {
  // Create cache directory if it doesn't exist
  const cacheDir = '/opt/render/.cache/puppeteer';
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log(`📁 Created cache directory: ${cacheDir}`);
  }

  // Install Chrome
  console.log('📦 Installing Chrome...');
  execSync('npx puppeteer browsers install chrome', { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  // Verify installation
  const chromePath = '/opt/render/.cache/puppeteer/chrome/linux-137.0.7151.119/chrome-linux64/chrome';
  if (fs.existsSync(chromePath)) {
    console.log('✅ Chrome installed successfully!');
    console.log(`📍 Chrome location: ${chromePath}`);
  } else {
    console.log('⚠️ Chrome installation completed but not found at expected path');
    
    // List what's in the cache directory
    try {
      const cacheContents = fs.readdirSync(cacheDir, { recursive: true });
      console.log('📋 Cache directory contents:');
      cacheContents.forEach(item => console.log(`  - ${item}`));
    } catch (e) {
      console.log('❌ Could not list cache directory contents');
    }
  }

} catch (error) {
  console.error('❌ Chrome installation failed:', error.message);
  process.exit(1);
}

console.log('🎉 Chrome installation process completed!');
