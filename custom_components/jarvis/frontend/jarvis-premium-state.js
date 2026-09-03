/* JARVIS Premium state bridge — semantic state classes for cinematic visuals. */
customElements.whenDefined('jarvis-core-hud').then(()=>{
 const Core=customElements.get('jarvis-core-hud');
 if(!Core||Core.prototype.__jarvisPremiumStateInstalled)return;
 const base=Core.prototype.setState;
 Core.prototype.setState=function(text,color='#00eaff'){
  const out=typeof base==='function'?base.call(this,text,color):undefined;
  const core=this.shadowRoot?.getElementById('core');if(!core)return out;
  core.classList.remove('state-error','state-idle','state-offline');
  const t=String(text||'').toUpperCase();
  if(t.includes('HORS LIGNE'))core.classList.add('state-offline');
  else if(t.includes('ERREUR'))core.classList.add('state-error');
  else if(!core.classList.contains('state-listen')&&!core.classList.contains('state-think')&&!core.classList.contains('state-search')&&!core.classList.contains('state-speak'))core.classList.add('state-idle');
  core.dataset.jarvisState=t.includes('ÉCOUTE')?'listen':t.includes('RÉFLÉCHIT')?'think':t.includes('RECHERCHE')?'search':t.includes('PARLE')?'speak':t.includes('ERREUR')?'error':t.includes('HORS LIGNE')?'offline':'idle';
  return out;
 };
 Core.prototype.__jarvisPremiumStateInstalled=true;
});
