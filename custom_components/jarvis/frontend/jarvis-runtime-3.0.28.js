/* JARVIS Core V3.0.28 — cache-safe frontend bridge.
 * Keeps the proven V3.0.27 panel/core lifecycle while forcing refreshed
 * visual extensions so stale iOS/WebView module cache cannot win.
 */
await import('/jarvis_core/jarvis-runtime.js?v=3.0.28-base');

const Panel=customElements.get('jarvis-panel-v3027')||customElements.get('jarvis-panel');
if(Panel){
  /* Re-install the current visual layer from unique URLs. */
  try{delete Panel.prototype.__jarvisCoreSizingInstalled}catch(_){}
  await import('/jarvis_core/jarvis-core-sizing.js?v=3.0.28-visual');

  try{delete Panel.prototype.__jarvisHealthInstalled}catch(_){}
  await import('/jarvis_core/jarvis-health.js?v=3.0.28-health');
}
