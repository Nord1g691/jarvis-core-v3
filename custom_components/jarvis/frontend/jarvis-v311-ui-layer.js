/* JARVIS Core V3 — UI controls / log bridge. Keeps the core engine untouched. */
(() => {
  const PREF_KEY = 'jarvis_ui_preferences_v311';
  const SAT_KEY = 'jarvis_satellite_preferences_v311';
  const DEFAULT = { volume: 70, cards: { energy: true, voice: true, pipeline: true, led: true, log: true }, order: ['energy','voice','pipeline','led','log'] };
  const SAT_DEFAULT = { enabled: false, device: 'auto', selected: null };
  const clone = v => JSON.parse(JSON.stringify(v));
  const load = () => { try { const x=JSON.parse(localStorage.getItem(PREF_KEY)||'{}'); return { ...clone(DEFAULT), ...x, cards:{...DEFAULT.cards,...(x.cards||{})}, order:Array.isArray(x.order)?x.order.slice():clone(DEFAULT.order) }; } catch (_) { return clone(DEFAULT); } };
  const loadSat = () => { try { return { ...SAT_DEFAULT, ...JSON.parse(localStorage.getItem(SAT_KEY)||'{}') }; } catch (_) { return { ...SAT_DEFAULT }; } };
  const save = v => localStorage.setItem(PREF_KEY, JSON.stringify(v));
  const saveSat = v => localStorage.setItem(SAT_KEY, JSON.stringify(v));

  const findHost = () => { const host=document.querySelector('jarvis-core-hud'); if(!host?.shadowRoot?.querySelector('.app')) return setTimeout(findHost,300); install(host); };

  function install(host) {
    const root=host.shadowRoot; if(!root) return;
    // Remove only legacy V311/V308 controls. Never remove the controls installed by this version.
    root.getElementById('jarvis-settings-card')?.remove(); root.getElementById('jarvisConfigBtn')?.remove(); root.getElementById('jarvisConfig')?.remove(); root.getElementById('jarvisSatelliteBtn')?.remove();
    if(root.getElementById('jarvis-v311-ui-style')) return;
    const style=document.createElement('style'); style.id='jarvis-v311-ui-style'; style.textContent=`
      .j311-settings{position:fixed;top:12px;right:12px;z-index:10020;width:40px;height:40px;min-height:40px;margin:0;padding:0;border:1px solid #00eaff66;border-radius:10px;background:#020711ee;color:#00eaff;font-size:17px;box-shadow:0 0 14px #00eaff22}
      .j311-panel{position:fixed;top:58px;right:12px;z-index:10021;width:min(390px,calc(100vw - 24px));max-height:82vh;overflow:auto;padding:14px;border:1px solid #00eaff55;border-radius:14px;background:#031322f7;color:#dffaff;backdrop-filter:blur(14px);box-shadow:0 18px 50px #000b;display:none;text-align:left}.j311-panel.open{display:block}
      .j311-title{font-size:10px;letter-spacing:2px;color:#8bd6ea;margin:2px 0 10px}.j311-note{font-size:8px;color:#7096a6;margin:6px 0 10px}.j311-section{border-top:1px solid #00eaff22;padding-top:11px;margin-top:11px}
      .j311-card-row{display:grid;grid-template-columns:34px 1fr 34px 34px;align-items:center;gap:6px;padding:7px 0;border-bottom:1px solid #00eaff12;font-size:10px}.j311-card-row button{width:34px;min-height:31px;margin:0}.j311-eye{color:#39ff88}.j311-eye.off{color:#536873}.j311-card-row button:disabled{opacity:.25}
      .j311-range{width:100%;accent-color:#00eaff}.j311-volume-value{color:#39ff88}.j311-actions{display:flex;gap:7px}.j311-actions button{flex:1;min-height:36px;margin:0}.j311-active{border-color:#39ff88!important;color:#39ff88!important;box-shadow:0 0 10px #39ff8833}
      .j311-sat-status{font-size:9px;color:#39ff88;margin:7px 0}.j311-sat-status.off{color:#70808a}.j311-sat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.j311-sat-grid button{width:auto}.j311-hidden{display:none!important}
      .core .label{bottom:4%!important;z-index:10;background:#02071166;padding:3px 0;text-shadow:0 0 8px #00eaff}
      .core.state-think .js-particle{width:4px;height:4px;box-shadow:0 0 8px #ffb000,0 0 18px #ffb00088}.core.state-think .js-radar-h{animation-duration:1.5s}.core.state-think .js-radar-v{animation-duration:1.9s}
    `; root.appendChild(style);

    const grid=root.querySelector('.grid'); if(!grid) return;
    const cards={
      energy:[...grid.children].find(e=>e.querySelector('.title')?.textContent.includes('ÉNERGIE SOLAIRE')),
      voice:[...grid.children].find(e=>e.querySelector('.title')?.textContent.includes('COMMANDES JARVIS')),
      pipeline:[...grid.children].find(e=>e.querySelector('.title')?.textContent.includes('ASSISTANT / PIPELINE')),
      led:[...grid.children].find(e=>e.querySelector('.title')?.textContent.includes('RÉGLAGE LED')),
      log:root.getElementById('log')?.closest('.card')
    };
    const labels={energy:'⚡ Énergie solaire',voice:'🎙️ Commandes JARVIS',pipeline:'🧠 Assistant / Pipeline',led:'💡 Réglage LED',log:'🖥️ Console / Log'};
    let prefs=load(),sat=loadSat();
    prefs.order=prefs.order.filter(k=>cards[k]); Object.keys(cards).forEach(k=>{if(cards[k]&&!prefs.order.includes(k))prefs.order.push(k)}); save(prefs);
    const applyCards=()=>{prefs.order.forEach(k=>cards[k]&&grid.appendChild(cards[k]));Object.entries(cards).forEach(([k,e])=>e?.classList.toggle('j311-hidden',!prefs.cards[k]));}; applyCards();

    const btn=document.createElement('button'); btn.className='j311-settings';btn.type='button';btn.id='j311-settings';btn.textContent='⚙️';btn.title='Réglages JARVIS';
    const panel=document.createElement('div');panel.className='j311-panel';panel.id='j311-panel';panel.innerHTML=`<div class="j311-title">⚙️ RÉGLAGES JARVIS</div><div class="j311-note">Les choix sont mémorisés sur cet appareil.</div><div class="j311-section"><div class="j311-title">CARTES SOUS LE CORE</div><div id="j311-card-list"></div></div><div class="j311-section"><div class="j311-title">🔊 VOLUME JARVIS</div><span id="j311-volume-value" class="j311-volume-value"></span><input id="j311-volume" class="j311-range" type="range" min="0" max="100" step="1"></div><div class="j311-section"><div class="j311-title">🛰️ SATELLITE</div><div id="j311-sat-status" class="j311-sat-status"></div><div class="j311-actions"><button id="j311-sat-toggle" type="button"></button></div><div class="j311-sat-grid" style="margin-top:7px"><button data-device="auto" type="button">AUTO</button><button data-device="iphone" type="button">iPHONE</button><button data-device="ipad" type="button">iPAD</button></div><button id="j311-sat-refresh" type="button" style="width:100%;margin-top:7px">↻ RÉACTUALISER</button></div><div class="j311-actions" style="margin-top:12px"><button id="j311-cancel" type="button">ANNULER</button><button id="j311-save" type="button" class="j311-active">ENREGISTRER</button></div>`;
    root.querySelector('.app').append(btn,panel);

    const list=panel.querySelector('#j311-card-list');
    const renderCards=()=>{list.innerHTML='';prefs.order.forEach((k,i)=>{const row=document.createElement('div');row.className='j311-card-row';const eye=document.createElement('button');eye.type='button';eye.className='j311-eye'+(prefs.cards[k]?'':' off');eye.textContent=prefs.cards[k]?'●':'○';const name=document.createElement('span');name.textContent=labels[k];const up=document.createElement('button');up.type='button';up.textContent='↑';up.disabled=i===0;const down=document.createElement('button');down.type='button';down.textContent='↓';down.disabled=i===prefs.order.length-1;eye.onclick=()=>{prefs.cards[k]=!prefs.cards[k];applyCards();renderCards()};up.onclick=()=>{[prefs.order[i-1],prefs.order[i]]=[prefs.order[i],prefs.order[i-1]];applyCards();renderCards()};down.onclick=()=>{[prefs.order[i+1],prefs.order[i]]=[prefs.order[i],prefs.order[i+1]];applyCards();renderCards()};row.append(eye,name,up,down);list.appendChild(row)});};
    const renderVolume=()=>{panel.querySelector('#j311-volume').value=prefs.volume;panel.querySelector('#j311-volume-value').textContent=prefs.volume+'%';};
    const satellites=()=>Object.entries(host._hass?.states||{}).filter(([id,s])=>id.startsWith('assist_satellite.')&&s.state!=='unavailable').map(([id,s])=>({id,name:s.attributes?.friendly_name||id}));
    const applySat=()=>{const st=panel.querySelector('#j311-sat-status'),tg=panel.querySelector('#j311-sat-toggle');st.textContent=`${sat.enabled?'ACTIVÉ':'DÉSACTIVÉ'} · ${sat.device.toUpperCase()}${sat.selected?' · '+sat.selected:''}`;st.classList.toggle('off',!sat.enabled);tg.textContent=sat.enabled?'DÉSACTIVER':'ACTIVER';panel.querySelectorAll('[data-device]').forEach(b=>b.classList.toggle('j311-active',b.dataset.device===sat.device));const active=sat.enabled;[root.querySelector('.sat1'),root.querySelector('.sat2')].forEach(e=>{if(e)e.style.setProperty('display',active?'':'none','important')});};
    const open=()=>{prefs=load();sat=loadSat();applyCards();renderCards();renderVolume();applySat();panel.classList.add('open');};
    btn.onclick=()=>panel.classList.contains('open')?panel.classList.remove('open'):open();
    panel.querySelector('#j311-cancel').onclick=()=>{prefs=load();applyCards();panel.classList.remove('open')};
    panel.querySelector('#j311-save').onclick=()=>{save(prefs);saveSat(sat);applyCards();applySat();safeLog(host,'⚙️ Réglages enregistrés');panel.classList.remove('open')};
    panel.querySelector('#j311-volume').oninput=e=>{prefs.volume=Number(e.target.value);renderVolume();};
    panel.querySelector('#j311-sat-toggle').onclick=()=>{sat.enabled=!sat.enabled;saveSat(sat);applySat();safeLog(host,sat.enabled?'🛰️ Satellite activé':'🛰️ Satellite désactivé')};
    panel.querySelectorAll('[data-device]').forEach(b=>b.onclick=()=>{sat.device=b.dataset.device;sat.enabled=true;saveSat(sat);applySat();safeLog(host,`🛰️ Mode ${sat.device.toUpperCase()}`)});
    panel.querySelector('#j311-sat-refresh').onclick=()=>safeLog(host,`↻ Satellites détectés : ${satellites().length}`);
    renderCards();renderVolume();applySat();installLogBridge(host);
  }

  function applyVolume(volume){
    if(!window.speechSynthesis||window.__j311SpeechPatched)return;
    const original=window.speechSynthesis.speak.bind(window.speechSynthesis);window.__j311SpeechPatched=true;
    window.speechSynthesis.speak=utterance=>{try{const p=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');utterance.volume=Math.max(0,Math.min(1,Number(p.volume??volume)/100));}catch(_){try{utterance.volume=Number(volume)/100}catch(__){}}return original(utterance)};
  }
  function installLogBridge(host){
    if(host.__j311LogBridge)return;host.__j311LogBridge=true;
    const originalProcess=typeof host.process==='function'?host.process.bind(host):null;
    if(originalProcess)host.process=async text=>{if(text)safeLog(host,`🗣️ VOUS · ${text}`);return originalProcess(text)};
    const originalSpeak=typeof host.speak==='function'?host.speak.bind(host):null;
    if(originalSpeak)host.speak=async text=>{if(text)safeLog(host,`🤖 JARVIS · ${text}`);return originalSpeak(text)};
    if(window.speechSynthesis&&!window.__j311SpeechLogPatched){const speak=window.speechSynthesis.speak.bind(window.speechSynthesis);window.__j311SpeechLogPatched=true;window.speechSynthesis.speak=u=>{try{if(u?.text)safeLog(host,`🤖 JARVIS · ${u.text}`)}catch(_){}return speak(u)}}
    applyVolume(load().volume);safeLog(host,'[SYSTEM] Réglages / volume / cartes / log actifs');
  }
  function safeLog(host,text){try{host.log(text)}catch(_){} }
  const boot=()=>{const h=document.querySelector('jarvis-core-hud');if(h?.shadowRoot?.querySelector('.app'))install(h);else setTimeout(boot,300)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});
})();
