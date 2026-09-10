/* JARVIS Core V3.0.27 — responsive + user adjustable core sizing + visual polish. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisCoreSizingInstalled){
 const KEY='jarvis_core_size_v326';
 const clamp=n=>Math.max(55,Math.min(120,Number(n)||100));
 const read=()=>{try{return clamp(localStorage.getItem(KEY)||100)}catch(_){return 100}};
 const save=v=>{try{localStorage.setItem(KEY,String(clamp(v)))}catch(_){}};
 const autoBase=()=>{
  const w=Math.max(320,window.innerWidth||320),h=Math.max(240,window.innerHeight||240),landscape=w>h;
  if(landscape&&h<=650)return Math.max(180,Math.min(w*.58,h-150,430));
  if(!landscape&&w<900)return Math.max(220,Math.min(w*.86,h*.49,500));
  if(w>=900&&h>=700)return Math.max(280,Math.min(w*.42,h*.49,500));
  return Math.max(220,Math.min(w*.78,h*.54,500));
 };
 Panel.prototype._jarvisCoreSize=function(){return read()};
 Panel.prototype._jarvisSetCoreSize=function(value){const v=clamp(value);save(v);this._jarvisApplyCoreSize?.();this._jarvisPersistSetting?.('core_size',v)};
 Panel.prototype._jarvisApplyCoreSize=function(){
  const root=this._core?.shadowRoot;if(!root)return;
  const maxByViewport=Math.max(170,Math.min((window.innerWidth||320)-36,(window.innerHeight||480)-145));
  const px=Math.round(Math.min(maxByViewport,autoBase()*(read()/100)));
  root.host.style.setProperty('--jv-core-final-size',px+'px');
 };
 Panel.prototype._jarvisCoreSizingCss=function(){return `
 :host{--jv-core-final-size:360px}
 .core{
   width:var(--jv-core-final-size)!important;
   height:var(--jv-core-final-size)!important;
   max-width:calc(100vw - 36px)!important;
   max-height:calc(100vh - 145px)!important;
   box-sizing:border-box;
   overflow:visible!important;
   margin-top:12px!important;
   margin-bottom:46px!important;
 }
 .ring{box-sizing:border-box!important;transform-origin:center center!important}
 .ring.r1{
   inset:5px!important;
   border:1.5px solid rgba(0,234,255,.58)!important;
   box-shadow:0 0 10px rgba(0,234,255,.16),inset 0 0 8px rgba(0,234,255,.08)!important;
   opacity:1!important;
 }
 .label{
   bottom:-31px!important;
   left:50%!important;
   right:auto!important;
   transform:translateX(-50%)!important;
   width:max-content!important;
   max-width:calc(100vw - 42px)!important;
   white-space:nowrap!important;
   line-height:1.2!important;
   padding:5px 12px!important;
   border-radius:999px!important;
   background:rgba(2,7,17,.78)!important;
   border:1px solid rgba(0,234,255,.18)!important;
   backdrop-filter:blur(6px)!important;
   z-index:20!important;
 }
 .core.state-think::before{
   inset:15%!important;
   opacity:.95!important;
   border:1px solid rgba(255,176,0,.62)!important;
   box-shadow:0 0 18px rgba(255,176,0,.18)!important;
   animation:jvThinkPulse 1.35s ease-in-out infinite!important;
 }
 .core.state-think::after{
   inset:23%!important;
   opacity:.8!important;
   border:1px dashed rgba(255,207,104,.55)!important;
   animation:jvThinkSpin 4.2s linear infinite!important;
 }
 .core.state-think .r1{border-color:rgba(255,176,0,.72)!important;box-shadow:0 0 16px rgba(255,176,0,.22)!important}
 .core.state-think .r2{animation-duration:5.5s!important;border-color:rgba(255,207,104,.68)!important}
 .core.state-think .r3{animation-duration:3.8s!important;border-color:rgba(255,176,0,.48)!important}
 .core.state-think .r4{animation-duration:7s!important;border-color:rgba(255,207,104,.34)!important}
 .core.state-think .r5{animation-duration:2.8s!important;border-color:rgba(255,176,0,.5)!important}
 .core.state-think .glow{
   animation:jvThinkCore 1.05s ease-in-out infinite!important;
   box-shadow:0 0 34px #00eaff,0 0 70px rgba(255,176,0,.38)!important;
 }
 .core.state-think .label{animation:jvThinkLabel 1.4s ease-in-out infinite!important}
 .core.state-think .soul{opacity:1!important;filter:drop-shadow(0 0 7px rgba(255,176,0,.65))}
 @keyframes jvThinkPulse{0%,100%{transform:scale(.94);opacity:.35}50%{transform:scale(1.07);opacity:1}}
 @keyframes jvThinkSpin{from{transform:rotate(0deg) scale(.96)}to{transform:rotate(360deg) scale(.96)}}
 @keyframes jvThinkCore{0%,100%{transform:scale(.96);opacity:.86}50%{transform:scale(1.13);opacity:1}}
 @keyframes jvThinkLabel{0%,100%{letter-spacing:4px;opacity:.72}50%{letter-spacing:5.5px;opacity:1}}
 @media(orientation:landscape) and (max-height:650px){
   .core{margin-top:6px!important;margin-bottom:38px!important;position:relative!important;top:auto!important}
   .label{bottom:-27px!important}
 }
 @media(max-height:500px){
   header{margin-bottom:2px!important}
   .core{max-height:calc(100vh - 132px)!important;margin-bottom:34px!important}
   .label{bottom:-25px!important;font-size:10px!important}
 }
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
