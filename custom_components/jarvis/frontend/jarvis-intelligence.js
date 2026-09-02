/* JARVIS Core V3.0.26 — lightweight household intelligence layer. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisIntelligenceInstalled){
 const IGNORE_KEY='jarvis_ignored_entities_v326';
 const PIN_KEY='jarvis_entity_pins_v326';
 const LEGACY_PIN_KEY='jarvis_pinned_entities_v326';
 const readSet=k=>{try{return new Set(JSON.parse(localStorage.getItem(k)||'[]'))}catch(_){return new Set()}};
 const saveSet=(k,s)=>{try{localStorage.setItem(k,JSON.stringify([...s]))}catch(_){}};
 const migratePins=()=>{const current=readSet(PIN_KEY),legacy=readSet(LEGACY_PIN_KEY);if(legacy.size){legacy.forEach(id=>current.add(id));saveSet(PIN_KEY,current);try{localStorage.removeItem(LEGACY_PIN_KEY)}catch(_){}}return current};
 Panel.prototype._jarvisIgnored=function(){return readSet(IGNORE_KEY)};
 Panel.prototype._jarvisPinned=function(){return migratePins()};
 Panel.prototype._jarvisIgnoreEntity=function(id,ignored=true){const s=this._jarvisIgnored();ignored?s.add(id):s.delete(id);saveSet(IGNORE_KEY,s);this._refreshDomainCards?.();this._renderCards?.()};
 Panel.prototype._jarvisPinEntity=function(id,pinned=true){const s=this._jarvisPinned();pinned?s.add(id):s.delete(id);saveSet(PIN_KEY,s);this._renderFavorites?.();this._renderCards?.()};

 const baseDomainStates=Panel.prototype._domainStates;
 if(baseDomainStates)Panel.prototype._domainStates=function(domain){const ignored=this._jarvisIgnored();return baseDomainStates.call(this,domain).filter(s=>!ignored.has(s.entity_id))};

 const baseFavorites=Panel.prototype._renderFavorites;
 if(baseFavorites)Panel.prototype._renderFavorites=function(){
  const card=this._core?.shadowRoot?.getElementById('jarvisFavoritesCard'),box=card?.querySelector('.jarvis-domain-list');if(!card||!box)return baseFavorites.call(this);
  const usage=this._readEntityUsage?.()||{},ignored=this._jarvisIgnored(),pinned=this._jarvisPinned(),allowed=new Set(['light','climate','media_player','cover','switch']);
  const all=Object.values(this._hass?.states||{}).filter(s=>allowed.has(s.entity_id?.split('.')[0])&&!ignored.has(s.entity_id));
  const states=all.filter(s=>pinned.has(s.entity_id)||Number(usage[s.entity_id]||0)>0).sort((a,b)=>{const ap=pinned.has(a.entity_id)?1:0,bp=pinned.has(b.entity_id)?1:0;if(bp!==ap)return bp-ap;return Number(usage[b.entity_id]||0)-Number(usage[a.entity_id]||0)}).slice(0,8);
  box.innerHTML='';if(!states.length){box.textContent='Épingle une entité ou utilise JARVIS : les favoris apparaîtront ici.';return}
  states.forEach(s=>{const row=this._renderEntityRow(s,true);if(pinned.has(s.entity_id))row.querySelector('strong')?.prepend('★ ');box.appendChild(row)});
 };

 Panel.prototype._jarvisHomeSummary=function(){
  const states=Object.values(this._hass?.states||{}),ignored=this._jarvisIgnored();
  const visible=states.filter(s=>!ignored.has(s.entity_id));
  const on=(d)=>visible.filter(s=>s.entity_id.startsWith(d+'.')&&s.state==='on').length;
  const open=visible.filter(s=>s.entity_id.startsWith('cover.')&&['open','opening'].includes(s.state)).length;
  const climates=visible.filter(s=>s.entity_id.startsWith('climate.')&&s.state!=='off'&&s.state!=='unavailable').length;
  const unavailable=visible.filter(s=>['unavailable','unknown'].includes(s.state)).length;
  return {lights:on('light'),switches:on('switch'),covers:open,climates,unavailable};
 };
 Panel.prototype._jarvisRenderSummary=function(){const root=this._core?.shadowRoot,card=root?.getElementById('jarvisSummaryCard');if(!card)return;const s=this._jarvisHomeSummary();const box=card.querySelector('.jarvis-summary-body');if(box)box.innerHTML=`<div><b>${s.lights}</b><small>LUMIÈRES ON</small></div><div><b>${s.switches}</b><small>SWITCHES ON</small></div><div><b>${s.covers}</b><small>OUVERTURES</small></div><div><b>${s.climates}</b><small>CLIM ACTIVES</small></div><div><b>${s.unavailable}</b><small>INDISPONIBLES</small></div>`};
 Panel.prototype._jarvisInstallSummary=function(){const root=this._core?.shadowRoot,grid=root?.querySelector('.grid');if(!grid||root.getElementById('jarvisSummaryCard'))return;const card=document.createElement('section');card.className='card';card.id='jarvisSummaryCard';card.innerHTML='<div class="title">🏠 ÉTAT DE LA MAISON</div><div class="jarvis-summary-body"></div><div class="row"><button id="jarvisActivityBtn" type="button">🕘 ACTIVITÉ RÉCENTE</button></div><div class="console" id="jarvisActivityLog" style="display:none;margin-top:8px"></div>';grid.prepend(card);const st=document.createElement('style');st.textContent='.jarvis-summary-body{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}.jarvis-summary-body>div{text-align:center;padding:8px 4px;border:1px solid #00eaff18;border-radius:7px}.jarvis-summary-body b{display:block;font-size:18px}.jarvis-summary-body small{font-size:7px;opacity:.65}@media(max-width:650px){.jarvis-summary-body{grid-template-columns:repeat(2,1fr)}}';root.appendChild(st);card.querySelector('#jarvisActivityBtn').onclick=()=>this._jarvisLoadActivity();this._jarvisRenderSummary()};
 Panel.prototype._jarvisLoadActivity=async function(){const root=this._core?.shadowRoot,log=root?.getElementById('jarvisActivityLog');if(!log)return;log.style.display='block';log.textContent='Chargement…';try{if(!this._hass?.callApi)throw Error('API Home Assistant indisponible');const start=new Date(Date.now()-6*3600*1000).toISOString();const data=await this._hass.callApi('GET','logbook/'+encodeURIComponent(start)),ignored=this._jarvisIgnored();const items=(Array.isArray(data)?data:[]).filter(x=>!ignored.has(x.entity_id)).slice(-20).reverse();log.innerHTML=items.length?items.map(x=>`${new Date(x.when||x.time_fired||Date.now()).toLocaleTimeString()} · ${x.name||x.entity_id||'Événement'} · ${x.message||x.state||''}`).join('<br>'):'Aucune activité récente.'}catch(e){log.textContent='Activité indisponible : '+e.message}};

 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallSummary();this._jarvisRenderSummary()};
 const desc=Object.getOwnPropertyDescriptor(Panel.prototype,'hass');
 if(desc?.set)Object.defineProperty(Panel.prototype,'hass',{configurable:true,get:desc.get,set:function(v){desc.set.call(this,v);this._jarvisRenderSummary?.()}});

 const baseSettings=Panel.prototype._domainSettingsHtml;
 if(baseSettings)Panel.prototype._domainSettingsHtml=function(domain){
  const html=baseSettings.call(this,domain),ignored=this._jarvisIgnored(),pinned=this._jarvisPinned();
  const raw=Object.values(this._hass?.states||{}).filter(s=>s.entity_id?.startsWith(domain+'.'));
  const controls=raw.map(s=>`<div class="jarvis-setting-entity"><div class="jarvis-setting-head"><span>${this._escapeSetting(s.attributes?.friendly_name||s.entity_id)}</span><small>${ignored.has(s.entity_id)?'IGNORÉ':pinned.has(s.entity_id)?'★ ÉPINGLÉ':''}</small></div><div class="jarvis-setting-controls"><button data-jarvis-ignore="${this._escapeSetting(s.entity_id)}">${ignored.has(s.entity_id)?'RÉINTÉGRER':'IGNORER'}</button><button data-jarvis-pin="${this._escapeSetting(s.entity_id)}">${pinned.has(s.entity_id)?'DÉSÉPINGLER':'★ FAVORI'}</button></div></div>`).join('');
  return html+'<div class="jarvis-setting-note" style="margin-top:10px">Organisation JARVIS</div>'+controls;
 };
 const baseWire=Panel.prototype._wireAccordionControls;
 Panel.prototype._wireAccordionControls=function(){baseWire?.call(this);const root=this.shadowRoot;if(!root)return;root.querySelectorAll('[data-jarvis-ignore]').forEach(b=>b.onclick=()=>this._jarvisIgnoreEntity(b.dataset.jarvisIgnore,!this._jarvisIgnored().has(b.dataset.jarvisIgnore)));root.querySelectorAll('[data-jarvis-pin]').forEach(b=>b.onclick=()=>this._jarvisPinEntity(b.dataset.jarvisPin,!this._jarvisPinned().has(b.dataset.jarvisPin)))};
 Panel.prototype.__jarvisIntelligenceInstalled=true;
}
