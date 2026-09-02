/* JARVIS Core V3.0.26 — configurable quick consumers / shortcuts card. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisQuickConsumersInstalled){
 const KEY='jarvis_quick_consumers_v326';
 const DEFAULTS=[
  {name:'Voiture',control:'switch.voiture_electrique_contacteur_1',power:''},
  {name:'Chauffe-eau',control:'switch.chauffe_eau',power:'sensor.chauffe_eau_puissance'},
  {name:'Piscine',control:'switch.smart_power_outlet_3',power:'sensor.filtration_piscine_puissance'},
  {name:'PAC piscine',control:'climate.pac_piscine',power:''},
 ];
 const load=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(v)?v:DEFAULTS}catch(_){return DEFAULTS}};
 const save=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}};
 Panel.prototype._jarvisQuickConsumers=function(){return load()};
 Panel.prototype._jarvisSetQuickConsumers=function(v){save(v);this._jarvisRenderQuickConsumers?.();};
 Panel.prototype._jarvisQuickPower=function(item){
  const h=this._hass;if(!h)return null;
  if(item.power&&h.states[item.power]){const s=h.states[item.power],n=Number(s.state);return Number.isFinite(n)?{value:n,unit:s.attributes?.unit_of_measurement||''}:null}
  const base=String(item.control||'').replace(/^(switch|climate|light)\./,'');
  const candidates=Object.values(h.states).filter(s=>s.entity_id?.startsWith('sensor.')&&/puissance|power/i.test(String(`${s.entity_id} ${s.attributes?.friendly_name||''}`)));
  const words=base.split('_').filter(w=>w.length>3);
  const hit=candidates.find(s=>words.filter(w=>String(`${s.entity_id} ${s.attributes?.friendly_name||''}`).toLowerCase().includes(w.toLowerCase())).length>=Math.min(2,words.length));
  if(!hit)return null;const n=Number(hit.state);return Number.isFinite(n)?{value:n,unit:hit.attributes?.unit_of_measurement||'',entity_id:hit.entity_id}:null;
 };
 Panel.prototype._jarvisQuickAction=async function(item){
  const id=item.control,state=this._hass?.states?.[id];if(!id||!state)return;
  const domain=id.split('.')[0];
  if(domain==='switch'||domain==='light')return this._callDomain?.(domain,state.state==='on'?'turn_off':'turn_on',id);
  if(domain==='climate')return this._callDomain?.('climate',state.state==='off'?'turn_on':'turn_off',id);
  if(domain==='cover')return this._callDomain?.('cover',state.state==='open'?'close_cover':'open_cover',id);
 };
 Panel.prototype._jarvisRenderQuickConsumers=function(){
  const root=this._core?.shadowRoot,card=root?.getElementById('jarvisQuickConsumersCard'),box=card?.querySelector('.jarvis-quick-grid');if(!box)return;
  const items=this._jarvisQuickConsumers().filter(x=>this._hass?.states?.[x.control]);box.innerHTML='';
  if(!items.length){box.textContent='Choisis tes équipements rapides dans Réglages.';return}
  items.forEach(item=>{const s=this._hass.states[item.control],p=this._jarvisQuickPower(item),tile=document.createElement('button');tile.type='button';tile.className='jarvis-quick-tile';tile.classList.toggle('on',s.state==='on'||(!['off','unavailable','unknown'].includes(s.state)&&item.control.startsWith('climate.')));tile.innerHTML=`<strong>${item.name||s.attributes?.friendly_name||item.control}</strong><span>${p?`${Math.round(p.value)} ${p.unit}`:String(s.state).toUpperCase()}</span><small>${s.state==='on'?'ACTIF':s.state}</small>`;tile.onclick=()=>this._jarvisQuickAction(item);box.appendChild(tile)});
 };
 Panel.prototype._jarvisInstallQuickConsumers=function(){
  const root=this._core?.shadowRoot,grid=root?.querySelector('.grid');if(!grid||root.getElementById('jarvisQuickConsumersCard'))return;
  const card=document.createElement('section');card.className='card';card.id='jarvisQuickConsumersCard';card.innerHTML='<div class="title">⚡ GROS CONSOMMATEURS · ACCÈS RAPIDES</div><div class="jarvis-quick-grid"></div>';grid.prepend(card);
  const st=document.createElement('style');st.textContent='.jarvis-quick-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:8px}.jarvis-quick-tile{min-height:78px;padding:9px;border:1px solid #00eaff33;border-radius:10px;background:#04131f;color:#dffaff;text-align:left}.jarvis-quick-tile.on{border-color:#39ff8877;box-shadow:0 0 12px #39ff8822}.jarvis-quick-tile strong,.jarvis-quick-tile span,.jarvis-quick-tile small{display:block}.jarvis-quick-tile strong{font-size:10px}.jarvis-quick-tile span{font-size:16px;margin:6px 0}.jarvis-quick-tile small{font-size:8px;opacity:.6}@media(max-width:650px){.jarvis-quick-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}';root.appendChild(st);this._jarvisRenderQuickConsumers();
 };
 const baseBoot=Panel.prototype._bootCore;Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallQuickConsumers()};
 const desc=Object.getOwnPropertyDescriptor(Panel.prototype,'hass');if(desc?.set)Object.defineProperty(Panel.prototype,'hass',{configurable:true,get:desc.get,set:function(v){desc.set.call(this,v);this._jarvisRenderQuickConsumers?.()}});
 const baseRenderCards=Panel.prototype._renderCards;Panel.prototype._renderCards=function(){baseRenderCards.call(this);const box=this.shadowRoot?.getElementById('cards');if(!box||box.querySelector('.jarvis-quick-settings'))return;const d=document.createElement('details');d.className='jarvis-settings-details jarvis-quick-settings';d.innerHTML='<summary><span>⚡ GROS CONSOMMATEURS / RACCOURCIS</span><b>RÉGLER</b></summary><div class="jarvis-settings-body"><div class="jarvis-setting-note">Choisis librement les équipements affichés. Format: Nom | entité de contrôle | capteur puissance (optionnel).</div><div class="jarvis-quick-settings-list"></div><button type="button" class="jarvis-quick-add">+ AJOUTER</button></div>';box.appendChild(d);const list=d.querySelector('.jarvis-quick-settings-list');const render=()=>{const items=this._jarvisQuickConsumers();list.innerHTML=items.map((x,i)=>`<div class="jarvis-quick-setting-row" data-i="${i}"><input data-k="name" value="${String(x.name||'').replace(/"/g,'&quot;')}" placeholder="Nom"><input data-k="control" value="${String(x.control||'').replace(/"/g,'&quot;')}" placeholder="switch... / climate..."><input data-k="power" value="${String(x.power||'').replace(/"/g,'&quot;')}" placeholder="sensor... puissance"><button type="button" data-del="${i}">×</button></div>`).join('');list.querySelectorAll('input').forEach(inp=>inp.onchange=()=>{const row=inp.closest('[data-i]'),arr=this._jarvisQuickConsumers();arr[Number(row.dataset.i)][inp.dataset.k]=inp.value.trim();this._jarvisSetQuickConsumers(arr)});list.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const arr=this._jarvisQuickConsumers();arr.splice(Number(b.dataset.del),1);this._jarvisSetQuickConsumers(arr);render()})};d.querySelector('.jarvis-quick-add').onclick=()=>{const arr=this._jarvisQuickConsumers();arr.push({name:'Nouveau',control:'',power:''});this._jarvisSetQuickConsumers(arr);render()};render();if(!this.shadowRoot.getElementById('jarvisQuickSettingsStyle')){const s=document.createElement('style');s.id='jarvisQuickSettingsStyle';s.textContent='.jarvis-quick-setting-row{display:grid;grid-template-columns:1fr 1.5fr 1.5fr auto;gap:5px;margin:6px 0}.jarvis-quick-setting-row input{min-width:0;height:31px;padding:0 6px;border:1px solid #00eaff33;border-radius:6px;background:#020b14;color:#dffaff}.jarvis-quick-setting-row button,.jarvis-quick-add{border:1px solid #00eaff33;border-radius:6px;background:#006b9422;color:#dffaff;padding:6px}@media(max-width:650px){.jarvis-quick-setting-row{grid-template-columns:1fr}.jarvis-quick-setting-row button{justify-self:end}}';this.shadowRoot.appendChild(s)}};
 Panel.prototype.__jarvisQuickConsumersInstalled=true;
}
