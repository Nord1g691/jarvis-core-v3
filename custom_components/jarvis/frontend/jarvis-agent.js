/* JARVIS Assist pipeline selector + solar instant display bridge. */
(function () {
  const patch = () => {
    const C = customElements.get("jarvis-core-hud");
    if (!C || C.prototype.__jarvisAssistPipelineSelector) return !!C;
    C.prototype.__jarvisAssistPipelineSelector = true;
    const originalRender = C.prototype.render;
    const originalUpdate = C.prototype.update;

    C.prototype.render = function () {
      originalRender.call(this);

      // Small, safe navigation control: return to the HA sidebar/page.
      if (this.shadowRoot && !this.shadowRoot.getElementById("jarvisBackButton")) {
        const back = document.createElement("button");
        back.id = "jarvisBackButton";
        back.type = "button";
        back.textContent = "‹";
        back.title = "Retour à Home Assistant";
        back.style.cssText = "position:fixed;top:8px;left:8px;z-index:9999;width:30px;height:30px;min-height:30px;padding:0;border:1px solid #00cfff55;border-radius:50%;background:#031322;color:#dffaff;font:600 16px/28px system-ui;cursor:pointer;box-shadow:0 2px 7px #0006;text-align:center";
        back.onclick = () => {
          try {
            if (window.history.length > 1) window.history.back();
            else if (window.parent && window.parent !== window) window.parent.history.back();
            else window.location.href = "/";
          } catch (_) {
            window.location.href = "/";
          }
        };
        this.shadowRoot.appendChild(back);
      }

      // Keep the existing Assist/Pipeline selector untouched.
      const grid = this.shadowRoot?.querySelector(".grid");
      if (grid && !this.shadowRoot.getElementById("pipelineCard")) {
        const card = document.createElement("section");
        card.className = "card";
        card.id = "pipelineCard";
        card.style.gridColumn = "1/-1";
        card.innerHTML = '<div class="title">🧠 ASSISTANT / PIPELINE</div><div class="row"><select id="pipelineSelect" style="flex:1;min-height:40px;border:1px solid #00cfff55;border-radius:7px;background:#031322;color:#dffaff;padding:0 10px"><option value="">AUTOMATIQUE · ASSIST</option></select></div><div id="pipelineInfo" style="font:9px monospace;color:#72ffad;margin-top:7px">Détection automatique…</div>';
        grid.insertBefore(card, grid.lastElementChild);
        const select = this.shadowRoot.getElementById("pipelineSelect");
        const saved = localStorage.getItem("jarvis_assist_pipeline") || "";
        select.value = saved;
        select.onchange = () => {
          localStorage.setItem("jarvis_assist_pipeline", select.value);
          this._log?.("✓ Pipeline JARVIS → " + (select.value || "AUTOMATIQUE"));
        };
        this._loadAssistPipelines();
      }

      // Add only the missing fifth instantaneous solar value.
      const values = this.shadowRoot?.querySelector(".card .values");
      if (values && !this.shadowRoot.getElementById("selfConsumption")) {
        const item = document.createElement("div");
        item.className = "value";
        item.style.gridColumn = "1 / -1";
        item.innerHTML = '<div class="num green" id="selfConsumption">--</div><div class="unit">AUTOCONSOMMATION</div>';
        values.appendChild(item);
      }
      this._updateSelfConsumption?.();
    };

    C.prototype.update = async function (manual = false) {
      await originalUpdate.call(this, manual);
      await this._updateSelfConsumption?.();
    };

    C.prototype._loadAssistPipelines = async function () {
      const select = this.shadowRoot?.getElementById("pipelineSelect"), info = this.shadowRoot?.getElementById("pipelineInfo");
      if (!select || !this._hass) return;
      try {
        const result = await this._hass.callWS({ type: "assist_pipeline/pipeline/list" });
        const pipelines = Array.isArray(result?.pipelines) ? result.pipelines : [];
        for (const p of pipelines) {
          if (!p?.id) continue;
          const o = document.createElement("option");
          o.value = p.id;
          o.textContent = `${p.name || p.id} · ${p.conversation_engine || "HA"}`;
          select.appendChild(o);
        }
        const saved = localStorage.getItem("jarvis_assist_pipeline") || "";
        select.value = [...select.options].some(o => o.value === saved) ? saved : "";
        info.textContent = pipelines.length ? `${pipelines.length} pipeline(s) Assist détecté(s)` : "Aucun pipeline Assist détecté";
        this._log?.("✓ Assist · " + (pipelines.length ? pipelines.length + " pipeline(s) détecté(s)" : "aucun pipeline"));
      } catch (e) {
        info.textContent = "Détection Assist indisponible";
        this._log?.("⚠️ Pipeline Assist · " + e.message);
      }
    };

    C.prototype._updateSelfConsumption = async function () {
      try {
        const states = await this._states();
        const s = states.find(x => x.entity_id === "sensor.jarvis_solar_self_consumption");
        const el = this.shadowRoot?.getElementById("selfConsumption");
        if (!el) return;
        const n = this._val(s);
        el.textContent = n === null ? "--" : n.toFixed(0) + " W";
      } catch (_) {
        const el = this.shadowRoot?.getElementById("selfConsumption");
        if (el) el.textContent = "--";
      }
    };

    return true;
  };
  if (!patch()) {
    const timer = setInterval(() => { if (patch()) clearInterval(timer); }, 50);
    setTimeout(() => clearInterval(timer), 10000);
  }
})();
