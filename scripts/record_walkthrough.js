/**
 * KaushalSetu Maharashtra (कौशलसेतू) - SIH26134
 * High-Density Autonomous Walkthrough Recorder (Zero Dead Pause Edition)
 *
 * Designed for first-time human viewers:
 * - Visible glowing presenter cursor with click ripples & smooth glide trajectories
 * - Zero frozen screens / zero dead pauses — every moment is in active motion
 * - Contextual story-driven HUD subtitles synchronized with live cursor actions
 * - Real UI clicks and native route transitions
 * - Broadcast 1080p 60fps / H.264 transcode with FFmpeg
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
// 3. VIRTUAL PRESENTER CURSOR & SMOOTH MOTION UTILITIES
// ============================================================================

/**
 * Injects a stylish glowing presenter cursor with visual click ripples
 * so first-time human viewers can effortlessly follow where the eye should look.
 */
async function injectPresenterCursor(page) {
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('presenter-cursor')) return;

      const cursor = document.createElement('div');
      cursor.id = 'presenter-cursor';
      cursor.style.cssText = `
        position: fixed;
        top: -100px;
        left: -100px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(249,115,22,0.9) 0%, rgba(234,88,12,0.6) 70%, transparent 100%);
        border: 2px solid #ffffff;
        box-shadow: 0 0 15px #f97316, 0 0 30px rgba(249,115,22,0.4);
        pointer-events: none;
        z-index: 99999999;
        transform: translate(-50%, -50%);
        transition: width 0.15s ease, height 0.15s ease, transform 0.1s ease, border-color 0.15s ease;
      `;

      // Center laser dot
      const dot = document.createElement('div');
      dot.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ffffff;
        transform: translate(-50%, -50%);
      `;
      cursor.appendChild(dot);
      document.body.appendChild(cursor);

      window.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });

      window.addEventListener('mousedown', (e) => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        cursor.style.borderColor = '#10b981';

        // Ripple wave
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: fixed;
          top: ${e.clientY}px;
          left: ${e.clientX}px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid #f97316;
          box-shadow: 0 0 10px #f97316;
          pointer-events: none;
          z-index: 99999998;
          transform: translate(-50%, -50%);
          animation: cursorRipple 0.45s ease-out forwards;
        `;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 450);
      });

      window.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.borderColor = '#ffffff';
      });

      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes cursorRipple {
          0% { width: 10px; height: 10px; opacity: 1; }
          100% { width: 60px; height: 60px; opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    });
  });
}

/**
 * Smoothly glides the virtual cursor to a specific locator and hovers it.
 */
async function glideTo(page, locator, steps = 14) {
  if (await locator.isVisible()) {
    const box = await locator.boundingBox();
    if (box) {
      const targetX = box.x + box.width / 2;
      const targetY = box.y + box.height / 2;
      await page.mouse.move(targetX, targetY, { steps });
      await locator.hover();
      await page.waitForTimeout(250);
    }
  }
}

/**
 * Glides to an element, highlights it with hover, and clicks with a visible pulse.
 */
async function glideAndClick(page, locator, steps = 12) {
  if (await locator.isVisible()) {
    await glideTo(page, locator, steps);
    await page.waitForTimeout(150);
    await locator.click();
    await page.waitForTimeout(300);
  }
}

/**
 * Continuous cinematic scrolling: no dead stops, smooth physics-like flow.
 */
async function continuousScroll(page, distance, steps = 16, stepDelayMs = 35) {
  const stepDist = distance / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepDist);
    await page.waitForTimeout(stepDelayMs);
  }
}

/**
 * Snappy human typing with micro-variations.
 */
async function livelyType(locator, text) {
  await locator.click();
  for (const char of text) {
    await locator.pressSequentially(char, { delay: Math.floor(Math.random() * 25) + 20 });
  }
}

// ============================================================================
// 4. HIGH-CONTRAST DYNAMIC HUD SYSTEM
// ============================================================================
async function updateHUD(page, stepNum, title, narrative, badge = 'SIH26134 • MAHARASHTRA') {
  await page.evaluate(
    ({ stepNum, title, narrative, badge }) => {
      let hud = document.getElementById('kaushalsetu-live-hud');
      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'kaushalsetu-live-hud';
        hud.style.cssText = `
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999999;
          pointer-events: none;
          font-family: system-ui, -apple-system, sans-serif;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        document.body.appendChild(hud);
      }

      hud.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(8, 8, 12, 0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(249, 115, 22, 0.4);
          box-shadow: 0 12px 35px -5px rgba(0, 0, 0, 0.85), 0 0 25px rgba(249, 115, 22, 0.25);
          border-radius: 9999px;
          padding: 10px 26px;
          color: #ffffff;
          max-width: 92vw;
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            box-shadow: 0 0 18px rgba(249, 115, 22, 0.6);
            font-weight: 900;
            font-size: 17px;
            color: #ffffff;
            flex-shrink: 0;
          ">
            कौ
          </div>
          <div style="display: flex; flex-direction: column; text-align: left;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
              <span style="
                background: rgba(249, 115, 22, 0.25);
                border: 1px solid rgba(249, 115, 22, 0.5);
                color: #fb923c;
                font-size: 10px;
                font-weight: 800;
                padding: 2px 8px;
                border-radius: 9999px;
                letter-spacing: 0.5px;
              ">${badge}</span>
              <span style="
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 11px;
                font-weight: 700;
                color: #10b981;
              ">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></span>
                PART ${stepNum}
              </span>
            </div>
            <div style="font-size: 15px; font-weight: 800; color: #ffffff; letter-spacing: -0.2px;">
              ${title}
            </div>
            <div style="font-size: 12px; font-weight: 500; color: #cbd5e1; margin-top: 1px;">
              ${narrative}
            </div>
          </div>
        </div>
      `;
    },
    { stepNum, title, narrative, badge }
  );
}

// ============================================================================
// 5. HIGH-DENSITY NARRATIVE CHOREOGRAPHY (NO DEAD AIR)
// ============================================================================
async function runContinuousWalkthrough() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  let serverProc = null;
  let browser = null;
  let context = null;
  let page = null;

  try {
    serverProc = await ensureServerRunning();

    console.log(`[Studio] Launching 1080p Chromium with Virtual Presenter Cursor...`);
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
    await injectPresenterCursor(page);

    // ========================================================================
    // SCENE 1: LANDING & CLOSED-LOOP ARCHITECTURE
    // ========================================================================
    console.log('[Narrative] 1/9: Hero & Closed-Loop Architecture');
    await page.goto(`${CONFIG.baseUrl}/`, { waitUntil: 'networkidle' });

    await updateHUD(
      page,
      '1/9',
      'The Core Problem & Closed-Loop Engine',
      'Connecting 1,000 real Maharashtra jobs with institutional ITI syllabi to bridge the 4-year curriculum lag'
    );

    // Glide cursor over the top govt emblem and 1,000 job badge
    const badge1000 = page.locator('text=1,000 Real Postings Ingested').first();
    if (await badge1000.isVisible()) await glideTo(page, badge1000, 10);

    // Continuous scroll down over the 4-pillar loop
    await continuousScroll(page, 550, 14, 30);
    const pillar1 = page.locator('text=Real-Time Labor Telemetry').first();
    if (await pillar1.isVisible()) await glideTo(page, pillar1, 10);

    // Continue scrolling over feature cards
    await continuousScroll(page, 650, 14, 30);
    const diffCard = page.locator('text=Autonomous Curriculum-Delta-Diff').first();
    if (await diffCard.isVisible()) await glideTo(page, diffCard, 8);

    // Click CTA directly to transition naturally
    const launchBtn = page.locator('a[href="/department"]').first();
    await updateHUD(
      page,
      '1/9',
      'Entering State Administration Cockpit',
      'Real-time supply vs demand aggregation for Government of Maharashtra'
    );
    await glideAndClick(page, launchBtn, 12);
    await page.waitForLoadState('networkidle');

    // ========================================================================
    // SCENE 2: STATE POLICY & MACRO ALIGNMENT COCKPIT
    // ========================================================================
    console.log('[Narrative] 2/9: State Cockpit & Macro Supply-Demand');
    await updateHUD(
      page,
      '2/9',
      'State Administration Cockpit (Macro Demand)',
      'Aggregating 1,000 job postings against 418 ITIs to calculate live sector equilibrium'
    );

    // Cursor sweeps over the 4 key metrics
    const statCards = page.locator('div[class*="grid-cols-2"] > div, div[class*="sm:grid-cols-2"] > div');
    const count = await statCards.count();
    for (let i = 0; i < Math.min(count, 4); i++) {
      await glideTo(page, statCards.nth(i), 8);
    }

    // Smooth scroll down to demand charts
    await continuousScroll(page, 500, 12, 30);
    const chartCard = page.locator('text=Demand by Top Industrial Skills').first();
    if (await chartCard.isVisible()) await glideTo(page, chartCard, 8);

    // Continuous scroll to Sector Coverage Table
    await continuousScroll(page, 550, 14, 30);
    const tableRow = page.locator('table tr').nth(1);
    if (await tableRow.isVisible()) await glideTo(page, tableRow, 8);

    // Navigate to 36-District GIS Twin via top bar button
    await continuousScroll(page, -1050, 16, 25);
    const districtsNavBtn = page.locator('a[href="/districts"]').first();
    await updateHUD(
      page,
      '3/9',
      'Opening 36-District GIS Digital Twin',
      'Mapping regional industrial corridors & local talent concentration'
    );
    await glideAndClick(page, districtsNavBtn, 10);
    await page.waitForLoadState('networkidle');

    // ========================================================================
    // SCENE 3: 36-DISTRICT GIS TWIN & INDUSTRIAL CLUSTERS
    // ========================================================================
    console.log('[Narrative] 3/9: 36-District GIS Twin');
    await updateHUD(
      page,
      '3/9',
      '36-District GIS Twin • Industrial Equilibrium',
      'Isolating acute Skill Deserts across Pune EV, Marathwada Pharma & Vidarbha Logistics'
    );

    // Filter Pune Division
    const puneDiv = page.locator('button:has-text("Pune")').first();
    await glideAndClick(page, puneDiv, 8);

    // Filter Marathwada Division
    const marathwadaDiv = page.locator('button:has-text("Marathwada")').first();
    await glideAndClick(page, marathwadaDiv, 8);

    // Filter Vidarbha Division
    const vidarbhaDiv = page.locator('button:has-text("Vidarbha")').first();
    await glideAndClick(page, vidarbhaDiv, 8);

    // Reset to ALL and click Pune EV & Auto cluster
    const allDiv = page.locator('button:has-text("ALL")').first();
    await glideAndClick(page, allDiv, 8);

    const puneCard = page.locator('text=Pune Metropolitan & Pimpri-Chinchwad').first();
    await glideAndClick(page, puneCard, 8);

    // Inspect right-side equilibrium analysis & skill desert alert
    const desertAlert = page.locator('text=Skill Desert Alert').first();
    if (await desertAlert.isVisible()) await glideTo(page, desertAlert, 8);

    // Navigate directly to Curriculum-Delta-Diff
    const openDiffBtn = page.locator('a[href="/curriculum-diff"]').first();
    await updateHUD(
      page,
      '4/9',
      'Launching Autonomous Curriculum-Delta-Diff',
      'Isolates the 15% missing competency and synthesizes an accredited 30-hour bridge'
    );
    await glideAndClick(page, openDiffBtn, 10);
    await page.waitForLoadState('networkidle');

    // ========================================================================
    // SCENE 4: AUTONOMOUS CURRICULUM-DELTA-DIFF STUDIO
    // ========================================================================
    console.log('[Narrative] 4/9: Curriculum-Delta-Diff Studio');
    await updateHUD(
      page,
      '4/9',
      'Autonomous Curriculum-Delta-Diff Studio',
      'Synthesizing 30-hour bridge courses with instant bilingual Marathi & English syllabus'
    );

    // Select Trade: Machinist
    const machinistBtn = page.locator('button:has-text("Machinist & Conventional Lathe")').first();
    await glideAndClick(page, machinistBtn, 8);

    // Toggle Marathi Translation
    const marathiToggle = page.locator('button:has-text("मराठी भाषांतर"), button:has-text("English")').first();
    await updateHUD(
      page,
      '4/9',
      'Bilingual Marathi Translation Activated',
      'Full Marathi syllabus generated for Maharashtra Government ITI instructors and students'
    );
    await glideAndClick(page, marathiToggle, 8);

    // Continuous scroll through Marathi syllabus modules
    await continuousScroll(page, 450, 12, 30);
    const dayModule = page.locator('text=दिवस १:').first();
    if (await dayModule.isVisible()) await glideTo(page, dayModule, 8);

    // Toggle back to English
    await continuousScroll(page, -450, 12, 25);
    await glideAndClick(page, marathiToggle, 8);

    // Select Electrician trade (EV & Solar)
    const elecBtn = page.locator('button:has-text("Electrician & Wireman Trade")').first();
    await glideAndClick(page, elecBtn, 8);
    await continuousScroll(page, 350, 10, 30);
    await continuousScroll(page, -350, 10, 25);

    // Navigate to Telemetry
    await page.goto(`${CONFIG.baseUrl}/telemetry`, { waitUntil: 'networkidle' });

    // ========================================================================
    // SCENE 5: LIVE 1,000 POSTINGS TELEMETRY FEED
    // ========================================================================
    console.log('[Narrative] 5/9: Live 1,000 Postings Telemetry');
    await updateHUD(
      page,
      '5/9',
      'Live Industrial Job Market Telemetry',
      '1,000 verified Maharashtra postings with real-time semantic skill extraction'
    );

    const searchInput = page.locator('input[placeholder*="Search 1,000 live postings"]').first();
    if (await searchInput.isVisible()) {
      await glideTo(page, searchInput, 8);
      await livelyType(searchInput, 'EV Battery');
      await page.waitForTimeout(400);

      // Select matching posting card to display deep right-side inspector
      const postingCard = page.locator('div[class*="cursor-pointer"]').first();
      if (await postingCard.isVisible()) {
        await glideAndClick(page, postingCard, 8);
      }

      // Fast clear and search CNC
      await searchInput.fill('');
      await livelyType(searchInput, 'CNC');
      await page.waitForTimeout(400);
      await searchInput.fill('');
    }

    // Scroll down to showcase right inspector NSQF Level matching
    await continuousScroll(page, 300, 10, 30);
    await continuousScroll(page, -300, 10, 25);

    // Navigate to Marathi Voice Rojgar Sahayak
    await page.goto(`${CONFIG.baseUrl}/voice-sahayak`, { waitUntil: 'networkidle' });

    // ========================================================================
    // SCENE 6: MARATHI AI VOICE ROJGAR SAHAYAK
    // ========================================================================
    console.log('[Narrative] 6/9: Marathi AI Voice Rojgar Sahayak');
    await updateHUD(
      page,
      '6/9',
      'मराठी AI रोजगार सहायक • Rural Inclusion',
      'Multilingual voice guidance connecting rural youth to nearest Government ITIs'
    );

    // Click Marathi query preset 1 (Pune Auto)
    const puneQuery = page.locator('button:has-text("पुणे / ऑटोमोबाईल")').first();
    await glideAndClick(page, puneQuery, 8);

    // Click glowing microphone button with active wave
    const micBtn = page.locator('button:has-text("माईकवर बोला"), button:has-text("माईक सुरू आहे")').first();
    if (await micBtn.isVisible()) {
      await updateHUD(
        page,
        '6/9',
        'Real-Time Marathi Voice Ingestion',
        'Speech recognition analyzes candidate qualification and recommends tailored ITI trades'
      );
      await glideAndClick(page, micBtn, 8);
    }

    // Click "मराठी आवाज ऐका"
    const playAudioBtn = page.locator('button:has-text("मराठी आवाज ऐका")').first();
    if (await playAudioBtn.isVisible()) {
      await glideAndClick(page, playAudioBtn, 8);
    }

    // Glide to nearest ITI recommendation card
    await continuousScroll(page, 380, 10, 30);
    const itiName = page.locator('text=Government ITI Pimpri-Chinchwad').first();
    if (await itiName.isVisible()) await glideTo(page, itiName, 8);
    await continuousScroll(page, -380, 10, 25);

    // Navigate to Verifiable Passport
    await page.goto(`${CONFIG.baseUrl}/passport`, { waitUntil: 'networkidle' });

    // ========================================================================
    // SCENE 7: VERIFIABLE DIGITAL KAUSHAL PASSPORT
    // ========================================================================
    console.log('[Narrative] 7/9: Verifiable Kaushal Passport');
    await updateHUD(
      page,
      '7/9',
      'डिजिटल कौशल पासपोर्ट • W3C & DigiLocker',
      'Tamper-proof micro-credentials with cryptographic Ed25519 signature validation'
    );

    // Trigger instant cryptographic verification
    const verifyBtn = page.locator('button:has-text("Verify Ed25519 Signature")').first();
    if (await verifyBtn.isVisible()) {
      await glideAndClick(page, verifyBtn, 10);
    }

    // Glide over green verification badge
    const successBadge = page.locator('text=Cryptographic Signature Verified').first();
    if (await successBadge.isVisible()) await glideTo(page, successBadge, 8);

    // Scroll to inspect student credential card & QR code
    await continuousScroll(page, 450, 12, 30);
    const qrCode = page.locator('div:has-text("SCAN TO VERIFY ON-CHAIN")').first();
    if (await qrCode.isVisible()) await glideTo(page, qrCode, 8);
    await continuousScroll(page, -450, 12, 25);

    // Navigate to What-If Simulator & Dynamic DAG
    await page.goto(`${CONFIG.baseUrl}/path`, { waitUntil: 'networkidle' });

    // ========================================================================
    // SCENE 8: WHAT-IF SIMULATOR & SKILL DAG
    // ========================================================================
    console.log('[Narrative] 8/9: What-If Simulator & Skill DAG');
    await updateHUD(
      page,
      '8/9',
      'What-If Simulator & Dynamic Skill DAG',
      'Topological dependency engine recalculates employment readiness in real time'
    );

    // Scroll through the learning phases
    await continuousScroll(page, 500, 14, 30);
    const phaseCard = page.locator('text=Phase').first();
    if (await phaseCard.isVisible()) await glideTo(page, phaseCard, 8);
    await continuousScroll(page, -500, 14, 25);

    // Navigate to Executive Secretariat Briefing
    await page.goto(`${CONFIG.baseUrl}/department/report`, { waitUntil: 'networkidle' });

    // ========================================================================
    // SCENE 9: EXECUTIVE BRIEFING MEMORANDUM & GRAND FINALE
    // ========================================================================
    console.log('[Narrative] 9/9: Executive Memorandum & Grand Finale');
    await updateHUD(
      page,
      '9/9',
      'Secretariat Executive Policy Memorandum',
      'Formal Cabinet-ready briefing paper for Skill Development & Entrepreneurship Dept'
    );

    // Continuous cinematic scroll through policy directives
    await continuousScroll(page, 650, 14, 30);
    await continuousScroll(page, 650, 14, 30);
    await continuousScroll(page, -1300, 18, 25);

    // Grand Finale banner
    await updateHUD(
      page,
      'WIN',
      'KaushalSetu Maharashtra (कौशलसेतू) • Ready for SIH 2026',
      'The complete end-to-end closed loop from labor market sensing to accredited jobs',
      'SMART INDIA HACKATHON 2026'
    );
    await page.waitForTimeout(1500);

    console.log('[Narrative] All chapters recorded seamlessly with continuous flow!');

  } catch (error) {
    console.error('[Recording Error]', error);
  } finally {
    let rawVideoPath = null;
    if (page && context) {
      try {
        console.log('[Studio] Closing context to flush video stream...');
        await context.close();
        const videoObj = page.video();
        if (videoObj) {
          rawVideoPath = await videoObj.path();
        }
      } catch (e) {
        console.warn('[Video] Retrying video path lookup:', e.message);
      }
      try {
        await browser.close();
      } catch (e) {}
    }

    // Bulletproof fallback: find latest .webm file in recordings directory
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
    // 6. FFMPEG TRANSCODING (Broadcast H.264 / 1080p 60fps)
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
        console.log(`🎉 WALKTHROUGH DEMO READY!`);
        console.log(`📹 File: ${finalMp4Path}`);
        console.log(`======================================================\n`);
      } catch (err) {
        console.warn(`[FFmpeg Warning] Transcoding issue: ${err.message}`);
      }
    }
  }
}

runContinuousWalkthrough();
