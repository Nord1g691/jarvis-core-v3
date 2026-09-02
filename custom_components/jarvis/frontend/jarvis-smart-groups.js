/* JARVIS Core V3.0.25 — smart room grouping and card ergonomics. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisSmartGroupsInstalled){
  Panel.prototype._registryValue=function(source,key){
    if(!source||!key)return null;
    if(source instanceof Map)return source.get(key)||null;
    if(Array.isArray(source))return source.find(v=>v?.entity_id===key||v?.id===key)||null;
    return source[key]||null;
  };

  Panel.prototype._inferAreaFromName=function(state){
    const text=String(`${state?.attributes?.friendly_name||''} ${state?.entity_id||''}`).toLowerCase();
    const rules=[
      ['Salle à manger',/salle.?a.?manger|sam\b/],['Salon',/salon|living/],['Cuisine',/cuisine|kitchen/],['Entrée',/entrée|entree|hall/],
      ['Terrasse',/terrasse|patio/],['Jardin',/jardin|garden|potager|laurier|palmier/],['Piscine',/piscine|pool/],['Garage',/garage/],
      ['Chambre',/chambre|bedroom/],['Salle de bain',/salle.?de.?bain|sdb|bathroom/],['Bureau',/bureau|office/],['Buanderie',/buanderie|laundry/]
    ];
    return rules.find(([,rx])=>rx.test(text))?.[0]||'';
  };

  Panel.prototype._entityArea=function(state){
    const hass=this._hass||{};
    const entity=this._registryValue(hass.entities,state?.entity_id);
    const device=this._registryValue(hass.devices,entity?.device_id||state?.attributes?.device_id);
    const areaId=entity?.area_id||device?.area_id||state?.attributes?.area_id||null;
    const area=this._registryValue(hass.areas,areaId);
    const name=area?.name||state?.attributes?.area_name||this._inferAreaFromName(state)||'';
    return String(name||'Sans pièce');
  };

  Panel.prototype._groupDomainStates=function(domain){
    const groups=new Map();
    for(const state of this._domainStates?.(domain)||[]){
      const area=this._entityArea(state);
      if(!groups.has(area))groups.set(area,[]);
      groups.get(area).push(state);
    }
    return [...groups.entries()].sort(([a],[b])=>{if(a==='Sans pièce')return 1;if(b==='Sans pièce')return -1;return a.localeCompare(b,'fr')});
  };

  Panel.prototype._renderDomain=function(cardId,domain){
    const card=this._core?.shadowRoot?.getElementById(cardId),box=card?.querySelector('.jarvis-domain-list');if(!box)return;
    const groups=this._groupDomainStates(domain);box.innerHTML='';
    if(!groups.length){box.textContent='Aucune entité '+domain+' disponible.';return}
    for(const [area,states] of groups){
      const section=document.createElement('section');section.className='jarvis-area-group';
      const title=document.createElement('div');title.className='jarvis-area-title';title.textContent=area;section.appendChild(title);
      for(const s of states){
        const row=document.createElement('div');row.className='jarvis-entity';const name=s.attributes?.friendly_name||s.entity_id;let detail=s.state;let actions=[];
        if(domain==='light')actions=[[s.state==='on'?'turn_off':'turn_on',s.state==='on'?'ÉTEINDRE':'ALLUMER']];
        if(domain==='climate'){const cur=s.attributes?.current_temperature,temp=s.attributes?.temperature;detail=`${s.state}${cur!=null?' · '+cur+'°':''}${temp!=null?' → '+temp+'°':''}`;actions=[[s.state==='off'?'turn_on':'turn_off',s.state==='off'?'ACTIVER':'ARRÊTER']]}
        if(domain==='media_player'){const playing=['playing','paused'].includes(s.state);actions=[[playing?'media_play_pause':'media_play',playing?'PLAY/PAUSE':'LECTURE']];detail=s.attributes?.media_title||s.state}
        if(domain==='cover'){const pos=s.attributes?.current_position;detail=pos!=null?`${s.state} · ${pos}%`:s.state;actions=[['open_cover','▲'],['stop_cover','■'],['close_cover','▼']]}
        if(domain==='switch')actions=[[s.state==='on'?'turn_off':'turn_on',s.state==='on'?'COUPER':'ACTIVER']];
        row.innerHTML='<div><strong></strong><small></small></div><div class="jarvis-cover-actions"></div>';row.querySelector('strong').textContent=name;row.querySelector('small').textContent=detail;const actionBox=row.querySelector('.jarvis-cover-actions');actions.forEach(([action,label])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.classList.toggle('on',s.state==='on'||s.state==='playing'||(domain==='cover'&&s.state==='open'));b.onclick=()=>this._callDomain(domain,action,s.entity_id);actionBox.appendChild(b)});section.appendChild(row);
      }
      box.appendChild(section);
    }
    const root=this._core?.shadowRoot;if(root&&!root.getElementById('jarvisSmartGroupStyle')){const s=document.createElement('style');s.id='jarvisSmartGroupStyle';s.textContent='.jarvis-area-group{display:grid;gap:6px;padding:8px 0 2px}.jarvis-area-group+.jarvis-area-group{border-top:1px solid #00eaff18;margin-top:4px}.jarvis-area-title{font-size:9px;letter-spacing:1.4px;color:#8bd6ea;opacity:.85;text-transform:uppercase;padding:2px 2px 4px}';root.appendChild(s)}
  };

  const baseSettingsHtml=Panel.prototype._domainSettingsHtml;
  if(baseSettingsHtml)Panel.prototype._domainSettingsHtml=function(domain){
    const groups=this._groupDomainStates(domain);if(!groups.length)return '<div class="jarvis-setting-empty">Aucune entité disponible.</div>';
    const originalStates=this._domainStates;
    try{return groups.map(([area,states])=>{this._domainStates=d=>d===domain?states:originalStates.call(this,d);const body=baseSettingsHtml.call(this,domain);return `<div class="jarvis-setting-area"><div class="jarvis-setting-area-title">${this._escapeSetting(area)}</div>${body}</div>`}).join('')}
    finally{this._domainStates=originalStates}
  };

  Panel.prototype._installCardCollapsers=function(){
    const root=this._core?.shadowRoot;if(!root)return;
    for(const card of root.querySelectorAll('.grid>.card')){
      if(card.__jarvisCollapsible)continue;
      const title=card.querySelector(':scope>.title');if(!title)continue;
      const key=card.id||String(title.textContent||'card').trim().toLowerCase().replace(/\s+/g,'-');
      const storageKey='jarvis_card_open_'+key;
      const body=document.createElement('div');body.className='jarvis-card-body';
      [...card.children].filter(el=>el!==title).forEach(el=>body.appendChild(el));card.appendChild(body);
      title.classList.add('jarvis-card-toggle');
      const marker=document.createElement('span');marker.className='jarvis-card-marker';title.appendChild(marker);
      const saved=localStorage.getItem(storageKey);const open=saved===null?false:saved==='1';
      body.hidden=!open;marker.textContent=open?'FERMER':'OUVRIR';card.dataset.jarvisOpen=open?'1':'0';
      title.onclick=()=>{const next=body.hidden;body.hidden=!next;card.dataset.jarvisOpen=next?'1':'0';marker.textContent=next?'FERMER':'OUVRIR';localStorage.setItem(storageKey,next?'1':'0')};
      card.__jarvisCollapsible=true;
    }
    if(!root.getElementById('jarvisCardCollapseStyle')){const s=document.createElement('style');s.id='jarvisCardCollapseStyle';s.textContent='.jarvis-card-toggle{display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:pointer;user-select:none;margin-bottom:0!important}.jarvis-card-marker{font-size:8px;font-weight:400;letter-spacing:1px;opacity:.6}.jarvis-card-body{margin-top:10px}.jarvis-card-body[hidden]{display:none!important}';root.appendChild(s)}
  };

  const baseRenderCards=Panel.prototype._renderCards;
  Panel.prototype._renderCards=function(){
    baseRenderCards.call(this);
    const box=this.shadowRoot?.getElementById('cards');
    if(box){box.querySelectorAll('.row').forEach(row=>row.style.gridTemplateColumns='34px 1fr 34px 34px');}
    if(!this.shadowRoot.getElementById('jarvisSmartSettingsStyle')){const s=document.createElement('style');s.id='jarvisSmartSettingsStyle';s.textContent='.jarvis-setting-area{padding:5px 0}.jarvis-setting-area+.jarvis-setting-area{border-top:1px solid #00eaff18;margin-top:5px}.jarvis-setting-area-title{font-size:8px;letter-spacing:1.3px;color:#8bd6ea;text-transform:uppercase;padding:5px 0 3px}';this.shadowRoot.appendChild(s)}
    queueMicrotask(()=>this._installCardCollapsers());
  };

  const baseBoot=Panel.prototype._bootCore;
  Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._installCardCollapsers()};
  Panel.prototype.__jarvisSmartGroupsInstalled=true;
}
