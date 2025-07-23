import { chromium } from 'playwright';

let browserPromise;
export default async function handler(req, res) {
  // Lazy-launch browser once
  if (!browserPromise) {
    browserPromise = chromium.launch({ args: ['--no-sandbox'] });
  }
  const browser = await browserPromise;
  const { playerId, platform } = req.query;
  if (!playerId || !platform) {
    return res.status(400).json({ error: 'Missing playerId or platform' });
  }

  const page = await browser.newPage();
  try {
    const url = `https://cfb.fan/api/cutdb/prices/${playerId}/${platform}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    const json = JSON.parse(await page.textContent('body'));
    await page.close();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(json);
  } catch (err) {
    await page.close();
    return res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}
