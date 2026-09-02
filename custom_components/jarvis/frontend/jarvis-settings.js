/* JARVIS Core V3.0.23 — accordion settings bridge. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisAccordionInstalled){
 const baseRender=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){
  baseRender.call(this);
  const box=this.shadowRoot?.getElementById('cards');if(!box)return;
  box.querySelectorAll('.jarvis-settings-details').forEach(el=>el.remove());
  const config={
   energy:{title:'⚡ Énergie',body:()=>'<div class="jarvis-setting-note">La carte HUD peut rester masquée : les données Énergie restent disponibles ici.</div>'},
   lights:{title:'💡 Éclairage',body:()=>this._domainSettingsHtml?.('light')||''},
   climate:{title:'🌡️ Clim / Chauffage',body:()=>this._domainSettingsHtml?.('climate')||''},
   media:{title:'📺 Médias',body:()=>this._domainSettingsHtml?.('media_player')||''}
  };
  [...box.querySelectorAll('.row')].forEach((row,i)=>{
   const key=this._prefs?.order?.[i],cfg=config[key];if(!cfg)return;
   const details=document.createElement('details');details.className='jarvis-settings-details';details.dataset.card=key;
   const summary=document.createElement('summary');summary.innerHTML=`<span>${cfg.title}</span><b>RÉGLER</b>`;details.appendChild(summary);
   const body=document.createElement('div');body.className='jarvis-settings-body';body.innerHTML=cfg.body();details.appendChild(body);
   row.insertAdjacentElement('afterend',details);
  });
  if(!this.shadowRoot.getElementById('jarvisAccordionStyle')){const s=document.createElement('style');s.id='jarvisAccordionStyle';s.textContent='.jarvis-settings-details{border-bottom:1px solid #00eaff12;padding:2px 0 6px;margin-left:0}.jarvis-settings-details summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;font-size:9px;letter-spacing:1px;color:#8bd6ea;padding:7px 10px 7px 40px;user-select:none}.jarvis-settings-details summary::-webkit-details-marker{display:none}.jarvis-settings-details summary:before{content:"›";font-size:16px;line-height:10px;transition:transform .18s}.jarvis-settings-details[open] summary:before{transform:rotate(90deg)}.jarvis-settings-details summary b{font-size:8px;font-weight:500;opacity:.65}.jarvis-settings-body{padding:6px 10px 8px 40px;font-size:9px}.jarvis-setting-note{opacity:.72;line-height:1.45}.jarvis-setting-entity{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid #00eaff0d}.jarvis-setting-entity small{opacity:.6;text-align:right}.jarvis-setting-empty{opacity:.6;padding:5px 0}';this.shadowRoot.appendChild(s)}
 };
 Panel.prototype._domainSettingsHtml=function(domain){const states=this._domainStates?.(domain)||[];if(!states.length)return '<div class="jarvis-setting-empty">Aucune entité disponible.</div>';return states.map(s=>`<div class="jarvis-setting-entity"><span>${this._escapeSetting(s.attributes?.friendly_name||s.entity_id)}</span><small>${this._escapeSetting(s.state)}</small></div>`).join('')};
 Panel.prototype._escapeSetting=function(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};
 Panel.prototype.__jarvisAccordionInstalled=true;
}
