/* JARVIS HUD Config Layer
 * Keeps the existing Core conversation/visual engine intact.
 * Adds user-facing display preferences and lightweight HA entity discovery.
 */
(() => {
  const KEY = 'jarvis_hud_preferences_v1';
  const DEFAULT = { visible: { energy: true, voice: true, categories: true, log: true }, order: ['energy','voice','categories','log'] };
  const labels = { energy:'⚡ Énergie', voice:'🎙️ Commandes vocales', categories:'🧩 Catégories', log:'🖥️ Console / Log' };
  const domains = {
    light:['💡','Lumières'], switch:['🔘','Interrupteurs'], climate:['🌡️','Climatisation'], media_player:['🎵','Médias'], cover:['🪟','Volets'], camera:['📷','Caméras'], fan:['🌀','Ventilation'], water_heater:['🚿','Chauffe-eau'], vacuum:['🧹','Aspirateurs'], lock:['🔒','Serrures'], alarm_control_panel:['🛡️','Sécurité'], sensor:['📊','Capteurs'], binary_sensor:['◉','Capteurs binaires'], number:['🔢','Réglages'], input_boolean:['☑','Commandes'], scene:['🎬','Scènes'], script:['⚙️','Scripts']
  };
  const load = () => { try { return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY)||'null')); } catch (_) { return JSON.parse(JSON.stringify(DEFAULT)); } };
  const save = p => localStorage.setItem(KEY, JSON.stringify(p));
  const wait = () => {
    const host = document.querySelector('jarvis-core-hud');
    if (!host || !host.shadowRoot || !host.shadowRoot.querySelector('.app')) return setTimeout(wait, 300);
    install(host); setTimeout(()=>discover(host), 700);
  };
  function install(host){
    const root = host.shadowRoot;
    if (root.getElementById('jarvisConfigBtn')) return;
    const style = document.createElement('style');
    style.textContent = `.jarvis-config-btn{position:fixed;top:12px;right:12px;z-index:10002;width:36px;height:36px;min-height:36px;margin:0;padding:0;border:1px solid #00eaff55;border-radius:9px;background:#020711dd;color:#00eaff;font-size:16px}.jarvis-config{position:fixed;top:56px;right:12px;z-index:10003;width:min(330px,calc(100vw - 24px));padding:12px;border:1px solid #00eaff44;border-radius:12px;background:#031322f5;backdrop-filter:blur(12px);box-shadow:0 15px 40px #0009;display:none}.jarvis-config.open{display:block}.jc-title{font-size:10px;letter-spacing:2px;color:#8bd6ea;margin-bottom:8px}.jc-row{display:grid;grid-template-columns:28px 1fr 32px 32px;align-items:center;gap:5px;padding:6px 0;border-bottom:1px solid #00eaff12;font-size:11px}.jc-row button{width:32px;min-height:30px;margin:0;padding:0}.jc-eye{cursor:pointer;color:#39ff88}.jc-eye.off{color:#506773}.jc-save{margin-top:10px!important;min-height:36px!important;color:#00eaff!important}.jc-cats{margin-top:12px;border-top:1px solid #00eaff22;padding-top:10px}.jc-cat{font-size:9px;letter-spacing:1px;color:#72ffad;margin:6px 0}.jc-entity{display:flex;justify-content:space-between;gap:8px;padding:4px 0;color:#b9d8e2;font-size:9px}.jc-entity button{width:26px;min-height:26px;margin:0}.jarvis-context{margin-top:12px}.jarvis-context .card{transition:opacity .2s}.jarvis-context .card.jc-hidden{display:none}`;
    root.appendChild(style);
    const btn = document.createElement('button'); btn.id='jarvisConfigBtn'; btn.className='jarvis-config-btn'; btn.type='button'; btn.textContent='⚙'; btn.title='Réglages JARVIS';
    const panel = document.createElement('div'); panel.id='jarvisConfig'; panel.className='jarvis-config';
    panel.innerHTML = `<div class="jc-title">⚙ RÉGLAGES AFFICHAGE</div><div id="jcRows"></div><button class="jc-save" id="jcSave">ENREGISTRER</button><div class="jc-cats"><div class="jc-title">ENTITÉS DÉCOUVERTES</div><div id="jcEntities">Recherche…</div></div>`;
    root.querySelector('.app').append(btn,panel);
    let prefs=load(); let draft=JSON.parse(JSON.stringify(prefs));
    const render=()=>{const box=panel.querySelector('#jcRows');box.innerHTML='';draft.order.forEach((key,i)=>{const row=document.createElement('div');row.className='jc-row';const eye=document.createElement('button');eye.className='jc-eye'+(draft.visible[key]?'':' off');eye.textContent=draft.visible[key]?'●':'○';eye.title='Afficher / masquer';eye.onclick=()=>{draft.visible[key]=!draft.visible[key];render()};const name=document.createElement('span');name.textContent=labels[key];const up=document.createElement('button');up.textContent='↑';up.disabled=i===0;up.onclick=()=>{[draft.order[i-1],draft.order[i]]=[draft.order[i],draft.order[i-1]];render()};const down=document.createElement('button');down.textContent='↓';down.disabled=i===draft.order.length-1;down.onclick=()=>{[draft.order[i+1],draft.order[i]]=[draft.order[i],draft.order[i+1]];render()};row.append(eye,name,up,down);box.append(row)})};
    btn.onclick=()=>{draft=JSON.parse(JSON.stringify(prefs));panel.classList.toggle('open');if(panel.classList.contains('open'))render()};
    panel.querySelector('#jcSave').onclick=()=>{prefs=JSON.parse(JSON.stringify(draft));save(prefs);panel.classList.remove('open');apply(host,prefs);safeLog(host,'⚙️ Affichage enregistré')};
    apply(host,prefs);
  }
  function apply(host,p){const root=host.shadowRoot;const grid=root.querySelector('.grid');if(!grid)return;const cards=[...grid.querySelectorAll('.card')];const find=t=>cards.find(c=>c.querySelector('.title')?.textContent.toLowerCase().includes(t));const map={energy:find('énergie solaire'),voice:find('commandes jarvis'),log:find('console jarvis'),categories:root.getElementById('jarvisCategories')};const all=p.order.map(k=>map[k]).filter(Boolean);const anchor=grid.querySelector('.card');all.forEach(el=>grid.appendChild(el));Object.entries(map).forEach(([k,el])=>{if(el)el.classList.toggle('jc-hidden',!p.visible[k])});}
  function safeLog(host,text){try{host.log(text)}catch(_){} }
  function discover(host){const root=host.shadowRoot, states=host._hass?.states||{};let sec=root.getElementById('jarvisCategories');if(!sec){sec=document.createElement('section');sec.id='jarvisCategories';sec.className='card jarvis-context';sec.innerHTML='<div class="title">🧩 CATÉGORIES · DÉCOUVERTE AUTOMATIQUE</div><div id="jcCategoryList"></div>';root.querySelector('.grid')?.append(sec)}const grouped={};Object.entries(states).forEach(([id,s])=>{const d=id.split('.')[0];if(!domains[d])return;(grouped[d]??=[]).push([id,s])});const list=sec.querySelector('#jcCategoryList');if(!list)return;list.innerHTML='';Object.entries(grouped).sort((a,b)=>domains[a[0]][1].localeCompare(domains[b[0]][1],'fr')).forEach(([d,items])=>{const box=document.createElement('div');box.className='jc-cat';box.textContent=`${domains[d][0]} ${domains[d][1]} · ${items.length}`;items.slice(0,20).forEach(([id,s])=>{const row=document.createElement('div');row.className='jc-entity';const name=host._hass?.formatEntityName?host._hass.formatEntityName(s,undefined):s.attributes?.friendly_name||id;row.innerHTML=`<span>${name}</span><span>${s.state}</span>`;box.append(row)});list.append(box)});safeLog(host,`🔎 ${Object.keys(grouped).length} catégories · ${Object.keys(states).length} entités disponibles`)}
  wait();
})();
