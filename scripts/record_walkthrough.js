/**
 * KaushalSetu Maharashtra (कौशलसेतू) - SIH26134
 * Clean Autonomous Walkthrough Recorder (Pure Full UI Edition)
 *
 * Requirements:
 * - 100% Pure, unobstructed full-screen UI (NO banners, NO bottom captions, NO artificial overlays)
 * - Zero dead pauses: fluid, continuous human-cadence navigation and scrolling
 * - Showcases ALL routes: /, /department (district heatmap + coverage focus), /districts, /curriculum-diff, /telemetry, /voice-sahayak, /passport, /path, /department/report
 * - Crystal-clear 1080p 60fps transcode with FFmpeg
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn, execSync } = require('child_process');

// ============================================================================
// 1. CONFIGURATION
// ============================================================================
const CONFIG = {
  baseUrl: process.env.TARGET_URL || 'http://localhost:3000',
  outputDir: path.resolve(__dirname, '../recordings'),
  finalMp4Name: 'KaushalSetu_Maharashtra_Full_Demo.mp4',
  resolution: { width: 1920, height: 1080 },
  headless: true,
  colorScheme: 'dark',
};

// ============================================================================
// 2. SERVER HEALTH & AUTO-START
// ============================================================================
function checkServer(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServerRunning() {
  const isUp = await checkServer(CONFIG.baseUrl);
  if (isUp) {
    console.log(`[Server] Target server is active at ${CONFIG.baseUrl}`);
    return null;
  }

  console.log(`[Server] Spawning Next.js server...`);
  const nextBin = path.resolve(__dirname, '../node_modules/next/dist/bin/next');
  const dotNextExists = fs.existsSync(path.resolve(__dirname, '../.next'));
  const startArgs = dotNextExists ? [nextBin, 'start', '-p', '3000'] : [nextBin, 'dev', '-p', '3000'];

  const serverProc = spawn(process.execPath, startArgs, {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: '3000' },
    stdio: 'ignore',
  });

  const maxWait = 45000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 1200));
    if (await checkServer(CONFIG.baseUrl)) {
      console.log(`[Server] Next.js ready at ${CONFIG.baseUrl}`);
      return serverProc;
    }
  }

  throw new Error(`Server failed to start within ${maxWait / 1000}s`);
}

// ============================================================================
// 3. FLUID MOVEMENT UTILITIES (NO DEAD FREEZES)
// ============================================================================

/**
 * Continuous cinematic scrolling with physics-like cadence.
 */
async function smoothScroll(page, totalDistance, steps = 14, delayMs = 35) {
  const stepDist = totalDistance / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepDist);
    await page.waitForTimeout(delayMs);
  }
}

/**
 * Focus and click element with gentle hover before click.
 */
async function focusAndClick(locator, hoverDelayMs = 300) {
  if (await locator.isVisible()) {
    await locator.hover();
    await locator.page().waitForTimeout(hoverDelayMs);
    await locator.click();
    await locator.page().waitForTimeout(350);
  }
}

/**
 * Lively human typing cadence.
 */
async function typeQuery(locator, text) {
  await locator.click();
  for (const char of text) {
    await locator.pressSequentially(char, { delay: Math.floor(Math.random() * 20) + 20 });
  }
}

// ============================================================================
// 4. CLEAN END-TO-END CHOREOGRAPHY (PURE FULL UI)
// ============================================================================
async function runCleanWalkthrough() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  let serverProc = null;
  let browser = null;
  let context = null;
  let page = null;

  try {
    serverProc = await ensureServerRunning();

    console.log(`[Studio] Launching 1080p Chromium for Pure Full-Screen UI Capture...`);
    browser = await chromium.launch({
      headless: CONFIG.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--window-size=${CONFIG.resolution.width},${CONFIG.resolution.height}`,
        '--force-device-scale-factor=1',
        '--disable-infobars',
        '--autoplay-policy=no-user-gesture-required',
      ],
    });

    context = await browser.newContext({
      viewport: CONFIG.resolution,
      recordVideo: {
        dir: CONFIG.outputDir,
        size: CONFIG.resolution,
      },
      colorScheme: CONFIG.colorScheme,
    });

    page = await context.newPage();

    // ========================================================================
    // CHAPTER 1: LANDING & HERO SHOWCASE (/)
    // ========================================================================
    console.log('[Walkthrough] 1/9: Landing Page & Hero Section');
    await page.goto(`${CONFIG.baseUrl}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Smooth continuous glide down the landing page
    await smoothScroll(page, 550, 14, 30);
    await page.waitForTimeout(600);

    // Scroll further down to showcase 4-pillar loop and command modules
    await smoothScroll(page, 650, 14, 30);
    await page.waitForTimeout(700);

    // Scroll smoothly back up to top nav
    await smoothScroll(page, -1200, 16, 25);
    await page.waitForTimeout(400);

    // Click "Open Dashboard" button directly in header
    const openDashBtn = page.locator('header a[href="/department"], a[href="/department"]').first();
    await focusAndClick(openDashBtn, 300);
    await page.waitForLoadState('networkidle');

    // ========================================================================
    // CHAPTER 2: STATE POLICY & MACRO ALIGNMENT COCKPIT (/department)
    // ========================================================================
    console.log('[Walkthrough] 2/9: State Administration Cockpit');
    await page.waitForTimeout(600);

    // Hover over executive KPI summary cards
    const kpiCards = page.locator('div[class*="sm:grid-cols-2"] > div, div[class*="grid-cols-2"] > div');
    const cardCount = await kpiCards.count();
    for (let i = 0; i < Math.min(cardCount, 4); i++) {
      if (await kpiCards.nth(i).isVisible()) {
        await kpiCards.nth(i).hover();
        await page.waitForTimeout(200);
      }
    }

    // Smooth scroll down to Demand by Skill charts
    await smoothScroll(page, 550, 14, 30);
    await page.waitForTimeout(800);

    // District-level choropleth heatmap (all 36 districts) + demand bars —
    // hover a couple of tiles so the counts read on camera.
    const mumbaiTile = page.locator('[title*="Mumbai:"]').first();
    if (await mumbaiTile.isVisible()) {
      await mumbaiTile.hover();
      await page.waitForTimeout(700);
    }
    const puneTile = page.locator('[title*="Pune:"]').first();
    if (await puneTile.isVisible()) {
      await puneTile.hover();
      await page.waitForTimeout(600);
    }
    const desertTile = page.locator('[title*="no demand signal"]').first();
    if (await desertTile.isVisible()) {
      await desertTile.hover();
      await page.waitForTimeout(600);
    }
    await smoothScroll(page, 450, 12, 30);
    await page.waitForTimeout(600);

    // Per-district coverage & Pune-vs-Mumbai focus comparison
    const focusPanel = page.locator('text=Focus:').first();
    if (await focusPanel.isVisible()) {
      await focusPanel.hover();
      await page.waitForTimeout(800);
      const salesRow = page.locator('tr', { hasText: 'Sales & Business Development' }).first();
      if (await salesRow.isVisible()) {
        await salesRow.hover();
        await page.waitForTimeout(700);
      }
    } else {
      await smoothScroll(page, 300, 10, 30);
      await page.waitForTimeout(400);
    }

    // Continuous scroll to Sector Coverage Deficit Matrix
    await smoothScroll(page, 600, 14, 30);
    const tableRow = page.locator('table tr').nth(1);
    if (await tableRow.isVisible()) {
      await tableRow.hover();
      await page.waitForTimeout(400);
    }

    // Scroll up to reach the top nav for the GIS Twin button
    await smoothScroll(page, -1900, 18, 25);
    await page.waitForTimeout(300);
    const districtsNav = page.locator('a[href="/districts"]').first();
    await focusAndClick(districtsNav, 300);
    await page.waitForLoadState('networkidle');

    // ========================================================================
    // CHAPTER 3: 36-DISTRICT GIS TWIN & INDUSTRIAL CLUSTERS (/districts)
    // ========================================================================
    console.log('[Walkthrough] 3/9: 36-District GIS Twin & Industrial Clusters');
    await page.waitForTimeout(600);

    // Demonstrate Division filter tabs: Pune -> Marathwada -> Vidarbha -> ALL
    const puneDiv = page.locator('button:has-text("Pune")').first();
    await focusAndClick(puneDiv, 250);
    await page.waitForTimeout(500);

    const marathwadaDiv = page.locator('button:has-text("Marathwada")').first();
    await focusAndClick(marathwadaDiv, 250);
    await page.waitForTimeout(500);

    const vidarbhaDiv = page.locator('button:has-text("Vidarbha")').first();
    await focusAndClick(vidarbhaDiv, 250);
    await page.waitForTimeout(500);

    const allDiv = page.locator('button:has-text("ALL")').first();
    await focusAndClick(allDiv, 250);
    await page.waitForTimeout(400);

    // Click on Pune Metropolitan & Chakan cluster card
    const puneCluster = page.locator('text=Pune Metropolitan & Pimpri-Chinchwad').first();
    await focusAndClick(puneCluster, 300);
    await page.waitForTimeout(600);

    // Smooth scroll down to view right-pane equilibrium analysis & skill desert alert
    await smoothScroll(page, 450, 12, 30);
    await page.waitForTimeout(700);
    await smoothScroll(page, -450, 12, 25);

    // Click "Open Curriculum Diff" directly from top action bar
    const openDiff = page.locator('a[href="/curriculum-diff"]').first();
    await focusAndClick(openDiff, 300);
    await page.waitForLoadState('networkidle');

    // ========================================================================
    // CHAPTER 4: AUTONOMOUS CURRICULUM-DELTA-DIFF STUDIO (/curriculum-diff)
    // ========================================================================
    console.log('[Walkthrough] 4/9: Autonomous Curriculum-Delta-Diff Studio');
    await page.waitForTimeout(600);

    // Select Trade 1: Machinist & Lathe
    const machinistBtn = page.locator('button:has-text("Machinist & Conventional Lathe")').first();
    await focusAndClick(machinistBtn, 250);
    await page.waitForTimeout(500);

    // Toggle Marathi Translation
    const marathiToggle = page.locator('button:has-text("मराठी भाषांतर"), button:has-text("English")').first();
    if (await marathiToggle.isVisible()) {
      console.log('Toggling Marathi translation...');
      await focusAndClick(marathiToggle, 300);
      await page.waitForTimeout(700);

      // Smooth scroll down to showcase translated day-by-day lesson plans & lab checklists
      await smoothScroll(page, 550, 14, 30);
      await page.waitForTimeout(800);

      // Scroll up and switch back to English
      await smoothScroll(page, -550, 14, 25);
      await focusAndClick(marathiToggle, 250);
      await page.waitForTimeout(500);
    }

    // Select Trade 2: Electrician (EV & Solar)
    const elecBtn = page.locator('button:has-text("Electrician & Wireman Trade")').first();
    await focusAndClick(elecBtn, 250);
    await page.waitForTimeout(600);
    await smoothScroll(page, 400, 12, 30);
    await page.waitForTimeout(500);
    await smoothScroll(page, -400, 12, 25);

    // Navigate to Live Telemetry
    await page.goto(`${CONFIG.baseUrl}/telemetry`, { waitUntil: 'networkidle' });

    // ========================================================================
    // CHAPTER 5: LIVE POSTINGS TELEMETRY FEED (/telemetry)
    // ========================================================================
    console.log('[Walkthrough] 5/9: Live Postings Telemetry Feed');
    await page.waitForTimeout(600);

    const searchInput = page.locator('input[placeholder*="Search 1,000 live postings"]').first();
    if (await searchInput.isVisible()) {
      // Human typing search for "EV Battery"
      await typeQuery(searchInput, 'EV Battery');
      await page.waitForTimeout(600);

      // Click first matching job card to update right-pane deep inspector
      const firstCard = page.locator('div[class*="cursor-pointer"]').first();
      if (await firstCard.isVisible()) {
        await focusAndClick(firstCard, 250);
        await page.waitForTimeout(500);
      }

      // Fast clear and search "CNC"
      await searchInput.fill('');
      await typeQuery(searchInput, 'CNC');
      await page.waitForTimeout(600);
      await searchInput.fill('');
      await page.waitForTimeout(400);
    }

    // Smooth scroll down to view extracted skills and NSQF mapping
    await smoothScroll(page, 400, 12, 30);
    await page.waitForTimeout(600);
    await smoothScroll(page, -400, 12, 25);

    // Navigate to Marathi Voice Rojgar Sahayak
    await page.goto(`${CONFIG.baseUrl}/voice-sahayak`, { waitUntil: 'networkidle' });

    // ========================================================================
    // CHAPTER 6: MARATHI AI VOICE ROJGAR SAHAYAK (/voice-sahayak)
    // ========================================================================
    console.log('[Walkthrough] 6/9: Marathi AI Voice Rojgar Sahayak');
    await page.waitForTimeout(600);

    // Click Marathi query preset 1 (Pune Auto)
    const puneQuery = page.locator('button:has-text("पुणे / ऑटोमोबाईल")').first();
    await focusAndClick(puneQuery, 300);
    await page.waitForTimeout(600);

    // Click Marathi query preset 2 (Chh. Sambhajinagar Pharma)
    const pharmaQuery = page.locator('button:has-text("छ. संभाजीनगर / फार्मा")').first();
    await focusAndClick(pharmaQuery, 300);
    await page.waitForTimeout(600);

    // Click glowing microphone button to demonstrate voice capture
    const micBtn = page.locator('button:has-text("माईकवर बोला"), button:has-text("माईक सुरू आहे")').first();
    if (await micBtn.isVisible()) {
      await focusAndClick(micBtn, 300);
      await page.waitForTimeout(800);
    }

    // Click voice audio playback button
    const playAudioBtn = page.locator('button:has-text("मराठी आवाज ऐका")').first();
    if (await playAudioBtn.isVisible()) {
      await focusAndClick(playAudioBtn, 300);
      await page.waitForTimeout(600);
    }

    // Smooth scroll down to inspect nearest Government ITI recommendation and action steps
    await smoothScroll(page, 450, 12, 30);
    await page.waitForTimeout(800);
    await smoothScroll(page, -450, 12, 25);

    // Navigate to Verifiable Kaushal Passport
    await page.goto(`${CONFIG.baseUrl}/passport`, { waitUntil: 'networkidle' });

    // ========================================================================
    // CHAPTER 7: VERIFIABLE DIGITAL KAUSHAL PASSPORT (/passport)
    // ========================================================================
    console.log('[Walkthrough] 7/9: Verifiable Digital Kaushal Passport');
    await page.waitForTimeout(600);

    // Click "Verify Ed25519 Signature" button
    const verifyBtn = page.locator('button:has-text("Verify Ed25519 Signature")').first();
    if (await verifyBtn.isVisible()) {
      await focusAndClick(verifyBtn, 350);
      await page.waitForTimeout(900); // Allow green verification badge to appear cleanly
    }

    // Smooth scroll down to view learner digital certificate, stamps & QR code
    await smoothScroll(page, 550, 14, 30);
    await page.waitForTimeout(900);
    await smoothScroll(page, -550, 14, 25);

    // Navigate to What-If Simulator & Dynamic Skill DAG
    await page.goto(`${CONFIG.baseUrl}/path`, { waitUntil: 'networkidle' });

    // ========================================================================
    // CHAPTER 8: WHAT-IF SKILLING SIMULATOR & SKILL DAG (/path)
    // ========================================================================
    console.log('[Walkthrough] 8/9: What-If Skilling Simulator & DAG');
    await page.waitForTimeout(700);

    // Smooth scroll through learning roadmap phases and competency metrics
    await smoothScroll(page, 550, 14, 30);
    await page.waitForTimeout(800);
    await smoothScroll(page, -550, 14, 25);

    // Navigate to Secretariat Executive Briefing Memo
    await page.goto(`${CONFIG.baseUrl}/department/report`, { waitUntil: 'networkidle' });

    // ========================================================================
    // CHAPTER 9: SECRETARIAT EXECUTIVE POLICY BRIEFING (/department/report)
    // ========================================================================
    console.log('[Walkthrough] 9/9: Secretariat Executive Policy Memo');
    await page.waitForTimeout(700);

    // Smooth scroll through Cabinet-ready executive memo
    await smoothScroll(page, 650, 14, 30);
    await page.waitForTimeout(700);
    await smoothScroll(page, 650, 14, 30);
    await page.waitForTimeout(700);
    await smoothScroll(page, -1300, 18, 25);

    // Return to landing page for clean final presentation shot
    await page.goto(`${CONFIG.baseUrl}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('[Walkthrough] Full-screen pure UI walkthrough completed successfully!');

  } catch (error) {
    console.error('[Recording Error]', error);
  } finally {
    let rawVideoPath = null;
    if (page && context) {
      try {
        console.log('[Studio] Flushing video stream to disk...');
        await context.close();
        const videoObj = page.video();
        if (videoObj) {
          rawVideoPath = await videoObj.path();
        }
      } catch (e) {
        console.warn('[Video] Retrying video lookup:', e.message);
      }
      try {
        await browser.close();
      } catch (e) {}
    }

    // Fallback: look for latest .webm file in recordings directory
    if (!rawVideoPath || !fs.existsSync(rawVideoPath)) {
      if (fs.existsSync(CONFIG.outputDir)) {
        const webmFiles = fs.readdirSync(CONFIG.outputDir)
          .filter(f => f.endsWith('.webm'))
          .map(f => ({ path: path.join(CONFIG.outputDir, f), mtime: fs.statSync(path.join(CONFIG.outputDir, f)).mtimeMs }))
          .sort((a, b) => b.mtime - a.mtime);
        if (webmFiles.length > 0) {
          rawVideoPath = webmFiles[0].path;
        }
      }
    }

    if (serverProc && serverProc.pid) {
      try {
        if (process.platform === 'win32') {
          execSync(`taskkill /pid ${serverProc.pid} /T /F`, { stdio: 'ignore' });
        } else {
          serverProc.kill();
        }
      } catch (e) {}
    }

    // ========================================================================
    // 5. FFMPEG TRANSCODING (Broadcast H.264 / 1080p 60fps)
    // ========================================================================
    if (rawVideoPath && fs.existsSync(rawVideoPath)) {
      console.log(`[FFmpeg] Raw WebM video captured: ${rawVideoPath}`);
      const finalMp4Path = path.join(CONFIG.outputDir, CONFIG.finalMp4Name);
      console.log(`[FFmpeg] Transcoding to 1080p streamable MP4 (${finalMp4Path})...`);

      try {
        execSync(
          `ffmpeg -y -i "${rawVideoPath}" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 -movflags +faststart "${finalMp4Path}"`,
          { stdio: 'inherit' }
        );
        console.log(`\n======================================================`);
        console.log(`🎉 PURE FULL-UI WALKTHROUGH DEMO READY!`);
        console.log(`📹 File: ${finalMp4Path}`);
        console.log(`======================================================\n`);
      } catch (err) {
        console.warn(`[FFmpeg Warning] Transcoding issue: ${err.message}`);
      }
    }
  }
}

runCleanWalkthrough();
