/* JARVIS Premium Cinematic Core — independent sixth visual mode. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisPremiumCoreInstalled){
 const KEY='jarvis_visual_mode_v326';
 const PREMIUM={key:'premium',name:'Premium Cinematic',tag:'3D CINÉMATIQUE',desc:'Core volumétrique, déploiement progressif et animations contextuelles.'};
 const current=()=>localStorage.getItem(KEY)||'classic';
 const safeMode=v=>['classic','holo','sentinel','glass','neural','premium'].includes(v)?v:'classic';
 const css=`
 :host([data-visual-mode="premium"]){--jv-premium:var(--jarvis-agent-color,#00eaff);--jv-premium2:color-mix(in srgb,var(--jv-premium) 55%,#ffffff);--jv-premium-dark:color-mix(in srgb,var(--jv-premium) 22%,#02070d);}
 :host([data-visual-mode="premium"]) .app{background:radial-gradient(circle at 50% 26%,color-mix(in srgb,var(--jv-premium) 15%,transparent),transparent 32%),radial-gradient(circle at 50% 60%,#00131f 0,transparent 52%),#01050a;perspective:1200px;overflow-x:hidden;}
 :host([data-visual-mode="premium"]) .core{transform-style:preserve-3d;filter:drop-shadow(0 0 22px color-mix(in srgb,var(--jv-premium) 35%,transparent));isolation:isolate;}
 :host([data-visual-mode="premium"]) .ring{opacity:.22;border-color:color-mix(in srgb,var(--jv-premium) 54%,transparent);box-shadow:inset 0 0 12px color-mix(in srgb,var(--jv-premium) 12%,transparent);}
 :host([data-visual-mode="premium"]) .jarvis-theme-overlay,:host([data-visual-mode="premium"]) .jarvis-neural-face{display:none!important;}
 .jv-premium-stage{display:none;position:absolute;inset:-12%;z-index:3;pointer-events:none;transform-style:preserve-3d;--deploy:1;}
 :host([data-visual-mode="premium"]) .jv-premium-stage{display:block;animation:jvPremiumStageIn 1.1s cubic-bezier(.2,.8,.2,1) both;}
 .jv-premium-orb,.jv-premium-halo,.jv-premium-ring3d,.jv-premium-wave,.jv-premium-arc,.jv-premium-scan,.jv-premium-petal{position:absolute;left:50%;top:50%;transform-style:preserve-3d;box-sizing:border-box;}
 .jv-premium-orb{width:18%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%) translateZ(34px);background:radial-gradient(circle at 35% 30%,#fff 0 4%,var(--jv-premium2) 7%,var(--jv-premium) 22%,color-mix(in srgb,var(--jv-premium) 24%,#00101a) 48%,#000 76%);box-shadow:0 0 18px var(--jv-premium),0 0 48px color-mix(in srgb,var(--jv-premium) 48%,transparent),inset -10px -12px 22px #000b;animation:jvPremiumOrb 3.8s ease-in-out infinite;}
 .jv-premium-orb:before{content:'';position:absolute;inset:18%;border-radius:50%;border:1px solid #fff8;box-shadow:0 0 12px #fff8,inset 0 0 12px color-mix(in srgb,var(--jv-premium) 65%,transparent);}
 .jv-premium-halo{width:27%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%) translateZ(18px);border:2px solid color-mix(in srgb,var(--jv-premium2) 75%,transparent);box-shadow:0 0 8px var(--jv-premium),inset 0 0 14px color-mix(in srgb,var(--jv-premium) 35%,transparent);animation:jvPremiumHalo 5.8s linear infinite;}
 .jv-premium-halo:after{content:'';position:absolute;inset:-9%;border-radius:50%;border:1px dashed color-mix(in srgb,var(--jv-premium) 55%,transparent);}
 .jv-premium-ring3d{border-radius:50%;border:1px solid color-mix(in srgb,var(--jv-premium) 58%,transparent);box-shadow:0 0 9px color-mix(in srgb,var(--jv-premium) 26%,transparent),inset 0 0 8px color-mix(in srgb,var(--jv-premium) 10%,transparent);}
 .jv-premium-ring3d.r1{width:38%;aspect-ratio:1;transform:translate(-50%,-50%) rotateX(66deg) rotateZ(15deg);animation:jvPremiumR1 7s linear infinite;}
 .jv-premium-ring3d.r2{width:47%;aspect-ratio:1;transform:translate(-50%,-50%) rotateX(74deg) rotateY(22deg) rotateZ(40deg);border-style:dashed;animation:jvPremiumR2 10s linear infinite reverse;}
 .jv-premium-ring3d.r3{width:58%;aspect-ratio:1;transform:translate(-50%,-50%) rotateX(58deg) rotateY(-28deg);border-width:2px;border-color:color-mix(in srgb,var(--jv-premium) 34%,transparent);animation:jvPremiumR3 14s linear infinite;}
 .jv-premium-ring3d.r4{width:70%;aspect-ratio:1;transform:translate(-50%,-50%) rotateX(82deg) rotateY(10deg);border-style:dotted;opacity:.55;animation:jvPremiumR4 18s linear infinite reverse;}
 .jv-premium-wave{width:72%;aspect-ratio:1;border-radius:44% 56% 48% 52%/58% 43% 57% 42%;transform:translate(-50%,-50%);border:1px solid color-mix(in srgb,var(--jv-premium) 24%,transparent);box-shadow:0 0 18px color-mix(in srgb,var(--jv-premium) 12%,transparent);animation:jvPremiumWave 6.5s ease-in-out infinite;}
 .jv-premium-wave.w2{width:79%;opacity:.6;animation-duration:8.4s;animation-direction:reverse;}
 .jv-premium-wave.w3{width:86%;opacity:.35;animation-duration:10.6s;}
 .jv-premium-arc{width:64%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);background:conic-gradient(from 12deg,transparent 0 9%,var(--jv-premium) 9.5% 12%,transparent 12.5% 26%,var(--jv-premium2) 26.5% 28%,transparent 28.5% 63%,var(--jv-premium) 63.5% 67%,transparent 67.5%);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px));mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px));filter:drop-shadow(0 0 5px var(--jv-premium));animation:jvPremiumArc 9s linear infinite;}
 .jv-premium-arc.a2{width:53%;animation-duration:6s;animation-direction:reverse;opacity:.75;}
 .jv-premium-scan{width:74%;height:74%;transform:translate(-50%,-50%);border-radius:50%;background:conic-gradient(from 0deg,color-mix(in srgb,var(--jv-premium) 32%,transparent),transparent 10%,transparent 100%);-webkit-mask:radial-gradient(farthest-side,transparent 0 46%,#000 47% 48%,transparent 49%);mask:radial-gradient(farthest-side,transparent 0 46%,#000 47% 48%,transparent 49%);opacity:.18;animation:jvPremiumScan 4.2s linear infinite;}
 .jv-premium-petal{width:10%;height:31%;transform-origin:50% 100%;border:1px solid color-mix(in srgb,var(--jv-premium) 28%,transparent);border-radius:70% 70% 20% 20%;background:linear-gradient(to top,color-mix(in srgb,var(--jv-premium) 13%,transparent),transparent 72%);opacity:.5;}
 :host([data-visual-mode="premium"]) .jv-premium-petal{animation:jvPremiumPetalIn .85s cubic-bezier(.12,.75,.2,1) both;}
 .jv-premium-petal.p1{transform:translate(-50%,-100%) rotate(0deg) translateY(-98%);animation-delay:.18s}.jv-premium-petal.p2{transform:translate(-50%,-100%) rotate(45deg) translateY(-98%);animation-delay:.24s}.jv-premium-petal.p3{transform:translate(-50%,-100%) rotate(90deg) translateY(-98%);animation-delay:.30s}.jv-premium-petal.p4{transform:translate(-50%,-100%) rotate(135deg) translateY(-98%);animation-delay:.36s}.jv-premium-petal.p5{transform:translate(-50%,-100%) rotate(180deg) translateY(-98%);animation-delay:.42s}.jv-premium-petal.p6{transform:translate(-50%,-100%) rotate(225deg) translateY(-98%);animation-delay:.48s}.jv-premium-petal.p7{transform:translate(-50%,-100%) rotate(270deg) translateY(-98%);animation-delay:.54s}.jv-premium-petal.p8{transform:translate(-50%,-100%) rotate(315deg) translateY(-98%);animation-delay:.60s}
 :host([data-visual-mode="premium"]) .card{border-color:color-mix(in srgb,var(--jv-premium) 25%,transparent);background:linear-gradient(145deg,#07131dbf,#02070dcc);box-shadow:inset 0 1px 0 #fff08,0 12px 35px #0008;backdrop-filter:blur(14px)}
 :host([data-visual-mode="premium"]) .title{color:color-mix(in srgb,var(--jv-premium) 72%,#fff)}
 :host([data-visual-mode="premium"]) button{border-color:color-mix(in srgb,var(--jv-premium) 30%,transparent);background:color-mix(in srgb,var(--jv-premium) 8%,#02070d);}
 :host([data-visual-mode="premium"]) .core.state-listen .jv-premium-wave{animation-duration:2.2s;opacity:.92}.core.state-listen .jv-premium-halo{box-shadow:0 0 18px #39ff88,0 0 38px #39ff8844}.core.state-think .jv-premium-ring3d.r1,.core.state-search .jv-premium-ring3d.r1{animation-duration:2.8s}.core.state-think .jv-premium-ring3d.r2,.core.state-search .jv-premium-ring3d.r2{animation-duration:3.4s}.core.state-speak .jv-premium-orb{animation-duration:.72s}.core.state-speak .jv-premium-wave{animation-duration:1.15s}.core.state-error .jv-premium-stage{filter:hue-rotate(140deg) saturate(1.8)}
 :host([data-visual-mode="premium"][data-jarvis-offline="1"]) .jv-premium-stage{opacity:.14;filter:grayscale(1);transform:scale(.72);transition:opacity .5s,transform .7s,filter .5s}.core.jv-offline .jv-premium-orb,.core.jv-offline .jv-premium-halo,.core.jv-offline .jv-premium-ring3d,.core.jv-offline .jv-premium-wave,.core.jv-offline .jv-premium-arc,.core.jv-offline .jv-premium-scan{animation-play-state:paused!important}
 @keyframes jvPremiumStageIn{0%{opacity:0;transform:scale(.14) rotate(-22deg)}38%{opacity:1;transform:scale(.34) rotate(-8deg)}72%{transform:scale(1.06) rotate(1deg)}100%{transform:scale(1) rotate(0)}}
 @keyframes jvPremiumPetalIn{0%{opacity:0;clip-path:inset(100% 0 0);filter:blur(4px)}100%{opacity:.5;clip-path:inset(0 0 0);filter:blur(0)}}
 @keyframes jvPremiumOrb{0%,100%{transform:translate(-50%,-50%) translateZ(34px) scale(.95)}50%{transform:translate(-50%,-50%) translateZ(44px) scale(1.08)}}
 @keyframes jvPremiumHalo{to{transform:translate(-50%,-50%) translateZ(18px) rotate(360deg)}}
 @keyframes jvPremiumR1{to{transform:translate(-50%,-50%) rotateX(66deg) rotateZ(375deg)}}
 @keyframes jvPremiumR2{to{transform:translate(-50%,-50%) rotateX(74deg) rotateY(22deg) rotateZ(400deg)}}
 @keyframes jvPremiumR3{to{transform:translate(-50%,-50%) rotateX(58deg) rotateY(-28deg) rotateZ(360deg)}}
 @keyframes jvPremiumR4{to{transform:translate(-50%,-50%) rotateX(82deg) rotateY(10deg) rotateZ(360deg)}}
 @keyframes jvPremiumWave{0%,100%{transform:translate(-50%,-50%) rotate(0) scale(.94);border-radius:44% 56% 48% 52%/58% 43% 57% 42%}50%{transform:translate(-50%,-50%) rotate(180deg) scale(1.06);border-radius:58% 42% 57% 43%/42% 58% 44% 56%}}
 @keyframes jvPremiumArc{to{transform:translate(-50%,-50%) rotate(360deg)}}
 @keyframes jvPremiumScan{to{transform:translate(-50%,-50%) rotate(360deg)}}
 @media(prefers-reduced-motion:reduce){.jv-premium-stage,.jv-premium-stage *{animation-duration:.001ms!important;animation-iteration-count:1!important}}
 `;
 function ensurePremiumLayers(panel){
  const root=panel._core?.shadowRoot,core=root?.getElementById('core');if(!root||!core)return;
  if(!root.getElementById('jarvisPremiumCoreStyle')){const s=document.createElement('style');s.id='jarvisPremiumCoreStyle';s.textContent=css;root.appendChild(s)}
  if(!core.querySelector('.jv-premium-stage')){
   const stage=document.createElement('div');stage.className='jv-premium-stage';stage.innerHTML='<div class="jv-premium-wave w1"></div><div class="jv-premium-wave w2"></div><div class="jv-premium-wave w3"></div><div class="jv-premium-petal p1"></div><div class="jv-premium-petal p2"></div><div class="jv-premium-petal p3"></div><div class="jv-premium-petal p4"></div><div class="jv-premium-petal p5"></div><div class="jv-premium-petal p6"></div><div class="jv-premium-petal p7"></div><div class="jv-premium-petal p8"></div><div class="jv-premium-ring3d r4"></div><div class="jv-premium-ring3d r3"></div><div class="jv-premium-ring3d r2"></div><div class="jv-premium-ring3d r1"></div><div class="jv-premium-arc a1"></div><div class="jv-premium-arc a2"></div><div class="jv-premium-scan"></div><div class="jv-premium-halo"></div><div class="jv-premium-orb"></div>';
   core.appendChild(stage);
  }
 }
 const originalList=Panel.prototype._jarvisVisualModes;
 Panel.prototype._jarvisVisualModes=function(){const list=originalList?originalList.call(this):[];return list.some(x=>x.key==='premium')?list:[...list,PREMIUM]};
 const originalSet=Panel.prototype._jarvisSetVisualMode;
 Panel.prototype._jarvisSetVisualMode=function(key){
  key=safeMode(key);if(key==='premium'){localStorage.setItem(KEY,'premium');this._jarvisApplyVisualMode?.();this._jarvisSyncVisualPicker?.();this._jarvisPremiumSyncPickers?.();return}
  return originalSet?originalSet.call(this,key):localStorage.setItem(KEY,key);
 };
 const originalApply=Panel.prototype._jarvisApplyVisualMode;
 Panel.prototype._jarvisApplyVisualMode=function(){
  const m=safeMode(current());if(m==='premium'){ensurePremiumLayers(this);this._core?.setAttribute('data-visual-mode','premium');return}
  return originalApply?.call(this);
 };
 Panel.prototype._jarvisPremiumSyncPickers=function(){
  const active=current();const root=this._core?.shadowRoot;
  root?.querySelectorAll('[data-jv-quick-theme]').forEach(b=>b.classList.toggle('active',b.dataset.jvQuickTheme===active));
  this.shadowRoot?.querySelectorAll('[data-jv-theme]').forEach(b=>b.classList.toggle('active',b.dataset.jvTheme===active));
 };
 function installPicker(panel){
  const root=panel._core?.shadowRoot;if(!root)return;
  const pop=root.getElementById('jarvisVisualPopover');if(pop&&!pop.querySelector('[data-jv-quick-theme="premium"]')){const b=document.createElement('button');b.type='button';b.dataset.jvQuickTheme='premium';b.innerHTML='<span class="jv-dot" style="background:var(--jarvis-agent-color,#00eaff);box-shadow:0 0 9px currentColor"></span>Premium Cinematic';b.onclick=()=>{panel._jarvisSetVisualMode('premium');pop.hidden=true};pop.appendChild(b)}
  const settings=panel.shadowRoot?.querySelector('.jv-theme-grid');if(settings&&!settings.querySelector('[data-jv-theme="premium"]')){const b=document.createElement('button');b.type='button';b.className='jv-theme-card';b.dataset.jvTheme='premium';b.innerHTML='<span class="jv-mini"><i></i><i></i><i></i></span><strong>Premium Cinematic</strong><small>3D CINÉMATIQUE</small><em>Core volumétrique, déploiement progressif et animations contextuelles.</em>';b.onclick=()=>panel._jarvisSetVisualMode('premium');settings.appendChild(b)}
  panel._jarvisPremiumSyncPickers();
 }
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);ensurePremiumLayers(this);if(current()==='premium')this._jarvisApplyVisualMode();installPicker(this);setTimeout(()=>installPicker(this),120)};
 const baseRender=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){baseRender.call(this);setTimeout(()=>installPicker(this),0)};
 Panel.prototype.__jarvisPremiumCoreInstalled=true;
}
