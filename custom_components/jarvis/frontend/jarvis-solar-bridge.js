/* JARVIS Core V3 — reliable solar card bridge.
 * Keeps the existing HUD untouched and refreshes only the solar card values.
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
    if (!Number.isFinite(n)) return null;
    const unit = String(state.attributes?.unit_of_measurement || 'W').toLowerCase();
    return unit === 'kw' ? n : n / 1000;
  };

  const refresh = (host) => {
    const states = host?._hass?.states;
    const root = host?.shadowRoot;
    if (!states || !root) return;

    for (const [key, entityId] of Object.entries(SOLAR)) {
      const value = toKw(states[entityId]);
      const el = root.getElementById(key);
      if (!el || value === null || value < 0 || value > 100) continue;
      const text = `${value.toFixed(1)} kW`;
      if (el.textContent !== text) el.textContent = text;
    }

    const production = toKw(states[SOLAR.production]);
    const fill = root.getElementById('solarFill');
    if (fill && production !== null) {
      fill.style.width = `${Math.max(0, Math.min(100, production / 7 * 100))}%`;
    }
  };

  const wait = () => {
    const host = document.querySelector('jarvis-core-hud');
    if (!host?.shadowRoot?.querySelector('.app')) {
      setTimeout(wait, 300);
      return;
    }
    refresh(host);
    if (!host.__jarvisSolarBridgeTimer) {
      host.__jarvisSolarBridgeTimer = setInterval(() => refresh(host), 5000);
    }
  };

  wait();
})();
