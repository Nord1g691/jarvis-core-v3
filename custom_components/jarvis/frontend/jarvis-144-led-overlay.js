/* JARVIS V24.3 — optional 144-LED outer ring overlay. Does not modify the existing 72 LEDs or voice logic. */
(() => {
  const INSTALL_ID = 'jarvis-outer-144';
  const install = () => {
    const hud = document.querySelector('jarvis-core-hud');
    const root = hud?.shadowRoot;
    const core = root?.getElementById('core');
    if (!core || root.getElementById(INSTALL_ID)) return !!core;

    const style = document.createElement('style');
    style.textContent = `
      #${INSTALL_ID}{position:absolute;inset:-4%;border-radius:50%;pointer-events:none;z-index:1}
      #${INSTALL_ID} i{position:absolute;left:50%;top:50%;width:2px;height:8px;margin:-4px 0 0 -1px;border-radius:2px;background:#00eaff;box-shadow:0 0 5px #00eaff;opacity:.28;transform-origin:1px 4px;animation:jarvisOuter144 3.6s linear infinite}
      .state-listen #${INSTALL_ID} i{background:#39ff88;box-shadow:0 0 6px #39ff88;opacity:.48;animation-duration:7s}
      .state-think #${INSTALL_ID} i{background:#ffb000;box-shadow:0 0 8px #ffb000;opacity:.8;animation-duration:1.15s}
      .state-speak #${INSTALL_ID} i{background:#b56cff;box-shadow:0 0 8px #b56cff;opacity:.65;animation-duration:2s}
      @keyframes jarvisOuter144{0%{opacity:.2;filter:brightness(.8)}25%{opacity:.65;filter:brightness(1.4)}50%{opacity:.25;filter:brightness(.9)}75%{opacity:.85;filter:brightness(1.7)}100%{opacity:.2;filter:brightness(.8)}}
    `;
    root.appendChild(style);

    const ring = document.createElement('div');
    ring.id = INSTALL_ID;
    for(let n=0;n<144;n++){
      const led=document.createElement('i');
      led.style.transform=`rotate(${n*2.5}deg) translateY(-${Math.min(285,Math.max(145,innerWidth*.43))}px)`;
      led.style.animationDelay=`-${(n%24)*45}ms`;
      ring.appendChild(led);
    }
    core.insertBefore(ring, core.firstChild);
    return true;
  };

  const start=()=>{ if(install()) return; setTimeout(start,250); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
