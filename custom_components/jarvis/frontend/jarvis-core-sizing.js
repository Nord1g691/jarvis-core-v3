/* JARVIS V4.0.0 — responsive Core sizing. */
const Panel=customElements.get('jarvis-panel-v4');
if(Panel&&!Panel.prototype.__jarvisCoreSizingInstalled){
 const KEY='jarvis_core_size_v4';
 const clamp=n=>Math.max(55,Math.min(120,Number(n)||100));
 const read=()=>{try{return clamp(localStorage.getItem(KEY)||100)}catch(_){return 100}};
 const save=v=>{try{localStorage.setItem(KEY,String(clamp(v)))}catch(_){}};
 const autoBase=()=>{const w=Math.max(320,window.innerWidth||320),h=Math.max(240,window.innerHeight||240),landscape=w>h;if(landscape&&h<=650)return Math.max(180,Math.min(w*.58,h-150,430));if(!landscape&&w<900)return Math.max(220,Math.min(w*.78,h*.49,430));if(w>=900&&h>=700)return Math.max(280,Math.min(w*.38,h*.49,430));return Math.max(220,Math.min(w*.72,h*.54,430))};
 Panel.prototype._jarvisCoreSize=function(){return read()};
 Panel.prototype._jarvisSetCoreSize=function(value){const v=clamp(value);save(v);this._jarvisApplyCoreSize?.();this._jarvisPersistSetting?.('core_size',v)};
 Panel.prototype._jarvisApplyCoreSize=function(){const root=this._core?.shadowRoot;if(!root)return;const maxByViewport=Math.max(170,Math.min((window.innerWidth||320)-36,(window.innerHeight||480)-145));const px=Math.round(Math.min(maxByViewport,autoBase()*(read()/100)));root.host.style.setProperty('--jv-core-final-size',px+'px')};
 Panel.prototype._jarvisCoreSizingCss=function(){return `
 :host{--jv-core-final-size:360px;--jv-core-state:#00eaff;--jv-core-state-soft:rgba(0,234,255,.34)}
 .core{width:var(--jv-core-final-size)!important;height:var(--jv-core-final-size)!important;max-width:calc(100vw - 36px)!important;max-height:calc(100vh - 145px)!important;box-sizing:border-box;overflow:visible!important;margin-top:12px!important;margin-bottom:46px!important;isolation:isolate}
 .ring{box-sizing:border-box!important;transform-origin:center center!important;transition:border-color .3s ease,box-shadow .3s ease,opacity .3s ease}
 .label{bottom:-31px!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:max-content!important;max-width:calc(100vw - 42px)!important;white-space:nowrap!important;line-height:1.2!important;padding:5px 12px!important;border-radius:999px!important;background:rgba(2,7,17,.78)!important;border:1px solid color-mix(in srgb,var(--jv-core-state) 22%,transparent)!important;color:var(--jv-core-state)!important;backdrop-filter:blur(6px)!important;z-index:20!important}
 .core.state-listen{--jv-core-state:#39ff88;--jv-core-state-soft:rgba(57,255,136,.34)}
 .core.state-think{--jv-core-state:#ffb000;--jv-core-state-soft:rgba(255,176,0,.38)}
 .core.state-search{--jv-core-state:#00eaff;--jv-core-state-soft:rgba(0,234,255,.38)}
 .core.state-speak{--jv-core-state:#b56cff;--jv-core-state-soft:rgba(181,108,255,.38)}
 .core.state-think .glow{animation:jvThinkCore 1.05s ease-in-out infinite!important;box-shadow:0 0 34px #00eaff,0 0 70px rgba(255,176,0,.38)!important}
 .core.state-think .label{animation:jvThinkLabel 1.4s ease-in-out infinite!important}
 .core.jv-booting .ring{opacity:0!important;animation:jvBuildRing .62s cubic-bezier(.2,.8,.2,1) forwards!important}
 .core.jv-booting .r5{animation-delay:.12s!important}.core.jv-booting .r4{animation-delay:.3s!important}.core.jv-booting .r3{animation-delay:.48s!important}.core.jv-booting .r2{animation-delay:.66s!important}.core.jv-booting .r1{animation-delay:.84s!important}
 .core.jv-booting .glow{opacity:0;animation:jvBuildCore .8s ease-out .08s forwards!important}
 .core.jv-booting .leds{opacity:0;animation:jvBuildLeds .9s ease-out 1.05s forwards!important}
 @keyframes jvThinkCore{0%,100%{transform:scale(.96);opacity:.86}50%{transform:scale(1.13);opacity:1}}
 @keyframes jvThinkLabel{0%,100%{letter-spacing:4px;opacity:.72}50%{letter-spacing:5.5px;opacity:1}}
 @keyframes jvBuildRing{0%{opacity:0;transform:scale(.35) rotate(-35deg)}70%{opacity:.9}100%{opacity:1;transform:scale(1) rotate(0deg)}}
 @keyframes jvBuildCore{0%{opacity:0;transform:scale(.15)}60%{opacity:1;transform:scale(1.16)}100%{opacity:1;transform:scale(1)}}
 @keyframes jvBuildLeds{0%{opacity:0;filter:blur(5px)}100%{opacity:1;filter:none}}
 @media(orientation:landscape) and (max-height:650px){.core{margin-top:6px!important;margin-bottom:38px!important;position:relative!important;top:auto!important}.label{bottom:-27px!important}}
 @media(max-height:500px){header{margin-bottom:2px!important}.core{max-height:calc(100vh - 132px)!important;margin-bottom:34px!important}.label{bottom:-25px!important;font-size:10px!important}}
 @media(prefers-reduced-motion:reduce){.core.jv-booting *{animation:none!important}.core.jv-booting .ring,.core.jv-booting .glow,.core.jv-booting .leds{opacity:1!important}}
 `};
 Panel.prototype._jarvisInstallCoreSizing=function(){const root=this._core?.shadowRoot,core=root?.getElementById('core');if(!root||!core)return;if(!root.getElementById('jarvisCoreSizingStyle')){const s=document.createElement('style');s.id='jarvisCoreSizingStyle';s.textContent=this._jarvisCoreSizingCss();root.appendChild(s)}this._jarvisApplyCoreSize();if(!core.dataset.jarvisBootPlayed){core.dataset.jarvisBootPlayed='1';core.classList.add('jv-booting');setTimeout(()=>core.classList.remove('jv-booting'),2200)}if(!this.__jarvisCoreResizeHandler){this.__jarvisCoreResizeHandler=()=>requestAnimationFrame(()=>this._jarvisApplyCoreSize?.());window.addEventListener('resize',this.__jarvisCoreResizeHandler,{passive:true});window.addEventListener('orientationchange',this.__jarvisCoreResizeHandler,{passive:true})}};
 Panel.prototype._v4RenderCoreSizeSettings=function(){const panel=this.shadowRoot?.getElementById('settingsPanel');if(!panel)return;let section=panel.querySelector('[data-v4-section="core-size"]');if(!section){section=document.createElement('div');section.className='section';section.dataset.v4Section='core-size';section.innerHTML='<div class="title">◉ TAILLE DU CŒUR JARVIS</div><div class="note">La taille s’adapte automatiquement à l’écran, puis applique ton échelle personnelle.</div><div class="jv-core-size-body"></div>';panel.insertBefore(section,panel.querySelector('.actions'));const s=document.createElement('style');s.textContent='.jv-core-size-row{display:grid;grid-template-columns:1fr 54px;gap:10px;align-items:center}.jv-core-size-row input{width:100%}.jv-core-size-row strong{text-align:right}.jv-core-size-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}@media(max-width:520px){.jv-core-size-presets{grid-template-columns:repeat(2,1fr)}}';this.shadowRoot.appendChild(s)}const value=read(),body=section.querySelector('.jv-core-size-body');body.innerHTML=`<div class="jv-core-size-row"><input type="range" min="55" max="120" step="5" value="${value}" data-core-size><strong>${value}%</strong></div><div class="jv-core-size-presets"><button type="button" data-size="70">70%</button><button type="button" data-size="85">85%</button><button type="button" data-size="100">100%</button><button type="button" data-size="115">115%</button></div>`;const slider=body.querySelector('[data-core-size]'),label=body.querySelector('strong');slider.oninput=()=>{label.textContent=slider.value+'%';this._jarvisSetCoreSize(slider.value)};body.querySelectorAll('[data-size]').forEach(btn=>btn.onclick=()=>{slider.value=btn.dataset.size;label.textContent=btn.dataset.size+'%';this._jarvisSetCoreSize(btn.dataset.size)})};
 const baseBoot=Panel.prototype._bootCore;Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallCoreSizing()};
 const baseRenderSettings=Panel.prototype._renderSettings;Panel.prototype._renderSettings=function(){baseRenderSettings.call(this);this._v4RenderCoreSizeSettings()};
 Panel.prototype.__jarvisCoreSizingInstalled=true;
}
