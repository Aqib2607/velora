import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText));

  console.log('Navigating...');
  await page.goto('http://127.0.0.1:8000/product/1', { waitUntil: 'networkidle' });
  
  const content = await page.content();
  console.log('Body length:', content.length);
  
  await browser.close();
})();
