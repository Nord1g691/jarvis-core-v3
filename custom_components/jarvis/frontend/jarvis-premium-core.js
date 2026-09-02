/* JARVIS Premium Cinematic Core — layered deployment, volumetric motion and state choreography. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisPremiumCoreInstalled){
 const CSS=`
 :host([data-visual-mode="premium"]){--jv-radius:8px;--jv-font:monospace}
 :host([data-visual-mode="premium"]) .app{background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--jv-agent-color,#00eaff) 14%,transparent),transparent 34%),linear-gradient(#02080d,#010307 72%);font-family:var(--jv-font);overflow-x:hidden}
 :host([data-visual-mode="premium"]) .core{perspective:900px;transform-style:preserve-3d;filter:drop-shadow(0 0 18px color-mix(in srgb,var(--jv-agent-color,#00eaff) 42%,transparent))}
 :host([data-visual-mode="premium"]) .ring{opacity:.42;transform-style:preserve-3d;border-color:color-mix(in srgb,var(--jv-agent-color,#00eaff) 58%,transparent)}
 :host([data-visual-mode="premium"]) .jarvis-premium-stage{position:absolute;inset:2%;border-radius:50%;pointer-events:none;z-index:3;transform-style:preserve-3d;animation:jvPremiumDeploy 2.4s cubic-bezier(.16,.82,.22,1) both}
 .jarvis-premium-stage i{position:absolute;inset:var(--inset);border-radius:50%;border:1px solid color-mix(in srgb,var(--jv-agent-color,#00eaff) var(--alpha),transparent);box-shadow:0 0 var(--glow) color-mix(in srgb,var(--jv-agent-color,#00eaff) 28%,transparent),inset 0 0 16px color-mix(in srgb,var(--jv-agent-color,#00eaff) 10%,transparent);transform-style:preserve-3d}
 .jarvis-premium-stage .p1{--inset:4%;--alpha:72%;--glow:12px;border-style:dashed;animation:jvPremiumSpin 13s linear infinite}
 .jarvis-premium-stage .p2{--inset:12%;--alpha:48%;--glow:16px;border-width:2px;border-style:dotted;animation:jvPremiumSpinBack 8s linear infinite}
 .jarvis-premium-stage .p3{--inset:22%;--alpha:78%;--glow:22px;border-width:2px;animation:jvPremiumTilt 6s ease-in-out infinite}
 .jarvis-premium-stage .p4{--inset:34%;--alpha:92%;--glow:28px;border-width:3px;background:radial-gradient(circle,transparent 46%,color-mix(in srgb,var(--jv-agent-color,#00eaff) 10%,transparent) 47% 55%,transparent 56%);animation:jvPremiumPulse 2.8s ease-in-out infinite}
 .jarvis-premium-stage .p5{--inset:44%;--alpha:100%;--glow:34px;background:radial-gradient(circle,#fff 0 5%,color-mix(in srgb,var(--jv-agent-color,#00eaff) 88%,#fff) 6% 18%,color-mix(in srgb,var(--jv-agent-color,#00eaff) 28%,transparent) 35%,transparent 68%);animation:jvPremiumHeart 1.8s ease-in-out infinite}
 .jarvis-premium-field{position:absolute;inset:-2%;border-radius:50%;pointer-events:none;z-index:2;opacity:.68;background:repeating-conic-gradient(from 0deg,color-mix(in srgb,var(--jv-agent-color,#00eaff) 18%,transparent) 0 .6deg,transparent .8deg 5deg);mask:radial-gradient(circle,transparent 0 64%,#000 65% 67%,transparent 68%);animation:jvPremiumSpin 24s linear infinite,jvPremiumBreathe 4s ease-in-out infinite}
 .jarvis-premium-scan{position:absolute;inset:8%;border-radius:50%;pointer-events:none;z-index:5;background:conic-gradient(from 0deg,transparent 0 83%,color-mix(in srgb,var(--jv-agent-color,#00eaff) 42%,transparent) 88%,transparent 94%);opacity:.2;animation:jvPremiumScan 4.8s linear infinite}
 :host([data-visual-mode="premium"]) .core.state-listen .jarvis-premium-stage{animation:jvPremiumListen 1.35s ease-in-out infinite}
 :host([data-visual-mode="premium"]) .core.state-think .p2,:host([data-visual-mode="premium"]) .core.state-search .p2{animation-duration:2.2s}
 :host([data-visual-mode="premium"]) .core.state-think .p1,:host([data-visual-mode="premium"]) .core.state-search .p1{animation-duration:3.4s}
 :host([data-visual-mode="premium"]) .core.state-search .jarvis-premium-scan{opacity:.85;animation-duration:1.2s}
 :host([data-visual-mode="premium"]) .core.state-speak .p4{animation-duration:.72s}
 :host([data-visual-mode="premium"]) .core.jarvis-offline .jarvis-premium-stage{animation:jvPremiumShutdown 1.2s ease-in both}.core.jarvis-offline .jarvis-premium-field,.core.jarvis-offline .jarvis-premium-scan{animation-play-state:paused;opacity:.06}
 :host([data-visual-mode="premium"]) .card{background:linear-gradient(145deg,#06131bd9,#02070bd9);border-color:color-mix(in srgb,var(--jv-agent-color,#00eaff) 24%,transparent);box-shadow:inset 0 1px 0 #fff0,0 12px 30px #0007}
 @keyframes jvPremiumDeploy{0%{opacity:0;transform:scale(.08) rotateZ(-120deg)}24%{opacity:1;transform:scale(.22) rotateZ(-75deg)}58%{transform:scale(.72) rotateZ(-18deg)}82%{transform:scale(1.05) rotateZ(3deg)}100%{opacity:1;transform:scale(1) rotateZ(0)}}
 @keyframes jvPremiumSpin{to{transform:rotateZ(360deg)}}@keyframes jvPremiumSpinBack{to{transform:rotateZ(-360deg)}}
 @keyframes jvPremiumTilt{0%,100%{transform:rotateX(64deg) rotateZ(0) scale(.94)}50%{transform:rotateX(48deg) rotateZ(180deg) scale(1.04)}}
 @keyframes jvPremiumPulse{0%,100%{transform:scale(.94);opacity:.62}50%{transform:scale(1.08);opacity:1}}
 @keyframes jvPremiumHeart{0%,100%{transform:scale(.86);filter:brightness(.9)}50%{transform:scale(1.18);filter:brightness(1.7)}}
 @keyframes jvPremiumBreathe{0%,100%{opacity:.34;transform:scale(.96)}50%{opacity:.8;transform:scale(1.025)}}
 @keyframes jvPremiumScan{to{transform:rotate(360deg)}}@keyframes jvPremiumListen{0%,100%{transform:scale(.96)}50%{transform:scale(1.045)}}
 @keyframes jvPremiumShutdown{0%{opacity:1;transform:scale(1)}65%{opacity:.22;transform:scale(.32) rotateZ(70deg)}100%{opacity:.05;transform:scale(.09) rotateZ(110deg)}}
 @media (prefers-reduced-motion:reduce){.jarvis-premium-stage,.jarvis-premium-stage i,.jarvis-premium-field,.jarvis-premium-scan{animation-duration:.001ms!important;animation-iteration-count:1!important}}
 `;
 Panel.prototype._jarvisEnsurePremiumCore=function(){
  const root=this._core?.shadowRoot,core=root?.getElementById('core');if(!root||!core)return;
  if(!root.getElementById('jarvisPremiumCoreStyle')){const s=document.createElement('style');s.id='jarvisPremiumCoreStyle';s.textContent=CSS;root.appendChild(s)}
  if(!core.querySelector('.jarvis-premium-field')){const f=document.createElement('div');f.className='jarvis-premium-field';core.prepend(f)}
  if(!core.querySelector('.jarvis-premium-stage')){const stage=document.createElement('div');stage.className='jarvis-premium-stage';stage.innerHTML='<i class="p1"></i><i class="p2"></i><i class="p3"></i><i class="p4"></i><i class="p5"></i>';core.appendChild(stage)}
  if(!core.querySelector('.jarvis-premium-scan')){const scan=document.createElement('div');scan.className='jarvis-premium-scan';core.appendChild(scan)}
 };
 const boot=Panel.prototype._bootCore;Panel.prototype._bootCore=async function(){await boot.call(this);this._jarvisEnsurePremiumCore()};
 Panel.prototype.__jarvisPremiumCoreInstalled=true;
}
