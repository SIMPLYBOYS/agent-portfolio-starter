// Optional developer check. Requires Playwright available in your environment.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { films } from './public/films.js';
import { projects } from './public/content.js';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173');
  await page.locator('.project-card').first().waitFor();
  assert.equal(await page.locator('.project-card').count(), 10);
  assert.equal(await page.locator('#career .career-entry').count(), 7);
  assert.equal(await page.locator('.expertise-grid article').count(), 4);
  for (const link of await page.locator('[data-resume-link]').all()) {
    assert.equal(await link.getAttribute('href'), 'https://simplyboys.github.io/resume/');
  }
  await page.locator('#earlier-career summary').click();
  assert.equal(await page.locator('#earlier-career').getAttribute('open'), '');
  await page.locator('#earlier-career summary').click();
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(() => {
    const video = document.querySelector('#intro-video');
    return video.currentTime > 0 && !video.paused;
  });
  assert.equal(await page.locator('#intro-video').evaluate((video) => video.muted && !video.paused), true);
  const opening = await page.locator('#intro-video').getAttribute('data-film-id');
  await page.locator('#intro-video').evaluate(video => { video.currentTime = video.duration - 0.15; });
  await page.waitForFunction(id => document.querySelector('#intro-video').dataset.filmId !== id, opening);
  await page.waitForFunction(() => document.querySelector('#intro-video').currentTime > 0);
  // Full-page screenshots do not scroll lazy images into view automatically.
  await page.locator('.project-art img').evaluateAll(async (images) => {
    await Promise.all(images.map((image) => { image.loading = 'eager'; return image.decode(); }));
  });
  await page.screenshot({ path: '/tmp/agent-portfolio-cinema-hero.png' });
  await page.screenshot({ path: '/tmp/agent-portfolio-desktop.png', fullPage: true });
  for (const category of ['ukiyoe', 'agent', 'experience', 'research']) {
    await page.locator(`[data-filter="${category}"]`).click();
    assert.equal(await page.locator('.project-card').count(), projects.filter(project => project.category === category).length);
    await page.locator('.project-card').first().click();
    assert.equal(await page.locator('#project-dialog').evaluate((element) => element.open), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#project-dialog').evaluate((element) => element.open), false);
    assert.equal(await page.locator('.project-card').first().evaluate((element) => element === document.activeElement), true);
  }
  await page.locator('[data-filter="all"]').click();
  for (const id of ['cogito-agent', 'immerse']) {
    await page.locator(`.project-card[data-open="${id}"]`).click();
    assert.equal(await page.locator('#dialog-links a').count(), id === 'cogito-agent' ? 5 : 2);
    assert.equal(await page.locator('#dialog-links a').first().getAttribute('href'), `https://github.com/SIMPLYBOYS/${id}`);
    await page.locator('#project-dialog .dialog-close').click();
  }
  for (const id of ['kiyochika', 'tokaido', 'nakasendo', 'fugaku', 'edo']) {
    await page.locator(`.project-card[data-open="${id}"]`).click();
    assert.equal(await page.locator('#dialog-links a').count(), 3);
    await page.waitForFunction(() => document.querySelector('#dialog-image').naturalWidth > 0);
    await page.locator('#project-dialog .dialog-close').click();
  }
  const officeCard = page.locator('.project-card[data-open="pixel-office"]');
  await officeCard.hover();
  await page.waitForFunction(() => {
    const video = document.querySelector('[data-open="pixel-office"] .project-preview');
    return video.currentTime > 0 && !video.hidden && video.muted;
  });
  await officeCard.click();
  assert.equal(await officeCard.locator('.project-preview').evaluate(video => video.paused), true);
  assert.equal(await page.locator('#project-media').isVisible(), true);
  assert.equal(await page.locator('#project-video').evaluate(video => video.paused && video.muted), true);
  assert.match(await page.locator('#dialog-links').textContent(), /Source code/);
  await page.locator('#project-video').evaluate(video => video.play());
  await page.waitForFunction(() => document.querySelector('#project-video').currentTime > 0);
  await page.locator('.media-choices button').nth(1).click();
  assert.equal(await page.locator('#project-video').evaluate(video => video.paused && !video.loop), true);
  assert.match(await page.locator('#project-media-note').textContent(), /0:14.*0:19.*重建示意/);
  await page.locator('#project-video').evaluate(video => video.play());
  await page.waitForFunction(() => {
    const video = document.querySelector('#project-video');
    return video.currentTime > 0 && video.videoWidth === 1080;
  });
  await page.locator('#project-video').evaluate(video => { video.pause(); video.currentTime = 7; });
  await page.waitForFunction(() => !document.querySelector('#project-video').seeking);
  await page.locator('#project-media').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('#project-dialog .dialog-close').evaluate(button => {
    const box = button.getBoundingClientRect();
    const dialogBox = button.closest('dialog').getBoundingClientRect();
    return box.top >= dialogBox.top && box.bottom <= dialogBox.bottom;
  }), true, 'Close control stays visible while scrolling the media');
  await page.screenshot({ path: '/tmp/agent-portfolio-pixel-office-desktop.png' });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#project-video').getAttribute('src'), null);
  await page.locator('[data-open="immerse"]').click();
  assert.equal(await page.locator('#project-media').isVisible(), false);
  assert.equal(await page.locator('#project-video').count(), 0);
  await page.keyboard.press('Escape');
  const cogitoCard = page.locator('[data-open="cogito-agent"]');
  await cogitoCard.hover();
  await page.waitForFunction(() => {
    const video = document.querySelector('[data-open="cogito-agent"] .project-preview');
    return video.currentTime > 0 && !video.hidden && video.muted;
  });
  await cogitoCard.click();
  assert.equal(await cogitoCard.locator('.project-preview').evaluate(video => video.paused), true);
  assert.equal(await page.locator('#project-media .credits-link').getAttribute('href'), '/credits.html#cogito-agent');
  assert.match(await page.locator('#project-media-note').textContent(), /功能示意/);
  assert.equal(await page.locator('#project-video').evaluate(video => video.paused && !video.loop), true);
  await page.locator('#project-video').evaluate(video => video.play());
  await page.waitForFunction(() => {
    const video = document.querySelector('#project-video');
    return video.currentTime > 0 && video.videoWidth === 1920;
  });
  await page.locator('#project-video').evaluate(video => { video.pause(); video.currentTime = 12; });
  await page.waitForFunction(() => !document.querySelector('#project-video').seeking);
  await page.locator('#project-media').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '/tmp/agent-portfolio-cogito-video.png' });
  for (const [i, name] of ['runs', 'metrics', 'policy'].entries()) {
    await page.locator('.gallery-choices button').nth(i).click();
    await page.locator('#gallery-image').evaluate(img => img.decode());
    assert.equal(await page.locator('.gallery-fullsize').getAttribute('href'), `/assets/cogito-agent/${name}.png`);
    assert.equal(await page.locator('.gallery-choices button[aria-pressed="true"]').count(), 1);
  }
  await page.locator('#project-gallery').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '/tmp/agent-portfolio-cogito-desktop.png' });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#project-video').getAttribute('src'), null);
  await officeCard.click();
  assert.equal(await page.locator('#project-gallery').isVisible(), false);
  assert.equal(await page.locator('#gallery-image').count(), 0);
  assert.equal(await page.locator('#project-media .credits-link').getAttribute('href'), '/credits.html#pixel-office');
  await page.keyboard.press('Escape');
  await page.locator('#open-film').click();
  assert.equal(await page.locator('#full-film').getAttribute('src'), await page.locator('#intro-video').getAttribute('src'));
  await page.waitForFunction(() => document.querySelector('#full-film').currentTime > 0);
  assert.equal(await page.locator('#intro-video').evaluate((video) => video.paused), true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('#full-film').paused);
  assert.equal(await page.locator('#full-film').evaluate((video) => video.paused), true);
  assert.equal(await page.locator('#open-film').evaluate((element) => element === document.activeElement), true);
  await page.locator('#motion-toggle').click();
  assert.equal(await page.locator('html').evaluate((element) => element.classList.contains('motion-paused')), true);
  await page.reload();
  assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'), 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelector('#motion-toggle').disabled);
  assert.equal(await page.locator('#motion-toggle').isDisabled(), true);
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow at ${width}px`);
    await cogitoCard.click();
    await page.locator('#gallery-image').evaluate(img => img.decode());
    assert.equal(await page.locator('#project-dialog').evaluate(element => element.scrollWidth <= element.clientWidth), true, `Cogito dialog overflow at ${width}px`);
    if (width === 390) {
      await page.locator('#project-gallery').scrollIntoViewIfNeeded();
      await page.screenshot({ path: '/tmp/agent-portfolio-cogito-mobile.png' });
    }
    await page.keyboard.press('Escape');
    if (width === 390) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.locator('.project-art img').evaluateAll(async (images) => {
        await Promise.all(images.map((image) => { image.loading = 'eager'; return image.decode(); }));
      });
      await page.screenshot({ path: '/tmp/agent-portfolio-cinema-mobile-hero.png' });
      await page.screenshot({ path: '/tmp/agent-portfolio-mobile.png', fullPage: true });
      await page.locator('[data-open="kiyochika"]').first().click();
      assert.equal(await page.locator('#project-dialog').evaluate((element) => element.scrollWidth <= element.clientWidth), true);
      await page.locator('#project-dialog .dialog-close').click();
      await officeCard.click();
      await page.locator('.media-choices button').nth(1).click();
      assert.equal(await page.locator('#project-dialog').evaluate(element => element.scrollWidth <= element.clientWidth), true);
      await page.locator('#project-media').scrollIntoViewIfNeeded();
      await page.screenshot({ path: '/tmp/agent-portfolio-pixel-office-mobile.png' });
      await page.keyboard.press('Escape');
    }
  }
  for (const path of ['/', '/styles.css', '/cinema.css', '/career.css', '/app.js', '/content.js', '/ukiyoe.js', '/cinema.js', '/credits.html', '/favicon.svg']) {
    assert.equal((await page.request.get(`http://127.0.0.1:4173${path}`)).status(), 200);
  }
  for (const path of ['/.env', '/README.md', '/%2e%2e%2f.env']) {
    assert.notEqual((await page.request.get(`http://127.0.0.1:4173${path}`)).status(), 200);
  }
  assert.equal((await page.request.post('http://127.0.0.1:4173/')).status(), 405);
  const filmURL = 'http://127.0.0.1:4173/assets/imado-summer-moon.mp4';
  const range = await page.request.get(filmURL, { headers: { Range: 'bytes=0-99' } });
  assert.equal(range.status(), 206);
  assert.equal((await range.body()).length, 100);
  assert.equal((await page.request.get(filmURL, { headers: { Range: 'bytes=-100' } })).status(), 206);
  assert.equal((await page.request.get(filmURL, { headers: { Range: 'bytes=999999999-' } })).status(), 416);
  const reduced = await browser.newPage({ reducedMotion: 'reduce' });
  const movieRequests = [];
  reduced.on('request', (request) => { if (request.url().endsWith('.mp4')) movieRequests.push(request.url()); });
  await reduced.goto('http://127.0.0.1:4173');
  await reduced.waitForFunction(() => document.querySelector('#motion-toggle').disabled);
  assert.equal(await reduced.locator('#intro-video').getAttribute('src'), null);
  assert.equal(movieRequests.length, 0);
  const seen = new Set();
  for (let i = 0; i < films.length; i++) {
    const id = await reduced.locator('#intro-video').getAttribute('data-film-id');
    const film = films.find(f => f.id === id);
    assert.ok(film);
    assert.equal(seen.has(id), false);
    seen.add(id);
    assert.equal(await reduced.locator('#hero-poster').getAttribute('src'), film.poster);
    assert.equal(await reduced.locator('#film-name').textContent(), `${film.artist}〈${film.title}〉`);
    assert.equal(await reduced.locator('#film-credit').getAttribute('href'), film.credit);
    await reduced.locator('#next-film').click();
  }
  assert.equal(movieRequests.length, 0, 'Manual scene changes under reduced motion must remain poster-only');
  await reduced.locator('[data-open="cogito-agent"]').hover();
  await reduced.locator('[data-open="cogito-agent"]').focus();
  assert.equal(await reduced.locator('[data-open="cogito-agent"] .project-preview').getAttribute('src'), null);
  await reduced.locator('[data-open="cogito-agent"]').click();
  assert.equal(await reduced.locator('#project-video').evaluate(video => video.paused), true);
  assert.equal(movieRequests.length, 0, 'Cogito showcase must not auto-fetch under reduced motion');
  await reduced.keyboard.press('Escape');
  await reduced.locator('[data-open="pixel-office"]').hover();
  await reduced.locator('[data-open="pixel-office"]').focus();
  assert.equal(await reduced.locator('[data-open="pixel-office"] .project-preview').getAttribute('src'), null);
  await reduced.locator('[data-open="pixel-office"]').click();
  assert.equal(await reduced.locator('#project-video').evaluate(video => video.paused), true);
  assert.equal(movieRequests.length, 0, 'Project media must not fetch until explicit play under reduced motion');
  await reduced.locator('#project-video').evaluate(video => video.play());
  await reduced.waitForFunction(() => document.querySelector('#project-video').currentTime > 0);
  await reduced.keyboard.press('Escape');
  // Explicit full-view playback verifies that every MP4 is decodable, not just HTTP 200.
  for (let i = 0; i < films.length; i++) {
    const id = await reduced.locator('#intro-video').getAttribute('data-film-id');
    const film = films.find(f => f.id === id);
    await reduced.locator('#open-film').click();
    await reduced.waitForFunction(() => {
      const video = document.querySelector('#full-film');
      return video.currentTime > 0 && video.videoWidth > 0;
    });
    assert.equal(await reduced.locator('#full-film').getAttribute('src'), film.video);
    assert.equal(await reduced.locator('#film-title').textContent(), film.title);
    assert.equal(await reduced.locator('#full-film-credit').getAttribute('href'), film.credit);
    await reduced.locator('#close-film').click();
    await reduced.waitForFunction(() => document.querySelector('#full-film').paused);
    await reduced.locator('#next-film').click();
  }
  await reduced.close();
  for (const film of films) {
    assert.equal((await page.request.get('http://127.0.0.1:4173' + film.video)).status(), 200);
    assert.equal((await page.request.get('http://127.0.0.1:4173' + film.poster)).status(), 200);
  }
  const failed = await browser.newPage();
  await failed.route('**/*.mp4', (route) => route.abort());
  await failed.goto('http://127.0.0.1:4173');
  await failed.waitForFunction(() => document.querySelector('#film-status').textContent.includes('靜態預覽'));
  assert.equal(await failed.locator('#hero-poster').isVisible(), true);
  assert.equal(await failed.locator('.project-card').count(), 10);
  await failed.locator('[data-open="pixel-office"]').hover();
  await failed.waitForFunction(() => Boolean(document.querySelector('[data-open="pixel-office"] .project-preview').error));
  assert.equal(await failed.locator('[data-open="pixel-office"] .project-preview').isVisible(), false);
  assert.equal(await failed.locator('[data-open="pixel-office"] img').isVisible(), true);
  await failed.locator('[data-open="pixel-office"]').click();
  await failed.locator('#project-video').evaluate(video => video.play().catch(() => {}));
  await failed.locator('.media-error').waitFor({ state: 'visible' });
  assert.match(await failed.locator('.media-error').textContent(), /Source code/);
  await failed.keyboard.press('Escape');
  await failed.locator('[data-open="cogito-agent"]').click();
  await failed.locator('#project-video').evaluate(video => video.play().catch(() => {}));
  await failed.locator('.media-error').waitFor({ state: 'visible' });
  await failed.locator('#gallery-image').evaluate(img => img.decode());
  assert.equal(await failed.locator('#gallery-image').isVisible(), true);
  await failed.close();
  assert.deepEqual(errors, []);
  console.log('PASS: resume, 10 projects, Cogito + Pixel Office media, 3 dashboard images, per-project credits, mobile layout, close cleanup, reduced-motion no-fetch, media fallback, 10 intro films, shuffle, 360–1440px, byte ranges, no page errors.');
  console.log('Screenshots: /tmp/agent-portfolio-desktop.png, /tmp/agent-portfolio-mobile.png');
} finally {
  await browser.close();
}
