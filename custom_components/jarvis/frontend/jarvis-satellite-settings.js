/* JARVIS Core V3 — Satellite selector
 * Adds a lightweight UI for enabling/disabling and selecting the preferred
 * Home Assistant Assist Satellite without changing the existing voice engine.
 */
(() => {
  const KEY = 'jarvis_satellite_preferences_v1';
  const DEFAULT = { enabled: true, mode: 'auto', selected: null };

  const load = () => {
    try { return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY) || 'null')); }
    catch (_) { return { ...DEFAULT }; }
  };
  const save = p => localStorage.setItem(KEY, JSON.stringify(p));

  function findHost() {
    const host = document.querySelector('jarvis-core-hud');
    if (!host?.shadowRoot?.querySelector('.app')) return setTimeout(findHost, 300);
    install(host);
  }

  function install(host) {
    const root = host.shadowRoot;
    if (root.getElementById('jarvisSatelliteBtn')) return;

    const style = document.createElement('style');
    style.textContent = `
      .jc-satellite{margin-top:12px;padding-top:10px;border-top:1px solid #00eaff22}
      .jc-sat-toggle{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 0}
      .jc-sat-status{font-size:9px;letter-spacing:1px;color:#72ffad}
      .jc-sat-status.off{color:#70808a}
      .jc-sat-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:6px}
      .jc-sat-modes button,.jc-sat-refresh{min-height:31px;margin:0;font-size:9px}
      .jc-sat-modes button.active{border-color:#39ff88;color:#39ff88;box-shadow:0 0 8px #39ff8833}
      .jc-sat-list{margin-top:7px;font-size:9px;color:#9fc4d0}
      .jc-sat-item{display:flex;justify-content:space-between;align-items:center;gap:5px;padding:4px 0}
      .jc-sat-item button{min-height:25px;width:100%;margin:0;font-size:8px}
    `;
    root.appendChild(style);

    const config = root.getElementById('jarvisConfig');
    if (!config) return;
    const block = document.createElement('div');
    block.className = 'jc-satellite';
    block.innerHTML = `
      <div class="jc-title">🛰️ SATELLITE</div>
      <div class="jc-sat-toggle"><span id="jcSatStatus" class="jc-sat-status">ACTIVÉ</span><button id="jcSatToggle" type="button">DÉSACTIVER</button></div>
      <div class="jc-sat-modes">
        <button data-mode="auto" type="button">AUTO</button>
        <button data-mode="iphone" type="button">iPHONE</button>
        <button data-mode="ipad" type="button">iPAD</button>
      </div>
      <button id="jcSatRefresh" class="jc-sat-refresh" type="button">🔄 RÉACTUALISER</button>
      <div id="jcSatList" class="jc-sat-list">Recherche…</div>
    `;
    config.appendChild(block);

    let prefs = load();
    const status = block.querySelector('#jcSatStatus');
    const toggle = block.querySelector('#jcSatToggle');
    const list = block.querySelector('#jcSatList');

    const getSatellites = () => {
      const states = host._hass?.states || {};
      return Object.entries(states)
        .filter(([id, s]) => id.startsWith('assist_satellite.') && s.state !== 'unavailable')
        .map(([id, s]) => ({ id, name: s.attributes?.friendly_name || id }));
    };

    const render = () => {
      status.textContent = prefs.enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ';
      status.classList.toggle('off', !prefs.enabled);
      toggle.textContent = prefs.enabled ? 'DÉSACTIVER' : 'ACTIVER';
      block.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === prefs.mode));
      const sats = getSatellites();
      if (!sats.length) {
        list.textContent = prefs.enabled ? 'Aucun satellite Assist détecté.' : 'Satellite désactivé.';
        return;
      }
      list.innerHTML = sats.map(s => `<div class="jc-sat-item"><span>${s.name}</span><button type="button" data-sat="${s.id}">${prefs.selected === s.id ? 'SÉLECTIONNÉ' : 'CHOISIR'}</button></div>`).join('');
      list.querySelectorAll('[data-sat]').forEach(b => b.onclick = () => {
        prefs.selected = b.dataset.sat;
        prefs.enabled = true;
        save(prefs);
        render();
        try { host.log(`🛰️ Satellite sélectionné · ${prefs.selected}`); } catch (_) {}
      });
    };

    toggle.onclick = () => {
      prefs.enabled = !prefs.enabled;
      save(prefs);
      render();
      try { host.log(prefs.enabled ? '🛰️ Satellite activé' : '🛰️ Satellite désactivé'); } catch (_) {}
    };
    block.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
      prefs.mode = b.dataset.mode;
      save(prefs);
      render();
      try { host.log(`🛰️ Mode satellite · ${prefs.mode.toUpperCase()}`); } catch (_) {}
    });
    block.querySelector('#jcSatRefresh').onclick = () => {
      render();
      try { host.log(`🔄 Satellites · ${getSatellites().length} détecté(s)`); } catch (_) {}
    };

    window.JarvisSatelliteSettings = {
      get: () => ({ ...prefs }),
      isEnabled: () => prefs.enabled,
      getMode: () => prefs.mode,
      getSelected: () => prefs.selected,
      refresh: render
    };
    render();
  }

  findHost();
})();
