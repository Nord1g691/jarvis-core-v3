/* JARVIS V3.0.25 — dynamic Home Assistant domain cards with automatic favorites. */
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
    const style=document.createElement('style');style.textContent='.jarvis-domain-list{display:grid;gap:7px;margin-top:8px}.jarvis-entity{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:7px;border:1px solid #00eaff22;border-radius:8px;font-size:10px}.jarvis-entity small{display:block;opacity:.65;margin-top:2px}.jarvis-entity button{min-width:66px;min-height:30px;border:1px solid #00cfff55;border-radius:7px;background:#006b9433;color:#dffaff}.jarvis-entity button.on{border-color:#39ff88;color:#39ff88}.jarvis-cover-actions{display:flex;gap:4px}.jarvis-cover-actions button{min-width:38px}.jarvis-fav-count{font-size:8px;opacity:.45;margin-left:6px}';root.appendChild(style);
  };

  Panel.prototype._domainStates=function(domain){return Object.values(this._hass?.states||{}).filter(s=>s.entity_id?.startsWith(domain+'.')).sort((a,b)=>String(a.attributes?.friendly_name||a.entity_id).localeCompare(String(b.attributes?.friendly_name||b.entity_id),'fr'))};
  Panel.prototype._readEntityUsage=function(){try{return JSON.parse(localStorage.getItem(USAGE_KEY)||'{}')}catch(_){return{}}};
  Panel.prototype._trackEntityUsage=function(entity_id){const u=this._readEntityUsage();u[entity_id]=Number(u[entity_id]||0)+1;try{localStorage.setItem(USAGE_KEY,JSON.stringify(u))}catch(_){};};
  Panel.prototype._callDomain=async function(domain,service,entity_id,data={}){try{await this._hass.callService(domain,service,{entity_id,...data});this._trackEntityUsage(entity_id);this._log(`✓ ${domain}.${service} · ${entity_id}`);this._renderFavorites()}catch(e){this._log(`✗ ${domain}.${service}: ${e.message}`)}};

  Panel.prototype._actionsForState=function(s){
    const domain=s.entity_id.split('.')[0];let detail=s.state,actions=[];
    if(domain==='light')actions=[[s.state==='on'?'turn_off':'turn_on',s.state==='on'?'ÉTEINDRE':'ALLUMER']];
    if(domain==='climate'){const cur=s.attributes?.current_temperature,temp=s.attributes?.temperature;detail=`${s.state}${cur!=null?' · '+cur+'°':''}${temp!=null?' → '+temp+'°':''}`;actions=[[s.state==='off'?'turn_on':'turn_off',s.state==='off'?'ACTIVER':'ARRÊTER']]}
    if(domain==='media_player'){const playing=['playing','paused'].includes(s.state);actions=[[playing?'media_play_pause':'media_play',playing?'PLAY/PAUSE':'LECTURE']];detail=s.attributes?.media_title||s.state}
    if(domain==='cover'){const pos=s.attributes?.current_position;detail=pos!=null?`${s.state} · ${pos}%`:s.state;actions=[['open_cover','▲'],['stop_cover','■'],['close_cover','▼']]}
    if(domain==='switch')actions=[[s.state==='on'?'turn_off':'turn_on',s.state==='on'?'COUPER':'ACTIVER']];
    return {domain,detail,actions};
  };

  Panel.prototype._renderEntityRow=function(s,showCount=false){
    const {domain,detail,actions}=this._actionsForState(s),row=document.createElement('div');row.className='jarvis-entity';const name=s.attributes?.friendly_name||s.entity_id;
    row.innerHTML='<div><strong></strong><small></small></div><div class="jarvis-cover-actions"></div>';row.querySelector('strong').textContent=name;row.querySelector('small').textContent=detail;
    if(showCount){const count=document.createElement('span');count.className='jarvis-fav-count';count.textContent='· '+Number(this._readEntityUsage()[s.entity_id]||0)+' usages';row.querySelector('strong').appendChild(count)}
    const actionBox=row.querySelector('.jarvis-cover-actions');actions.forEach(([action,label])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.classList.toggle('on',s.state==='on'||s.state==='playing'||(domain==='cover'&&s.state==='open'));b.onclick=()=>this._callDomain(domain,action,s.entity_id);actionBox.appendChild(b)});return row;
  };

  Panel.prototype._renderDomain=function(cardId,domain){
    const card=this._core?.shadowRoot?.getElementById(cardId),box=card?.querySelector('.jarvis-domain-list');if(!box)return;
    const states=this._domainStates(domain);box.innerHTML='';
    if(!states.length){box.textContent='Aucune entité '+domain+' disponible.';return}
    states.forEach(s=>box.appendChild(this._renderEntityRow(s)));
  };

  Panel.prototype._renderFavorites=function(){
    const card=this._core?.shadowRoot?.getElementById('jarvisFavoritesCard'),box=card?.querySelector('.jarvis-domain-list');if(!box)return;
    const usage=this._readEntityUsage(),allowed=new Set(['light','climate','media_player','cover','switch']);
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
