// Showcase media only: no connection to live agents or project backends.
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const previews = new Set();
const visibility = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const video = entry.target.querySelector('.project-preview');
    if (video && !entry.isIntersecting) { video.pause(); video.hidden = true; }
  }
});

function stopPreviews() {
  for (const video of previews) { video.pause(); video.hidden = true; }
}

export function clearPreviews() {
  stopPreviews();
  visibility.disconnect();
  for (const video of previews) { video.removeAttribute('src'); video.load(); }
  previews.clear();
}

export function attachPreview(card, source) {
  const video = document.createElement('video');
  video.className = 'project-preview';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';
  video.hidden = true;
  video.setAttribute('aria-hidden', 'true');
  card.querySelector('.project-art').append(video);
  previews.add(video);
  visibility.observe(card);
  let hovered = false;
  let focused = false;
  let failed = false;
  const allowed = () => (hovered || focused) && card.isConnected && !failed &&
    card.getBoundingClientRect().bottom > 0 && card.getBoundingClientRect().top < innerHeight &&
    !preference.matches && !document.documentElement.classList.contains('motion-paused') &&
    !document.hidden && !document.querySelector('dialog[open]');
  function sync() {
    if (!allowed()) { video.pause(); video.hidden = true; return; }
    if (!video.getAttribute('src')) video.src = source;
    video.play().then(() => {
      if (allowed()) video.hidden = false;
      else { video.pause(); video.hidden = true; }
    }).catch(() => { video.hidden = true; });
  }
  card.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') { hovered = true; sync(); } });
  card.addEventListener('pointerleave', () => { hovered = false; sync(); });
  card.addEventListener('focus', () => { focused = true; sync(); });
  card.addEventListener('blur', () => { focused = false; sync(); });
  video.addEventListener('error', () => { failed = true; video.hidden = true; });
}

let detailVideo;
export function stopProjectMedia() {
  if (!detailVideo) return;
  detailVideo.pause();
  detailVideo.removeAttribute('src');
  detailVideo.load();
  detailVideo = undefined;
}

export function renderProjectMedia(items, mediaCredit) {
  stopProjectMedia();
  let section = document.querySelector('#project-media');
  if (!section) {
    section = document.createElement('section');
    section.id = 'project-media';
    section.setAttribute('aria-label', '專案展示影片');
    document.querySelector('#dialog-image').after(section);
  }
  section.replaceChildren();
  section.hidden = !items.length;
  if (!items.length) return;
  const choices = document.createElement('div');
  choices.className = 'media-choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', '選擇展示影片');
  const note = document.createElement('p');
  note.id = 'project-media-note';
  note.setAttribute('aria-live', 'polite');
  const video = document.createElement('video');
  detailVideo = video;
  video.id = 'project-video';
  video.controls = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('aria-describedby', note.id);
  const fallback = document.createElement('p');
  fallback.className = 'media-error';
  fallback.hidden = true;
  fallback.textContent = '影片暫時無法載入，可由下方 Source code 前往專案觀看。';
  video.addEventListener('error', () => { fallback.hidden = false; });
  function select(index) {
    const item = items[index];
    video.pause();
    video.poster = item.poster;
    video.src = item.video;
    video.loop = item.loop ?? (index === 0);
    video.setAttribute('aria-label', item.label);
    video.dataset.selection = String(index);
    note.textContent = item.note;
    fallback.hidden = true;
    [...choices.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    // Selection never autoplays; native controls work on mobile and reduced-motion.
  }
  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.label;
    button.addEventListener('click', () => select(index));
    choices.append(button);
  });
  const credit = document.createElement('a');
  credit.className = 'credits-link';
  credit.href = mediaCredit?.href || '/credits.html';
  credit.textContent = mediaCredit?.label || '展示素材來源 ↗';
  section.append(choices, note, video, fallback, credit);
  select(0);
}

export function renderProjectGallery(items) {
  let section = document.querySelector('#project-gallery');
  if (!section) {
    section = document.createElement('section');
    section.id = 'project-gallery';
    section.setAttribute('aria-label', '專案介面截圖');
    document.querySelector('#project-media').after(section);
  }
  section.replaceChildren();
  section.hidden = !items.length;
  if (!items.length) return;
  const heading = document.createElement('h3');
  heading.textContent = 'Dashboard / 介面展示';
  const choices = document.createElement('div');
  choices.className = 'media-choices gallery-choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', '選擇介面截圖');
  const note = document.createElement('p');
  note.id = 'gallery-note';
  note.setAttribute('aria-live', 'polite');
  const link = document.createElement('a');
  link.className = 'gallery-fullsize';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const img = document.createElement('img');
  img.id = 'gallery-image';
  img.decoding = 'async';
  img.setAttribute('aria-describedby', note.id);
  const hint = document.createElement('span');
  hint.textContent = '開啟原尺寸截圖 ↗';
  link.append(img, hint);
  function select(index) {
    const item = items[index];
    img.src = item.image;
    img.alt = item.alt;
    link.href = item.image;
    note.textContent = item.note;
    [...choices.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.title;
    button.addEventListener('click', () => select(index));
    choices.append(button);
  });
  section.append(heading, choices, note, link);
  select(0);
}

preference.addEventListener('change', stopPreviews);
document.addEventListener('dialogchange', stopPreviews);
document.addEventListener('visibilitychange', () => {
  stopPreviews();
  if (document.hidden) detailVideo?.pause();
});
new MutationObserver(() => {
  if (document.documentElement.classList.contains('motion-paused')) stopPreviews();
}).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
