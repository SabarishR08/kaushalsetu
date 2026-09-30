/**
 * KaushalSetu Maharashtra (कौशलसेतू) - SIH26134
 * Autonomous High-Definition (1080p) Prototype Walkthrough Video Recorder
 * Built according to AI-Agent-Skills/automated-browser-recording.md specification.
 *
 * Features captured:
 * 1. Landing Page & 4-Pillar Closed Loop Engine (/)
 * 2. State Policy & Macro Alignment Cockpit (/department)
 * 3. Secretariat Executive Policy Briefing (/department/report)
 * 4. 36-District GIS Twin & Industrial Cluster Equilibrium (/districts)
 * 5. Autonomous Curriculum-Delta-Diff Studio (/curriculum-diff)
 * 6. Live 1,000 Postings Telemetry Feed (/telemetry)
 * 7. Marathi AI Voice Rojgar Sahayak (/voice-sahayak)
 * 8. Verifiable Digital Kaushal Passport (/passport)
 * 9. What-If Skilling Simulator & DAG (/path)
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
  resolution: { width: 1920, height: 1080 }, // Full 1080p
  headless: true, // Headless recording for deterministic CI & studio capture
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
    console.log(`[Server] Target server is already active at ${CONFIG.baseUrl}`);
    return null;
  }

  console.log(`[Server] No server detected at ${CONFIG.baseUrl}. Spawning Next.js server...`);
  const nextBin = path.resolve(__dirname, '../node_modules/next/dist/bin/next');
  const dotNextExists = fs.existsSync(path.resolve(__dirname, '../.next'));
  const startArgs = dotNextExists ? [nextBin, 'start', '-p', '3000'] : [nextBin, 'dev', '-p', '3000'];

  const serverProc = spawn(process.execPath, startArgs, {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: '3000' },
    stdio: 'ignore',
  });

  console.log('[Server] Waiting for server readiness...');
  const maxWait = 45000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 1500));
    if (await checkServer(CONFIG.baseUrl)) {
      console.log(`[Server] Next.js is ready at ${CONFIG.baseUrl}`);
      return serverProc;
    }
  }

  throw new Error(`Server failed to start within ${maxWait / 1000}s`);
}

// ============================================================================
// 3. HUMAN-LIKE INTERACTION HELPERS
// ============================================================================

/**
 * Natural physics-like smooth scroll.
 */
async function smoothScroll(page, totalDistance, steps = 18, delayMs = 45) {
  const stepDist = totalDistance / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepDist);
    await page.waitForTimeout(delayMs);
  }
}

/**
 * Human-speed realistic typing with subtle randomized cadence.
 */
async function humanType(locator, text, minDelay = 25, maxDelay = 65) {
  await locator.click();
  for (const char of text) {
    await locator.pressSequentially(char, {
      delay: Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay,
    });
  }
}

/**
 * Focus and highlight an element briefly before natural click.
 */
async function focusAndClick(locator, delayBefore = 400) {
  if (await locator.isVisible()) {
    await locator.hover();
    await locator.page().waitForTimeout(delayBefore);
    await locator.click();
  }
}

// ============================================================================
// 4. STUDIO HUD DISPLAY OVERLAY
// ============================================================================
async function updateHUD(page, chapterNumber, chapterTitle, subtitle, tag = 'SIH26134 • MAHARASHTRA') {
  await page.evaluate(
    ({ chapterNumber, chapterTitle, subtitle, tag }) => {
      let hud = document.getElementById('kaushalsetu-recording-hud');
      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'kaushalsetu-recording-hud';
        hud.style.position = 'fixed';
        hud.style.bottom = '24px';
        hud.style.left = '50%';
        hud.style.transform = 'translateX(-50%)';
        hud.style.zIndex = '999999';
        hud.style.pointerEvents = 'none';
        hud.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        hud.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        document.body.appendChild(hud);
      }

      hud.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(10, 10, 15, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(249, 115, 22, 0.35);
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(249, 115, 22, 0.2);
          border-radius: 9999px;
          padding: 10px 24px;
          color: #ffffff;
          max-width: 90vw;
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            box-shadow: 0 0 15px rgba(249, 115, 22, 0.5);
            font-weight: 800;
            font-size: 15px;
            color: #ffffff;
            flex-shrink: 0;
          ">
            कौ
          </div>
          <div style="display: flex; flex-col; justify-content: center; text-align: left;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
              <span style="
                background: rgba(249, 115, 22, 0.2);
                border: 1px solid rgba(249, 115, 22, 0.4);
                color: #fb923c;
                font-size: 10px;
                font-weight: 700;
                padding: 1px 7px;
                border-radius: 9999px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
              ">${tag}</span>
              <span style="font-size: 11px; font-weight: 600; color: #a1a1aa;">CHAPTER ${chapterNumber}</span>
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px;">
              ${chapterTitle}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">
              ${subtitle}
            </div>
          </div>
        </div>
      `;
    },
    { chapterNumber, chapterTitle, subtitle, tag }
  );
}

// ============================================================================
// 5. EXHAUSTIVE RECORDING CHOREOGRAPHY
// ============================================================================
async function runRecording() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  let serverProc = null;
  let browser = null;
  let context = null;
  let page = null;

  try {
    serverProc = await ensureServerRunning();

    console.log(`[Recording] Launching Chromium (Viewport: ${CONFIG.resolution.width}x${CONFIG.resolution.height})...`);
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
    // CHAPTER 1: LANDING & CLOSED-LOOP ARCHITECTURE (/)
    // ========================================================================
    console.log('[Walkthrough] >>> Chapter 1: Landing Page & Architectural Overview');
    await page.goto(`${CONFIG.baseUrl}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await updateHUD(
      page,
      '1',
      'KaushalSetu Maharashtra • Closed-Loop Intelligence',
      'AI-driven alignment of vocational training with 1,000 real Maharashtra industry job openings'
    );
    await page.waitForTimeout(2000);

    // Hero visual appreciation & smooth scroll to KPI cards
    await smoothScroll(page, 750, 20, 45);
    await page.waitForTimeout(2200);

    // Scroll to 4-pillar closed-loop diagram & feature cards
    await smoothScroll(page, 900, 22, 45);
    await page.waitForTimeout(2400);

    // Scroll back up smoothly
    await smoothScroll(page, -1650, 25, 35);
    await page.waitForTimeout(1500);

    // ========================================================================
    // CHAPTER 2: STATE POLICY & MACRO ALIGNMENT COCKPIT (/department)
    // ========================================================================
    console.log('[Walkthrough] >>> Chapter 2: State Policy & Macro Alignment Cockpit');
    await page.goto(`${CONFIG.baseUrl}/department`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);

    await updateHUD(
      page,
      '2',
      'State Administration Cockpit • Demand vs. Supply',
      'Synthesizing 1,000 live Naukri postings against 418+ Government ITIs across Maharashtra'
    );
    await page.waitForTimeout(2200);

    // Smooth scroll down to view Demand by Skill & Sector Coverage charts
    await smoothScroll(page, 650, 18, 45);
    await page.waitForTimeout(2500);

    // Scroll further down to inspect the real-time Sector Coverage Deficit Table
    await smoothScroll(page, 750, 18, 45);
    await page.waitForTimeout(2500);

    // Hover over sector coverage rows to show data tooltips
    const tableRow = page.locator('table tr').nth(1);
    if (await tableRow.isVisible()) {
      await tableRow.hover();
      await page.waitForTimeout(1000);
    }

    // Scroll back to top
    await smoothScroll(page, -1400, 22, 35);
    await page.waitForTimeout(1500);

    // ========================================================================
    // CHAPTER 3: EXECUTIVE POLICY MEMO & BRIEFING (/department/report)
    // ========================================================================
    console.log('[Walkthrough] >>> Chapter 3: Secretariat Executive Policy Briefing');
    const reportBtn = page.locator('a[href*="/department/report"]').first();
    if (await reportBtn.isVisible()) {
      await focusAndClick(reportBtn, 400);
    } else {
      await page.goto(`${CONFIG.baseUrl}/department/report`, { waitUntil: 'networkidle' });
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await updateHUD(
      page,
      '3',
      'Secretariat Briefing Memorandum • Policy Directive',
      'Official Cabinet-ready brief reallocating capital expenditure towards high-deficit ITI corridors'
    );
    await page.waitForTimeout(2000);

    await smoothScroll(page, 700, 18, 45);
    await page.waitForTimeout(2200);
    await smoothScroll(page, 800, 18, 45);
    await page.waitForTimeout(2200);
    await smoothScroll(page, -1500, 22, 35);
    await page.waitForTimeout(1500);

    // ========================================================================
    // CHAPTER 4: 36-DISTRICT GIS TWIN & INDUSTRIAL CLUSTERS (/districts)
    // ========================================================================
    console.log('[Walkthrough] >>> Chapter 4: 36-District GIS Twin & Industrial Clusters');
    await page.goto(`${CONFIG.baseUrl}/districts`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);

    await updateHUD(
      page,
      '4',
      '36-District GIS Twin • Industrial Cluster Equilibrium',
      'Geospatial intelligence pinpointing regional Skill Deserts in Pune, Aurangabad & Vidarbha'
    );
    await page.waitForTimeout(2200);

    // Division Filter: Pune Division
    const puneDivBtn = page.locator('button:has-text("Pune")').first();
    if (await puneDivBtn.isVisible()) {
      await focusAndClick(puneDivBtn, 500);
      await page.waitForTimeout(1800);
    }

    // Division Filter: Marathwada Division
    const marathwadaBtn = page.locator('button:has-text("Marathwada")').first();
    if (await marathwadaBtn.isVisible()) {
      await focusAndClick(marathwadaBtn, 500);
      await page.waitForTimeout(1800);
    }

    // Division Filter: Vidarbha Division
    const vidarbhaBtn = page.locator('button:has-text("Vidarbha")').first();
    if (await vidarbhaBtn.isVisible()) {
      await focusAndClick(vidarbhaBtn, 500);
      await page.waitForTimeout(1800);
    }

    // Reset to ALL and click Pune cluster to inspect deep right-pane metrics
    const allDivBtn = page.locator('button:has-text("ALL")').first();
    if (await allDivBtn.isVisible()) {
      await focusAndClick(allDivBtn, 400);
      await page.waitForTimeout(1200);
    }

    const puneClusterCard = page.locator('text=Pune Metropolitan & Pimpri-Chinchwad').first();
    if (await puneClusterCard.isVisible()) {
      await focusAndClick(puneClusterCard, 500);
      await page.waitForTimeout(2000);
    }

    // Scroll to see the right-hand equilibrium inspector and skill desert alert
    await smoothScroll(page, 450, 14, 45);
    await page.waitForTimeout(2000);
    await smoothScroll(page, -450, 14, 35);
    await page.waitForTimeout(1200);

    // ========================================================================
    // CHAPTER 5: AUTONOMOUS CURRICULUM-DELTA-DIFF STUDIO (/curriculum-diff)
    // ========================================================================
    console.log('[Walkthrough] >>> Chapter 5: Autonomous Curriculum-Delta-Diff Studio');
    await page.goto(`${CONFIG.baseUrl}/curriculum-diff`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);

    await updateHUD(
      page,
      '5',
      'Curriculum-Delta-Diff Studio • 30-Hour Rapid Bridges',
      'Automated Git-style delta isolation: synthesizes accredited NCVT/DVET add-on modules'
    );
    await page.waitForTimeout(2200);

    // Select Trade 1: Machinist & Lathe
    const machinistBtn = page.locator('button:has-text("Machinist & Conventional Lathe")').first();
    if (await machinistBtn.isVisible()) {
      await focusAndClick(machinistBtn, 400);
      await page.waitForTimeout(1500);
    }

    // Toggle Marathi Translation
    const marathiToggle = page.locator('button:has-text("मराठी भाषांतर"), button:has-text("English")').first();
    if (await marathiToggle.isVisible()) {
      console.log('Toggling Marathi translation in Curriculum Diff...');
      await focusAndClick(marathiToggle, 500);
      await page.waitForTimeout(2200);

      // Scroll to view Marathi syllabus modules
      await smoothScroll(page, 600, 16, 45);
      await page.waitForTimeout(2200);

      // Toggle back to English
      await focusAndClick(marathiToggle, 400);
      await page.waitForTimeout(1500);
    }

    // Select Trade 2: Electrician (Solar & EV Charger)
    const electricianBtn = page.locator('button:has-text("Electrician & Wireman Trade")').first();
    if (await electricianBtn.isVisible()) {
      await focusAndClick(electricianBtn, 400);
      await page.waitForTimeout(2000);
      await smoothScroll(page, 550, 16, 45);
      await page.waitForTimeout(2200);
      await smoothScroll(page, -550, 16, 35);
      await page.waitForTimeout(1200);
    }

    // ========================================================================
    // CHAPTER 6: LIVE 1,000 POSTINGS TELEMETRY FEED (/telemetry)
    // ========================================================================
    console.log('[Walkthrough] >>> Chapter 6: Live 1,000 Postings Telemetry Feed');
    await page.goto(`${CONFIG.baseUrl}/telemetry`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);

    await updateHUD(
      page,
      '6',
      'Live Industrial Job Market Telemetry • 1,000 Postings',
      'Verified corporate vacancies across Pune, Mumbai, Thane, Chh. Sambhajinagar & Nagpur'
    );
    await page.waitForTimeout(2200);

    // Demonstrate interactive search query
    const searchInput = page.locator('input[placeholder*="Search 1,000 live postings"]').first();
    if (await searchInput.isVisible()) {
      await humanType(searchInput, 'EV Battery');
      await page.waitForTimeout(2000);

      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(1000);
      await humanType(searchInput, 'CNC');
      await page.waitForTimeout(2000);
      await searchInput.fill('');
      await page.waitForTimeout(1000);
    }

    // Select a job posting card to display deep right-pane inspector
    const firstPostingCard = page.locator('div[class*="cursor-pointer"]:has-text("Pune"), div[class*="cursor-pointer"]:has-text("Mumbai")').first();
    if (await firstPostingCard.isVisible()) {
      await focusAndClick(firstPostingCard, 400);
      await page.waitForTimeout(2000);
    }

    // Scroll to see extracted skills and DGET alignment matrix
    await smoothScroll(page, 400, 12, 45);
    await page.waitForTimeout(2000);
    await smoothScroll(page, -400, 12, 35);
    await page.waitForTimeout(1200);

    // ========================================================================
    // CHAPTER 7: MARATHI AI VOICE ROJGAR SAHAYAK (/voice-sahayak)
    // ========================================================================
    console.log('[Walkthrough] >>> Chapter 7: Marathi AI Voice Rojgar Sahayak');
    await page.goto(`${CONFIG.baseUrl}/voice-sahayak`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);

    await updateHUD(
      page,
      '7',
      'मराठी AI रोजगार सहायक • Rural & Semi-Urban Accessibility',
      'Voice-first AI assistant guiding Maharashtra youth to local government ITIs & subsidized careers'
    );
    await page.waitForTimeout(2200);

    // Click Marathi query preset 1 (Pune Auto)
    const puneQueryBtn = page.locator('button:has-text("पुणे / ऑटोमोबाईल")').first();
    if (await puneQueryBtn.isVisible()) {
      await focusAndClick(puneQueryBtn, 400);
      await page.waitForTimeout(2000);
    }

    // Click Marathi query preset 2 (Chh. Sambhajinagar Pharma)
    const sambhajinagarQueryBtn = page.locator('button:has-text("छ. संभाजीनगर / फार्मा")').first();
    if (await sambhajinagarQueryBtn.isVisible()) {
      await focusAndClick(sambhajinagarQueryBtn, 400);
      await page.waitForTimeout(2000);
    }

    // Click glowing microphone button to simulate real-time speech capture
    const micBtn = page.locator('button:has-text("माईकवर बोला"), button:has-text("माईक सुरू आहे")').first();
    if (await micBtn.isVisible()) {
      await focusAndClick(micBtn, 400);
      console.log('Simulating microphone voice capture...');
      await page.waitForTimeout(2200);
    }

    // Click voice playback simulation
    const playAudioBtn = page.locator('button:has-text("मराठी आवाज ऐका")').first();
    if (await playAudioBtn.isVisible()) {
      await focusAndClick(playAudioBtn, 400);
      await page.waitForTimeout(2000);
    }

    // Scroll to see nearest ITI center and action steps
    await smoothScroll(page, 450, 14, 45);
    await page.waitForTimeout(2200);
    await smoothScroll(page, -450, 14, 35);
    await page.waitForTimeout(1200);

    // ========================================================================
    // CHAPTER 8: VERIFIABLE DIGITAL KAUSHAL PASSPORT (/passport)
    // ========================================================================
    console.log('[Walkthrough] >>> Chapter 8: Verifiable Digital Kaushal Passport');
    await page.goto(`${CONFIG.baseUrl}/passport`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);

    await updateHUD(
      page,
      '8',
      'डिजिटल कौशल पासपोर्ट • W3C & DigiLocker Verifiable Credentials',
      'Tamper-proof cryptographic micro-stamps with instant QR validation for MIDC factory recruiters'
    );
    await page.waitForTimeout(2200);

    // Click on cryptographic signature verification button
    const verifySignatureBtn = page.locator('button:has-text("Verify Ed25519 Signature")').first();
    if (await verifySignatureBtn.isVisible()) {
      await focusAndClick(verifySignatureBtn, 500);
      console.log('Triggered cryptographic signature verification...');
      await page.waitForTimeout(2500); // Allow green verification banner to appear
    }

    // Scroll down to showcase micro-competencies and QR code verification
    await smoothScroll(page, 550, 16, 45);
    await page.waitForTimeout(2500);
    await smoothScroll(page, -550, 16, 35);
    await page.waitForTimeout(1200);

    // ========================================================================
    // CHAPTER 9: WHAT-IF SKILLING SIMULATOR & INTERACTIVE DAG (/path)
    // ========================================================================
    console.log('[Walkthrough] >>> Chapter 9: What-If Skilling Simulator & DAG');
    await page.goto(`${CONFIG.baseUrl}/path`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);

    await updateHUD(
      page,
      '9',
      'What-If Simulator & Dynamic Skill DAG • Predictive Trajectory',
      'Topologically sorted learning dependencies with real-time recalculation of industry readiness'
    );
    await page.waitForTimeout(2500);

    // Scroll to inspect learning phases & simulator
    await smoothScroll(page, 600, 16, 45);
    await page.waitForTimeout(2500);
    await smoothScroll(page, -600, 16, 35);
    await page.waitForTimeout(1500);

    // ========================================================================
    // CONCLUSION / GRAND FINALE
    // ========================================================================
    console.log('[Walkthrough] >>> Grand Finale: KaushalSetu Mission Summary');
    await page.goto(`${CONFIG.baseUrl}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    await updateHUD(
      page,
      '★',
      'KaushalSetu Maharashtra (कौशलसेतू) • Ready for Deployment',
      'Aligning skilling programs with live market demand for 36 districts of Maharashtra | SIH26134',
      'SIH 2026 WINNING PROTOTYPE'
    );
    await page.waitForTimeout(3000);

    console.log('[Walkthrough] Recording completed successfully!');

  } catch (error) {
    console.error('[Walkthrough Error]', error);
  } finally {
    let rawVideoPath = null;
    if (page) {
      try {
        const videoObj = page.video();
        await page.close();
        await context.close();
        if (videoObj) {
          rawVideoPath = await videoObj.path();
        }
      } catch (e) {
        console.warn('[Video] Retrying video path lookup from disk:', e.message);
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
      console.log('[Server] Terminating background server process...');
      try {
        if (process.platform === 'win32') {
          execSync(`taskkill /pid ${serverProc.pid} /T /F`, { stdio: 'ignore' });
        } else {
          serverProc.kill();
        }
      } catch (e) {
        // ignore
      }
    }

    // ========================================================================
    // 6. FFMPEG TRANSCODING (H.264 / 1080p / High-Performance Universal Playback)
    // ========================================================================
    if (rawVideoPath && fs.existsSync(rawVideoPath)) {
      console.log(`[FFmpeg] Raw WebM video captured at: ${rawVideoPath}`);
      const finalMp4Path = path.join(CONFIG.outputDir, CONFIG.finalMp4Name);
      console.log(`[FFmpeg] Transcoding to broadcast-quality 1080p MP4 (${finalMp4Path})...`);

      try {
        execSync(
          `ffmpeg -y -i "${rawVideoPath}" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 -movflags +faststart "${finalMp4Path}"`,
          { stdio: 'inherit' }
        );
        console.log(`\n======================================================`);
        console.log(`🎉 WALKTHROUGH RECORDING COMPLETE!`);
        console.log(`📹 File: ${finalMp4Path}`);
        console.log(`======================================================\n`);
      } catch (err) {
        console.warn(`[FFmpeg Warning] Direct MP4 transcode encountered an issue: ${err.message}`);
        console.log(`Raw WebM video is safely preserved at: ${rawVideoPath}`);
      }
    }
  }
}

runRecording();
