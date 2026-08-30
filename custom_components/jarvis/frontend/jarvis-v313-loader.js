/* JARVIS Core V3.0.13 — deterministic panel loader.
 * The custom panel loads this module directly. It imports the Core first,
 * then attaches the V13 UI and memory layers in a guaranteed order.
 */
const VERSION = '3.0.13';
const BASE = '/jarvis_core/';

const loadScript = (name) => new Promise((resolve, reject) => {
  const src = `${BASE}${name}?v=${VERSION}`;
  const existing = document.querySelector(`script[data-jarvis-v313="${name}"]`);
  if (existing) {
    resolve();
    return;
  }
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.dataset.jarvisV313 = name;
  script.src = src;
  script.onload = resolve;
  script.onerror = () => reject(new Error(`JARVIS asset failed: ${name}`));
  document.head.appendChild(script);
});

await import(`./jarvis-core.js?v=${VERSION}`);
await loadScript('jarvis-hud-config.js');
await loadScript('jarvis-solar-bridge.js');
await loadScript('jarvis-v311-ui-layer.js');
await loadScript('jarvis-v313-memory-ui.js');

console.info(`[JARVIS] V${VERSION} loader complete`);
