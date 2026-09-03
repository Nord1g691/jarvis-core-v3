/* JARVIS Core V3.0.26 — unified HUD state, card ordering and mobile orientation. */
await import('/jarvis_core/jarvis-premium-core.js?v=3.0.26');
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisUiCoherenceInstalled){
 const EXTRA_CARDS={
  health:{id:'jarvisHealthCard',label:'🩺 Health Score'},
  quick:{id:'jarvisQuickConsumersCard',label:'⚡ Gros consommateurs'},
  suggestions:{id:'jarvisSuggestionsCard',label:'💡 Propositions JARVIS'},
 };
 const baseLoad=Panel.prototype._loadPrefs;
 Panel.prototype._loadPrefs=function(){
  const p=baseLoad.call(this);
  p.cards={...(p.cards||{})};
  p.order=Array.isArray(p.order)?p.order.slice():[];
  for(const k of Object.keys(EXTRA_CARDS)){
   if(!(k in p.cards))p.cards[k]=true;
   if(!p.order.includes(k))p.order.push(k);
  }
  return p;
 };
 const baseMap=Panel.prototype._cardMap;
 Panel.prototype._cardMap=function(){
  const map=baseMap.call(this),root=this._core?.shadowRoot;
  if(!root)return map;
  for(const [k,cfg] of Object.entries(EXTRA_CARDS))map[k]=root.getElementById(cfg.id);
  return map;
 };
 const baseRenderCards=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){
  baseRenderCards.call(this);
  const box=this.shadowRoot?.getElementById('cards');if(!box)return;
  const rows=[...box.querySelectorAll(':scope>.row')];
  rows.forEach((row,i)=>{const k=this._prefs?.order?.[i];if(EXTRA_CARDS[k]){const span=row.querySelector('span');if(span)span.textContent=EXTRA_CARDS[k].label}});
 };
 Panel.prototype._jarvisConnectionAlive=function(){
  if(navigator.onLine===false)return false;
  if(!this._hass)return false;
  const c=this._hass.connection;
  if(c&&c.connected===false)return false;
  return true;
 };
 Panel.prototype._jarvisApplyConnectivity=function(){
  const core=this._core,root=core?.shadowRoot;if(!core||!root)return;
  const online=this._jarvisConnectionAlive();
  const app=root.querySelector('.app'),state=root.getElementById('state');
  app?.classList.toggle('jarvis-offline',!online);
  core.classList.toggle('jv-offline',!online);
  core.toggleAttribute('data-jarvis-offline',!online);
  if(!online){
   if(state?.textContent!=='HORS LIGNE')core.setState?.('HORS LIGNE','#ff4050');
   return;
  }
  if(state?.textContent==='HORS LIGNE'||state?.textContent==='INITIALISATION')core.setState?.('OPÉRATIONNEL',this._jarvisActiveTheme?.color||'#00eaff');
 };
 Panel.prototype._jarvisInstallCoherentHud=function(){
  const root=this._core?.shadowRoot,core=root?.getElementById('core'),state=root?.getElementById('state');if(!root||!core)return;
  const topStatus=root.getElementById('status');if(topStatus)topStatus.style.display='none';
  let dock=root.getElementById('stateDock');
  if(!dock&&state){dock=document.createElement('div');dock.id='stateDock';core.insertAdjacentElement('afterend',dock);dock.appendChild(state)}
  if(state){state.style.position='static';state.style.inset='auto';state.style.display='inline-block';state.style.pointerEvents='none'}
  if(!root.getElementById('jarvisUiCoherenceStyle')){
   const s=document.createElement('style');s.id='jarvisUiCoherenceStyle';s.textContent=`
    header .status{display:none!important}
    #stateDock{position:relative!important;inset:auto!important;display:block!important;width:100%!important;min-height:22px!important;margin:-2px auto 8px!important;text-align:center!important;letter-spacing:4px!important;font-size:12px!important;z-index:20!important}
    #state{position:static!important;inset:auto!important;display:inline-block!important;width:auto!important;transform:none!important;margin:0!important;line-height:22px!important;white-space:nowrap!important}
    #agentRouteDock{position:relative!important;inset:auto!important;display:block!important;width:100%!important;margin:0 auto 10px!important;text-align:center!important;transform:none!important}
    .jarvis-health-ring-track{border:1.5px solid var(--jv-health-color)!important;box-shadow:0 0 9px color-mix(in srgb,var(--jv-health-color) 45%,transparent),0 0 18px #0008 inset!important}
    .jarvis-health-ring-progress,.jarvis-health-ring-dot{display:none!important}
    .jarvis-offline .glow{filter:grayscale(.75);opacity:.45!important;animation:none!important}
    .jarvis-offline .ring,.jarvis-offline .orbit,.jarvis-offline .satellite,.jarvis-offline .led{animation-play-state:paused!important;opacity:.18!important}
    @media (orientation:portrait) and (max-width:760px){
      .app{display:block!important;padding-left:10px!important;padding-right:10px!important}
      .core{margin:10px auto 4px!important}
      #stateDock,#agentRouteDock{grid-area:auto!important}
      .jarvis-cards-drawer{width:100%!important;max-width:100%!important;margin:8px auto 18px!important}
    }
    @media (orientation:landscape) and (max-height:650px){
      .app{display:grid!important;grid-template-columns:minmax(210px,42vw) minmax(0,1fr)!important;grid-template-areas:'header cards' 'core cards' 'state cards' 'route cards'!important;column-gap:14px!important;align-items:start!important;padding:8px 10px 16px!important}
      header{grid-area:header!important;align-self:end!important}
      header .logo{font-size:24px!important;letter-spacing:7px!important}.sub{font-size:7px!important;margin:4px!important}
      .core{grid-area:core!important;margin:2px auto!important}
      #stateDock{grid-area:state!important;margin:0 auto 2px!important}
      #agentRouteDock{grid-area:route!important;margin:0 auto!important}
      .jarvis-cards-drawer{grid-area:cards!important;width:100%!important;max-width:none!important;max-height:calc(100vh - 18px)!important;margin:0!important;overflow:auto!important}
      .jarvis-cards-drawer>.grid{grid-template-columns:1fr!important}
    }
   `;root.appendChild(s)
  }
  this._jarvisApplyConnectivity();
  if(this.__jarvisConnectivityTimer)clearInterval(this.__jarvisConnectivityTimer);
  this.__jarvisConnectivityTimer=setInterval(()=>{if(!this.isConnected){clearInterval(this.__jarvisConnectivityTimer);return}this._jarvisApplyConnectivity()},2000);
 };
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){
  await baseBoot.call(this);
  for(const k of Object.keys(EXTRA_CARDS)){
   if(!(k in this._prefs.cards))this._prefs.cards[k]=true;
   if(!this._prefs.order.includes(k))this._prefs.order.push(k);
  }
  this._applyCards?.();
  this._renderCards?.();
  this._jarvisInstallCoherentHud();
 };
 Panel.prototype.__jarvisUiCoherenceInstalled=true;
}
