async page => {
  const id = 'WyTCPYMMnxlRRizC6GBE';
  const routes = [
    ['overview', '/'], ['progress', '/dashboard'], ['interview-setup', '/interview/select'],
    ['interview-session', `/interview/${id}`], ['interview-feedback', `/interview/${id}/feedback`],
    ['resume', '/resume'], ['coding', '/coding']
  ];
  const checks = [];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [name, route] of routes) {
    await page.goto('http://127.0.0.1:3100' + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(700);
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(150);
      const state = await page.evaluate(() => ({
        title: document.title,
        heading: document.querySelector('main h1, main h2')?.textContent?.trim() || '',
        overflow: document.documentElement.scrollWidth > innerWidth,
        main: Boolean(document.querySelector('main')),
        alerts: [...document.querySelectorAll('main [role="alert"]')].map(e => e.textContent?.trim()).filter(Boolean),
      }));
      await page.screenshot({ path: `docs/qa/phase2-${name}-${width}.png`, fullPage: true });
      checks.push({name, route: new URL(await page.url()).pathname, width, ...state});
    }
  }
  return checks;
}
