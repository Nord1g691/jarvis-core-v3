/* JARVIS Core V3 — persistent command bar + single-turn voice flow */
(async () => {
  await customElements.whenDefined('jarvis-core-hud');
  const C = customElements.get('jarvis-core-hud');
  if (!C) return;

  const addBar = (host) => {
    const root = host?.shadowRoot;
    if (!root) return;
    const app = root.querySelector('.app');
    const grid = root.querySelector('.grid');
    if (!app || !grid) return;

    if (!root.getElementById('jarvisTextBarStyle')) {
      const style = document.createElement('style');
      style.id = 'jarvisTextBarStyle';
      style.textContent = `
        #jarvisStateBridge{width:100%;max-width:950px;min-height:34px;margin:2px auto 12px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;color:#00eaff;font:700 12px/1.2 Arial,sans-serif;letter-spacing:3px;text-shadow:0 0 10px currentColor;transition:color .25s,text-shadow .25s}
        #jarvisTextBar{position:fixed;left:16px;right:16px;bottom:16px;width:auto;max-width:950px;margin:0 auto;display:flex;align-items:center;gap:8px;padding:8px;box-sizing:border-box;z-index:9999;background:#020711ee;border:1px solid #00eaff55;border-radius:10px;box-shadow:0 0 20px #00a0ff22;backdrop-filter:blur(8px)}
        #jarvisTextBar input{flex:1;min-width:0;height:42px;padding:0 14px;border:1px solid #00eaff77;border-radius:8px;background:#031322;color:#dffaff;outline:none;font-size:14px;box-sizing:border-box}
        #jarvisTextBar input::placeholder{color:#79bfd8}
        #jarvisTextBar button{width:auto;min-width:92px;height:42px;margin:0;border:1px solid #00eaff88;border-radius:8px;background:#006b9433;color:#00eaff;font-weight:bold;font-size:10px;letter-spacing:1px;box-sizing:border-box}
        #jarvisTextBar input:focus{box-shadow:0 0 12px #00eaff33;border-color:#00eaffcc}
        @media(max-width:650px){#jarvisTextBar{left:10px;right:10px;bottom:10px;gap:6px;padding:6px}#jarvisTextBar input{font-size:13px}#jarvisTextBar button{min-width:78px}#jarvisStateBridge{font-size:10px;letter-spacing:2px}}
      `;
      root.appendChild(style);
    }

    // Readable state stays outside the bright core.
    if (!root.getElementById('jarvisStateBridge')) {
      const status = document.createElement('div');
      status.id = 'jarvisStateBridge';
      status.textContent = 'JARVIS · OPÉRATIONNEL';
      app.insertBefore(status, grid);
    }

    // Keep the original state label from competing visually with the external state.
    const label = root.getElementById('state');
    if (label) {
      label.style.opacity = '0';
      label.style.pointerEvents = 'none';
    }

    // Persistent command bar, anchored to the bottom of the HUD viewport.
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
  };

  // Voice flow: one initial listen + one listen window after the answer.
  // This prevents an endless 10 s loop while still allowing a natural follow-up.
  if (!C.prototype.__jarvisConversationStabilizerV2) {
    C.prototype.__jarvisConversationStabilizerV2 = true;
    const originalToggle = C.prototype.toggleConversation;
    const originalStart = C.prototype.startListeningWindow;
    const originalStop = C.prototype.stopConversation;

    C.prototype.toggleConversation = function (...args) {
      const wasActive = !!this.conversationMode;
      if (!wasActive) {
        this.__jarvisListenWindowsRemaining = 2;
        this.__jarvisListeningStarted = false;
      } else {
        this.__jarvisListenWindowsRemaining = 0;
      }
      return originalToggle.apply(this, args);
    };

    C.prototype.startListeningWindow = function (...args) {
      if (this.__jarvisListenWindowsRemaining === 0) {
        this.conversationMode = false;
        return originalStop.apply(this, []);
      }
      this.__jarvisListenWindowsRemaining = Math.max(0, (this.__jarvisListenWindowsRemaining || 0) - 1);
      this.__jarvisListeningStarted = true;
      return originalStart.apply(this, args);
    };

    C.prototype.stopConversation = function (...args) {
      this.__jarvisListenWindowsRemaining = 0;
      this.__jarvisListeningStarted = false;
      return originalStop.apply(this, args);
    };
  }

  // Bridge real HUD state changes to the readable state outside the core.
  const installStateBridge = () => {
    const current = C.prototype.setState;
    if (!current || current.__jarvisStateBridgeV2) return;

    const wrapped = function (text, color) {
      current.call(this, text, color);
      const status = this.shadowRoot?.getElementById('jarvisStateBridge');
      if (!status) return;
      const value = String(text || 'OPÉRATIONNEL');
      status.textContent = 'JARVIS · ' + value;
      status.style.color = color || '#00eaff';
      status.style.textShadow = `0 0 10px ${color || '#00eaff'}`;
    };
    wrapped.__jarvisStateBridgeV2 = true;
    C.prototype.setState = wrapped;
  };

  const scan = () => document.querySelectorAll('jarvis-core-hud').forEach(addBar);
  const install = () => { installStateBridge(); scan(); };
  install();
  new MutationObserver(install).observe(document.documentElement, {childList:true, subtree:true});

  const retry = setInterval(() => {
    install();
    const hosts = [...document.querySelectorAll('jarvis-core-hud')];
    if (hosts.length && hosts.every(h => h.shadowRoot?.getElementById('jarvisTextBar') && h.shadowRoot?.getElementById('jarvisStateBridge'))) clearInterval(retry);
  }, 250);
  setTimeout(() => clearInterval(retry), 20000);
})();
