// script.js — UI glue
import { libraryOfTokens, encode, decode, splitTheString } from './tokenizer.js';

// --- cookie helpers (JSON cookie with expiry) ---
function setCookieJSON(name, value, days = 365) {
  try {
    const v = encodeURIComponent(JSON.stringify(value));
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${v}; path=/; expires=${expires}; SameSite=Lax`;
  } catch (e) { console.error(e); }
}

function getCookieJSON(name) {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(';').map(c=>c.trim());
  const found = cookies.find(c=>c.startsWith(nameEQ));
  if(!found) return null;
  try {
    const val = decodeURIComponent(found.substring(nameEQ.length));
    return JSON.parse(val);
  } catch(e){ console.error(e); return null; }
}

function deleteCookie(name){
  document.cookie = name + '=; Max-Age=0; path=/';
}

// --- DOM helpers & refs ---
const $id = (id) => document.getElementById(id);
const inputText = $id('inputText');
const encodedOutput = $id('encodedOutput');
const decodedOutput = $id('decodedOutput');
const libraryOutput = $id('libraryOutput');
const pasteBtn = $id('pasteBtn');
const clearBtn = $id('clearBtn');
const copyEncodedBtn = $id('copyEncodedBtn');
const copyDecodedBtn = $id('copyDecodedBtn');
const copyTokensBtn = $id('copyTokensBtn');
const indexInput = $id('indexInput');
const getDecodedBtn = $id('getDecodedBtn');
const indexDecoded = $id('indexDecoded');
const resetAll = $id('resetAll');
const themeToggle = $id('themeToggle');

// sanity check
if(!inputText || !encodedOutput || !decodedOutput || !libraryOutput){
  console.warn('Some UI elements are missing. Ensure script.js runs after DOM is ready.');
}

// --- constants ---
const THEME_COOKIE = '__tv_theme';
const TOKEN_COOKIE = '__tv_tokens';

// --- theme ---
function applyTheme(theme){
  if(theme === 'dark') {
    document.documentElement.setAttribute('data-theme','dark');
    if (themeToggle) themeToggle.textContent = '🌙';
  }
  else {
    document.documentElement.removeAttribute('data-theme');
    if (themeToggle) themeToggle.textContent = '☀️';
  }
}

let savedTheme = getCookieJSON(THEME_COOKIE);
if(!savedTheme){
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  savedTheme = prefersDark ? 'dark' : 'light';
  setCookieJSON(THEME_COOKIE, savedTheme);
}
applyTheme(savedTheme);

themeToggle && themeToggle.addEventListener('click', ()=>{
  const current = getCookieJSON(THEME_COOKIE) || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  setCookieJSON(THEME_COOKIE, next);
  applyTheme(next);
  flash(`Theme: ${next}`);
});

// --- restore tokens from cookie if available ---
(function restoreTokens(){
  const saved = getCookieJSON(TOKEN_COOKIE);
  if(Array.isArray(saved) && saved.length){
    // mutate the exported array (do not reassign binding)
    libraryOfTokens.splice(0, libraryOfTokens.length, ...saved);
  }
})();

// --- UI helpers ---
function updateAllDisplays(){
  const text = inputText && inputText.value ? inputText.value.trim() : '';
  const encoded = text ? splitTheString(text) : [];
  const decoded = encoded.map(item => (typeof item === 'number' ? decode(item) : decode(item)));

  if(encodedOutput) encodedOutput.textContent = JSON.stringify(encoded, null, 2);
  if(decodedOutput) decodedOutput.textContent = JSON.stringify(decoded, null, 2);
  // libraryOutput is not shown in UI, so skip updating it

  // persist library to cookie whenever it changes
  setCookieJSON(TOKEN_COOKIE, libraryOfTokens);
}

// initial render
updateAllDisplays();

// --- events ---
inputText && inputText.addEventListener('input', ()=>{
  updateAllDisplays();
});

pasteBtn && pasteBtn.addEventListener('click', async ()=>{
  if(navigator.clipboard && navigator.clipboard.readText){
    try{
      const t = await navigator.clipboard.readText();
      inputText.value = t;
      updateAllDisplays();
      flash('Pasted from clipboard');
    }catch(e){
      alert('Clipboard permission denied or not available.');
    }
  } else {
    const fallback = prompt('Paste your text here:');
    if(fallback !== null){ inputText.value = fallback; updateAllDisplays(); flash('Pasted (fallback)'); }
  }
});

clearBtn && clearBtn.addEventListener('click', ()=>{
  inputText.value = '';
  updateAllDisplays();
  flash('Cleared input');
});

// copy helpers
async function safeClipboardWrite(text, successMsg){
  try{
    await navigator.clipboard.writeText(text);
    flash(successMsg);
  }catch(e){
    fallbackCopy(text);
  }
}

copyDecodedBtn && copyDecodedBtn.addEventListener('click', () => {
  if (decodedOutput) safeClipboardWrite(decodedOutput.textContent, 'Copied decoded');
});

copyEncodedBtn && copyEncodedBtn.addEventListener('click', () => {
  if (encodedOutput) safeClipboardWrite(encodedOutput.textContent, 'Copied encoded');
});

copyTokensBtn && copyTokensBtn.addEventListener('click', () => {
  // libraryOutput is not shown in UI, so do nothing or remove this handler
});

// index lookup
getDecodedBtn && getDecodedBtn.addEventListener('click', () => {
  const idx = parseInt(indexInput.value, 10);
  if (!isNaN(idx) && idx >= 0 && idx < libraryOfTokens.length) {
    indexDecoded.textContent = JSON.stringify(decode(idx), null, 2);
    flash(`Decoded index ${idx}`);
  } else {
    indexDecoded.textContent = '"<UKN>"';
    flash('"<UKN>"');
  }
});

// reset tokens but keep theme
resetAll && resetAll.addEventListener('click', () => {
  libraryOfTokens.splice(0, libraryOfTokens.length);
  deleteCookie(TOKEN_COOKIE);
  updateAllDisplays();
  flash('All tokens cleared');
});

// --- clipboard fallback ---
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.top = '-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    flash('Copied (fallback)');
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(ta);
}

// --- toast helper ---
function flash(msg) {
  let toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '1rem';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = 'var(--toast-bg, #333)';
  toast.style.color = 'var(--toast-color, #fff)';
  toast.style.padding = '0.5rem 1rem';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  toast.style.zIndex = 9999;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 1200);
}
