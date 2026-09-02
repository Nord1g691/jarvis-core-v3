/* JARVIS V3.0.27 — dynamic Home Assistant domain cards and state colors. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisDomainsInstalled){
  const USAGE_KEY='jarvis_entity_usage_v325';
  const baseLoad=Panel.prototype._loadPrefs;
  Panel.prototype._loadPrefs=function(){
    const p=baseLoad.call(this);
    const extra={favorites:true,lights:true,climate:true,media:true,covers:true,switches:true};
    p.cards={...extra,...p.cards};
    for(const k of ['favorites','lights','climate','media','covers','switches'])if(!p.order.includes(k))p.order.push(k);
    return p;
  };

  const baseBoot=Panel.prototype._bootCore;
  Panel.prototype._bootCore=async function(){
    await baseBoot.call(this);
    this._installDomainCards();
    this._applyCards();
    this._renderCards();
    this._refreshDomainCards();
  };

  const baseMap=Panel.prototype._cardMap;
  Panel.prototype._cardMap=function(){
    const map=baseMap.call(this),root=this._core?.shadowRoot;
    if(!root)return map;
    map.favorites=root.getElementById('jarvisFavoritesCard');
    map.lights=root.getElementById('jarvisLightsCard');
    map.climate=root.getElementById('jarvisClimateCard');
    map.media=root.getElementById('jarvisMediaCard');
    map.covers=root.getElementById('jarvisCoversCard');
    map.switches=root.getElementById('jarvisSwitchesCard');
    return map;
  };

  Panel.prototype._installDomainCards=function(){
    const root=this._core?.shadowRoot,grid=root?.querySelector('.grid');
    if(!grid||root.getElementById('jarvisLightsCard'))return;
    const make=(id,title)=>{const card=document.createElement('section');card.className='card jarvis-domain-card';card.id=id;card.innerHTML=`<div class="title">${title}</div><div class="jarvis-domain-list">Chargement…</div>`;grid.appendChild(card)};
    make('jarvisFavoritesCard','⭐ PRÉFÉRÉS · PLUS UTILISÉS');
    make('jarvisLightsCard','💡 ÉCLAIRAGE');
    make('jarvisClimateCard','🌡️ CLIM / CHAUFFAGE');
    make('jarvisMediaCard','📺 MÉDIAS');
    make('jarvisCoversCard','🪟 VOLETS / OUVERTURES');
    make('jarvisSwitchesCard','🔌 PRISES / SWITCHES');
    const style=document.createElement('style');style.textContent='.jarvis-domain-list{display:grid;gap:7px;margin-top:8px}.jarvis-domain-card,.jarvis-entity{transition:border-color .25s,background .25s,box-shadow .25s,color .25s}.jarvis-domain-card.jarvis-card-active{border-color:var(--jarvis-state-color,#00eaff)!important;box-shadow:0 0 18px color-mix(in srgb,var(--jarvis-state-color,#00eaff) 38%,transparent);background:linear-gradient(135deg,color-mix(in srgb,var(--jarvis-state-color,#00eaff) 13%,#031322dd),#031322dd)}.jarvis-domain-card.jarvis-card-active>.title{color:var(--jarvis-state-color,#00eaff);text-shadow:0 0 8px var(--jarvis-state-color,#00eaff)}.jarvis-entity{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:7px;border:1px solid #00eaff22;border-radius:8px;font-size:10px}.jarvis-entity.jarvis-entity-active{border-color:var(--jarvis-entity-color,#39ff88);background:color-mix(in srgb,var(--jarvis-entity-color,#39ff88) 11%,transparent);box-shadow:inset 0 0 12px color-mix(in srgb,var(--jarvis-entity-color,#39ff88) 16%,transparent)}.jarvis-entity.jarvis-entity-active strong{color:var(--jarvis-entity-color,#39ff88)}.jarvis-entity small{display:block;opacity:.65;margin-top:2px}.jarvis-entity button{min-width:66px;min-height:30px;border:1px solid #00cfff55;border-radius:7px;background:#006b9433;color:#dffaff}.jarvis-entity button.on{border-color:var(--jarvis-entity-color,#39ff88);color:var(--jarvis-entity-color,#39ff88)}.jarvis-cover-actions{display:flex;gap:4px;align-items:center}.jarvis-cover-actions button{min-width:38px}.jarvis-light-color{width:34px;height:30px;padding:1px;border:1px solid #ffd60a88;border-radius:7px;background:#020711;cursor:pointer}.jarvis-fav-count{font-size:8px;opacity:.45;margin-left:6px}';root.appendChild(style);
  };

  Panel.prototype._domainStates=function(domain){const domains=domain==='climate'?['climate','fan']:[domain];return Object.values(this._hass?.states||{}).filter(s=>domains.some(d=>s.entity_id?.startsWith(d+'.'))).sort((a,b)=>String(a.attributes?.friendly_name||a.entity_id).localeCompare(String(b.attributes?.friendly_name||b.entity_id),'fr'))};
  Panel.prototype._readEntityUsage=function(){try{return JSON.parse(localStorage.getItem(USAGE_KEY)||'{}')}catch(_){return{}}};
  Panel.prototype._trackEntityUsage=function(entity_id){const u=this._readEntityUsage();u[entity_id]=Number(u[entity_id]||0)+1;try{localStorage.setItem(USAGE_KEY,JSON.stringify(u))}catch(_){};};
  Panel.prototype._callDomain=async function(domain,service,entity_id,data={}){try{await this._hass.callService(domain,service,{entity_id,...data});this._trackEntityUsage(entity_id);this._log(`✓ ${domain}.${service} · ${entity_id}`);this._renderFavorites()}catch(e){this._log(`✗ ${domain}.${service}: ${e.message}`)}};

  Panel.prototype._actionsForState=function(s){
    const domain=s.entity_id.split('.')[0];let detail=s.state,actions=[];
    if(domain==='light')actions=[[s.state==='on'?'turn_off':'turn_on',s.state==='on'?'ÉTEINDRE':'ALLUMER']];
    if(domain==='climate'){const cur=s.attributes?.current_temperature,temp=s.attributes?.temperature;detail=`${s.state}${cur!=null?' · '+cur+'°':''}${temp!=null?' → '+temp+'°':''}`;actions=[[s.state==='off'?'turn_on':'turn_off',s.state==='off'?'ACTIVER':'ARRÊTER']]}
    if(domain==='fan'){const pct=s.attributes?.percentage;detail=`${s.state}${pct!=null?' · '+pct+'%':''}`;actions=[[s.state==='on'?'turn_off':'turn_on',s.state==='on'?'ARRÊTER':'ACTIVER']]}
    if(domain==='media_player'){const playing=['playing','paused'].includes(s.state);actions=[[playing?'media_play_pause':'media_play',playing?'PLAY/PAUSE':'LECTURE']];detail=s.attributes?.media_title||s.state}
    if(domain==='cover'){const pos=s.attributes?.current_position;detail=pos!=null?`${s.state} · ${pos}%`:s.state;actions=[['open_cover','▲'],['stop_cover','■'],['close_cover','▼']]}
    if(domain==='switch')actions=[[s.state==='on'?'turn_off':'turn_on',s.state==='on'?'COUPER':'ACTIVER']];
    return {domain,detail,actions};
  };

  Panel.prototype._entityVisual=function(s){const domain=s.entity_id.split('.')[0],attrs=s.attributes||{},text=String(`${s.entity_id} ${attrs.friendly_name||''}`).toLowerCase();if(domain==='light'&&s.state==='on'){const rgb=attrs.rgb_color;return{active:true,color:Array.isArray(rgb)?`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`:'#ffd60a'}}if(domain==='climate'&&s.state!=='off'&&s.state!=='unavailable'){const action=String(attrs.hvac_action||s.state).toLowerCase();return{active:true,color:action.includes('heat')?'#ff5a45':action.includes('cool')?'#38bdf8':action.includes('dry')?'#ffb000':'#7dd3fc'}}if(domain==='fan'&&s.state==='on')return{active:true,color:'#62d8ff'};if(domain==='switch'&&s.state==='on'&&/piscine|pool|filtration/.test(text))return{active:true,color:'#249dff'};if((domain==='switch'||domain==='media_player')&&['on','playing'].includes(s.state))return{active:true,color:'#39ff88'};return{active:false,color:'#00eaff'}};
  Panel.prototype._applyDomainCardVisual=function(card,states,domain){if(!card)return;const visuals=states.map(s=>this._entityVisual(s)).filter(v=>v.active);card.classList.toggle('jarvis-card-active',visuals.length>0);if(visuals.length){let color=visuals[0].color;if(domain==='light')color='#ffd60a';if(domain==='switch'&&states.some(s=>this._entityVisual(s).active&&/piscine|pool|filtration/.test(String(`${s.entity_id} ${s.attributes?.friendly_name||''}`).toLowerCase())))color='#249dff';card.style.setProperty('--jarvis-state-color',color)}else card.style.removeProperty('--jarvis-state-color')};
  Panel.prototype._hexToRgb=function(hex){const clean=String(hex||'').replace('#','');const n=parseInt(clean,16);return Number.isFinite(n)?[(n>>16)&255,(n>>8)&255,n&255]:[255,214,10]};
  Panel.prototype._lightColorValue=function(s){const rgb=s.attributes?.rgb_color;if(Array.isArray(rgb)&&rgb.length>=3)return'#'+rgb.slice(0,3).map(v=>Math.max(0,Math.min(255,Number(v)||0)).toString(16).padStart(2,'0')).join('');return'#ffd60a'};

  Panel.prototype._renderEntityRow=function(s,showCount=false){
    const {domain,detail,actions}=this._actionsForState(s),row=document.createElement('div');row.className='jarvis-entity';const name=s.attributes?.friendly_name||s.entity_id,visual=this._entityVisual(s);row.classList.toggle('jarvis-entity-active',visual.active);row.style.setProperty('--jarvis-entity-color',visual.color);
    row.innerHTML='<div><strong></strong><small></small></div><div class="jarvis-cover-actions"></div>';row.querySelector('strong').textContent=name;row.querySelector('small').textContent=detail;
    if(showCount){const count=document.createElement('span');count.className='jarvis-fav-count';count.textContent='· '+Number(this._readEntityUsage()[s.entity_id]||0)+' usages';row.querySelector('strong').appendChild(count)}
    const actionBox=row.querySelector('.jarvis-cover-actions');actions.forEach(([action,label])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.classList.toggle('on',visual.active||(domain==='cover'&&s.state==='open'));b.onclick=()=>this._callDomain(domain,action,s.entity_id);actionBox.appendChild(b)});if(domain==='light'&&Array.isArray(s.attributes?.supported_color_modes)&&s.attributes.supported_color_modes.some(m=>['rgb','rgbw','rgbww','hs','xy'].includes(m))){const picker=document.createElement('input');picker.type='color';picker.className='jarvis-light-color';picker.title='Choisir la couleur';picker.value=this._lightColorValue(s);picker.onchange=()=>this._callDomain('light','turn_on',s.entity_id,{rgb_color:this._hexToRgb(picker.value)});actionBox.appendChild(picker)}return row;
  };

  Panel.prototype._renderDomain=function(cardId,domain){
    const card=this._core?.shadowRoot?.getElementById(cardId),box=card?.querySelector('.jarvis-domain-list');if(!box)return;
    const states=this._domainStates(domain);box.innerHTML='';
    if(!states.length){box.textContent='Aucune entité '+domain+' disponible.';this._applyDomainCardVisual(card,states,domain);return}
    states.forEach(s=>box.appendChild(this._renderEntityRow(s)));this._applyDomainCardVisual(card,states,domain);
  };

  Panel.prototype._renderFavorites=function(){
    const card=this._core?.shadowRoot?.getElementById('jarvisFavoritesCard'),box=card?.querySelector('.jarvis-domain-list');if(!box)return;
    const usage=this._readEntityUsage(),allowed=new Set(['light','climate','fan','media_player','cover','switch']);
    const states=Object.values(this._hass?.states||{}).filter(s=>allowed.has(s.entity_id?.split('.')[0])&&Number(usage[s.entity_id]||0)>0).sort((a,b)=>Number(usage[b.entity_id]||0)-Number(usage[a.entity_id]||0)).slice(0,8);
    box.innerHTML='';if(!states.length){box.textContent='Les entités les plus utilisées apparaîtront ici automatiquement.';return}
    states.forEach(s=>box.appendChild(this._renderEntityRow(s,true)));
  };

  Panel.prototype._refreshDomainCards=function(){this._renderFavorites();this._renderDomain('jarvisLightsCard','light');this._renderDomain('jarvisClimateCard','climate');this._renderDomain('jarvisMediaCard','media_player');this._renderDomain('jarvisCoversCard','cover');this._renderDomain('jarvisSwitchesCard','switch');this._installCardCollapsers?.()};

  const baseSet=Object.getOwnPropertyDescriptor(Panel.prototype,'hass')?.set;
  if(baseSet)Object.defineProperty(Panel.prototype,'hass',{configurable:true,get:Object.getOwnPropertyDescriptor(Panel.prototype,'hass')?.get,set:function(v){baseSet.call(this,v);if(this._core?.shadowRoot?.getElementById('jarvisLightsCard'))this._refreshDomainCards()}});

  const baseRender=Panel.prototype._renderCards;
  Panel.prototype._renderCards=function(){baseRender.call(this);const labels={favorites:'⭐ Préférés',lights:'💡 Éclairage',climate:'🌡️ Clim / Chauffage',media:'📺 Médias',covers:'🪟 Volets / Ouvertures',switches:'🔌 Prises / Switches'};const box=this.shadowRoot?.getElementById('cards');if(!box)return;[...box.querySelectorAll('.row')].forEach((r,i)=>{const k=this._prefs.order[i];if(labels[k])r.querySelector('span').textContent=labels[k]})};
  Panel.prototype.__jarvisDomainsInstalled=true;
}
