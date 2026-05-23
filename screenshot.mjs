/**
 * RIA — Puppeteer Screenshot Script
 * Usage: node screenshot.mjs [url] [label]
 * Examples:
 *   node screenshot.mjs http://localhost:3000
 *   node screenshot.mjs http://localhost:3000/plan-book.html plan-book
 *   node screenshot.mjs http://localhost:3000/discover-riyadh.html discover
 */

import puppeteer from 'puppeteer';
import fs        from 'fs';
import path      from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function getNextFilename(label) {
  const files = fs.existsSync(outDir)
    ? fs.readdirSync(outDir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'))
    : [];
  const nums = files.map(f => {
    const m = f.match(/screenshot-(\d+)/);
    return m ? parseInt(m[1]) : 0;
  });
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  const suffix = label ? `-${label}` : '';
  return `screenshot-${next}${suffix}.png`;
}

(async () => {
  console.log(`\n  Launching Puppeteer…`);
  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 60000,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log(`  Navigating to ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Scroll through page to trigger lazy-loaded images
  await page.evaluate(async () => {
    await new Promise(resolve => {
      const distance = 400;
      const delay    = 120;
      let scrolled   = 0;
      const total    = document.body.scrollHeight;
      const timer    = setInterval(() => {
        window.scrollBy(0, distance);
        scrolled += distance;
        if (scrolled >= total) {
          window.scrollTo(0, 0);
          clearInterval(timer);
          resolve();
        }
      }, delay);
    });
  });

  // Wait for triggered images to load
  await new Promise(r => setTimeout(r, 4000));

  const filename = getNextFilename(label);
  const outPath  = path.join(outDir, filename);

  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();

  console.log(`  ✓ Screenshot saved: temporary screenshots/${filename}\n`);
})().catch(err => {
  console.error('\n  Puppeteer error:', err.message);
  console.error('  Make sure the dev server is running: node serve.mjs\n');
  process.exit(1);
});
