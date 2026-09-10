/* JARVIS V4.0.0 — cache-safe native entrypoint. */
await import('/jarvis_core/jarvis-runtime.js?v=4.0.0-native');
const Panel=customElements.get('jarvis-panel-v4');
const Core=customElements.get('jarvis-core-v4');
if(!Panel||!Core)throw new Error('JARVIS V4 natif incomplet');
