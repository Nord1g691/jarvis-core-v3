/* JARVIS Core V3.0.26 — cinematic layer for alternate visual modes only. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisCinematicInstalled){
 Panel.prototype._jarvisCinematicCss=function(){return `
 :host(:not([data-visual-mode="classic"])) .app{position:relative;overflow:hidden}
 :host(:not([data-visual-mode="classic"])) .jv-cinema{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden}
 :host(:not([data-visual-mode="classic"])) .jv-cinema::before{content:'';position:absolute;inset:0;background:linear-gradient(transparent 50%,#ffffff08 50%);background-size:100% 4px;mix-blend-mode:soft-light;opacity:.12}
 :host(:not([data-visual-mode="classic"])) .jv-cinema::after{content:'';position:absolute;inset:-20%;background:radial-gradient(circle at 50% 45%,transparent 0 38%,#0005 68%,#000b 100%);opacity:.7}
 .jv-telemetry{display:none;position:fixed;z-index:20;pointer-events:none;font:8px/1.6 monospace;letter-spacing:1.4px;text-transform:uppercase}
 .jv-telemetry span{display:block;white-space:nowrap}
 .jv-telemetry b{font-weight:700}
 .jv-live-dot{display:inline-block!important;width:5px;height:5px;border-radius:50%;margin-right:5px;vertical-align:1px;box-shadow:0 0 8px currentColor;animation:jvLive 1.4s ease-in-out infinite}

 :host([data-visual-mode="holo"]) .jv-telemetry{display:block;right:18px;bottom:18px;color:#67f8ff8f;text-align:right;border-right:1px solid #67f8ff33;padding-right:9px}
 :host([data-visual-mode="holo"]) .jv-telemetry b{color:#bcfbff}
 :host([data-visual-mode="holo"]) .jv-live-dot{color:#3effc9;background:#3effc9}
 :host([data-visual-mode="holo"]) .jv-cinema .beam{display:block;position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#72faff88 30%,#fff 50%,#72faff88 70%,transparent);box-shadow:0 0 12px #00eaff;animation:jvBeam 5.6s linear infinite;opacity:.35}

 :host([data-visual-mode="sentinel"]) .jv-telemetry{display:block;left:16px;bottom:16px;color:#ff847e99;border-left:2px solid #ff4d4555;padding-left:9px}
 :host([data-visual-mode="sentinel"]) .jv-telemetry b{color:#ffd0cd}
 :host([data-visual-mode="sentinel"]) .jv-live-dot{color:#ffb000;background:#ffb000}
 :host([data-visual-mode="sentinel"]) .jv-cinema .corners{display:block;position:absolute;inset:10px;border:1px solid transparent;background:linear-gradient(#ff4d4544,#ff4d4544) left top/44px 1px no-repeat,linear-gradient(#ff4d4544,#ff4d4544) left top/1px 44px no-repeat,linear-gradient(#ff4d4544,#ff4d4544) right top/44px 1px no-repeat,linear-gradient(#ff4d4544,#ff4d4544) right top/1px 44px no-repeat,linear-gradient(#ff4d4544,#ff4d4544) left bottom/44px 1px no-repeat,linear-gradient(#ff4d4544,#ff4d4544) left bottom/1px 44px no-repeat,linear-gradient(#ff4d4544,#ff4d4544) right bottom/44px 1px no-repeat,linear-gradient(#ff4d4544,#ff4d4544) right bottom/1px 44px no-repeat;opacity:.55}

 :host([data-visual-mode="glass"]) .jv-cinema::before{background:radial-gradient(circle at 20% 30%,#b899ff10 0 1px,transparent 2px),radial-gradient(circle at 72% 18%,#7eeeff10 0 1px,transparent 2px);background-size:48px 48px,64px 64px;opacity:.5}
 :host([data-visual-mode="glass"]) .jv-telemetry{display:block;right:18px;bottom:18px;color:#d7ecff66;text-align:right}
 :host([data-visual-mode="glass"]) .jv-telemetry b{color:#fff}
 :host([data-visual-mode="glass"]) .jv-live-dot{color:#c0a7ff;background:#c0a7ff}

 :host([data-visual-mode="neural"]) .jv-telemetry{display:block;left:50%;bottom:14px;transform:translateX(-50%);color:#b995ff80;text-align:center;letter-spacing:2px}
 :host([data-visual-mode="neural"]) .jv-telemetry b{color:#d9c7ff}
 :host([data-visual-mode="neural"]) .jv-live-dot{color:#6eeaff;background:#6eeaff}
 :host([data-visual-mode="neural"]) .jv-cinema .neural-field{display:block;position:absolute;inset:0;background:radial-gradient(circle at 50% 38%,#8b5cff12 0 1px,transparent 2px);background-size:18px 18px;mask-image:radial-gradient(circle at 50% 38%,#000 0 32%,transparent 66%);animation:jvField 8s linear infinite}
 :host([data-visual-mode="neural"]) .jv-cinema .neural-arc{display:block;position:absolute;left:50%;top:38%;width:min(72vw,720px);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;border:1px solid #a974ff18;box-shadow:0 0 70px #6d43ff10,inset 0 0 70px #00eaff08;animation:jvArc 10s linear infinite}
 :host([data-visual-mode="neural"]) .jv-cinema .neural-arc::before,:host([data-visual-mode="neural"]) .jv-cinema .neural-arc::after{content:'';position:absolute;inset:10%;border-radius:50%;border:1px dashed #6eeaff1e;animation:jvArc 7s linear infinite reverse}
 :host([data-visual-mode="neural"]) .jv-cinema .neural-arc::after{inset:24%;border-style:dotted;border-color:#c487ff27;animation-duration:5s}

 @keyframes jvBeam{0%{top:3%}50%{top:97%}100%{top:3%}}
 @keyframes jvLive{0%,100%{opacity:.35;transform:scale(.75)}50%{opacity:1;transform:scale(1.2)}}
 @keyframes jvField{to{background-position:36px 18px}}
 @keyframes jvArc{to{transform:translate(-50%,-50%) rotate(360deg)}}
 @media(max-width:650px){.jv-telemetry{font-size:7px!important;bottom:max(8px,env(safe-area-inset-bottom))!important}.jv-telemetry span:nth-child(n+3){display:none}}
 @media(prefers-reduced-motion:reduce){.jv-live-dot,.jv-cinema .beam,.jv-cinema .neural-field,.jv-cinema .neural-arc,.jv-cinema .neural-arc::before,.jv-cinema .neural-arc::after{animation:none!important}}
 `};
 Panel.prototype._jarvisInstallCinematic=function(){
  const root=this._core?.shadowRoot;if(!root||root.getElementById('jarvisCinematicStyle'))return;
  const style=document.createElement('style');style.id='jarvisCinematicStyle';style.textContent=this._jarvisCinematicCss();root.appendChild(style);
  const layer=document.createElement('div');layer.className='jv-cinema';layer.innerHTML='<i class="beam"></i><i class="corners"></i><i class="neural-field"></i><i class="neural-arc"></i>';
  const telemetry=document.createElement('div');telemetry.className='jv-telemetry';telemetry.innerHTML='<span><i class="jv-live-dot"></i><b>JARVIS CORE</b> · LIVE</span><span>ASSIST LINK · ACTIVE</span><span>HOME CONTEXT · SYNC</span><span>SECURITY BUS · MONITOR</span>';
  root.append(layer,telemetry);
 };
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallCinematic()};
 Panel.prototype.__jarvisCinematicInstalled=true;
}
