// Test NÉONOID with Playwright (CJS for NODE_PATH require)
const { chromium } = require('/root/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 600, height: 800 } });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE ERROR: ' + msg.text());
  });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));

  await page.goto('https://laurent-67370.github.io/neonoid/', { waitUntil: 'networkidle', timeout: 30000 });

  // Check title screen
  const title = await page.textContent('.logo').catch(() => null);
  console.log('Title:', title);

  const version = await page.textContent('.version').catch(() => null);
  console.log('Version:', version);

  // Check canvas exists
  const canvas = await page.$('#game');
  console.log('Canvas found:', !!canvas);

  // Check buttons
  const buttons = await page.$$eval('.btn', els => els.map(e => e.textContent.trim()));
  console.log('Buttons:', JSON.stringify(buttons));

  // Click JOUER
  await page.click('#btn-play');
  await page.waitForTimeout(1000);

  // Check game state — look for HUD elements or canvas drawing
  const gameRunning = await page.evaluate(() => {
    const c = document.getElementById('game');
    const ctx = c.getContext('2d');
    // Sample some pixels to check canvas is being drawn on
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let nonBlack = 0;
    for (let i = 0; i < data.length; i += 400) {
      if (data[i] > 10 || data[i+1] > 10 || data[i+2] > 10) nonBlack++;
    }
    return { nonBlackPixels: nonBlack, total: data.length / 400 };
  });
  console.log('Canvas activity:', JSON.stringify(gameRunning));

  // Take screenshot
  await page.screenshot({ path: '/root/neonoid/test-screenshot.png' });
  console.log('Screenshot saved: /root/neonoid/test-screenshot.png');

  // Play for a few seconds — simulate mouse movement and clicks
  await page.mouse.move(300, 750);
  await page.waitForTimeout(500);
  await page.mouse.click(300, 750); // launch ball
  await page.waitForTimeout(2000);

  // Move paddle
  for (let i = 0; i < 10; i++) {
    await page.mouse.move(200 + i * 30, 750);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(1000);

  // Screenshot during gameplay
  await page.screenshot({ path: '/root/neonoid/test-gameplay.png' });
  console.log('Gameplay screenshot saved');

  // Check canvas activity after gameplay
  const activity2 = await page.evaluate(() => {
    const c = document.getElementById('game');
    const ctx = c.getContext('2d');
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let nonBlack = 0;
    let colors = new Set();
    for (let i = 0; i < data.length; i += 400) {
      const r = data[i], g = data[i+1], b = data[i+2];
      if (r > 10 || g > 10 || b > 10) {
        nonBlack++;
        colors.add(`${Math.round(r/50)*50},${Math.round(g/50)*50},${Math.round(b/50)*50}`);
      }
    }
    return { nonBlackPixels: nonBlack, distinctColors: colors.size };
  });
  console.log('Gameplay canvas activity:', JSON.stringify(activity2));

  // Report errors
  if (errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    errors.forEach(e => console.log('  ' + e));
  } else {
    console.log('\n✅ No JS errors');
  }

  await browser.close();
})();