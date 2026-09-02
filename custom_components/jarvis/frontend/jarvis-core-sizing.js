/* JARVIS Core V3.0.26 — responsive + user adjustable core sizing. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisCoreSizingInstalled){
 const KEY='jarvis_core_size_v326';
 const clamp=n=>Math.max(55,Math.min(120,Number(n)||100));
 const read=()=>{try{return clamp(localStorage.getItem(KEY)||100)}catch(_){return 100}};
 const save=v=>{try{localStorage.setItem(KEY,String(clamp(v)))}catch(_){}};
 Panel.prototype._jarvisCoreSize=function(){return read()};
 Panel.prototype._jarvisSetCoreSize=function(value){const v=clamp(value);save(v);this._jarvisApplyCoreSize?.();this._jarvisPersistSetting?.('core_size',v)};
 Panel.prototype._jarvisApplyCoreSize=function(){
  const root=this._core?.shadowRoot;if(!root)return;
  root.host.style.setProperty('--jv-core-user-scale',String(read()/100));
 };
 Panel.prototype._jarvisCoreSizingCss=function(){return `
 :host{--jv-core-user-scale:1;--jv-core-auto-size:min(78vw,58vh,500px)}
 .core{width:calc(var(--jv-core-auto-size) * var(--jv-core-user-scale))!important;height:calc(var(--jv-core-auto-size) * var(--jv-core-user-scale))!important;max-width:calc(100vw - 28px)!important;max-height:calc(100vh - 150px)!important;box-sizing:border-box}
 @media(orientation:landscape) and (max-height:650px){
  :host{--jv-core-auto-size:min(58vw,calc(100vh - 120px),430px)}
  .core{margin-top:6px!important;margin-bottom:6px!important;position:relative!important;top:auto!important}
 }
 @media(orientation:portrait) and (max-width:899px){:host{--jv-core-auto-size:min(86vw,52vh,500px)}}
 @media(min-width:900px) and (min-height:700px){:host{--jv-core-auto-size:min(42vw,52vh,500px)}}
 @media(max-height:500px){:host{--jv-core-auto-size:min(52vw,calc(100vh - 96px),360px)}header{margin-bottom:2px!important}.core{max-height:calc(100vh - 96px)!important}}
 `};
 Panel.prototype._jarvisInstallCoreSizing=function(){
  const root=this._core?.shadowRoot;if(!root)return;
  if(!root.getElementById('jarvisCoreSizingStyle')){const s=document.createElement('style');s.id='jarvisCoreSizingStyle';s.textContent=this._jarvisCoreSizingCss();root.appendChild(s)}
  this._jarvisApplyCoreSize();
 };
 const baseRender=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){
  baseRender.call(this);const box=this.shadowRoot?.getElementById('cards');if(!box)return;
  let details=box.querySelector('.jarvis-core-size-settings');
  if(!details){details=document.createElement('details');details.className='jarvis-settings-details jarvis-core-size-settings';details.dataset.card='core-size';details.innerHTML='<summary><span>◉ TAILLE DU CŒUR JARVIS</span><b>AUTO + MANUEL</b></summary><div class="jarvis-settings-body jarvis-core-size-body"></div>';box.appendChild(details)}
  const value=read(),body=details.querySelector('.jarvis-core-size-body');
  body.innerHTML=`<div class="jarvis-setting-note">Le mode Auto adapte d’abord le cœur à la largeur et à la hauteur disponibles. Ce curseur applique ensuite ton échelle personnelle.</div><div class="jv-core-size-row"><input type="range" min="55" max="120" step="5" value="${value}" data-core-size><strong>${value}%</strong></div><div class="jv-core-size-presets"><button type="button" data-size="70">70%</button><button type="button" data-size="85">85%</button><button type="button" data-size="100">100%</button><button type="button" data-size="115">115%</button></div>`;
  const slider=body.querySelector('[data-core-size]'),label=body.querySelector('strong');
  slider.oninput=()=>{label.textContent=slider.value+'%';this._jarvisSetCoreSize(slider.value)};
  body.querySelectorAll('[data-size]').forEach(btn=>btn.onclick=()=>{slider.value=btn.dataset.size;label.textContent=btn.dataset.size+'%';this._jarvisSetCoreSize(btn.dataset.size)});
  if(!this.shadowRoot.getElementById('jarvisCoreSizeSettingsStyle')){const s=document.createElement('style');s.id='jarvisCoreSizeSettingsStyle';s.textContent='.jv-core-size-row{display:grid;grid-template-columns:1fr 54px;gap:10px;align-items:center}.jv-core-size-row input{width:100%}.jv-core-size-row strong{text-align:right}.jv-core-size-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}@media(max-width:520px){.jv-core-size-presets{grid-template-columns:repeat(2,1fr)}}';this.shadowRoot.appendChild(s)}
 };
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallCoreSizing()};
 Panel.prototype.__jarvisCoreSizingInstalled=true;
}
