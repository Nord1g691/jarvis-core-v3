/* JARVIS Core V3 — visible text command bar + conversation behavior stabilizer */
(async () => {
  await customElements.whenDefined('jarvis-core-hud');
  const C = customElements.get('jarvis-core-hud');
  if (!C) return;

  const addBar = (host) => {
    const root = host?.shadowRoot;
    if (!root) return;
    const app = root.querySelector('.app');
    const core = root.querySelector('.core');
    const grid = root.querySelector('.grid');
    if (!app || !core || !grid) return;

    if (!root.getElementById('jarvisTextBarStyle')) {
      const style = document.createElement('style');
      style.id = 'jarvisTextBarStyle';
      style.textContent = `
        #jarvisTextBar{width:100%;max-width:950px;margin:14px auto 0;display:flex;align-items:center;gap:8px;padding:0;box-sizing:border-box;position:relative;z-index:20}
        #jarvisTextBar input{flex:1;min-width:0;height:42px;padding:0 14px;border:1px solid #00eaff77;border-radius:8px;background:#031322;color:#dffaff;outline:none;font-size:14px;box-sizing:border-box}
        #jarvisTextBar input::placeholder{color:#79bfd8}
        #jarvisTextBar button{width:auto;min-width:92px;height:42px;margin:0;border:1px solid #00eaff88;border-radius:8px;background:#006b9433;color:#00eaff;font-weight:bold;font-size:10px;letter-spacing:1px;box-sizing:border-box}
        #jarvisTextBar input:focus{box-shadow:0 0 12px #00eaff22;border-color:#00eaffcc}
        #jarvisStatusBar{width:100%;max-width:950px;min-height:30px;margin:8px auto 0;display:flex;align-items:center;justify-content:center;box-sizing:border-box;color:#00eaff;font:700 11px/1.2 Arial,sans-serif;letter-spacing:3px;text-shadow:0 0 10px currentColor;transition:color .25s,text-shadow .25s}
        @media(max-width:650px){#jarvisTextBar{gap:6px}#jarvisTextBar input{font-size:13px}#jarvisTextBar button{min-width:78px}#jarvisStatusBar{font-size:10px;letter-spacing:2px}}
      `;
      root.appendChild(style);
    }

    // The command bar belongs at the bottom of the HUD, after the cards.
    if (!root.getElementById('jarvisTextBar')) {
      const bar = document.createElement('div');
      bar.id = 'jarvisTextBar';
      bar.innerHTML = '<input id="jarvisTextInput" type="text" autocomplete="off" placeholder="Écrire une commande à JARVIS…"><button id="jarvisTextSend" type="button">ENVOYER</button>';
      app.appendChild(bar);

      const input = bar.querySelector('#jarvisTextInput');
      const send = bar.querySelector('#jarvisTextSend');
      const submit = () => {
        const text = input.value.trim();
        if (!text) return;
        host.dispatchEvent(new CustomEvent('jarvis-text-command', {detail:{text}, bubbles:true, composed:true}));
        if (typeof host.process === 'function') host.process(text);
        input.value = '';
        input.focus();
      };
      send.addEventListener('click', submit);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    }

    if (!root.getElementById('jarvisStatusBar')) {
      const status = document.createElement('div');
      status.id = 'jarvisStatusBar';
      status.textContent = 'JARVIS · OPÉRATIONNEL';
      app.appendChild(status);
    }
  };

  // One spoken interaction at a time: do not automatically reopen a new 10 s
  // listening window after JARVIS has answered. A new listen starts only from
  // the user's explicit Listen/glow action.
  if (!C.prototype.__jarvisConversationStabilizer) {
    C.prototype.__jarvisConversationStabilizer = true;
    const originalToggle = C.prototype.toggleConversation;
    const originalStart = C.prototype.startListeningWindow;
    const originalStop = C.prototype.stopConversation;

    C.prototype.toggleConversation = function (...args) {
      const wasActive = !!this.conversationMode;
      if (!wasActive) {
        this.__jarvisSingleTurn = true;
        this.__jarvisListeningStarted = false;
      }
      return originalToggle.apply(this, args);
    };

    C.prototype.startListeningWindow = function (...args) {
      if (this.__jarvisSingleTurn && this.__jarvisListeningStarted) {
        this.__jarvisSingleTurn = false;
        return originalStop.apply(this, []);
      }
      this.__jarvisListeningStarted = true;
      return originalStart.apply(this, args);
    };

    C.prototype.stopConversation = function (...args) {
      this.__jarvisSingleTurn = false;
      this.__jarvisListeningStarted = false;
      return originalStop.apply(this, args);
    };
  }

  // Keep the state readable outside the bright core and resilient if another
  // frontend patch replaces setState later in the loading sequence.
  const ensureStateBridge = () => {
    const current = C.prototype.setState;
    if (current && current.__jarvisStateBridge) return;
    const wrapped = function (text, color) {
      current?.call(this, text, color);
      const status = this.shadowRoot?.getElementById('jarvisStatusBar');
      if (status) {
        const value = String(text || 'OPÉRATIONNEL');
        status.textContent = 'JARVIS · ' + value;
        status.style.color = color || '#00eaff';
      }
      const root = this.shadowRoot;
      const label = root?.getElementById('state');
      if (label) {
        label.style.top = '100%';
        label.style.bottom = 'auto';
        label.style.transform = 'translateY(10px)';
        label.style.zIndex = '30';
        label.style.fontWeight = '700';
        label.style.fontSize = '13px';
      }
    };
    wrapped.__jarvisStateBridge = true;
    C.prototype.setState = wrapped;
  };
  ensureStateBridge();
  setInterval(ensureStateBridge, 500);

  const scan = () => document.querySelectorAll('jarvis-core-hud').forEach(addBar);
  scan();
  new MutationObserver(scan).observe(document.documentElement, {childList:true, subtree:true});

  const retry = setInterval(() => {
    scan();
    ensureStateBridge();
    const hosts = [...document.querySelectorAll('jarvis-core-hud')];
    if (hosts.length && hosts.every(h => h.shadowRoot?.getElementById('jarvisTextBar') && h.shadowRoot?.getElementById('jarvisStatusBar'))) clearInterval(retry);
  }, 250);
  setTimeout(() => clearInterval(retry), 20000);
})();
