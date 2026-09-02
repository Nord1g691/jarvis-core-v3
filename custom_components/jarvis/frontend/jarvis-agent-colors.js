/* JARVIS Core V3.0.26 — manual pipeline colors and long-search visual state. */
const Panel=customElements.get('jarvis-panel');
const COLOR_KEY='jarvis_pipeline_colors_v326';
const norm=v=>String(v||'').trim().toLowerCase();
const readColors=()=>{try{return JSON.parse(localStorage.getItem(COLOR_KEY)||'{}')}catch(_){return{}}};
const saveColors=v=>{try{localStorage.setItem(COLOR_KEY,JSON.stringify(v))}catch(_){}};
const shades=hex=>{const h=String(hex||'#00eaff').replace('#','');const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);if(!Number.isFinite(n))return{color:'#00eaff',soft:'#00eaff99',faint:'#00eaff44',text:'#dffaff'};const r=(n>>16)&255,g=(n>>8)&255,b=n&255;const text=(r*299+g*587+b*114)/1000>170?'#061018':'#f4fdff';return{color:'#'+h.padStart(6,'0'),soft:'#'+h.padStart(6,'0')+'99',faint:'#'+h.padStart(6,'0')+'44',text}};

if(Panel&&!Panel.prototype.__jarvisManualAgentColorsInstalled){
 const baseTheme=Panel.prototype._jarvisThemeForAgent;
 Panel.prototype._jarvisThemeForAgent=function(label){
  const colors=readColors(),key=norm(label),custom=colors[key];
  const base=baseTheme?baseTheme.call(this,label):{name:'JARVIS',color:'#00eaff',soft:'#00eaff99',faint:'#00eaff44',text:'#dffaff',voice:0,rate:.92,pitch:.88};
  if(!custom)return base;
  return {...base,...shades(custom),name:base.name||String(label||'JARVIS').toUpperCase()};
 };

 Panel.prototype._jarvisPipelineColorRows=function(){
  const select=this._core?.shadowRoot?.getElementById('pipelineSelect');
  if(!select)return '<div class="jarvis-setting-empty">Les pipelines apparaîtront ici après chargement du HUD.</div>';
  const colors=readColors(),options=[...select.options].filter(o=>o.value||o.textContent?.trim());
  if(!options.length)return '<div class="jarvis-setting-empty">Aucun pipeline détecté.</div>';
  return options.map(o=>{const value=String(o.value||'').trim(),label=String(o.textContent||value||'Pipeline').trim(),key=norm(value||label);const fallback=this._jarvisThemeForAgent(label)?.color||'#00eaff',color=colors[key]||fallback;return `<div class="jarvis-pipeline-color-row"><span>${this._escapeSetting?.(label)||label}</span><input type="color" value="${color}" data-pipeline-color="${this._escapeSetting?.(key)||key}" data-pipeline-label="${this._escapeSetting?.(label)||label}"><button type="button" data-pipeline-reset="${this._escapeSetting?.(key)||key}" data-pipeline-label="${this._escapeSetting?.(label)||label}">AUTO</button></div>`}).join('');
 };

 const baseRender=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){
  baseRender.call(this);
  const box=this.shadowRoot?.getElementById('cards');if(!box||box.querySelector('.jarvis-agent-color-settings'))return;
  const details=document.createElement('details');details.className='jarvis-settings-details jarvis-agent-color-settings';details.dataset.card='agent-colors';
  const summary=document.createElement('summary');summary.innerHTML='<span>🎨 COULEURS AGENTS / PIPELINES</span><b>RÉGLER</b>';details.appendChild(summary);
  const body=document.createElement('div');body.className='jarvis-settings-body';body.innerHTML='<div class="jarvis-setting-note">Choisis la couleur de repos de chaque pipeline. Les couleurs d’état Écoute / Réflexion / Réponse gardent la priorité pendant une conversation.</div>'+this._jarvisPipelineColorRows();details.appendChild(body);box.appendChild(details);
  box.querySelectorAll('[data-pipeline-color]').forEach(input=>input.oninput=()=>{const colors=readColors(),key=norm(input.dataset.pipelineColor),label=input.dataset.pipelineLabel||key;colors[key]=input.value;colors[norm(label)]=input.value;saveColors(colors);this._jarvisApplyAgentTheme?.()});
  box.querySelectorAll('[data-pipeline-reset]').forEach(btn=>btn.onclick=()=>{const colors=readColors(),key=norm(btn.dataset.pipelineReset),label=norm(btn.dataset.pipelineLabel);delete colors[key];delete colors[label];saveColors(colors);this._jarvisApplyAgentTheme?.();this._renderCards()});
  if(!this.shadowRoot.getElementById('jarvisPipelineColorStyle')){const s=document.createElement('style');s.id='jarvisPipelineColorStyle';s.textContent='.jarvis-pipeline-color-row{display:grid;grid-template-columns:1fr 46px 52px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #00eaff12}.jarvis-pipeline-color-row input[type=color]{width:42px;height:30px;padding:0;border:1px solid #00cfff55;border-radius:6px;background:transparent}.jarvis-pipeline-color-row button{min-height:30px;margin:0;font-size:8px}';this.shadowRoot.appendChild(s)}
 };

 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._renderCards()};
 Panel.prototype.__jarvisManualAgentColorsInstalled=true;
}

customElements.whenDefined('jarvis-core-hud').then(()=>{
 const Core=customElements.get('jarvis-core-hud');if(!Core||Core.prototype.__jarvisLongSearchInstalled)return;
 const baseSetState=Core.prototype.setState;
 if(baseSetState)Core.prototype.setState=function(label,color){
  const text=String(label||'');
  if(this.__jarvisLongSearchTimer){clearTimeout(this.__jarvisLongSearchTimer);this.__jarvisLongSearchTimer=null}
  const result=baseSetState.call(this,label,color),core=this.shadowRoot?.getElementById('core');
  if(core)core.classList.remove('jarvis-long-search');
  if(/RÉFLÉCHIT|REFLECHIT/i.test(text))this.__jarvisLongSearchTimer=setTimeout(()=>{if(this.processing&&core){core.classList.add('jarvis-long-search');this.log?.('🔎 Recherche approfondie…')}},2500);
  return result;
 };
 const baseRender=Core.prototype.render;
 Core.prototype.render=function(){const r=baseRender.call(this);const root=this.shadowRoot;if(root&&!root.getElementById('jarvisLongSearchStyle')){const s=document.createElement('style');s.id='jarvisLongSearchStyle';s.textContent='.core.jarvis-long-search .r1{animation-duration:5s!important}.core.jarvis-long-search .r2{animation-duration:3.6s!important}.core.jarvis-long-search .r3{animation-duration:6.5s!important}.core.jarvis-long-search .r4{animation-duration:2.8s!important}.core.jarvis-long-search .glow{animation:jarvisDeepSearch 1.15s ease-in-out infinite!important}.core.jarvis-long-search .soul{opacity:1!important}.core.jarvis-long-search .soul i{background:#ffb000!important;box-shadow:0 0 7px #ffb000,0 0 16px #ffb00077!important}@keyframes jarvisDeepSearch{0%,100%{transform:scale(.94);filter:saturate(1.2) brightness(.95)}50%{transform:scale(1.16);filter:saturate(1.7) brightness(1.22)}}';root.appendChild(s)}return r};
 Core.prototype.__jarvisLongSearchInstalled=true;
});
