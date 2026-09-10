/* JARVIS Core V3.0.29 — UI coherence, state emphasis and complete outer frame. */
const Panel=customElements.get('jarvis-panel-v3029')||customElements.get('jarvis-panel-v3027')||customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisUiFixes3029){
 const stateInfo=core=>{
   if(core?.classList.contains('state-think'))return {key:'think',color:'#ffb000',soft:'rgba(255,176,0,.34)'};
   if(core?.classList.contains('state-listen'))return {key:'listen',color:'#39ff88',soft:'rgba(57,255,136,.30)'};
   if(core?.classList.contains('state-search'))return {key:'search',color:'#00eaff',soft:'rgba(0,234,255,.30)'};
   if(core?.classList.contains('state-speak'))return {key:'speak',color:'#b56cff',soft:'rgba(181,108,255,.32)'};
   return {key:'ready',color:'#00eaff',soft:'rgba(0,234,255,.24)'};
 };
 Panel.prototype._jarvisUiFixes3029=function(){
   const panelRoot=this.shadowRoot;
   if(panelRoot&&!panelRoot.getElementById('jarvisUi3029PanelStyle')){
     const s=document.createElement('style');s.id='jarvisUi3029PanelStyle';s.textContent=`
      #settingsPanel{padding:16px!important;border-radius:16px!important;background:linear-gradient(180deg,#041827f7,#020b14fa)!important;box-shadow:0 18px 55px #0009,0 0 0 1px #00eaff12 inset!important}
      #settingsPanel>.title{font-size:12px!important;letter-spacing:2.4px!important;margin:0 0 5px!important;color:#dffaff!important}
      #settingsPanel>.note{margin:0 0 14px!important;padding:9px 10px!important;border:1px solid #00eaff1f!important;border-radius:9px!important;background:#00131f80!important;color:#7eb7c9!important;line-height:1.45!important}
      #settingsPanel .section{margin-top:10px!important;padding:12px!important;border:1px solid #00eaff22!important;border-radius:12px!important;background:#031322a6!important}
      #settingsPanel .section>.title{margin:0 0 8px!important;padding-bottom:8px!important;border-bottom:1px solid #00eaff18!important;color:#8fe9ff!important;font-size:9px!important;letter-spacing:1.8px!important}
      #settingsPanel .row,#settingsPanel .system-tool{min-height:42px!important;padding:6px 2px!important;border-bottom:1px solid #00eaff10!important}
      #settingsPanel button{border-radius:9px!important;background:#052236cc!important;border-color:#00d9ff35!important;box-shadow:none!important}
      #settingsPanel button:hover,#settingsPanel button:active{background:#07304acc!important;border-color:#00eaff70!important}
      #settingsPanel .actions{position:sticky!important;bottom:-14px!important;margin:14px -4px -4px!important;padding:10px 4px 4px!important;background:linear-gradient(180deg,transparent,#020b14 30%)!important}
      #settingsPanel .actions button{min-height:40px!important;font-weight:700!important;letter-spacing:1px!important}
      #settingsPanel details.jarvis-settings-details{margin:8px 0!important;border:1px solid #00eaff20!important;border-radius:10px!important;background:#020d17b8!important;overflow:hidden!important}
      #settingsPanel details.jarvis-settings-details>summary{min-height:42px!important;padding:0 10px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;list-style:none!important;color:#bdefff!important}
      #settingsPanel details.jarvis-settings-details>summary::-webkit-details-marker{display:none!important}
      #settingsPanel .jarvis-settings-body{padding:10px!important;border-top:1px solid #00eaff16!important}
     `;panelRoot.appendChild(s);
   }
   const root=this._core?.shadowRoot,core=root?.getElementById('core');if(!root||!core)return;
   if(!root.getElementById('jarvisUi3029CoreStyle')){
     const s=document.createElement('style');s.id='jarvisUi3029CoreStyle';s.textContent=`
      .jv-outer-frame{position:absolute;inset:-6.2%;border:1.5px solid var(--jv-core-state,#00eaff);border-radius:50%;pointer-events:none;z-index:0;opacity:.72;box-shadow:0 0 12px var(--jv-core-state-soft,rgba(0,234,255,.28)),inset 0 0 10px #00eaff0c;transition:border-color .2s,box-shadow .2s,opacity .2s}
      .core.state-think .jv-outer-frame{border-color:#ffb000;opacity:1;box-shadow:0 0 18px rgba(255,176,0,.48),inset 0 0 12px rgba(255,176,0,.12);animation:jvOuterThink .9s ease-in-out infinite}
      .core.state-listen .jv-outer-frame{border-color:#39ff88;opacity:.92;box-shadow:0 0 16px rgba(57,255,136,.4)}
      .core.state-search .jv-outer-frame{border-color:#00eaff;opacity:.95;box-shadow:0 0 18px rgba(0,234,255,.42)}
      .core.state-speak .jv-outer-frame{border-color:#b56cff;opacity:.95;box-shadow:0 0 18px rgba(181,108,255,.46)}
      #stateDock{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;box-sizing:border-box!important;text-align:center!important}
      #stateDock .label{position:static!important;left:auto!important;right:auto!important;bottom:auto!important;transform:none!important;width:auto!important;max-width:calc(100vw - 42px)!important;margin:0 auto!important;text-align:center!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:28px!important;padding:5px 13px!important;border-radius:999px!important;background:rgba(2,7,17,.84)!important;border:1px solid currentColor!important;color:#00eaff!important;box-shadow:0 0 10px rgba(0,234,255,.14)!important;transition:color .2s,border-color .2s,box-shadow .2s,background .2s!important}
      #stateDock[data-state="think"] .label{color:#ffb000!important;background:rgba(35,22,0,.88)!important;box-shadow:0 0 16px rgba(255,176,0,.34)!important;animation:jvStateThink .9s ease-in-out infinite!important}
      #stateDock[data-state="listen"] .label{color:#39ff88!important;box-shadow:0 0 13px rgba(57,255,136,.27)!important}
      #stateDock[data-state="search"] .label{color:#00eaff!important;box-shadow:0 0 15px rgba(0,234,255,.30)!important}
      #stateDock[data-state="speak"] .label{color:#b56cff!important;box-shadow:0 0 15px rgba(181,108,255,.31)!important}
      @keyframes jvOuterThink{0%,100%{transform:scale(.992);opacity:.7}50%{transform:scale(1.012);opacity:1}}
      @keyframes jvStateThink{0%,100%{opacity:.72;letter-spacing:4px}50%{opacity:1;letter-spacing:5.2px}}
     `;root.appendChild(s);
   }
   if(!core.querySelector('.jv-outer-frame')){const f=document.createElement('div');f.className='jv-outer-frame';core.prepend(f)}
   const sync=()=>{
     const info=stateInfo(core),dock=root.getElementById('stateDock');
     if(dock)dock.dataset.state=info.key;
     core.style.setProperty('--jv-core-state',info.color);
     core.style.setProperty('--jv-core-state-soft',info.soft);
   };
   sync();
   if(!core.__jarvisStateObserver3029){const o=new MutationObserver(sync);o.observe(core,{attributes:true,attributeFilter:['class']});core.__jarvisStateObserver3029=o}
   requestAnimationFrame(sync);
   setTimeout(sync,80);
 };
 const render=Panel.prototype._render;
 Panel.prototype._render=function(){render.call(this);this._jarvisUiFixes3029?.()};
 const renderCards=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){renderCards.call(this);this._jarvisUiFixes3029?.()};
 const boot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await boot.call(this);this._jarvisUiFixes3029?.();requestAnimationFrame(()=>this._jarvisUiFixes3029?.())};
 Panel.prototype.__jarvisUiFixes3029=true;
}
