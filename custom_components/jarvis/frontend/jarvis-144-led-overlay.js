/* JARVIS Core V3 — visual LED layer. The Core owns the 72 LEDs. */
(() => {
  const INSTALL_ID = 'jarvis-72-led-motion';
  let timer = null;

  function install() {
    const hud = document.querySelector('jarvis-core-hud');
    const root = hud?.shadowRoot;
    const core = root?.getElementById('core');
    const leds = root?.querySelectorAll('#leds .led');
    if (!core || !leds?.length) return false;
    if (root.getElementById(INSTALL_ID)) return true;

    const style = document.createElement('style');
    style.id = `${INSTALL_ID}-style`;
    style.textContent = `
      .stateBridge{display:none!important}
      #voiceBars{display:none!important}
      #${INSTALL_ID}{display:none}
      #leds .led{background:#00eaff!important;box-shadow:0 0 6px #00eaff!important;transition:opacity .12s,filter .12s!important}
    `;
    root.appendChild(style);

    const marker = document.createElement('span');
    marker.id = INSTALL_ID;
    marker.hidden = true;
    root.appendChild(marker);

    let phase = 0;
    const animate = () => {
      phase += .18;
      const state = core.classList;
      const mode = state.contains('state-speak') ? 1 : state.contains('state-think') ? .55 : state.contains('state-search') ? .4 : state.contains('state-listen') ? .25 : .08;
      leds.forEach((led, i) => {
        const wave = (Math.sin(phase + i * .42) + 1) / 2;
        const ripple = (Math.sin(phase * 1.7 - i * .19) + 1) / 2;
        const pulse = 1 + mode * (wave * .72 + ripple * .28);
        const radius = Math.min(250, Math.max(120, innerWidth * .36));
        led.style.transform = `rotate(${i * 5}deg) translateY(-${radius}px) scaleY(${pulse.toFixed(2)})`;
        led.style.opacity = (0.42 + mode * .35 + wave * mode * .16).toFixed(2);
      });
      requestAnimationFrame(animate);
    };
    animate();
    return true;
  }

  function boot(){
    if (!install()) setTimeout(boot,300);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
