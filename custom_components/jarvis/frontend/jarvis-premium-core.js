/* JARVIS Premium Cinematic Core — independent 3D deployment layer. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisPremiumCoreInstalled){
 const KEY='jarvis_visual_mode_v326';
 const PREMIUM={key:'premium',name:'Premium Cinematic',tag:'ULTRA',desc:'Core 3D cinématique : construction progressive, profondeur, iris, champ énergétique et réactions par état.'};
 const active=()=>localStorage.getItem(KEY)==='premium';
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

 const baseModes=Panel.prototype._jarvisVisualModes;
 Panel.prototype._jarvisVisualModes=function(){const list=typeof baseModes==='function'?baseModes.call(this):[];return list.some(x=>x.key==='premium')?list:[...list,{...PREMIUM}]};
 const baseMode=Panel.prototype._jarvisVisualMode;
 Panel.prototype._jarvisVisualMode=function(){return active()?'premium':(typeof baseMode==='function'?baseMode.call(this):'classic')};
 const baseSet=Panel.prototype._jarvisSetVisualMode;
 Panel.prototype._jarvisSetVisualMode=function(key){
  if(key==='premium'){
   localStorage.setItem(KEY,'premium');
   this._jarvisApplyVisualMode?.();
   this._jarvisSyncVisualPicker?.();
   this._jarvisPremiumActivate?.(true);
   return;
  }
  const out=typeof baseSet==='function'?baseSet.call(this,key):undefined;
  this._jarvisPremiumActivate?.(false);
  return out;
 };
 const basePreview=Panel.prototype._jarvisPreviewHtml;
 Panel.prototype._jarvisPreviewHtml=function(current){
  const html=typeof basePreview==='function'?basePreview.call(this,current):'';
  return html+`<button type="button" class="jv-theme-card ${current==='premium'?'active':''}" data-jv-theme="premium"><span class="jv-mini jv-mini-premium"><i></i><i></i><i></i></span><strong>${esc(PREMIUM.name)}</strong><small>${esc(PREMIUM.tag)}</small><em>${esc(PREMIUM.desc)}</em></button>`;
 };
 const baseSync=Panel.prototype._jarvisSyncVisualPicker;
 Panel.prototype._jarvisSyncVisualPicker=function(){if(typeof baseSync==='function')baseSync.call(this);const on=active();this._core?.shadowRoot?.querySelectorAll('[data-jv-quick-theme="premium"]').forEach(b=>b.classList.toggle('active',on));this.shadowRoot?.querySelectorAll('[data-jv-theme="premium"]').forEach(b=>b.classList.toggle('active',on));};
 const basePicker=Panel.prototype._jarvisInstallCornerVisualPicker;
 Panel.prototype._jarvisInstallCornerVisualPicker=function(){
  if(typeof basePicker==='function')basePicker.call(this);
  const root=this._core?.shadowRoot,pop=root?.getElementById('jarvisVisualPopover');if(!root||!pop||pop.querySelector('[data-jv-quick-theme="premium"]'))return;
  const b=document.createElement('button');b.type='button';b.dataset.jvQuickTheme='premium';b.innerHTML='<span class="jv-dot jv-dot-premium"></span>Premium Cinematic';b.onclick=()=>{this._jarvisSetVisualMode('premium');pop.hidden=true};pop.appendChild(b);
  const st=root.getElementById('jarvisVisualPickerStyle');if(st)st.textContent+=' .jv-dot-premium{background:#fff;box-shadow:0 0 5px #fff,0 0 12px var(--jarvis-agent-color,#00eaff)}';
  this._jarvisSyncVisualPicker();
 };

 Panel.prototype._jarvisPremiumMarkup=function(){
  const ticks=Array.from({length:48},(_,i)=>`<i class="jvp-tick" style="--i:${i}"></i>`).join('');
  const sparks=Array.from({length:36},(_,i)=>`<i class="jvp-spark" style="--i:${i};--d:${(i%9)*.11}s"></i>`).join('');
  const blades=Array.from({length:12},(_,i)=>`<i class="jvp-blade" style="--i:${i}"></i>`).join('');
  return `<div class="jv-premium-stage" aria-hidden="true">
   <div class="jvp-space"></div><div class="jvp-aura"></div><div class="jvp-scan"></div>
   <div class="jvp-mesh jvp-mesh-a"></div><div class="jvp-mesh jvp-mesh-b"></div><div class="jvp-mesh jvp-mesh-c"></div>
   <div class="jvp-ring jvp-r1">${ticks}</div><div class="jvp-ring jvp-r2"></div><div class="jvp-ring jvp-r3"></div><div class="jvp-ring jvp-r4"></div><div class="jvp-ring jvp-r5"></div>
   <div class="jvp-arc jvp-arc-a"></div><div class="jvp-arc jvp-arc-b"></div><div class="jvp-arc jvp-arc-c"></div>
   <div class="jvp-iris">${blades}</div>
   <div class="jvp-nucleus"><i></i><i></i><i></i><b></b></div>
   <div class="jvp-sparks">${sparks}</div>
  </div>`;
 };

 Panel.prototype._jarvisPremiumCss=function(){return `
 :host([data-visual-mode="premium"]){--jvp-agent:var(--jarvis-agent-color,#00eaff);--jvp-state:var(--jvp-agent);--jv-accent:var(--jvp-agent);--jv-accent2:#fff;--jv-surface:#020914e8;--jv-line:color-mix(in srgb,var(--jvp-agent) 26%,transparent);--jv-radius:12px}
 :host([data-visual-mode="premium"]) .app{background:radial-gradient(ellipse at 50% 30%,color-mix(in srgb,var(--jvp-agent) 12%,transparent),transparent 38%),radial-gradient(circle at 50% 42%,#061322 0,#01050a 58%,#000 100%);overflow-x:hidden}
 :host([data-visual-mode="premium"]) header .logo{font-weight:300;letter-spacing:15px;text-shadow:0 0 16px color-mix(in srgb,var(--jvp-agent) 72%,transparent);font-size:38px}
 :host([data-visual-mode="premium"]) header .sub{letter-spacing:5px;opacity:.55}
 :host([data-visual-mode="premium"]) .core{perspective:850px;transform-style:preserve-3d;overflow:visible;isolation:isolate}
 :host([data-visual-mode="premium"]) .core>.ring,:host([data-visual-mode="premium"]) .core>.orbit,:host([data-visual-mode="premium"]) .core>.satellite,:host([data-visual-mode="premium"]) .core>.soul,:host([data-visual-mode="premium"]) .core>.leds,:host([data-visual-mode="premium"]) .core>.glow,:host([data-visual-mode="premium"]) .core>.voiceBars,:host([data-visual-mode="premium"]) .core>.jarvis-theme-overlay,:host([data-visual-mode="premium"]) .core>.jarvis-neural-face{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
 :host([data-visual-mode="premium"]) .jarvis-health-ring{inset:-10%!important;opacity:.34!important;filter:blur(.2px)}
 :host([data-visual-mode="premium"]) .jarvis-health-ring-track{border-width:1px!important}
 :host([data-visual-mode="premium"]) .jv-premium-stage{position:absolute;inset:-7%;display:block;transform-style:preserve-3d;pointer-events:none;z-index:4;color:var(--jvp-state);transition:opacity .7s ease,transform .9s cubic-bezier(.2,.8,.2,1),filter .7s ease}
 .jv-premium-stage{display:none}
 :host([data-visual-mode="premium"]) .jvp-space{position:absolute;inset:4%;border-radius:50%;background:radial-gradient(circle,transparent 34%,color-mix(in srgb,var(--jvp-agent) 4%,transparent) 35% 35.5%,transparent 36% 100%);box-shadow:0 0 90px color-mix(in srgb,var(--jvp-agent) 15%,transparent);animation:jvpSpace 7s ease-in-out infinite}
 :host([data-visual-mode="premium"]) .jvp-aura{position:absolute;inset:15%;border-radius:50%;background:radial-gradient(circle,#fff 0 1%,var(--jvp-state) 2% 6%,color-mix(in srgb,var(--jvp-state) 28%,transparent) 17%,transparent 62%);filter:blur(5px);opacity:.64;animation:jvpAura 3.8s ease-in-out infinite}
 :host([data-visual-mode="premium"]) .jvp-mesh{position:absolute;left:7%;top:34%;width:86%;height:32%;border:1px solid color-mix(in srgb,var(--jvp-state) 38%,transparent);border-radius:50%;box-shadow:0 0 14px color-mix(in srgb,var(--jvp-state) 20%,transparent),inset 0 0 18px color-mix(in srgb,var(--jvp-state) 10%,transparent);opacity:.45;transform-style:preserve-3d}
 :host([data-visual-mode="premium"]) .jvp-mesh-a{transform:rotateX(64deg) rotateZ(12deg);animation:jvpMeshA 11s linear infinite}
 :host([data-visual-mode="premium"]) .jvp-mesh-b{transform:rotateY(67deg) rotateZ(-22deg);animation:jvpMeshB 14s linear infinite reverse}
 :host([data-visual-mode="premium"]) .jvp-mesh-c{transform:rotateX(71deg) rotateY(28deg);animation:jvpMeshC 17s linear infinite}
 :host([data-visual-mode="premium"]) .jvp-ring{position:absolute;border-radius:50%;transform-style:preserve-3d;box-sizing:border-box;opacity:.9;transition:border-color .35s,filter .35s,transform .5s}
 :host([data-visual-mode="premium"]) .jvp-r1{inset:2%;border:1px solid color-mix(in srgb,var(--jvp-state) 32%,transparent);animation:jvpSpin 26s linear infinite}
 :host([data-visual-mode="premium"]) .jvp-r2{inset:9%;border:6px double color-mix(in srgb,var(--jvp-state) 56%,transparent);clip-path:polygon(50% 0,61% 7%,73% 5%,82% 18%,95% 27%,93% 42%,100% 50%,93% 59%,95% 73%,82% 82%,73% 95%,60% 93%,50% 100%,40% 93%,27% 95%,18% 82%,5% 73%,7% 59%,0 50%,7% 41%,5% 27%,18% 18%,27% 5%,39% 7%);animation:jvpSpinReverse 19s linear infinite;filter:drop-shadow(0 0 5px var(--jvp-state))}
 :host([data-visual-mode="premium"]) .jvp-r3{inset:18%;border:2px solid color-mix(in srgb,var(--jvp-state) 58%,transparent);border-left-width:8px;border-right-width:8px;animation:jvpSpin 13s linear infinite}
 :host([data-visual-mode="premium"]) .jvp-r4{inset:27%;border:1px dashed color-mix(in srgb,var(--jvp-state) 72%,transparent);animation:jvpSpinReverse 9s linear infinite}
 :host([data-visual-mode="premium"]) .jvp-r5{inset:36%;border:2px solid color-mix(in srgb,var(--jvp-state) 74%,transparent);box-shadow:0 0 16px color-mix(in srgb,var(--jvp-state) 28%,transparent),inset 0 0 18px color-mix(in srgb,var(--jvp-state) 18%,transparent);animation:jvpRingBreath 3.2s ease-in-out infinite}
 :host([data-visual-mode="premium"]) .jvp-tick{position:absolute;left:50%;top:-1%;width:1px;height:4.2%;background:currentColor;opacity:calc(.18 + (var(--i) % 4)*.12);transform-origin:50% 1230%;transform:rotate(calc(var(--i)*7.5deg));box-shadow:0 0 4px currentColor}
 :host([data-visual-mode="premium"]) .jvp-arc{position:absolute;border-radius:50%;border:3px solid transparent;filter:drop-shadow(0 0 4px var(--jvp-state))}
 :host([data-visual-mode="premium"]) .jvp-arc-a{inset:13%;border-top-color:var(--jvp-state);border-right-color:color-mix(in srgb,var(--jvp-state) 28%,transparent);transform:rotate(28deg);animation:jvpSpin 7s linear infinite}
 :host([data-visual-mode="premium"]) .jvp-arc-b{inset:23%;border-bottom-color:var(--jvp-state);border-left-color:color-mix(in srgb,var(--jvp-state) 22%,transparent);transform:rotate(-52deg);animation:jvpSpinReverse 5.6s linear infinite}
 :host([data-visual-mode="premium"]) .jvp-arc-c{inset:32%;border-width:1px;border-top-color:#fff;border-bottom-color:var(--jvp-state);animation:jvpSpin 4.3s linear infinite}
 :host([data-visual-mode="premium"]) .jvp-iris{position:absolute;inset:37%;border-radius:50%;transform-style:preserve-3d;animation:jvpIris 8s ease-in-out infinite}
 :host([data-visual-mode="premium"]) .jvp-blade{position:absolute;left:50%;top:50%;width:48%;height:18%;transform-origin:0 50%;transform:rotate(calc(var(--i)*30deg)) skewX(-18deg);background:linear-gradient(90deg,color-mix(in srgb,var(--jvp-state) 56%,transparent),transparent 82%);clip-path:polygon(0 50%,18% 0,100% 28%,74% 100%);opacity:.36;filter:drop-shadow(0 0 3px var(--jvp-state))}
 :host([data-visual-mode="premium"]) .jvp-nucleus{position:absolute;inset:42%;border-radius:50%;display:grid;place-items:center;transform-style:preserve-3d;filter:drop-shadow(0 0 11px var(--jvp-state));animation:jvpNucleus 2.7s ease-in-out infinite}
 :host([data-visual-mode="premium"]) .jvp-nucleus i{position:absolute;border-radius:50%;border:1px solid color-mix(in srgb,var(--jvp-state) 78%,transparent)}
 :host([data-visual-mode="premium"]) .jvp-nucleus i:nth-child(1){inset:-34%;transform:rotateX(68deg);animation:jvpSpin 4s linear infinite}
 :host([data-visual-mode="premium"]) .jvp-nucleus i:nth-child(2){inset:-24%;transform:rotateY(68deg);animation:jvpSpinReverse 5.2s linear infinite}
 :host([data-visual-mode="premium"]) .jvp-nucleus i:nth-child(3){inset:-12%;transform:rotateX(52deg) rotateY(33deg);animation:jvpSpin 3.4s linear infinite}
 :host([data-visual-mode="premium"]) .jvp-nucleus b{width:54%;height:54%;border-radius:50%;background:radial-gradient(circle,#fff 0 9%,var(--jvp-state) 18%,color-mix(in srgb,var(--jvp-state) 38%,transparent) 46%,transparent 74%);box-shadow:0 0 12px #fff,0 0 28px var(--jvp-state),0 0 58px color-mix(in srgb,var(--jvp-state) 54%,transparent)}
 :host([data-visual-mode="premium"]) .jvp-spark{position:absolute;left:50%;top:50%;width:2px;height:2px;border-radius:50%;background:#fff;box-shadow:0 0 4px #fff,0 0 10px var(--jvp-state);transform:rotate(calc(var(--i)*10deg)) translateY(calc(-36% - (var(--i)%7)*5%));transform-origin:0 0;opacity:.35;animation:jvpSpark 2.4s ease-in-out var(--d) infinite}
 :host([data-visual-mode="premium"]) .jvp-scan{position:absolute;inset:9%;border-radius:50%;background:conic-gradient(from 0deg,transparent 0 80%,color-mix(in srgb,var(--jvp-state) 6%,transparent) 84%,color-mix(in srgb,var(--jvp-state) 45%,transparent) 90%,transparent 96%);opacity:0;animation:jvpSpin 3s linear infinite}

 :host([data-visual-mode="premium"]) .core.state-listen{--jvp-state:#39ff88}
 :host([data-visual-mode="premium"]) .core.state-think{--jvp-state:#ffb000}
 :host([data-visual-mode="premium"]) .core.state-search{--jvp-state:#00eaff}
 :host([data-visual-mode="premium"]) .core.state-speak{--jvp-state:#b56cff}
 :host([data-visual-mode="premium"]) .core.state-error{--jvp-state:#ff4050}
 :host([data-visual-mode="premium"]) .core.state-listen .jvp-r2,:host([data-visual-mode="premium"]) .core.state-listen .jvp-r5{animation-duration:4.5s}
 :host([data-visual-mode="premium"]) .core.state-listen .jvp-aura{animation-duration:1.8s;opacity:.86}
 :host([data-visual-mode="premium"]) .core.state-think .jvp-r2{animation-duration:5.5s}:host([data-visual-mode="premium"]) .core.state-think .jvp-r3{animation-duration:3.8s}:host([data-visual-mode="premium"]) .core.state-think .jvp-r4{animation-duration:2.9s}
 :host([data-visual-mode="premium"]) .core.state-think .jvp-iris{animation-duration:2s;transform:scale(.86)}
 :host([data-visual-mode="premium"]) .core.state-search .jvp-scan{opacity:.88}:host([data-visual-mode="premium"]) .core.state-search .jvp-r1{animation-duration:7s}
 :host([data-visual-mode="premium"]) .core.state-speak .jvp-nucleus{animation-duration:.72s}:host([data-visual-mode="premium"]) .core.state-speak .jvp-aura{animation-duration:1s;opacity:1}:host([data-visual-mode="premium"]) .core.state-speak .jvp-r5{animation-duration:1.25s}

 :host([data-visual-mode="premium"]) .jv-premium-stage.jvp-deploy .jvp-nucleus{animation:jvpDeployNucleus .75s cubic-bezier(.18,.82,.2,1) both,jvpNucleus 2.7s ease-in-out .75s infinite}
 :host([data-visual-mode="premium"]) .jv-premium-stage.jvp-deploy .jvp-iris{animation:jvpDeploy .7s .35s cubic-bezier(.18,.82,.2,1) both,jvpIris 8s ease-in-out 1.05s infinite}
 :host([data-visual-mode="premium"]) .jv-premium-stage.jvp-deploy .jvp-r5{animation:jvpDeploy .65s .65s cubic-bezier(.18,.82,.2,1) both,jvpRingBreath 3.2s ease-in-out 1.3s infinite}
 :host([data-visual-mode="premium"]) .jv-premium-stage.jvp-deploy .jvp-r4{animation:jvpDeploy .65s .9s cubic-bezier(.18,.82,.2,1) both,jvpSpinReverse 9s linear 1.55s infinite}
 :host([data-visual-mode="premium"]) .jv-premium-stage.jvp-deploy .jvp-r3{animation:jvpDeploy .65s 1.15s cubic-bezier(.18,.82,.2,1) both,jvpSpin 13s linear 1.8s infinite}
 :host([data-visual-mode="premium"]) .jv-premium-stage.jvp-deploy .jvp-r2{animation:jvpDeploy .7s 1.4s cubic-bezier(.18,.82,.2,1) both,jvpSpinReverse 19s linear 2.1s infinite}
 :host([data-visual-mode="premium"]) .jv-premium-stage.jvp-deploy .jvp-r1{animation:jvpDeploy .75s 1.7s cubic-bezier(.18,.82,.2,1) both,jvpSpin 26s linear 2.45s infinite}
 :host([data-visual-mode="premium"]) .jv-premium-stage.jvp-deploy .jvp-mesh{animation-delay:2s}
 :host([data-visual-mode="premium"]) .jv-premium-stage.jvp-deploy .jvp-arc{animation-delay:2.25s}

 :host([data-visual-mode="premium"]) .jarvis-offline .jv-premium-stage{opacity:.24;transform:scale(.54) rotateX(18deg);filter:grayscale(.8) blur(.5px)}
 :host([data-visual-mode="premium"]) .jarvis-offline .jv-premium-stage *{animation-play-state:paused!important}
 :host([data-visual-mode="premium"]) #stateDock{margin-top:3px!important}
 :host([data-visual-mode="premium"]) #agentRouteDock{opacity:.58!important}
 :host([data-visual-mode="premium"]) .card{border-color:color-mix(in srgb,var(--jvp-agent) 23%,transparent);background:linear-gradient(155deg,#05111bd9,#01060bdd);box-shadow:inset 0 1px 0 #ffffff0d,0 12px 30px #0008}
 :host([data-visual-mode="premium"]) .title{color:color-mix(in srgb,var(--jvp-agent) 64%,#fff)}
 :host([data-visual-mode="premium"]) button{border-color:color-mix(in srgb,var(--jvp-agent) 32%,transparent);background:color-mix(in srgb,var(--jvp-agent) 8%,#020711)}

 .jv-mini-premium{background:radial-gradient(circle,#fff 0 5%,#00eaff 9%,transparent 35%),repeating-radial-gradient(circle,#00eaff55 0 1px,transparent 2px 8px)!important;box-shadow:inset 0 0 20px #00eaff22!important}.jv-mini-premium i{border-radius:50%!important;border-color:#fff8!important;transform:scale(.72)!important}
 @keyframes jvpSpin{to{transform:rotate(360deg)}}@keyframes jvpSpinReverse{to{transform:rotate(-360deg)}}
 @keyframes jvpSpace{0%,100%{transform:scale(.98);opacity:.45}50%{transform:scale(1.025);opacity:.82}}
 @keyframes jvpAura{0%,100%{transform:scale(.92);opacity:.45}50%{transform:scale(1.12);opacity:.83}}
 @keyframes jvpRingBreath{0%,100%{transform:scale(.97);opacity:.58}50%{transform:scale(1.035);opacity:1}}
 @keyframes jvpIris{0%,100%{transform:rotate(-4deg) scale(.96)}50%{transform:rotate(7deg) scale(1.04)}}
 @keyframes jvpNucleus{0%,100%{transform:scale(.9) translateZ(28px)}50%{transform:scale(1.08) translateZ(46px)}}
 @keyframes jvpSpark{0%,100%{opacity:.08;filter:blur(.5px)}45%{opacity:.8;filter:none}70%{opacity:.2}}
 @keyframes jvpMeshA{to{transform:rotateX(64deg) rotateZ(372deg)}}@keyframes jvpMeshB{to{transform:rotateY(67deg) rotateZ(338deg)}}@keyframes jvpMeshC{to{transform:rotateX(71deg) rotateY(388deg)}}
 @keyframes jvpDeploy{0%{opacity:0;transform:scale(.18) rotate(-55deg);filter:blur(8px)}65%{opacity:1;filter:blur(0)}100%{opacity:.9;transform:scale(1) rotate(0)}}
 @keyframes jvpDeployNucleus{0%{opacity:0;transform:scale(.05) translateZ(-80px)}55%{opacity:1;transform:scale(1.28) translateZ(65px)}100%{opacity:1;transform:scale(.9) translateZ(28px)}}
 @media(max-width:760px) and (orientation:portrait){:host([data-visual-mode="premium"]) header .logo{font-size:28px;letter-spacing:10px}:host([data-visual-mode="premium"]) .jv-premium-stage{inset:-4%}}
 @media(max-height:650px) and (orientation:landscape){:host([data-visual-mode="premium"]) .jv-premium-stage{inset:-3%}:host([data-visual-mode="premium"]) header .logo{font-size:22px!important;letter-spacing:7px!important}}
 @media(prefers-reduced-motion:reduce){:host([data-visual-mode="premium"]) .jv-premium-stage *{animation-duration:18s!important}:host([data-visual-mode="premium"]) .jvp-spark{display:none}}
 `};

 Panel.prototype._jarvisEnsurePremium=function(){
  const root=this._core?.shadowRoot,core=root?.getElementById('core');if(!root||!core)return null;
  if(!root.getElementById('jarvisPremiumCoreStyle')){const s=document.createElement('style');s.id='jarvisPremiumCoreStyle';s.textContent=this._jarvisPremiumCss();root.appendChild(s)}
  let stage=core.querySelector('.jv-premium-stage');if(!stage){core.insertAdjacentHTML('beforeend',this._jarvisPremiumMarkup());stage=core.querySelector('.jv-premium-stage')}
  return stage;
 };
 Panel.prototype._jarvisPremiumActivate=function(force){
  const hud=this._core;if(!hud)return;const on=force===undefined?active():Boolean(force);
  if(on)hud.setAttribute('data-visual-mode','premium');
  const stage=this._jarvisEnsurePremium();if(!stage)return;
  if(on){stage.classList.remove('jvp-deploy');void stage.offsetWidth;stage.classList.add('jvp-deploy');setTimeout(()=>stage.classList.remove('jvp-deploy'),3300)}
 };
 const baseApply=Panel.prototype._jarvisApplyVisualMode;
 Panel.prototype._jarvisApplyVisualMode=function(){
  if(active()){
   this._jarvisEnsurePremium();
   this._core?.setAttribute('data-visual-mode','premium');
   this._jarvisPremiumActivate(true);
   return;
  }
  if(typeof baseApply==='function')baseApply.call(this);
 };

 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisEnsurePremium();this._jarvisInstallCornerVisualPicker();if(active())this._jarvisPremiumActivate(true)};
 Panel.prototype.__jarvisPremiumCoreInstalled=true;
}
