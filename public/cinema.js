import { createFilmQueue } from './film-queue.js';

export function setupCinema({ films }) {
  const video = document.querySelector('#intro-video');
  const poster = document.querySelector('#hero-poster');
  const button = document.querySelector('#motion-toggle');
  const status = document.querySelector('#film-status');
  const filmDialog = document.querySelector('#film-dialog');
  const fullFilm = document.querySelector('#full-film');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused = false;
  let inView = true;
  let unavailable = false;
  let attempt = 0;
  const queue = createFilmQueue(films);
  let currentFilm;
  let videoURL;
  try { manuallyPaused = localStorage.getItem('portfolio-motion-paused') === 'true'; } catch { /* Optional storage. */ }
  video.muted = true;
  video.loop = false;
  fullFilm.muted = true;

  function selectFilm() {
    ++attempt; // Invalidate play promises belonging to the previous source.
    video.pause();
    currentFilm = queue.next();
    videoURL = currentFilm?.video;
    unavailable = false;
    video.hidden = true;
    video.removeAttribute('src');
    video.load();
    if (!currentFilm) return;
    poster.src = currentFilm.poster;
    video.poster = currentFilm.poster;
    video.dataset.filmId = currentFilm.id;
    document.querySelector('#film-name').textContent = `${currentFilm.artist}〈${currentFilm.title}〉`;
    document.querySelector('#film-number').textContent = `FILM ${String(films.indexOf(currentFilm) + 1).padStart(2, '0')} / ${String(films.length).padStart(2, '0')}`;
    document.querySelector('#film-credit').href = currentFilm.credit;
  }

  function sync() {
    const ticket = ++attempt;
    const paused = manuallyPaused || preference.matches;
    const suspended = document.hidden || !inView || Boolean(document.querySelector('dialog[open]'));
    document.documentElement.classList.toggle('motion-paused', paused);
    button.textContent = paused || unavailable ? '▷' : 'Ⅱ';
    button.setAttribute('aria-pressed', String(paused));
    button.disabled = preference.matches || !videoURL;
    button.setAttribute('aria-label', preference.matches ? '已依系統設定減少動畫' : unavailable ? '重新播放開場影片' : paused ? '播放開場影片' : '暫停開場影片');
    if (paused || suspended || unavailable || !videoURL) {
      video.pause();
      if (preference.matches || unavailable || !videoURL) video.hidden = true;
      status.textContent = unavailable ? '靜態預覽 · 可重試' : paused ? '已暫停' : suspended ? '暫停於背景' : '靜態預覽';
      return;
    }
    if (video.ended) { selectFilm(); sync(); return; }
    // No video request is made on initial load when reduced motion is enabled.
    if (!video.getAttribute('src')) video.src = videoURL;
    status.textContent = '載入影像';
    video.play().then(() => {
      if (ticket !== attempt) return;
      video.hidden = false;
      status.textContent = '靜音播放';
    }).catch(() => {
      if (ticket !== attempt) return;
      unavailable = true;
      sync();
    });
  }

  video.addEventListener('error', () => { unavailable = true; sync(); });
  video.addEventListener('ended', sync);
  const nextFilm = document.querySelector('#next-film');
  nextFilm.disabled = films.length < 2;
  nextFilm.addEventListener('click', () => { selectFilm(); sync(); });
  button.addEventListener('click', () => {
    if (unavailable) {
      unavailable = false;
      manuallyPaused = false;
      video.load();
    } else manuallyPaused = !manuallyPaused;
    try { localStorage.setItem('portfolio-motion-paused', String(manuallyPaused)); } catch { /* Optional storage. */ }
    sync();
  });
  preference.addEventListener('change', sync);
  document.addEventListener('dialogchange', sync);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) fullFilm.pause();
    sync();
  });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: 0.15 }).observe(document.querySelector('.hero'));

  const openFilm = document.querySelector('#open-film');
  openFilm.disabled = !films.length;
  openFilm.addEventListener('click', () => {
    fullFilm.src = videoURL;
    fullFilm.poster = currentFilm.poster;
    document.querySelector('#film-title').textContent = currentFilm.title;
    document.querySelector('#full-film-credit').href = currentFilm.credit;
    filmDialog.showModal();
    document.body.classList.add('dialog-open');
    document.querySelector('#close-film').focus();
    sync();
    // Explicit playback remains possible even when background motion is disabled.
    fullFilm.play().catch(() => { /* Native controls allow another user-initiated attempt. */ });
  });
  document.querySelector('#close-film').addEventListener('click', () => filmDialog.close());
  filmDialog.addEventListener('click', (event) => {
    const bounds = filmDialog.getBoundingClientRect();
    if (event.target === filmDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) filmDialog.close();
  });
  filmDialog.addEventListener('close', () => {
    fullFilm.pause();
    document.body.classList.remove('dialog-open');
    openFilm.focus();
    sync();
  });
  selectFilm();
  sync();
}
