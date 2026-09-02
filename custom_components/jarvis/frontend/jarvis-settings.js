/* JARVIS V3.0.23 — accordion settings bridge. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisAccordionInstalled){
 const baseRender=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){
  baseRender.call(this);
  const box=this.shadowRoot?.getElementById('cards');if(!box)return;
  const config={
   energy:{title:'⚡ Énergie',body:()=>'<div class="jarvis-setting-note">Production, consommation, import et export restent disponibles même si la carte est masquée du HUD.</div>'},
   lights:{title:'💡 Éclairage',body:()=>this._domainSettingsHtml?.('light')||''},
   climate:{title:'🌡️ Clim / Chauffage',body:()=>this._domainSettingsHtml?.('climate')||''},
   media:{title:'📺 Médias',body:()=>this._domainSettingsHtml?.('media_player')||''}
  };
  [...box.querySelectorAll('.row')].forEach((row,i)=>{
   const key=this._prefs.order[i],cfg=config[key];if(!cfg)return;
   const details=document.createElement('details');details.className='jarvis-settings-details';
   const summary=document.createElement('summary');summary.textContent='RÉGLER';details.appendChild(summary);
   const body=document.createElement('div');body.className='jarvis-settings-body';body.innerHTML=cfg.body();details.appendChild(body);
   row.insertAdjacentElement('afterend',details);
  });
  if(!this.shadowRoot.getElementById('jarvisAccordionStyle')){const s=document.createElement('style');s.id='jarvisAccordionStyle';s.textContent='.jarvis-settings-details{border-bottom:1px solid #00eaff12;padding:4px 0 8px}.jarvis-settings-details summary{cursor:pointer;font-size:9px;letter-spacing:1px;color:#8bd6ea;padding:5px 40px}.jarvis-settings-body{padding:6px 10px 8px 40px;font-size:9px}.jarvis-setting-note{opacity:.72;line-height:1.45}.jarvis-setting-entity{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid #00eaff0d}.jarvis-setting-entity small{opacity:.6}';this.shadowRoot.appendChild(s)}
 };
 Panel.prototype._domainSettingsHtml=function(domain){const states=this._domainStates?.(domain)||[];if(!states.length)return '<div class="jarvis-setting-note">Aucune entité disponible.</div>';return states.map(s=>`<div class="jarvis-setting-entity"><span>${this._escapeSetting?.(s.attributes?.friendly_name||s.entity_id)||s.entity_id}</span><small>${this._escapeSetting?.(s.state)||s.state}</small></div>`).join('')};
 Panel.prototype._escapeSetting=function(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};
 Panel.prototype.__jarvisAccordionInstalled=true;
}
