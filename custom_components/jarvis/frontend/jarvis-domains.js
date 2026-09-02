/* JARVIS V3.0.23 — dynamic Home Assistant domain cards. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisDomainsInstalled){
  const baseLoad=Panel.prototype._loadPrefs;
  Panel.prototype._loadPrefs=function(){
    const p=baseLoad.call(this);
    const extra={lights:true,climate:true,media:true};
    p.cards={...extra,...p.cards};
    for(const k of ['lights','climate','media'])if(!p.order.includes(k))p.order.push(k);
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
    map.lights=root.getElementById('jarvisLightsCard');
    map.climate=root.getElementById('jarvisClimateCard');
    map.media=root.getElementById('jarvisMediaCard');
    return map;
  };

  Panel.prototype._installDomainCards=function(){
    const root=this._core?.shadowRoot,grid=root?.querySelector('.grid');
    if(!grid||root.getElementById('jarvisLightsCard'))return;
    const make=(id,title)=>{const card=document.createElement('section');card.className='card jarvis-domain-card';card.id=id;card.innerHTML=`<div class="title">${title}</div><div class="jarvis-domain-list">Chargement…</div>`;grid.appendChild(card);return card};
    make('jarvisLightsCard','💡 ÉCLAIRAGE');
    make('jarvisClimateCard','🌡️ CLIM / CHAUFFAGE');
    make('jarvisMediaCard','📺 MÉDIAS');
    const style=document.createElement('style');style.textContent='.jarvis-domain-list{display:grid;gap:7px;margin-top:8px}.jarvis-entity{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:7px;border:1px solid #00eaff22;border-radius:8px;font-size:10px}.jarvis-entity small{display:block;opacity:.65;margin-top:2px}.jarvis-entity button{min-width:66px;min-height:30px;border:1px solid #00cfff55;border-radius:7px;background:#006b9433;color:#dffaff}.jarvis-entity button.on{border-color:#39ff88;color:#39ff88}';root.appendChild(style);
  };

  Panel.prototype._domainStates=function(domain){return Object.values(this._hass?.states||{}).filter(s=>s.entity_id?.startsWith(domain+'.')).sort((a,b)=>String(a.attributes?.friendly_name||a.entity_id).localeCompare(String(b.attributes?.friendly_name||b.entity_id),'fr'))};
  Panel.prototype._callDomain=async function(domain,service,entity_id,data={}){try{await this._hass.callService(domain,service,{entity_id,...data});this._log(`✓ ${domain}.${service} · ${entity_id}`)}catch(e){this._log(`✗ ${domain}.${service}: ${e.message}`)}};
  Panel.prototype._renderDomain=function(cardId,domain){
    const card=this._core?.shadowRoot?.getElementById(cardId),box=card?.querySelector('.jarvis-domain-list');if(!box)return;
    const states=this._domainStates(domain);box.innerHTML='';
    if(!states.length){box.textContent='Aucune entité '+domain+' disponible.';return}
    states.forEach(s=>{const row=document.createElement('div');row.className='jarvis-entity';const name=s.attributes?.friendly_name||s.entity_id;let detail=s.state;let action='';let label='';
      if(domain==='light'){action=s.state==='on'?'turn_off':'turn_on';label=s.state==='on'?'ÉTEINDRE':'ALLUMER'}
      if(domain==='climate'){const cur=s.attributes?.current_temperature,temp=s.attributes?.temperature;detail=`${s.state}${cur!=null?' · '+cur+'°':''}${temp!=null?' → '+temp+'°':''}`;action=s.state==='off'?'turn_on':'turn_off';label=s.state==='off'?'ACTIVER':'ARRÊTER'}
      if(domain==='media_player'){const playing=['playing','paused'].includes(s.state);action=playing?'media_play_pause':'media_play';label=playing?'PLAY/PAUSE':'LECTURE';detail=s.attributes?.media_title||s.state}
      row.innerHTML='<div><strong></strong><small></small></div><button type="button"></button>';row.querySelector('strong').textContent=name;row.querySelector('small').textContent=detail;const b=row.querySelector('button');b.textContent=label;b.classList.toggle('on',s.state==='on'||s.state==='playing');b.onclick=()=>this._callDomain(domain,action,s.entity_id);box.appendChild(row)});
  };
  Panel.prototype._refreshDomainCards=function(){this._renderDomain('jarvisLightsCard','light');this._renderDomain('jarvisClimateCard','climate');this._renderDomain('jarvisMediaCard','media_player')};

  const baseSet=Object.getOwnPropertyDescriptor(Panel.prototype,'hass')?.set;
  if(baseSet)Object.defineProperty(Panel.prototype,'hass',{configurable:true,get:Object.getOwnPropertyDescriptor(Panel.prototype,'hass')?.get,set:function(v){baseSet.call(this,v);if(this._core?.shadowRoot?.getElementById('jarvisLightsCard'))this._refreshDomainCards()}});

  const baseRender=Panel.prototype._renderCards;
  Panel.prototype._renderCards=function(){baseRender.call(this);const labels={lights:'💡 Éclairage',climate:'🌡️ Clim / Chauffage',media:'📺 Médias'};const box=this.shadowRoot?.getElementById('cards');if(!box)return;[...box.querySelectorAll('.row')].forEach((r,i)=>{const k=this._prefs.order[i];if(labels[k])r.querySelector('span').textContent=labels[k]})};
  Panel.prototype.__jarvisDomainsInstalled=true;
}
