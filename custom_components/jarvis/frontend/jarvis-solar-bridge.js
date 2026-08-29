/* JARVIS Core V3 — energy binding.
 * Hooks the actual JARVIS custom element instead of searching the HA document,
 * so the cards receive the live hass object even when the panel is inside HA's UI tree.
 */
(() => {
  const SOLAR = {
    production: 'sensor.envoy_122323101280_production_solaire_instantanee',
    consumption: 'sensor.envoy_122323101280_consommation_electrique_actuelle',
    import: 'sensor.puissance_import_reseau',
    export: 'sensor.puissance_export_reseau',
  };

  const toKw = (state) => {
    if (!state) return null;
    const n = Number.parseFloat(state.state);
    if (!Number.isFinite(n) || n < 0 || n > 100000) return null;
    const unit = String(state.attributes?.unit_of_measurement || 'W').toLowerCase();
    return unit.includes('kw') ? n : n / 1000;
  };

  const render = (host) => {
    const root = host?.shadowRoot;
    const states = host?._hass?.states;
    if (!root || !states) return;
    for (const [key, entityId] of Object.entries(SOLAR)) {
      const el = root.getElementById(key);
      if (!el) continue;
      const value = toKw(states[entityId]);
      el.textContent = value === null ? '--' : `${value.toFixed(1)} kW`;
    }
    const production = toKw(states[SOLAR.production]);
    const fill = root.getElementById('solarFill');
    if (fill) fill.style.width = production === null ? '0%' : `${Math.max(0, Math.min(100, production / 7 * 100))}%`;
  };

  const install = () => {
    const ctor = customElements.get('jarvis-core-hud');
    if (!ctor || ctor.__jarvisEnergyHooked) return;
    const descriptor = Object.getOwnPropertyDescriptor(ctor.prototype, 'hass');
    if (!descriptor?.set) return;
    const originalSet = descriptor.set;
    Object.defineProperty(ctor.prototype, 'hass', {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      get: descriptor.get,
      set(value) {
        originalSet.call(this, value);
        queueMicrotask(() => render(this));
      },
    });
    ctor.__jarvisEnergyHooked = true;
    document.addEventListener('visibilitychange', () => { if (!document.hidden) render(this); });
  };

  customElements.whenDefined('jarvis-core-hud').then(install);
  setInterval(() => {
    const host = document.querySelector('jarvis-core-hud');
    if (host) render(host);
  }, 5000);
})();
