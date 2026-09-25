import { profile, projects } from './content.js';
import { setupCinema } from './cinema.js';
import { attachPreview, clearPreviews, renderProjectMedia, renderProjectGallery, stopProjectMedia } from './project-media.js';

const $ = (selector) => document.querySelector(selector);
const create = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

function safeURL(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const url = new URL(value, location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function addLink(container, label, value) {
  const href = safeURL(value);
  if (!href) return false;
  const link = create('a', '', `${label} ↗`);
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  container.append(link);
  return true;
}

function makeArt(project) {
  const art = create('div', `project-art ${project.visual}`);
  art.setAttribute('aria-hidden', 'true');
  art.append(create('span', 'art-number', project.number));
  if (safeURL(project.image)) {
    const img = create('img');
    img.src = safeURL(project.image);
    img.alt = project.imageAlt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    art.append(img);
  } else if (project.visual === 'office') {
    const terminal = create('div', 'mini-terminal');
    terminal.append(create('span', '', project.terminalLabel || '> authorize(intent)'), create('i'), create('i'), create('i'));
    art.append(terminal);
  } else if (project.visual === 'gallery') {
    art.append(create('div', 'mini-door'));
  } else {
    const paper = create('div', 'mini-paper');
    paper.append(create('b', '', project.paperTitle || 'Field notes.'), create('i'), create('i'), create('i'));
    art.append(paper);
  }
  art.append(create('span', 'art-category', project.artLabel || (project.category === 'ukiyoe' ? 'COLLECTION ARTWORK / 原畫封面' : project.category.toUpperCase())));
  return art;
}

function renderProjects(filter = 'all') {
  clearPreviews();
  const selected = projects.filter((project) => filter === 'all' || project.category === filter);
  $('#project-grid').replaceChildren(...selected.map((project) => {
    const card = create('button', 'project-card');
    card.type = 'button';
    card.dataset.open = project.id;
    card.setAttribute('aria-label', `查看 ${project.subtitle}：${project.status}`);
    const meta = create('div', 'project-meta');
    meta.append(create('span', '', project.subtitle), create('b', '', '↗'));
    const tags = create('div', 'project-tags');
    tags.append(...project.tags.map((tag) => create('span', '', tag)));
    card.append(makeArt(project), meta, create('h3', '', project.title), create('p', '', project.description), tags, create('span', 'card-status', project.status));
    if (safeURL(project.preview)) attachPreview(card, safeURL(project.preview));
    return card;
  }));
  $('#work-count').textContent = `${String(selected.length).padStart(2, '0')} WORKS`;
}

const dialog = $('#project-dialog');
let previousFocus;
function openProject(id) {
  const project = projects.find((item) => item.id === id);
  if (!project) return;
  previousFocus = document.activeElement;
  $('#dialog-kicker').textContent = `EXHIBIT ${project.number} / ${project.category.toUpperCase()}`;
  $('#dialog-title').textContent = project.subtitle;
  $('#dialog-status').textContent = project.status;
  const preview = $('#dialog-image');
  preview.hidden = !safeURL(project.image);
  if (!preview.hidden) {
    preview.src = safeURL(project.image);
    preview.alt = project.imageAlt || '';
  } else preview.removeAttribute('src');
  renderProjectMedia(project.media || [], project.mediaCredit);
  renderProjectGallery(project.gallery || []);
  $('#dialog-question').textContent = project.question;
  $('#dialog-approach').textContent = project.approach;
  $('#dialog-evidence').textContent = project.evidence;
  $('#dialog-decisions').replaceChildren(...project.decisions.map((decision) => create('li', '', decision)));
  const links = $('#dialog-links');
  links.replaceChildren();
  addLink(links, project.category === 'ukiyoe' ? '開始遊玩' : '開啟 Demo', project.demo);
  addLink(links, 'Source code', project.repo);
  addLink(links, project.caseStudyLabel || (project.category === 'ukiyoe' ? '專案 README' : '閱讀 Case study'), project.caseStudy);
  for (const reference of project.references || []) addLink(links, reference.label, reference.href);
  $('#dialog-link-note').hidden = links.childElementCount > 0;
  dialog.showModal();
  document.body.classList.add('dialog-open');
  document.dispatchEvent(new Event('dialogchange'));
  $('.dialog-close').focus();
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-open]');
  if (trigger) openProject(trigger.dataset.open);
});
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  stopProjectMedia();
  document.body.classList.remove('dialog-open');
  document.dispatchEvent(new Event('dialogchange'));
  if (previousFocus?.isConnected) previousFocus.focus();
});
document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    renderProjects(button.dataset.filter);
  });
});

$('#year').textContent = new Date().getFullYear();
document.querySelectorAll('[data-profile-name]').forEach((element) => { element.textContent = profile.name; });
document.querySelectorAll('[data-profile-role]').forEach((element) => { element.textContent = profile.role; });
document.querySelectorAll('[data-resume-link]').forEach((element) => {
  const url = safeURL(profile.resume);
  if (url) element.href = url;
  else element.hidden = true;
});
document.title = `${profile.brand} — 浮世・造境`;
const contacts = $('#contact-links');
if (profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
  const email = create('a', '', 'Email ↗');
  email.href = `mailto:${encodeURIComponent(profile.email)}`;
  contacts.append(email);
}
addLink(contacts, 'GitHub', profile.github);
addLink(contacts, 'LinkedIn', profile.linkedin);
addLink(contacts, '履歷', profile.resume);
addLink(contacts, 'Cake', profile.careerProfile);
$('#contact-placeholder').hidden = contacts.childElementCount > 0;

renderProjects();
setupCinema({ films: profile.introFilms.filter((film) => safeURL(film.video) && safeURL(film.poster)) });
