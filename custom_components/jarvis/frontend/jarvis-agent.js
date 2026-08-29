/* JARVIS Assist pipeline selector + automatic HA entity display bridge. */
(function () {
  const patch = () => {
    const C = customElements.get("jarvis-core-hud");
    if (!C || C.prototype.__jarvisAssistPipelineSelector) return !!C;
    C.prototype.__jarvisAssistPipelineSelector = true;
    const originalRender = C.prototype.render;
    const originalUpdate = C.prototype.update;

    C.prototype.render = function () {
      originalRender.call(this);
      if (this.shadowRoot && !this.shadowRoot.getElementById("jarvisBackButton")) {
        const back = document.createElement("button"); back.id = "jarvisBackButton"; back.type = "button"; back.textContent = "Retour"; back.title = "Retour à Home Assistant";
        back.style.cssText = "position:fixed;top:8px;left:8px;z-index:9999;width:30px;height:30px;min-height:30px;padding:0;border:1px solid #00cfff55;border-radius:50%;background:#031322;color:#dffaff;font:600 10px/28px system-ui;cursor:pointer;box-shadow:0 2px 7px #0006;text-align:center";
        back.onclick = () => { try { if (window.history.length > 1) window.history.back(); else if (window.parent && window.parent !== window) window.parent.history.back(); else window.location.href = "/"; } catch (_) { window.location.href = "/"; } };
        this.shadowRoot.appendChild(back);
      }
      const grid = this.shadowRoot?.querySelector(".grid");
      if (grid && !this.shadowRoot.getElementById("pipelineCard")) {
        const card = document.createElement("section"); card.className = "card"; card.id = "pipelineCard"; card.style.gridColumn = "1/-1";
        card.innerHTML = '<div class="title">🧠 ASSISTANT / PIPELINE</div><div class="row"><select id="pipelineSelect" style="flex:1;min-height:40px;border:1px solid #00cfff55;border-radius:7px;background:#031322;color:#dffaff;padding:0 10px"><option value="">AUTOMATIQUE · ASSIST</option></select></div><div id="pipelineInfo" style="font:9px monospace;color:#72ffad;margin-top:7px">Détection automatique…</div>';
        grid.insertBefore(card, grid.lastElementChild);
        const select = this.shadowRoot.getElementById("pipelineSelect"); const saved = localStorage.getItem("jarvis_assist_pipeline") || ""; select.value = saved;
        select.onchange = () => { localStorage.setItem("jarvis_assist_pipeline", select.value); this._log?.("✓ Pipeline JARVIS → " + (select.value || "AUTOMATIQUE")); };
        this._loadAssistPipelines();
      }
      if (!this.__jarvisEnergyTimer) {
        this._updateAutomaticEnergy?.();
        this.__jarvisEnergyTimer = setInterval(() => this._updateAutomaticEnergy?.(), 10000);
      }
      this._installReactiveVisuals();
    };

    C.prototype._installReactiveVisuals = function () {
      const root = this.shadowRoot; const core = root?.querySelector(".core");
      if (!root || !core || root.getElementById("jarvisReactiveVisuals")) return;
      const style = document.createElement("style"); style.id = "jarvisReactiveVisuals";
      style.textContent = `
        .core{--jcolor:#00eaff;--jsoft:#00eaff55;--jstrong:#00eaff;transition:filter .35s ease}
        .core.state-listen{--jcolor:#39ff88;--jsoft:#39ff8855;--jstrong:#39ff88;filter:drop-shadow(0 0 10px #39ff8833)}
        .core.state-think{--jcolor:#ffb000;--jsoft:#ffb00055;--jstrong:#ffb000;filter:drop-shadow(0 0 12px #ffb00033)}
        .core.state-speak{--jcolor:#b56cff;--jsoft:#b56cff55;--jstrong:#b56cff;filter:drop-shadow(0 0 14px #b56cff44)}
        .core.state-error{--jcolor:#ff4050;--jsoft:#ff405055;--jstrong:#ff4050}
        .core.state-listen .orbit{animation-duration:7s}.core.state-listen .orbit2{animation-duration:10s}
        .core.state-think .led{animation:thinkLed .8s ease-in-out infinite alternate}
        .core.state-think .orbit{animation-duration:5s}.core.state-think .orbit2{animation-duration:8s}
        .core.state-speak .orbit{animation-duration:6s}.core.state-speak .orbit2{animation-duration:8s}
        .core.state-listen .glow{animation:pulseVoice .8s ease-in-out infinite}
        .core.state-think .glow{animation:thinkPulse .55s ease-in-out infinite alternate}
        .core.state-speak .glow{animation:speakPulse .42s ease-in-out infinite alternate}
        .reactive-radar{position:absolute;inset:7%;border:1px solid var(--jsoft);border-radius:50%;opacity:0;pointer-events:none;overflow:hidden;transition:opacity .25s}
        .reactive-radar:before{content:"";position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,transparent 0 72%,var(--jcolor) 83%,transparent 94%);animation:radarSweep 2.2s linear infinite}
        .reactive-radar:after{content:"";position:absolute;inset:10%;border:1px dashed var(--jsoft);border-radius:50%;box-shadow:0 0 0 18px transparent,0 0 0 19px var(--jsoft);animation:radarPulse 1.6s ease-out infinite}
        .core.state-think .reactive-radar,.core.state-speak .reactive-radar{opacity:.48}
        .core.state-listen .reactive-radar{opacity:.72}.core.state-listen .reactive-radar:before{animation-duration:1.15s}
        .voice-bars{position:absolute;left:50%;top:50%;width:46%;height:18%;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;gap:3px;opacity:0;pointer-events:none;z-index:6}
        .voice-bars i{display:block;width:3px;height:18%;border-radius:3px;background:var(--jcolor);box-shadow:0 0 7px var(--jcolor);transition:height .15s}
        .core.state-listen .voice-bars,.core.state-speak .voice-bars{opacity:.95}
        .core.state-listen .voice-bars i{animation:voiceListen .55s ease-in-out infinite alternate}
        .core.state-speak .voice-bars i{animation:voiceSpeak .32s ease-in-out infinite alternate}
        @keyframes radarSweep{to{transform:rotate(360deg)}}
        @keyframes radarPulse{50%{transform:scale(1.05);opacity:.25}}
        @keyframes thinkLed{from{opacity:.18;filter:brightness(.8)}to{opacity:1;filter:brightness(2.4)}}
        @keyframes pulseVoice{50%{transform:scale(1.16);box-shadow:0 0 35px var(--jcolor),0 0 100px var(--jsoft)}}
        @keyframes thinkPulse{to{transform:scale(1.14);box-shadow:0 0 30px var(--jcolor),0 0 95px var(--jsoft)}}
        @keyframes speakPulse{to{transform:scale(1.18);box-shadow:0 0 40px var(--jcolor),0 0 120px var(--jsoft)}}
        @keyframes voiceListen{to{height:82%}}
        @keyframes voiceSpeak{to{height:100%}}
      `;
      root.appendChild(style);
      const radar = document.createElement("div"); radar.id = "jarvisReactiveVisuals"; radar.className = "reactive-radar"; core.insertBefore(radar, core.firstChild);
      const bars = document.createElement("div"); bars.className = "voice-bars";
      for(let i=0;i<15;i++){const b=document.createElement("i");b.style.animationDelay=(i*0.035)+"s";bars.appendChild(b)}
      core.appendChild(bars);
    };

    C.prototype.update = async function (manual = false) { await originalUpdate.call(this, manual); };

    C.prototype._loadAssistPipelines = async function () {
      const select = this.shadowRoot?.getElementById("pipelineSelect"), info = this.shadowRoot?.getElementById("pipelineInfo"); if (!select || !this._hass) return;
      try { const result = await this._hass.callWS({ type: "assist_pipeline/pipeline/list" }); const pipelines = Array.isArray(result?.pipelines) ? result.pipelines : [];
        for (const p of pipelines) { if (!p?.id) continue; const o = document.createElement("option"); o.value = p.id; o.textContent = `${p.name || p.id} · ${p.conversation_engine || "HA"}`; select.appendChild(o); }
        const saved = localStorage.getItem("jarvis_assist_pipeline") || ""; select.value = [...select.options].some(o => o.value === saved) ? saved : "";
        info.textContent = pipelines.length ? `${pipelines.length} pipeline(s) Assist détecté(s)` : "Aucun pipeline Assist détecté"; this._log?.("✓ Assist · " + (pipelines.length ? pipelines.length + " pipeline(s) détecté(s)" : "aucun pipeline"));
      } catch (e) { info.textContent = "Détection Assist indisponible"; this._log?.("⚠️ Pipeline Assist · " + e.message); }
    };

    C.prototype._updateAutomaticEnergy = async function () {
      const root = this.shadowRoot; if (!root) return;
      try {
        const states = await this._states();
        const sensors = states.filter(s => /^sensor\./.test(s.entity_id) && Number.isFinite(parseFloat(s.state)));
        const text = s => (s.entity_id + " " + (s.attributes?.friendly_name || "")).toLowerCase();
        const power = s => { const u = String(s.attributes?.unit_of_measurement || "").toLowerCase(); return u === "w" || u === "kw"; };
        const instant = s => /instant|actuel|actuelle|current|now|power|puissance/.test(text(s));
        const score = (s, patterns) => { const t = text(s); let n = 0; if (power(s)) n += 20; if (instant(s)) n += 15; for (const p of patterns) if (t.includes(p)) n += 10; if (/energy|énergie|daily|journal|total|today|jour|kwh/.test(t)) n -= 30; return n; };
        const pick = patterns => sensors.filter(power).sort((a,b) => score(b,patterns)-score(a,patterns))[0] || null;
        const production = pick(["solar","solaire","production solaire","production_solaire","pv","photovolta"]);
        const consumption = pick(["consommation électrique actuelle","consommation_electrique_actuelle","consommation actuelle","consommation maison","home consumption","home_consumption","consommation"]);
        const imp = pick(["import net réseau instantané","import_net_reseau_instantane","import réseau","import","grid import","grid_import"]);
        const exp = pick(["export net réseau instantané","export_net_reseau_instantane","export réseau","export","grid export","grid_export"]);
        const kw = s => { if (!s) return null; const n = parseFloat(s.state), u = String(s.attributes?.unit_of_measurement || "").toLowerCase(); if (!Number.isFinite(n)) return null; return u === "kw" ? n : n / 1000; };
        const set = (id, s) => { const el = root.getElementById(id); if (!el) return; const n = kw(s); if (n === null || n < 0 || n > 10) return; const next = n.toFixed(1) + " kW"; if (el.textContent !== next) el.textContent = next; };
        set("production", production); set("consumption", consumption); set("import", imp); set("export", exp);
        const p = kw(production), e = kw(exp); const self = root.getElementById("selfConsumption");
        if (self && p !== null && p >= 0 && p <= 10) { const rate = p > 0 ? Math.max(0, Math.min(100, ((p - Math.max(0,e || 0)) / p) * 100)) : 0; const next = rate.toFixed(0) + "%"; if (self.textContent !== next) self.textContent = next; }
      } catch (e) { /* Keep existing UI stable if HA states are unavailable. */ }
    };
    return true;
  };
  if (!patch()) { const timer = setInterval(() => { if (patch()) clearInterval(timer); }, 50); setTimeout(() => clearInterval(timer), 10000); }
})();
