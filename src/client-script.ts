/**
 * Browser island. Served from /app.js as a module, so no inline script and the
 * CSP stays strict. Vanilla — the charts are already server-rendered SVG, this
 * only adds the assistant and progressive niceties.
 */

export const CLIENT_JS = String.raw`
const $ = (s, r) => (r || document).querySelector(s);

/* ---------------- assistant ---------------- */
const fab   = $('#ask-fab');
const panel = $('#ask');
const log   = $('#ask-log');
const form  = $('#ask-form');
const input = $('#ask-in');
const send  = $('#ask-send');
const mic   = $('#ask-mic');
const chips = $('#ask-chips');
const speakToggle = $('#ask-speak');

let history = [];
let busy = false;
let speak = false;

function open() {
  panel.hidden = false;
  fab.hidden = true;
  setTimeout(() => input && input.focus(), 60);
}
function close() {
  panel.hidden = true;
  fab.hidden = false;
  fab.focus();
}
fab && fab.addEventListener('click', open);
$('#ask-x') && $('#ask-x').addEventListener('click', close);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panel && !panel.hidden) close();
});

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function addMsg(role, text) {
  const el = document.createElement('div');
  el.className = 'msg msg--' + (role === 'user' ? 'u' : role === 'system' ? 'sys' : 'a');
  if (role === 'assistant') {
    el.innerHTML = String(text).split(/\n\n+/).map((p) => '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>').join('');
  } else {
    el.textContent = text;
  }
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function crisisBanner() {
  if ($('#crisis')) return;
  const d = document.createElement('div');
  d.id = 'crisis';
  d.className = 'crisis';
  d.innerHTML = '<b>If this is urgent</b>In the United States you can call or text <strong>988</strong> to reach the Suicide and Crisis Lifeline, any time. This site explains a funding rule and cannot arrange care.';
  panel.insertBefore(d, form);
}

const CRISIS_RE = /\b(suicid|kill myself|end my life|hurt myself|self.?harm|want to die|overdose|crisis right now|emergency)\b/i;

async function ask(question) {
  if (busy || !question.trim()) return;
  busy = true;
  send.disabled = true;
  input.value = '';
  input.style.height = 'auto';
  if (chips) chips.hidden = true;

  addMsg('user', question);
  if (CRISIS_RE.test(question)) crisisBanner();

  const holder = addMsg('assistant', '');
  holder.innerHTML = '<span class="dots"><span></span><span></span><span></span></span>';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question, history: history.slice(-6) }),
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(detail && detail.error ? detail.error : 'request failed with status ' + res.status);
    }

    // stream
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let acc = '';
    let buf = '';
    holder.innerHTML = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const ln of lines) {
        if (!ln.startsWith('data:')) continue;
        const payload = ln.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const j = JSON.parse(payload);
          const delta = (j.choices && j.choices[0] && j.choices[0].delta) || {};
          // Use || not ?? — the stream sends response:"" alongside real
          // delta.content on the first frames, and ?? would pick the empty
          // string and drop the text. Reasoning-model 'reasoning' fields are
          // deliberately ignored: never render a model's scratchpad as answer.
          const piece =
            (typeof j.response === 'string' && j.response) ||
            (typeof delta.content === 'string' && delta.content) ||
            '';
          if (piece) {
            acc += piece;
            holder.innerHTML = acc.split(/\n\n+/).map((p) => '<p>' + esc(p).replace(/\n/g,'<br>') + '</p>').join('');
            log.scrollTop = log.scrollHeight;
          }
        } catch (_) { /* partial frame, wait for more */ }
      }
    }

    if (!acc) {
      holder.innerHTML = '<p>I could not produce an answer just then. Try rephrasing, or email <a href="mailto:hello@16bedlimit.com">hello@16bedlimit.com</a>.</p>';
    } else {
      history.push({ role: 'user', content: question });
      history.push({ role: 'assistant', content: acc });
      if (speak) say(acc);
    }
  } catch (err) {
    holder.innerHTML = '<p>Something went wrong reaching the assistant: ' + esc(err.message) + '</p>';
  } finally {
    busy = false;
    send.disabled = false;
    input.focus();
  }
}

form && form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
input && input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input.value); }
});
input && input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 110) + 'px';
});
chips && chips.addEventListener('click', (e) => {
  const b = e.target.closest('.chip');
  if (b) { open(); ask(b.textContent); }
});

/* ---------------- text to speech ---------------- */
let audio = null;
speakToggle && speakToggle.addEventListener('click', () => {
  speak = !speak;
  speakToggle.setAttribute('aria-pressed', String(speak));
  speakToggle.textContent = speak ? 'Voice on' : 'Voice off';
  if (!speak && audio) { audio.pause(); audio = null; }
});

async function say(text) {
  try {
    if (audio) { audio.pause(); audio = null; }
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 1800) }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    audio = new Audio(URL.createObjectURL(blob));
    audio.play().catch(() => {});
  } catch (_) { /* speech is a nicety, never block the answer */ }
}

/* ---------------- speech to text ---------------- */
let rec = null;
let chunks = [];

if (mic) {
  const supported = typeof MediaRecorder !== 'undefined' &&
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
  if (!supported) mic.hidden = true;
}

mic && mic.addEventListener('click', async () => {
  if (rec && rec.state === 'recording') { rec.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
    rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      mic.classList.remove('is-rec');
      mic.setAttribute('aria-label', 'Ask by voice');
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      if (blob.size < 900) { addMsg('system', 'That recording was too short to hear.'); return; }
      addMsg('system', 'Transcribing…');
      try {
        const res = await fetch('/api/stt', {
          method: 'POST',
          headers: { 'content-type': blob.type || 'application/octet-stream' },
          body: blob,
        });
        const j = await res.json();
        log.lastElementChild.remove();
        if (j.text && j.text.trim()) {
          speak = true;
          if (speakToggle) { speakToggle.setAttribute('aria-pressed','true'); speakToggle.textContent = 'Voice on'; }
          ask(j.text.trim());
        } else {
          addMsg('system', j.error ? 'Could not transcribe: ' + j.error : 'I could not make out any words.');
        }
      } catch (err) {
        log.lastElementChild.remove();
        addMsg('system', 'Transcription failed: ' + err.message);
      }
    };
    rec.start();
    mic.classList.add('is-rec');
    mic.setAttribute('aria-label', 'Stop recording');
  } catch (err) {
    addMsg('system', 'Microphone unavailable. You can type instead.');
    mic.hidden = true;
  }
});

/* ---------------- top-of-page question buttons ---------------- */
/* These open the assistant and ask immediately, rather than scrolling the
   reader to a box they then have to think of a question for. The full sentence
   lives in data-ask because the button label is too terse to be a good prompt. */
document.addEventListener('click', (e) => {
  const b = e.target && e.target.closest ? e.target.closest('.cta__q') : null;
  if (!b) return;
  const q = b.getAttribute('data-ask');
  if (!q) return;
  open();
  ask(q);
});

/* ---------------- copy a draft message ---------------- */
/* The targets are web forms, not mailboxes, so the useful action is "put this
   on the clipboard" rather than a mailto: that would go nowhere. */
document.addEventListener('click', async (e) => {
  const btn = e.target && e.target.closest ? e.target.closest('.btn--copy') : null;
  if (!btn) return;
  const src = document.getElementById(btn.getAttribute('data-copy'));
  if (!src) return;
  const subject = btn.getAttribute('data-subject') || '';
  const text = (subject ? subject + '\n\n' : '') + src.textContent;
  const done = (msg) => {
    const was = btn.textContent;
    btn.textContent = msg;
    btn.classList.add('is-done');
    setTimeout(() => { btn.textContent = was; btn.classList.remove('is-done'); }, 2200);
  };
  try {
    await navigator.clipboard.writeText(text);
    done('Copied — now open a form below');
  } catch (_) {
    /* Clipboard API needs a secure context and permission. Selecting the text
       is the honest fallback: the person can still hit Cmd-C. */
    const r = document.createRange();
    r.selectNodeContents(src);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    done('Selected — press Cmd/Ctrl+C');
  }
});

/* ---------------- deep link ---------------- */
if (location.hash === '#ask') open();
`;
