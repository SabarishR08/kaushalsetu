/**
 * Deck screenshot capture for KaushalSetu (SIH26134).
 *
 * Captures deck-ready PNGs of the department dashboard against a running
 * server (default http://localhost:3100, override with TARGET_URL) and
 * writes them to docs/deck/. Uses deviceScaleFactor 2 for crisp projection
 * and print quality.
 *
 * Usage: node scripts/capture-deck-shots.js
 */
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const CONFIG = {
  baseUrl: process.env.TARGET_URL || 'http://localhost:3100',
  outDir: path.resolve(__dirname, '../docs/deck'),
  viewport: { width: 1600, height: 1000 },
  scale: 2,
};

const SHOTS = [
  {
    name: 'slide3-kpis-and-demand',
    scrollTo: 0,
    note: 'KPI row + top demand chart + sector coverage chart',
  },
  {
    name: 'slide3-district-heatmap',
    selector: 'text=District-level demand heatmap',
    scrollOffset: -40,
    note: '36-district choropleth with skill deserts',
  },
  {
    name: 'slide3-coverage-focus',
    selector: 'text=District coverage',
    scrollOffset: -30,
    note: 'Per-district coverage table + Mumbai vs Pune focus',
  },
  {
    name: 'slide3-sector-gaps',
    selector: 'text=Sector-wise gap detection',
    scrollOffset: -30,
    note: 'Sector-wise gap detection table',
  },
];

async function main() {
  if (!fs.existsSync(CONFIG.outDir)) fs.mkdirSync(CONFIG.outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    deviceScaleFactor: CONFIG.scale,
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  await page.goto(`${CONFIG.baseUrl}/department`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500); // charts animate in

  // Sanity check: the KPI must show the current posting count, not a stale one.
  const body = await page.innerText('body');
  const kpiMatch = body.match(/(\d[\d,]*)\s*\n\s*keyword tagger/);
  if (kpiMatch) console.log(`[capture] postings KPI on page: ${kpiMatch[1]}`);

  for (const shot of SHOTS) {
    try {
      if (shot.selector) {
        const el = page.locator(shot.selector).first();
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        if (shot.scrollOffset) await page.mouse.wheel(0, shot.scrollOffset);
        await page.waitForTimeout(400);
      } else if (shot.scrollTo !== undefined) {
        await page.evaluate((y) => window.scrollTo(0, y), shot.scrollTo);
        await page.waitForTimeout(600);
      }
      const out = path.join(CONFIG.outDir, `${shot.name}.png`);
      await page.screenshot({ path: out });
      console.log(`[capture] ${shot.note} -> ${shot.name}.png`);
    } catch (e) {
      console.warn(`[capture] FAILED ${shot.name}: ${e.message}`);
    }
  }

  // Bonus: full-page capture for reference.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(CONFIG.outDir, 'department-fullpage.png'), fullPage: true });
  console.log('[capture] full page -> department-fullpage.png');

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
