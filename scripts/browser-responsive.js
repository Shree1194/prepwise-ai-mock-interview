async page => {
 const results = [];
 await page.emulateMedia({ reducedMotion: 'reduce' });
 for (const route of ['/', '/dashboard', '/resume', '/coding', '/interview/select']) {
  await page.goto('http://127.0.0.1:3100' + route, {waitUntil:'domcontentloaded', timeout:60000});
  await page.waitForTimeout(1200);
  for (const width of [1440, 768, 390, 375]) {
   await page.setViewportSize({width, height:900});
   const name = route === '/' ? 'overview' : route.replaceAll('/', '-').slice(1);
   await page.screenshot({path:`docs/qa/${name}-${width}.png`, fullPage:true});
   const checks = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > window.innerWidth, main: !!document.querySelector('main'), error: !!document.querySelector('main [role="alert"]') }));
   results.push({route,width,...checks});
  }
 }
 return results;
}
