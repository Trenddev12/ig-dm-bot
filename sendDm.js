require('dotenv').config();
const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

// Root route to verify server is live
app.get("/", (req, res) => {
  res.send("FluxDX IG DM bot is live 🚀");
});

// Main POST endpoint to send DM
app.post('/send-instagram-dm', async (req, res) => {
  const { username, message } = req.body;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    timeout: 60000 // Optional: increases timeout for slow startups
  });

  const page = await browser.newPage();

  try {
    // Navigate to login
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });

    // Log in
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', IG_USERNAME, { delay: 50 });
    await page.type('input[name="password"]', IG_PASSWORD, { delay: 50 });
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // Navigate to user's profile
    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    // Click Message button
    const buttons = await page.$x("//button[contains(., 'Message')]");
    if (buttons.length > 0) {
      await buttons[0].click();
    } else {
      throw new Error("Message button not found");
    }

    // Send the DM
    await page.waitForSelector('textarea');
    await page.type('textarea', message, { delay: 30 });
    await page.keyboard.press('Enter');

    console.log(`✅ DM sent to @${username}`);
    res.status(200).send("DM sent successfully");
  } catch (err) {
    console.error(`❌ Error sending DM to @${username}:`, err.message);
    res.status(500).send("Failed to send DM: " + err.message);
  } finally {
    await browser.close();
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
