/* JARVIS V4.0.0 — configurable semantic entity roles. */
const Panel=customElements.get('jarvis-panel-v4');
if(Panel&&!Panel.prototype.__jarvisEntityRolesInstalled){
 const KEY='jarvis_entity_roles_v4';
 const ROLES=[
  ['solar_production','Production solaire','sensor.envoy_122323101280_production_solaire_instantanee'],
  ['grid_import','Import réseau','sensor.puissance_import_reseau'],
  ['grid_export','Export réseau','sensor.puissance_export_reseau'],
  ['water_heater','Chauffe-eau','switch.chauffe_eau'],
  ['water_heater_power','Puissance chauffe-eau','sensor.chauffe_eau_puissance'],
  ['ev_charger','Charge véhicule','switch.voiture_electrique_contacteur_1'],
  ['pool_filter','Filtration piscine','switch.smart_power_outlet_3'],
  ['pool_filter_power','Puissance filtration','sensor.filtration_piscine_puissance'],
  ['pool_heat_pump','PAC piscine','climate.pac_piscine']
 ];
 const defaults=()=>Object.fromEntries(ROLES.map(([k,,v])=>[k,v]));
 const read=()=>{try{return {...defaults(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(_){return defaults()}};
 const save=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}};
 Panel.prototype._jarvisEntityRoles=function(){return read()};
 Panel.prototype._jarvisSetEntityRole=function(role,entity){const v=read();v[role]=String(entity||'').trim();save(v);this._jarvisPersistSetting?.('entity_roles',v)};
 Panel.prototype._v4RenderEntityRoles=function(){const panel=this.shadowRoot?.getElementById('settingsPanel');if(!panel)return;let section=panel.querySelector('[data-v4-section="entity-roles"]');if(!section){section=document.createElement('div');section.className='section';section.dataset.v4Section='entity-roles';section.innerHTML='<div class="title">🧩 RÔLES DE LA MAISON</div><div class="note">Ces rôles permettent de rendre JARVIS réutilisable sans coder les entités en dur.</div><div class="jarvis-entity-role-body"></div>';panel.insertBefore(section,panel.querySelector('.actions'));const s=document.createElement('style');s.textContent='.jarvis-role-row{display:grid;grid-template-columns:1fr minmax(180px,1.5fr);gap:8px;align-items:center;padding:6px 0}.jarvis-role-row input{height:32px;border:1px solid #00eaff33;border-radius:6px;background:#020b14;color:#dffaff;padding:0 8px}.jarvis-role-reset{margin-top:8px}@media(max-width:650px){.jarvis-role-row{grid-template-columns:1fr}}';this.shadowRoot.appendChild(s)}const body=section.querySelector('.jarvis-entity-role-body'),roles=read();body.innerHTML=ROLES.map(([k,label])=>`<label class="jarvis-role-row"><span>${label}</span><input data-role="${k}" value="${String(roles[k]||'').replace(/"/g,'&quot;')}" placeholder="domain.entity"></label>`).join('')+'<button type="button" class="jarvis-role-reset">RÉTABLIR LES VALEURS PAR DÉFAUT</button>';body.querySelectorAll('[data-role]').forEach(inp=>inp.onchange=()=>this._jarvisSetEntityRole(inp.dataset.role,inp.value));body.querySelector('.jarvis-role-reset').onclick=()=>{const v=defaults();save(v);this._jarvisPersistSetting?.('entity_roles',v);this._v4RenderEntityRoles()}};
 const baseRenderSettings=Panel.prototype._renderSettings;Panel.prototype._renderSettings=function(){baseRenderSettings.call(this);this._v4RenderEntityRoles()};
 Panel.prototype.__jarvisEntityRolesInstalled=true;
}
