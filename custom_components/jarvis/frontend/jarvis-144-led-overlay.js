/* JARVIS V24.3 — 144-LED outer ring, isolated from the existing HUD. */
(() => {
  const INSTALL_ID = 'jarvis-outer-144';

  function install() {
    const hud = document.querySelector('jarvis-core-hud');
    const root = hud?.shadowRoot;
    const core = root?.getElementById('core');
    if (!core) return false;
    if (root.getElementById(INSTALL_ID)) return true;

    const style = document.createElement('style');
    style.id = `${INSTALL_ID}-style`;
    style.textContent = `
      #${INSTALL_ID}{position:absolute;inset:0;border-radius:50%;pointer-events:none;z-index:20;overflow:visible}
      #${INSTALL_ID} i{position:absolute;left:50%;top:50%;width:2px;height:8px;margin:-4px 0 0 -1px;border-radius:3px;background:#00eaff;box-shadow:0 0 6px #00eaff;opacity:.45;transform-origin:1px 4px}
      .state-listen #${INSTALL_ID} i{background:#39ff88;box-shadow:0 0 7px #39ff88;opacity:.7}
      .state-think #${INSTALL_ID} i{background:#ffb000;box-shadow:0 0 9px #ffb000;opacity:.95;animation:jarvisOuterThink .32s steps(2,end) infinite}
      .state-search #${INSTALL_ID} i{background:#00eaff;box-shadow:0 0 10px #00eaff;opacity:.9;animation:jarvisOuterSearch 1.4s linear infinite}
      .state-speak #${INSTALL_ID} i{background:#b56cff;box-shadow:0 0 9px #b56cff;opacity:.85;animation:jarvisOuterSpeak .22s ease-in-out infinite alternate}
      @keyframes jarvisOuterThink{0%,100%{opacity:.3}50%{opacity:1}}
      @keyframes jarvisOuterSearch{0%,100%{opacity:.35}50%{opacity:1}}
      @keyframes jarvisOuterSpeak{from{opacity:.35}to{opacity:1}}
    `;
    root.appendChild(style);

    const ring = document.createElement('div');
    ring.id = INSTALL_ID;
    const radius = Math.max(0, Math.floor(core.clientWidth * .44));
    for (let n = 0; n < 144; n++) {
      const led = document.createElement('i');
      led.style.transform = `rotate(${n * 2.5}deg) translateY(-${radius}px)`;
      led.style.animationDelay = `${-(n % 36) * 25}ms`;
      ring.appendChild(led);
    }
    core.appendChild(ring);
    return true;
  }

  const boot = () => {
    if (!install()) setTimeout(boot, 300);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }
})();
