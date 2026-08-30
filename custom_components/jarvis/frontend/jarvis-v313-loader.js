/* JARVIS Core V3.0.17 — single deterministic panel entrypoint. */
const VERSION = '3.0.17';
const BASE = '/jarvis_core/';

const loadScript = (name) => new Promise((resolve, reject) => {
  const src = `${BASE}${name}?v=${VERSION}`;
  const existing = document.querySelector(`script[data-jarvis-v313="${name}"]`);
  if (existing) return resolve();
  const script = document.createElement('script');
  script.src = src;
  script.async = false;
  script.dataset.jarvisV313 = name;
  script.onload = resolve;
  script.onerror = () => reject(new Error(`JARVIS asset failed: ${name}`));
  document.head.appendChild(script);
});

await import(`${BASE}jarvis-core.js?v=${VERSION}`);
await loadScript('jarvis-hud-config.js');
await loadScript('jarvis-solar-bridge.js');
await loadScript('jarvis-v311-ui-layer.js');
await loadScript('jarvis-v313-memory-ui.js');

console.info(`[JARVIS] V${VERSION} READY — core + settings + memory`);
