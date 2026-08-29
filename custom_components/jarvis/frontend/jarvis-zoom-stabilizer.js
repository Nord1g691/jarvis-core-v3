/* JARVIS HUD zoom stabilizer — keeps the V1 reference scale without touching core rendering. */
(() => {
  const apply = () => {
    const host = document.querySelector('jarvis-core-hud');
    const root = host?.shadowRoot;
    const core = root?.getElementById('core');
    if (!core) return false;
    core.style.width = 'min(94vw, 650px)';
    core.style.height = 'min(94vw, 650px)';
    core.style.maxWidth = '650px';
    core.style.maxHeight = '650px';
    core.style.margin = '4px auto 16px';
    return true;
  };
  if (!apply()) {
    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 15000);
  }
})();
