/* JARVIS Core V3.0.18 — legacy config compatibility shim.
 * The authoritative settings UI is owned by jarvis-v313-loader.js.
 * This file intentionally creates no second settings button/panel.
 */
(() => {
  const VERSION='3.0.18';
  const LEGACY_KEY='jarvis_hud_preferences_v1';
  const TARGET_KEY='jarvis_ui_preferences_v311';
  try {
    const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');
    if(legacy && !localStorage.getItem(TARGET_KEY)) {
      localStorage.setItem(TARGET_KEY,JSON.stringify(legacy));
    }
  } catch(_) {}
})();
