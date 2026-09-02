/* JARVIS Core V3.0.26 — responsive + user adjustable core sizing. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisCoreSizingInstalled){
 const KEY='jarvis_core_size_v326';
 const clamp=n=>Math.max(55,Math.min(120,Number(n)||100));
 const read=()=>{try{return clamp(localStorage.getItem(KEY)||100)}catch(_){return 100}};
 const save=v=>{try{localStorage.setItem(KEY,String(clamp(v)))}catch(_){}};
 const autoBase=()=>{
  const w=Math.max(320,window.innerWidth||320),h=Math.max(240,window.innerHeight||240),landscape=w>h;
  if(landscape&&h<=650)return Math.max(180,Math.min(w*.58,h-120,430));
  if(!landscape&&w<900)return Math.max(220,Math.min(w*.86,h*.52,500));
  if(w>=900&&h>=700)return Math.max(280,Math.min(w*.42,h*.52,500));
  return Math.max(220,Math.min(w*.78,h*.58,500));
 };
 Panel.prototype._jarvisCoreSize=function(){return read()};
 Panel.prototype._jarvisSetCoreSize=function(value){const v=clamp(value);save(v);this._jarvisApplyCoreSize?.();this._jarvisPersistSetting?.('core_size',v)};
 Panel.prototype._jarvisApplyCoreSize=function(){
  const root=this._core?.shadowRoot;if(!root)return;
  const maxByViewport=Math.max(170,Math.min((window.innerWidth||320)-28,(window.innerHeight||480)-96));
  const px=Math.round(Math.min(maxByViewport,autoBase()*(read()/100)));
  root.host.style.setProperty('--jv-core-final-size',px+'px');
 };
 Panel.prototype._jarvisCoreSizingCss=function(){return `
 :host{--jv-core-final-size:360px}
 .core{width:var(--jv-core-final-size)!important;height:var(--jv-core-final-size)!important;max-width:calc(100vw - 28px)!important;max-height:calc(100vh - 96px)!important;box-sizing:border-box}
 @media(orientation:landscape) and (max-height:650px){.core{margin-top:6px!important;margin-bottom:6px!important;position:relative!important;top:auto!important}}
 @media(max-height:500px){header{margin-bottom:2px!important}.core{max-height:calc(100vh - 96px)!important}}
 `};
 Panel.prototype._jarvisInstallCoreSizing=function(){
  const root=this._core?.shadowRoot;if(!root)return;
  if(!root.getElementById('jarvisCoreSizingStyle')){const s=document.createElement('style');s.id='jarvisCoreSizingStyle';s.textContent=this._jarvisCoreSizingCss();root.appendChild(s)}
  this._jarvisApplyCoreSize();
  if(!this.__jarvisCoreResizeHandler){this.__jarvisCoreResizeHandler=()=>requestAnimationFrame(()=>this._jarvisApplyCoreSize?.());window.addEventListener('resize',this.__jarvisCoreResizeHandler,{passive:true});window.addEventListener('orientationchange',this.__jarvisCoreResizeHandler,{passive:true})}
 };
 const baseRender=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){
  baseRender.call(this);const box=this.shadowRoot?.getElementById('cards');if(!box)return;
  let details=box.querySelector('.jarvis-core-size-settings');
  if(!details){details=document.createElement('details');details.className='jarvis-settings-details jarvis-core-size-settings';details.dataset.card='core-size';details.innerHTML='<summary><span>◉ TAILLE DU CŒUR JARVIS</span><b>AUTO + MANUEL</b></summary><div class="jarvis-settings-body jarvis-core-size-body"></div>';box.appendChild(details)}
  const value=read(),body=details.querySelector('.jarvis-core-size-body');
  body.innerHTML=`<div class="jarvis-setting-note">Auto adapte le cœur à la largeur ET à la hauteur disponibles, notamment en paysage. Le curseur applique ensuite ton échelle personnelle.</div><div class="jv-core-size-row"><input type="range" min="55" max="120" step="5" value="${value}" data-core-size><strong>${value}%</strong></div><div class="jv-core-size-presets"><button type="button" data-size="70">70%</button><button type="button" data-size="85">85%</button><button type="button" data-size="100">100%</button><button type="button" data-size="115">115%</button></div>`;
  const slider=body.querySelector('[data-core-size]'),label=body.querySelector('strong');
  slider.oninput=()=>{label.textContent=slider.value+'%';this._jarvisSetCoreSize(slider.value)};
  body.querySelectorAll('[data-size]').forEach(btn=>btn.onclick=()=>{slider.value=btn.dataset.size;label.textContent=btn.dataset.size+'%';this._jarvisSetCoreSize(btn.dataset.size)});
  if(!this.shadowRoot.getElementById('jarvisCoreSizeSettingsStyle')){const s=document.createElement('style');s.id='jarvisCoreSizeSettingsStyle';s.textContent='.jv-core-size-row{display:grid;grid-template-columns:1fr 54px;gap:10px;align-items:center}.jv-core-size-row input{width:100%}.jv-core-size-row strong{text-align:right}.jv-core-size-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}@media(max-width:520px){.jv-core-size-presets{grid-template-columns:repeat(2,1fr)}}';this.shadowRoot.appendChild(s)}
 };
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallCoreSizing()};
 Panel.prototype.__jarvisCoreSizingInstalled=true;
}
