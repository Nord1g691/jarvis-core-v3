/* JARVIS Core V3.0.13 — deterministic frontend loader. */
(async () => {
  const version = '3.0.13';
  const base = '/jarvis_core/';
  const files = [
    'jarvis-core.js',
    'jarvis-hud-config.js',
    'jarvis-solar-bridge.js',
    'jarvis-v311-ui-layer.js',
    'jarvis-v313-memory-ui.js',
  ];
  try {
    for (const file of files) {
      await import(`${base}${file}?v=${version}`);
    }
  } catch (error) {
    console.error('[JARVIS V3] Frontend load failed:', error);
  }
})();
