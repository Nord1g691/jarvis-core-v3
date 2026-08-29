/* JARVIS Core V3 — reliable solar card bridge.
 * Owns only the four energy cards and survives HA/frontend timing and cache issues.
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
    return unit === 'kw' ? n : n / 1000;
  };

  const render = (root, states) => {
    if (!root || !states) return false;
    let updated = false;
    for (const [key, entityId] of Object.entries(SOLAR)) {
      const value = toKw(states[entityId]);
      const el = root.getElementById(key);
      if (!el || value === null) continue;
      const text = `${value.toFixed(1)} kW`;
      if (el.textContent !== text) el.textContent = text;
      updated = true;
    }
    const production = toKw(states[SOLAR.production]);
    const fill = root.getElementById('solarFill');
    if (fill && production !== null) {
      fill.style.width = `${Math.max(0, Math.min(100, production / 7 * 100))}%`;
    }
    return updated;
  };

  const refresh = async (host) => {
    const root = host?.shadowRoot;
    if (!root?.querySelector('.app')) return;

    // Fast path: use the live Home Assistant state object already attached to the panel.
    if (render(root, host?._hass?.states)) return;

    // Fallback: fetch HA states directly. This also makes the bridge independent
    // from the exact timing of the custom element's `hass` setter.
    const token = host?._hass?.auth?.data?.access_token;
    if (!token) return;
    try {
      const response = await fetch(`${location.origin}/api/states`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const list = await response.json();
      const states = Object.fromEntries((Array.isArray(list) ? list : []).map(s => [s.entity_id, s]));
      render(root, states);
    } catch (_) {}
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
