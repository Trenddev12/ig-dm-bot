require('dotenv').config();
const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

app.post('/send-instagram-dm', async (req, res) => {
  const { username, message } = req.body;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });

    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', IG_USERNAME, { delay: 50 });
    await page.type('input[name="password"]', IG_PASSWORD, { delay: 50 });

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    const buttons = await page.$x("//button[contains(., 'Message')]");
    if (buttons.length > 0) {
      await buttons[0].click();
    } else {
      throw new Error("Message button not found");
    }

    await page.waitForSelector('textarea');
    await page.type('textarea', message, { delay: 30 });
    await page.keyboard.press('Enter');

    res.send("DM sent successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
