import './style.css';
import './overrides.css';
import { normalizeEntries, parseBackup } from './backup';
import { clearEntries, loadEntries, saveEntries, updateEntries } from './db';
import { sampleEntries } from './sample';
import type { DataFile, Entry } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const KDF_ITERATIONS = 600_000;
const PRODUCT_SLUG = 'care-visit-brief';
const BILLING_BASE = 'https://api.sociobot.in/api/v1/products';
const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${PRODUCT_SLUG}`;
const COVER_NOTE_KEY = 'care-visit-brief:cover-note';
const today = () => new Date().toISOString().slice(0, 10);
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]!));
const b64 = (value: Uint8Array) => btoa(String.fromCharCode(...value));
const bytes = (value: string) => Uint8Array.from(atob(value), char => char.charCodeAt(0));
const changeChannel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('care-visit-brief:changes');

let tags = { symptoms: ['Headache', 'Fatigue', 'Nausea', 'Pain'], triggers: ['Poor sleep', 'Stress', 'Food', 'Activity'], medications: ['New dose', 'As needed', 'Missed dose'] };
let entries: Entry[] = [];
let demo = false;
let pendingRemovals: Entry[] = [];
let removalTimer: number | undefined;
let statusMessage = '';
let recoveryRaw: unknown = null;
let updateWorker: ServiceWorker | null = null;
let updateReady = false;
let reloadForUpdate = false;
let licenseMessage = '';
let demoSession = 0;
let licenseVerification: { token: string; isDemo: boolean; demoSession: number; promise: Promise<void> } | null = null;

function route() { return location.pathname.replace(/\/$/, '') || '/'; }
function queryDemo() { return route() === '/' && new URLSearchParams(location.search).get('demo') === '1'; }
function demoRoute() { return route() === '/demo' || queryDemo(); }
function viewRoute() { return demoRoute() ? '/demo' : route(); }
function isAppRoute() { return ['/', '/log', '/demo'].includes(viewRoute()); }
function namespace(isDemo = demo) { return isDemo ? 'demo' : 'real'; }
function localKey(key: string, isDemo = demo) { return isDemo ? `demo:${key}` : key; }
function licenseKey(isDemo = demo) { return localKey(LICENSE_KEY, isDemo); }
function verdictKey(isDemo = demo) { return localKey(VERDICT_KEY, isDemo); }
function coverNoteKey(isDemo = demo) { return localKey(COVER_NOTE_KEY, isDemo); }
function licenseVerdict(isDemo = demo): { valid?: boolean; checked?: number } {
  try { return JSON.parse(localStorage.getItem(verdictKey(isDemo)) || '{}') as { valid?: boolean; checked?: number }; } catch { return {}; }
}
function premium() { return licenseVerdict().valid === true; }
function clearDemoLocalState() {
  for (const key of [LICENSE_KEY, VERDICT_KEY, COVER_NOTE_KEY]) localStorage.removeItem(localKey(key, true));
}
function dateLabel(date: string) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`)); }
function sorted() { return [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)); }
function setMetadata() {
  const metadata: Record<string, { title: string; description: string; canonical: string }> = {
    '/': { title: 'Care Visit Brief — Print a clear symptom timeline', description: 'Save private symptom notes and print a concise timeline for a clinical appointment.', canonical: '/' },
    '/log': { title: 'Symptom timeline — Care Visit Brief', description: 'Save symptom notes privately and prepare a printable visit brief.', canonical: '/log' },
    '/demo': { title: 'Demo — Care Visit Brief', description: 'Try Care Visit Brief with isolated sample symptom notes.', canonical: '/?demo=1' },
    '/privacy': { title: 'Privacy — Care Visit Brief', description: 'Read how Care Visit Brief stores notes and checks optional licenses.', canonical: '/privacy' },
    '/terms': { title: 'Terms — Care Visit Brief', description: 'Read the medical disclaimer and purchase terms for Care Visit Brief.', canonical: '/terms' }
  };
  const current = metadata[viewRoute()] ?? { title: 'Page not found — Care Visit Brief', description: 'This page is not in the Care Visit Brief notebook.', canonical: '/404.html' };
  document.title = current.title;
  const set = (selector: string, attribute: string, value: string) => document.querySelector(selector)?.setAttribute(attribute, value);
  const canonical = `https://care-visit-brief.sociobot.in${current.canonical}`;
  set('meta[name="description"]', 'content', current.description);
  set('link[rel="canonical"]', 'href', canonical);
  set('meta[property="og:title"]', 'content', current.title);
  set('meta[property="og:description"]', 'content', current.description);
  set('meta[property="og:url"]', 'content', canonical);
  set('meta[name="twitter:title"]', 'content', current.title);
  set('meta[name="twitter:description"]', 'content', current.description);
}
function download(name: string, body: BlobPart, type = 'application/json') {
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([body], { type })); link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 400);
}
function announce(message: string) { statusMessage = message; const live = document.querySelector('.live'); if (live) live.textContent = message; }
function notifyChange(isDemo = demo) { changeChannel?.postMessage(namespace(isDemo)); }
function navigate(path: string) { history.pushState({}, '', path); window.scrollTo(0, 0); void render(true); }

function shell(content: string) {
  const undo = pendingRemovals.length ? `<aside class="undo-toast" role="status"><span>${pendingRemovals.length === 1 ? `Note from ${dateLabel(pendingRemovals[0].date)} removed.` : `${pendingRemovals.length} notes removed.`}</span><button class="secondary" data-action="undo-removal">Undo removals</button></aside>` : '';
  const update = updateReady ? `<div class="update-toast" role="status"><span>An update is ready.</span><button class="secondary" data-action="apply-update">Reload to update</button></div>` : '';
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="/" data-route>Care <i>Visit</i> Brief</a><nav aria-label="Primary"><a href="/log" data-route>My timeline</a><a href="/?demo=1" data-route>Demo</a><a href="/privacy" data-route>Privacy</a></nav></header>${content}<footer><p>Care Visit Brief turns daily notes into a printable visit brief.</p><p><a href="/privacy" data-route>Privacy</a> · <a href="/terms" data-route>Terms</a> · Built by Param Factory · v1.1.0</p><p class="fine">Illustration generated for this product.</p></footer>${undo}${update}<div class="live" aria-live="polite" aria-atomic="true">${escapeHtml(statusMessage)}</div>`;
}
function banner() { return demo ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span><button class="text-button" data-action="reset-demo">Reset demo</button><button class="text-button" data-action="start-real">Start my private timeline</button></span></aside>` : ''; }
function entryCard(entry: Entry) {
  const chips = (label: string, list: string[]) => list.length ? `<p class="entry-tags"><b>${label}:</b> ${list.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</p>` : '';
  return `<article class="entry-card"><div><time datetime="${entry.date}">${dateLabel(entry.date)}</time><strong class="severity s${entry.severity}">Severity ${entry.severity}/4</strong></div>${chips('Symptoms', entry.symptoms)}${chips('Possible triggers', entry.triggers)}${chips('Medicine changes', entry.medications)}${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ''}<button class="text-button delete" data-action="delete-entry" data-id="${entry.id}">Remove note</button></article>`;
}
function tagGroup(kind: keyof typeof tags, label: string) { return `<fieldset><legend>${label} <span class="optional">optional</span></legend><div class="tag-list" data-group="${kind}">${tags[kind].map(tag => `<button type="button" class="tag" data-tag="${kind}" data-value="${escapeHtml(tag)}" aria-pressed="false">${escapeHtml(tag)}</button>`).join('')}</div><label class="add-tag">Add your own <input type="text" maxlength="32" data-custom="${kind}" aria-label="Add a ${label.toLowerCase()} tag" /></label></fieldset>`; }
function restoreTools(prefix = '') { return `<label class="import-label">Restore from a backup <input id="${prefix}import-file" type="file" accept="application/json,.json" /></label><label class="restore-password">Password for an encrypted backup <input id="${prefix}restore-password" type="password" autocomplete="current-password" /></label>`; }
function logUi() {
  const log = sorted();
  const cover = premium() ? `<label>Personal cover note <span class="optional">included in your printed brief</span><textarea id="cover-note" maxlength="280" rows="2" placeholder="For example: My main question for this visit">${escapeHtml(localStorage.getItem(coverNoteKey()) || '')}</textarea></label>` : '';
  return `<section class="log-section" id="add-note" aria-labelledby="log-heading"><div class="section-label">Daily note</div><h2 id="log-heading">Record what changed</h2><p class="intro">Save a severity number, optional tags, and a short note.</p><form id="entry-form" class="entry-form"><label>Date <input required type="date" name="date" max="${today()}" value="${today()}" /></label><fieldset><legend>How hard was it today?</legend><div class="severity-picker" role="group" aria-label="Symptom severity"><button type="button" data-severity="0" aria-pressed="false">0<br><small>None</small></button><button type="button" data-severity="1" aria-pressed="false">1<br><small>Mild</small></button><button type="button" data-severity="2" aria-pressed="true" class="selected">2<br><small>Noticeable</small></button><button type="button" data-severity="3" aria-pressed="false">3<br><small>Hard</small></button><button type="button" data-severity="4" aria-pressed="false">4<br><small>Severe</small></button></div></fieldset>${tagGroup('symptoms', 'Symptoms')}${tagGroup('triggers', 'Possible triggers')}${tagGroup('medications', 'Medicine changes')}<label>What changed? <span class="optional">optional</span><textarea name="note" maxlength="280" rows="3" placeholder="A short note in your own words"></textarea></label><button class="button" type="submit">Save today’s note</button><p class="fine">This timeline does not diagnose, interpret symptoms, recommend treatment, or contact a clinician.</p></form></section><section class="timeline" aria-labelledby="timeline-heading"><div class="section-label">Your timeline</div><h2 id="timeline-heading">Saved notes</h2>${log.length ? `<p class="intro">Days without a note stay blank.</p><div class="timeline-list">${log.map(entryCard).join('')}</div>` : `<div class="empty"><p><strong>Your notes will appear here.</strong></p><p>Start with a severity number. You do not need to fill every field.</p></div>`}</section><section class="brief-tools" aria-labelledby="brief-heading"><div class="section-label">Printable visit brief</div><h2 id="brief-heading">Make a visit brief</h2><p class="intro">Choose a date range. The print view uses only your saved notes.</p><p class="fine">If the notes need more than one page, choose a shorter range.</p><div class="date-range"><label>From <input id="brief-from" type="date" max="${today()}" /></label><label>To <input id="brief-to" type="date" max="${today()}" value="${today()}" /></label></div>${cover}<div class="tool-actions"><button class="button" data-action="print">Open one-page visit brief</button><button class="secondary" data-action="csv">Export CSV</button><button class="secondary" data-action="json">Export backup</button></div><details><summary>Make an encrypted backup</summary><p>Choose a password. You need it to restore this backup later.</p><label>Backup password <input id="backup-password" type="password" autocomplete="new-password" /></label><button class="secondary" data-action="encrypted" aria-label="Download encrypted backup">Download encrypted backup</button></details>${restoreTools()}</section>`;
}
function paid() { return `<section class="paid"><div><p class="eyebrow">One-time unlock</p><h2>Add a cover note to printed briefs</h2><p>Pay $12 USD once to add a personal cover note. Your timeline, exports, print tools, and safety information stay free.</p></div><div><a class="button" href="${BILLING_BASE}/${PRODUCT_SLUG}/checkout">Buy the $12 unlock</a><div class="license"><label for="license-token">Have a license?</label><input id="license-token" type="text" autocomplete="off" placeholder="Paste license token" /><button class="secondary" data-action="license">Restore my unlock</button></div><p id="license-status" class="fine" aria-live="polite">${escapeHtml(licenseMessage)}</p></div></section>`; }
function landing() { return `<main id="main" tabindex="-1"><section class="hero"><div class="hero-copy"><p class="eyebrow">Private symptom notes for appointments</p><h1 tabindex="-1">Turn symptom notes into a visit brief</h1><p class="lede">For people with changing symptoms, build a short timeline to print for a clinician.</p><div class="hero-actions"><a class="button" href="/?demo=1" data-route>Try it with sample data</a><span>Open a filled sample timeline. Your notes stay untouched.</span></div><ul class="facts"><li>Notes stay on this device</li><li>Works offline after your first visit</li><li>$12 USD once; the timeline stays free</li></ul></div><figure><img src="/assets/notebook-hero.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="An open ruled notebook, pencil, and blank note paper on a desk." /><figcaption>Keep only the details you may need later.</figcaption></figure></section><section class="product" aria-label="Care Visit Brief timeline">${logUi()}</section><section class="how"><div><span>1</span><h2>Mark the day</h2><p>Choose a severity number. Add only tags that matter.</p></div><div><span>2</span><h2>Leave gaps alone</h2><p>No missed-day warning appears. Blank days remain blank.</p></div><div><span>3</span><h2>Bring the visit brief</h2><p>Print a short chronology before your next visit.</p></div></section><section class="privacy-note"><h2>Notes, not medical advice</h2><p>Care Visit Brief stores notes in this browser. It does not diagnose, interpret symptoms, recommend treatment, or contact a clinician.</p><p>For urgent symptoms or immediate danger, contact local emergency services.</p></section>${paid()}</main>`; }
function samplePreview() {
  const latest = sorted()[0];
  if (!latest) return '';
  return `<section class="sample-preview" aria-labelledby="sample-preview-heading"><div><p class="section-label">Latest sample note</p><h2 id="sample-preview-heading">${dateLabel(latest.date)} · Severity ${latest.severity}/4</h2><p>${escapeHtml(latest.note)}</p></div><a class="secondary" href="#add-note">Add another note</a></section>`;
}
function appPage() { const heading = demo ? 'Review a filled sample timeline' : 'Start a private symptom timeline'; return `<main id="main" tabindex="-1" class="app-main">${banner()}<section class="app-heading"><p class="eyebrow">${demo ? 'Sample that cannot change your notes' : 'Your private timeline'}</p><h1 tabindex="-1">${heading}</h1><p>${demo ? 'Five sample notes show the printable timeline before you add anything.' : 'Save short notes between appointments, then print a visit brief.'}</p></section>${demo ? samplePreview() : ''}${logUi()}${demo ? '' : paid()}</main>`; }
function legal(kind: 'privacy' | 'terms') { const privacy = kind === 'privacy'; return `<main id="main" tabindex="-1" class="legal"><h1 tabindex="-1">${privacy ? 'Privacy for your visit notes' : 'Terms for Care Visit Brief'}</h1>${privacy ? `<h2>Your notes stay on your device</h2><p>Notes are stored in your browser’s local database. Care Visit Brief does not send them to a server or use analytics.</p><h2>Exports are your choice</h2><p>A backup downloads only when you choose it. Encrypted backups use a password in your browser.</p><h2>Optional purchase</h2><p>If you restore the optional unlock, Sociobot receives only the license token needed to check it.</p>` : `<h2>What this tool is for</h2><p>Care Visit Brief records and prints your observations. It does not provide medical advice, diagnosis, treatment recommendations, or emergency care.</p><h2>Your responsibility</h2><p>Check your visit brief before sharing it. Keep your device and backup password secure.</p><h2>Optional purchase</h2><p>The $12 USD unlock is a one-time purchase. Sociobot and Dodo are the merchant of record. A refund revokes the related license.</p>`}<p><a href="/" data-route>Return to Care Visit Brief</a></p></main>`; }
function notFound() { return `<main id="main" tabindex="-1" class="legal not-found"><p class="eyebrow">Page not found</p><h1 tabindex="-1">This page is not in the notebook</h1><p>Return to your timeline or try the sample.</p><a class="button" href="/" data-route>Return home</a></main>`; }

async function ensureDemo() { await updateEntries(true, current => current.length ? current : sampleEntries); }
async function replaceEntries(next: Entry[], isDemo = demo) { await saveEntries(isDemo, next); entries = next; notifyChange(isDemo); }
async function changeEntries(change: (current: Entry[]) => Entry[], isDemo = demo) { entries = await updateEntries(isDemo, current => change(normalizeEntries(current))); notifyChange(isDemo); return entries; }
function recovery(error: unknown) {
  setMetadata(); const detail = error instanceof Error ? error.message : 'The saved timeline could not be opened.';
  app.innerHTML = shell(`<main id="main" tabindex="-1" class="legal recovery"><p class="eyebrow">Recovery</p><h1 tabindex="-1">We could not open this timeline</h1><p>Export a recovery copy, restore a known-good backup, or remove only this unreadable timeline and start again.</p><p class="fine">${escapeHtml(detail)}</p><p><button class="secondary" data-action="export-corrupt">Download recovery copy</button></p>${restoreTools('recovery-')}<p><button class="button" data-action="clear-corrupt">Remove unreadable timeline</button></p></main>`);
  bind(); document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
}
async function render(moveFocus = false) {
  try {
    demo = demoRoute(); setMetadata(); if (demo) await ensureDemo();
    if (isAppRoute()) { const stored = await loadEntries(demo); recoveryRaw = stored; entries = normalizeEntries(stored); } else entries = [];
    recoveryRaw = null;
    const content = viewRoute() === '/' ? landing() : viewRoute() === '/log' || viewRoute() === '/demo' ? appPage() : viewRoute() === '/privacy' || viewRoute() === '/terms' ? legal(viewRoute().slice(1) as 'privacy' | 'terms') : notFound();
    app.innerHTML = shell(content); bind();
    if (moveFocus) { document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }); announce(`Opened ${document.title}.`); }
    const currentScope = demo;
    const storedLicense = localStorage.getItem(licenseKey(currentScope));
    if (storedLicense && (!licenseVerdict(currentScope).checked || Date.now() - Number(licenseVerdict(currentScope).checked) > 86_400_000)) void verifyLicense(storedLicense, false, currentScope);
  } catch (error) { recovery(error); }
}
function selected(kind: keyof typeof tags) { return [...document.querySelectorAll<HTMLButtonElement>(`[data-tag="${kind}"][aria-pressed="true"]`)].map(button => button.dataset.value!); }
function chosenSeverity() { return Number(document.querySelector<HTMLButtonElement>('[data-severity][aria-pressed="true"]')?.dataset.severity ?? 2); }
async function addEntry(form: HTMLFormElement) {
  const fd = new FormData(form); const date = String(fd.get('date'));
  if (date > today()) { announce('Choose today or an earlier date for a daily note.'); return; }
  const entry: Entry = { id: crypto.randomUUID(), date, severity: chosenSeverity(), symptoms: selected('symptoms'), triggers: selected('triggers'), medications: selected('medications'), note: String(fd.get('note')).trim(), createdAt: new Date().toISOString() };
  await changeEntries(current => [...current.filter(item => item.id !== entry.id), entry]); announce('Today’s note saved.'); await render();
}
function csvCell(value: string | number) { const text = String(value); return `"${(/^\s*[=+\-@]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`; }
function csv() { const header = ['Date', 'Severity', 'Symptoms', 'Triggers', 'Medicine changes', 'Note']; download('care-visit-brief.csv', [header.map(csvCell).join(','), ...sorted().map(entry => [entry.date, entry.severity, entry.symptoms.join('; '), entry.triggers.join('; '), entry.medications.join('; '), entry.note].map(csvCell).join(','))].join('\n'), 'text/csv'); announce('CSV downloaded.'); }
function backupData(): DataFile { return { version: 1, exportedAt: new Date().toISOString(), entries }; }
function json() { download('care-visit-brief-backup.json', JSON.stringify(backupData(), null, 2)); announce('Backup downloaded.'); }
async function encrypted() {
  const input = document.querySelector<HTMLInputElement>('#backup-password')!;
  if (input.value.length < 12) { announce('Use a backup password with at least 12 characters.'); input.focus(); return; }
  const salt = crypto.getRandomValues(new Uint8Array(16)); const iv = crypto.getRandomValues(new Uint8Array(12)); const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(input.value), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: KDF_ITERATIONS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(backupData())));
  download('care-visit-brief-encrypted.json', JSON.stringify({ version: 1, encrypted: 'AES-GCM', kdf: 'PBKDF2-SHA-256', iterations: KDF_ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(new Uint8Array(cipher)) })); input.value = ''; announce('Encrypted backup downloaded. Keep its password somewhere safe.');
}
async function decryptBackup(value: unknown, password: string): Promise<DataFile> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('This is not a Care Visit Brief backup.');
  const file = value as Record<string, unknown>;
  // Keep the 10,000-iteration files made by the prior release recoverable,
  // while every new file uses the stronger current cost.
  const iterations = typeof file.iterations === 'number' && (file.iterations === KDF_ITERATIONS || file.iterations === 10_000) ? file.iterations : null;
  if (file.version !== 1 || file.encrypted !== 'AES-GCM' || file.kdf !== 'PBKDF2-SHA-256' || !iterations || typeof file.salt !== 'string' || typeof file.iv !== 'string' || typeof file.data !== 'string') throw new Error('This encrypted backup is not supported.');
  if (!password) throw new Error('Enter the password for this encrypted backup.');
  try {
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(file.salt), iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(file.iv) }, key, bytes(file.data));
    return parseBackup(JSON.parse(new TextDecoder().decode(plain)));
  } catch { throw new Error('The password did not open this encrypted backup. Check it and try again.'); }
}
function printBrief() {
  const from = document.querySelector<HTMLInputElement>('#brief-from')?.value || '0000-01-01'; const to = document.querySelector<HTMLInputElement>('#brief-to')?.value || today(); const list = sorted().filter(entry => entry.date >= from && entry.date <= to);
  if (!list.length) { announce('No saved notes fall in that date range. Choose another range.'); return; }
  const coverNote = premium() ? localStorage.getItem(coverNoteKey())?.trim() : '';
  const printUnits = list.reduce((sum, entry) => sum + 105 + entry.note.length + [...entry.symptoms, ...entry.triggers, ...entry.medications].join('').length, coverNote?.length ?? 0);
  if (list.length > 7 || printUnits > 1_400) { announce(`${list.length} saved notes need more than one page. Choose a shorter date range.`); document.querySelector<HTMLInputElement>('#brief-from')?.focus(); return; }
  const rows = list.reverse().map(entry => `<tr><th scope="row"><time datetime="${entry.date}">${dateLabel(entry.date)}</time><strong>Severity ${entry.severity}/4</strong></th><td><p><b>Symptoms:</b> ${escapeHtml(entry.symptoms.join(', ') || '—')} · <b>Possible triggers:</b> ${escapeHtml(entry.triggers.join(', ') || '—')} · <b>Medicine changes:</b> ${escapeHtml(entry.medications.join(', ') || '—')}</p>${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ''}</td></tr>`).join('');
  const cover = coverNote ? `<aside><h2>Personal cover note</h2><p>${escapeHtml(coverNote)}</p></aside>` : '';
  // Chromium returns null for an about:blank popup opened with noopener, so it
  // produced a blank printable tab even though the popup was allowed.
  const win = window.open('', '_blank', 'popup,width=760,height=900');
  if (!win) { announce('Your browser blocked the print window. Allow pop-ups and try again.'); return; }
  win.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visit brief — Care Visit Brief</title><style>@page{size:A4;margin:10mm}*{box-sizing:border-box}body{font:11px/1.3 Arial,sans-serif;color:#17222e;margin:0;background:#f7f1e5}.sheet{width:190mm;min-height:277mm;margin:0 auto;background:white;padding:8mm}header{display:flex;justify-content:space-between;gap:8mm;border-bottom:2px solid #9b3f35;padding-bottom:3mm}h1{font:26px/1 Georgia,serif;margin:0}header p{max-width:105mm;margin:0}aside{border-left:3px solid #9b3f35;padding:2mm 3mm;margin:3mm 0}h2{font:700 13px/1.2 Georgia,serif;margin:0 0 1mm}p{margin:0 0 1mm}table{width:100%;border-collapse:collapse;margin-top:3mm;table-layout:fixed}th,td{vertical-align:top;text-align:left;border-top:1px solid #9caab4;padding:2.2mm 1.5mm}th{width:39mm}th strong{display:block;margin-top:1mm;color:#9b3f35}footer{border-top:1px solid #9caab4;margin-top:3mm;padding-top:2mm;font-size:9px}button{min-height:44px;margin:8px;padding:8px 14px}@media print{body{background:white}.sheet{padding:0;width:auto;min-height:auto}button{display:none}}</style></head><body><button onclick="window.print()">Print this brief</button><main class="sheet"><header><h1>Care Visit Brief</h1><p>${from === '0000-01-01' ? 'All saved notes' : dateLabel(from)} to ${to === today() ? 'today' : dateLabel(to)}. Personal observations only; not medical advice.</p></header>${cover}<table aria-label="Saved symptom notes"><tbody>${rows}</tbody></table><footer>${list.length} saved ${list.length === 1 ? 'note' : 'notes'} in this date range.</footer></main></body></html>`); win.document.close();
  announce('One-page visit brief opened.');
}
async function checkLicense(value: string, isDemo: boolean, currentDemoSession: number) {
  licenseMessage = 'Checking license…';
  try {
    const response = await fetch(`${BILLING_BASE}/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(value)}`);
    if (!response.ok) throw new Error('License verification was unavailable.');
    const result = await response.json() as { valid?: boolean; reason?: string; expires_at?: string | null };
    if (typeof result.valid !== 'boolean') throw new Error('License verification returned an invalid response.');
    if (isDemo !== demo || (isDemo && currentDemoSession !== demoSession)) return;
    localStorage.setItem(verdictKey(isDemo), JSON.stringify({ ...result, checked: Date.now() }));
    licenseMessage = result.valid ? 'License active.' : 'License is no longer active. You can buy a new unlock.';
  } catch {
    if (isDemo !== demo || (isDemo && currentDemoSession !== demoSession)) return;
    const prior = licenseVerdict(isDemo);
    localStorage.setItem(verdictKey(isDemo), JSON.stringify({ ...prior, checked: Date.now() }));
    licenseMessage = prior.valid ? 'Could not check the license now. Your saved unlock stays available until it can be checked.' : 'Could not check the license now. Try again when you are online.';
  }
  await render();
}
async function verifyLicense(token?: string, announceResult = true, isDemo = demo) {
  const value = token || document.querySelector<HTMLInputElement>('#license-token')?.value.trim() || localStorage.getItem(licenseKey(isDemo));
  if (!value) { if (announceResult) announce('Paste a license token first.'); return; }
  localStorage.setItem(licenseKey(isDemo), value);
  const currentDemoSession = demoSession;
  if (!licenseVerification || licenseVerification.token !== value || licenseVerification.isDemo !== isDemo || licenseVerification.demoSession !== currentDemoSession) {
    const promise = checkLicense(value, isDemo, currentDemoSession);
    licenseVerification = { token: value, isDemo, demoSession: currentDemoSession, promise };
    void promise.finally(() => {
      if (licenseVerification?.promise === promise) licenseVerification = null;
    });
  }
  await licenseVerification.promise;
  if (announceResult && isDemo === demo) announce(licenseMessage);
}
async function importFile(file: File, recovery = false) {
  try {
    const parsed: unknown = JSON.parse(await file.text()); const password = document.querySelector<HTMLInputElement>(recovery ? '#recovery-restore-password' : '#restore-password')?.value ?? '';
    const data = parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed as Record<string, unknown>).encrypted ? await decryptBackup(parsed, password) : parseBackup(parsed);
    await replaceEntries(data.entries, demo); announce('Backup restored.'); await render();
  } catch (error) { announce(error instanceof Error ? `${error.message} Your existing timeline was not changed.` : 'This backup could not be restored. Your existing timeline was not changed.'); }
}
async function removeEntry(id: string) {
  const removed = entries.find(entry => entry.id === id); if (!removed) return;
  await changeEntries(current => current.filter(entry => entry.id !== id)); pendingRemovals = [...pendingRemovals.filter(entry => entry.id !== id), removed];
  if (removalTimer) window.clearTimeout(removalTimer); removalTimer = window.setTimeout(() => { pendingRemovals = []; void render(); }, 10_000);
  announce('Note removed. You can undo these removals for 10 seconds.'); await render();
}
async function undoRemovals() {
  const restoring = pendingRemovals; if (!restoring.length) return;
  await changeEntries(current => { const ids = new Set(current.map(entry => entry.id)); return [...current, ...restoring.filter(entry => !ids.has(entry.id))]; });
  pendingRemovals = []; if (removalTimer) window.clearTimeout(removalTimer); announce('Removed notes restored.'); await render();
}
function toggleTag(button: HTMLButtonElement) { const active = button.getAttribute('aria-pressed') === 'true'; button.setAttribute('aria-pressed', String(!active)); button.classList.toggle('selected', !active); }
function addCustomTag(input: HTMLInputElement) {
  const value = input.value.trim(); const kind = input.dataset.custom as keyof typeof tags; if (!value || tags[kind].includes(value)) return;
  tags[kind].push(value); input.value = ''; const host = document.querySelector(`[data-group="${kind}"]`)!;
  host.insertAdjacentHTML('beforeend', `<button type="button" class="tag selected" data-tag="${kind}" data-value="${escapeHtml(value)}" aria-pressed="true">${escapeHtml(value)}</button>`); (host.lastElementChild as HTMLButtonElement).addEventListener('click', event => toggleTag(event.currentTarget as HTMLButtonElement));
}
function applyUpdate() { if (updateWorker) { reloadForUpdate = true; updateWorker.postMessage({ type: 'SKIP_WAITING' }); } }
function bind() {
  document.querySelectorAll<HTMLAnchorElement>('[data-route]').forEach(anchor => anchor.addEventListener('click', event => { event.preventDefault(); navigate(anchor.getAttribute('href')!); }));
  document.querySelector('#entry-form')?.addEventListener('submit', event => { event.preventDefault(); void addEntry(event.currentTarget as HTMLFormElement); });
  document.querySelectorAll<HTMLButtonElement>('[data-severity]').forEach(button => button.addEventListener('click', () => document.querySelectorAll<HTMLButtonElement>('[data-severity]').forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', String(item === button)); })));
  document.querySelectorAll<HTMLButtonElement>('[data-tag]').forEach(button => button.addEventListener('click', () => toggleTag(button)));
  document.querySelectorAll<HTMLInputElement>('[data-custom]').forEach(input => input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addCustomTag(input); } }));
  document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'csv') csv(); if (action === 'json') json(); if (action === 'encrypted') void encrypted(); if (action === 'print') printBrief(); if (action === 'delete-entry') void removeEntry(button.dataset.id!); if (action === 'undo-removal') void undoRemovals();
    if (action === 'reset-demo') void (async () => { await clearEntries(true); await ensureDemo(); notifyChange(true); announce('Demo reset.'); await render(); })();
    if (action === 'start-real') void (async () => { demoSession += 1; clearDemoLocalState(); await clearEntries(true); notifyChange(true); navigate('/log'); })();
    if (action === 'license') void verifyLicense();
    if (action === 'export-corrupt') download('care-visit-brief-recovery-copy.json', JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), entries: recoveryRaw }, null, 2));
    if (action === 'clear-corrupt' && confirm('Remove the unreadable local timeline? Download a recovery copy first if you may need it.')) void (async () => { await clearEntries(demo); recoveryRaw = null; notifyChange(); announce('Unreadable timeline removed. You can start a new note.'); await render(true); })();
    if (action === 'apply-update') applyUpdate();
  }));
  document.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', event => { const file = (event.target as HTMLInputElement).files?.[0]; if (file) void importFile(file); });
  document.querySelector<HTMLInputElement>('#recovery-import-file')?.addEventListener('change', event => { const file = (event.target as HTMLInputElement).files?.[0]; if (file) void importFile(file, true); });
  document.querySelector<HTMLTextAreaElement>('#cover-note')?.addEventListener('input', event => localStorage.setItem(coverNoteKey(), (event.currentTarget as HTMLTextAreaElement).value));
  const query = new URLSearchParams(location.search); const returnedLicense = query.get('license');
  if (returnedLicense) {
    query.delete('license'); history.replaceState({}, '', `${location.pathname}${query.size ? `?${query}` : ''}${location.hash}`);
    void verifyLicense(returnedLicense);
  }
}
function showUpdate(worker: ServiceWorker) { updateWorker = worker; updateReady = true; const toast = document.querySelector<HTMLElement>('.update-toast'); if (toast) { toast.hidden = false; } else void render(); }
function registerServiceWorker() {
  navigator.serviceWorker.register('/sw.js').then(registration => {
    if (registration.waiting) showUpdate(registration.waiting);
    registration.addEventListener('updatefound', () => { const installing = registration.installing; if (installing) installing.addEventListener('statechange', () => { if (installing.state === 'installed' && navigator.serviceWorker.controller) showUpdate(installing); }); });
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloadForUpdate) window.location.reload(); });
  }).catch(() => undefined);
}

changeChannel?.addEventListener('message', event => { if (event.data === namespace()) void render(); });
window.addEventListener('popstate', () => void render(true));
if ('serviceWorker' in navigator) window.addEventListener('load', registerServiceWorker);
void render();
