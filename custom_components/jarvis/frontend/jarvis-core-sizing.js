/* JARVIS Core V3.0.27 — responsive sizing + cinematic core polish. */
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
 :host{--jv-core-final-size:360px;--jv-core-state:#00eaff;--jv-core-state-soft:rgba(0,234,255,.34)}
 .core{
   width:var(--jv-core-final-size)!important;
   height:var(--jv-core-final-size)!important;
   max-width:calc(100vw - 36px)!important;
   max-height:calc(100vh - 145px)!important;
   box-sizing:border-box;
   overflow:visible!important;
   margin-top:12px!important;
   margin-bottom:46px!important;
   isolation:isolate;
 }
 .ring{box-sizing:border-box!important;transform-origin:center center!important;transition:border-color .3s ease,box-shadow .3s ease,opacity .3s ease}
 .ring.r1{
   inset:5px!important;
   border:1.5px solid color-mix(in srgb,var(--jv-core-state) 58%,transparent)!important;
   box-shadow:0 0 12px var(--jv-core-state-soft),inset 0 0 8px rgba(0,234,255,.08)!important;
   opacity:1!important;
 }
 .jv-energy-wave,.jv-tech-ticks,.jv-boot-scan{
   position:absolute;pointer-events:none;border-radius:50%;inset:-4.5%;z-index:-1
 }
 .jv-energy-wave{
   background:
    radial-gradient(circle,transparent 67%,color-mix(in srgb,var(--jv-core-state) 12%,transparent) 68%,transparent 72%),
    repeating-conic-gradient(from 0deg,color-mix(in srgb,var(--jv-core-state) 42%,transparent) 0 1deg,transparent 1deg 5deg);
   -webkit-mask:radial-gradient(circle,transparent 65%,#000 67% 71%,transparent 73%);
   mask:radial-gradient(circle,transparent 65%,#000 67% 71%,transparent 73%);
   opacity:.34;
   filter:drop-shadow(0 0 6px var(--jv-core-state-soft));
   animation:jvWaveIdle 8s linear infinite;
   transition:opacity .3s ease,filter .3s ease;
 }
 .jv-tech-ticks{
   inset:-1.5%;
   background:repeating-conic-gradient(from -90deg,color-mix(in srgb,var(--jv-core-state) 55%,transparent) 0 .75deg,transparent .75deg 6deg);
   -webkit-mask:radial-gradient(circle,transparent 91%,#000 92% 95%,transparent 96%);
   mask:radial-gradient(circle,transparent 91%,#000 92% 95%,transparent 96%);
   opacity:.5;
   animation:jvTicksDrift 22s linear infinite reverse;
 }
 .jv-boot-scan{
   inset:7%;
   border:1px solid color-mix(in srgb,var(--jv-core-state) 55%,transparent);
   box-shadow:0 0 18px var(--jv-core-state-soft),inset 0 0 18px var(--jv-core-state-soft);
   opacity:0;
 }
 .core.state-listen{--jv-core-state:#39ff88;--jv-core-state-soft:rgba(57,255,136,.34)}
 .core.state-think{--jv-core-state:#ffb000;--jv-core-state-soft:rgba(255,176,0,.38)}
 .core.state-search{--jv-core-state:#00eaff;--jv-core-state-soft:rgba(0,234,255,.38)}
 .core.state-speak{--jv-core-state:#b56cff;--jv-core-state-soft:rgba(181,108,255,.38)}
 .core.state-listen .jv-energy-wave{opacity:.7;animation:jvWaveListen 1.8s ease-in-out infinite}
 .core.state-think .jv-energy-wave{opacity:.95;animation:jvWaveThink .95s linear infinite;filter:drop-shadow(0 0 11px var(--jv-core-state-soft))}
 .core.state-search .jv-energy-wave{opacity:.78;animation:jvWaveSearch 1.4s linear infinite}
 .core.state-speak .jv-energy-wave{opacity:.82;animation:jvWaveSpeak .72s ease-in-out infinite}
 .core.state-think .jv-tech-ticks{opacity:.9;animation-duration:4.8s}
 .core.state-listen .jv-tech-ticks{opacity:.72;animation-duration:10s}
 .core.state-speak .jv-tech-ticks{opacity:.82;animation-duration:7s}
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
   border:1px solid color-mix(in srgb,var(--jv-core-state) 22%,transparent)!important;
   color:var(--jv-core-state)!important;
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
 .core.jv-booting .ring{opacity:0!important;animation:jvBuildRing .62s cubic-bezier(.2,.8,.2,1) forwards!important}
 .core.jv-booting .r5{animation-delay:.12s!important}.core.jv-booting .r4{animation-delay:.3s!important}.core.jv-booting .r3{animation-delay:.48s!important}.core.jv-booting .r2{animation-delay:.66s!important}.core.jv-booting .r1{animation-delay:.84s!important}
 .core.jv-booting .glow{opacity:0;animation:jvBuildCore .8s ease-out .08s forwards!important}
 .core.jv-booting .leds{opacity:0;animation:jvBuildLeds .9s ease-out 1.05s forwards!important}
 .core.jv-booting .jv-tech-ticks{opacity:0;animation:jvBuildTicks .8s ease-out 1.3s forwards!important}
 .core.jv-booting .jv-energy-wave{opacity:0;animation:jvBuildWave 1s ease-out 1.6s forwards!important}
 .core.jv-booting .jv-boot-scan{animation:jvBootScan 2.25s ease-in-out .1s forwards!important}
 @keyframes jvThinkPulse{0%,100%{transform:scale(.94);opacity:.35}50%{transform:scale(1.07);opacity:1}}
 @keyframes jvThinkSpin{from{transform:rotate(0deg) scale(.96)}to{transform:rotate(360deg) scale(.96)}}
 @keyframes jvThinkCore{0%,100%{transform:scale(.96);opacity:.86}50%{transform:scale(1.13);opacity:1}}
 @keyframes jvThinkLabel{0%,100%{letter-spacing:4px;opacity:.72}50%{letter-spacing:5.5px;opacity:1}}
 @keyframes jvWaveIdle{from{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.018)}to{transform:rotate(360deg) scale(1)}}
 @keyframes jvWaveListen{0%,100%{transform:scale(.97);opacity:.45}50%{transform:scale(1.045);opacity:.9}}
 @keyframes jvWaveThink{from{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.035)}to{transform:rotate(360deg) scale(1)}}
 @keyframes jvWaveSearch{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
 @keyframes jvWaveSpeak{0%,100%{transform:scale(.985);filter:drop-shadow(0 0 5px var(--jv-core-state-soft))}50%{transform:scale(1.055);filter:drop-shadow(0 0 13px var(--jv-core-state-soft))}}
 @keyframes jvTicksDrift{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
 @keyframes jvBuildRing{0%{opacity:0;transform:scale(.35) rotate(-35deg)}70%{opacity:.9}100%{opacity:1;transform:scale(1) rotate(0deg)}}
 @keyframes jvBuildCore{0%{opacity:0;transform:scale(.15)}60%{opacity:1;transform:scale(1.16)}100%{opacity:1;transform:scale(1)}}
 @keyframes jvBuildLeds{0%{opacity:0;filter:blur(5px)}100%{opacity:1;filter:none}}
 @keyframes jvBuildTicks{0%{opacity:0;transform:rotate(-60deg) scale(.9)}100%{opacity:.5;transform:rotate(0deg) scale(1)}}
 @keyframes jvBuildWave{0%{opacity:0;transform:scale(.7)}70%{opacity:.62;transform:scale(1.05)}100%{opacity:.34;transform:scale(1)}}
 @keyframes jvBootScan{0%{opacity:0;transform:scale(.2)}35%{opacity:.95}75%{opacity:.42;transform:scale(1.18)}100%{opacity:0;transform:scale(1.36)}}
 @media(orientation:landscape) and (max-height:650px){
   .core{margin-top:6px!important;margin-bottom:38px!important;position:relative!important;top:auto!important}
   .label{bottom:-27px!important}
 }
 @media(max-height:500px){
   header{margin-bottom:2px!important}
   .core{max-height:calc(100vh - 132px)!important;margin-bottom:34px!important}
   .label{bottom:-25px!important;font-size:10px!important}
 }
 @media(prefers-reduced-motion:reduce){
   .jv-energy-wave,.jv-tech-ticks,.core.jv-booting *{animation:none!important}
   .core.jv-booting .ring,.core.jv-booting .glow,.core.jv-booting .leds{opacity:1!important}
 }
 `};
 Panel.prototype._jarvisInstallCoreVisuals=function(){
  const root=this._core?.shadowRoot,core=root?.getElementById('core');if(!root||!core)return;
  if(!core.querySelector('.jv-energy-wave')){const wave=document.createElement('div');wave.className='jv-energy-wave';core.prepend(wave)}
  if(!core.querySelector('.jv-tech-ticks')){const ticks=document.createElement('div');ticks.className='jv-tech-ticks';core.prepend(ticks)}
  if(!core.querySelector('.jv-boot-scan')){const scan=document.createElement('div');scan.className='jv-boot-scan';core.prepend(scan)}
  if(!core.dataset.jarvisBootPlayed){core.dataset.jarvisBootPlayed='1';core.classList.add('jv-booting');setTimeout(()=>core.classList.remove('jv-booting'),2750)}
 };
 Panel.prototype._jarvisInstallCoreSizing=function(){
  const root=this._core?.shadowRoot;if(!root)return;
  if(!root.getElementById('jarvisCoreSizingStyle')){const s=document.createElement('style');s.id='jarvisCoreSizingStyle';s.textContent=this._jarvisCoreSizingCss();root.appendChild(s)}
  this._jarvisApplyCoreSize();
  this._jarvisInstallCoreVisuals();
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
