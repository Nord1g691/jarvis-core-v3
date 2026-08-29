/* JARVIS Core V3 — visible text command bar */
(async () => {
  await customElements.whenDefined('jarvis-core-hud');
  const C = customElements.get('jarvis-core-hud');
  if (!C || C.prototype.__jarvisTextBarPatched) return;
  C.prototype.__jarvisTextBarPatched = true;
  const originalRender = C.prototype.render;
  const addBar = (host) => {
    const root = host.shadowRoot;
    if (!root || root.getElementById('jarvisTextBar')) return;
    const style = document.createElement('style');
    style.textContent = '#jarvisTextBar{max-width:950px;margin:0 auto 12px;display:flex;gap:8px;padding:0 0;box-sizing:border-box}#jarvisTextBar input{flex:1;min-width:0;height:42px;padding:0 14px;border:1px solid #00eaff77;border-radius:8px;background:#031322;color:#dffaff;outline:none;font-size:14px;box-shadow:0 0 12px #00eaff18}#jarvisTextBar input::placeholder{color:#79bfd8}#jarvisTextBar button{width:auto;min-width:92px;height:42px;margin:0;border:1px solid #00eaff88;border-radius:8px;background:#006b9433;color:#00eaff;font-weight:bold;font-size:10px;letter-spacing:1px}@media(max-width:650px){#jarvisTextBar{padding:0;gap:6px}#jarvisTextBar button{min-width:78px}}';
    root.appendChild(style);
    const bar = document.createElement('div');
    bar.id = 'jarvisTextBar';
    bar.innerHTML = '<input id="jarvisTextInput" type="text" autocomplete="off" placeholder="Écrire une commande à JARVIS…"><button id="jarvisTextSend" type="button">ENVOYER</button>';
    const app = root.querySelector('.app');
    const core = root.querySelector('.core');
    if (app && core) app.insertBefore(bar, core);
    const input = bar.querySelector('#jarvisTextInput');
    const send = bar.querySelector('#jarvisTextSend');
    const submit = () => {
      const text = input.value.trim();
      if (!text) return;
      host.process(text);
      input.value = '';
      input.focus();
    };
    send.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  };
  C.prototype.render = function(){
    originalRender.call(this);
    addBar(this);
  };
  document.querySelectorAll('jarvis-core-hud').forEach(addBar);
})();
