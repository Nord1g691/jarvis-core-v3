/* JARVIS V4.0.0 — structural layouts for native V4 visual modes. */
const Panel=customElements.get('jarvis-panel-v4');
if(Panel&&!Panel.prototype.__jarvisLayoutModesInstalled){
 Panel.prototype._jarvisLayoutCss=function(){return `
 /* Native V4 layout: preserve the circular Core and avoid legacy state/card docks. */
 @media(min-width:900px){
  :host([data-visual-mode="holo"]) .app{padding:18px 24px 90px}
  :host([data-visual-mode="holo"]) header{text-align:left;padding-left:14px;border-left:2px solid #66f7ff55}
  :host([data-visual-mode="holo"]) .grid{grid-template-columns:repeat(2,minmax(0,1fr));max-width:1100px}

  :host([data-visual-mode="sentinel"]) .app{padding:14px 20px 80px}
  :host([data-visual-mode="sentinel"]) header{text-align:left;padding:10px 14px;border-top:2px solid #ff4d4566;border-bottom:1px solid #ff4d4525;background:linear-gradient(90deg,#ff4d4510,transparent 60%)}
  :host([data-visual-mode="sentinel"]) .grid{grid-template-columns:repeat(2,minmax(0,1fr));max-width:1050px}

  :host([data-visual-mode="glass"]) .app{padding:20px 28px 100px}
  :host([data-visual-mode="glass"]) .grid{grid-template-columns:repeat(3,minmax(0,1fr));max-width:1200px;gap:14px}

  :host([data-visual-mode="neural"]) .app{padding:16px 24px 90px}
  :host([data-visual-mode="neural"]) .grid{grid-template-columns:repeat(2,minmax(0,1fr));max-width:1200px}
 }

 :host([data-visual-mode="holo"]) header .logo{font-family:monospace;text-align:left;font-size:34px;letter-spacing:8px}
 :host([data-visual-mode="holo"]) .core{overflow:visible}
 :host([data-visual-mode="holo"]) .glow{border-radius:16%;transform:rotate(45deg)}
 :host([data-visual-mode="holo"]) .voiceBars{transform:translate(-50%,-50%) rotate(-45deg)}

 :host([data-visual-mode="sentinel"]) .logo{font-size:30px;letter-spacing:8px;text-align:left}
 :host([data-visual-mode="sentinel"]) .glow{border-radius:3px;width:22%;height:22%}

 :host([data-visual-mode="glass"]) .logo{font-weight:300;letter-spacing:16px;font-size:38px}
 :host([data-visual-mode="glass"]) .core{transform:translateZ(0) rotateX(2deg)}
 :host([data-visual-mode="glass"]) .glow{width:31%;height:31%;backdrop-filter:blur(10px)}

 :host([data-visual-mode="neural"]) header .sub{letter-spacing:6px}
 :host([data-visual-mode="neural"]) .core{transform-style:preserve-3d}
 :host([data-visual-mode="neural"]) .r1{transform:rotateX(66deg) rotateZ(8deg)}
 :host([data-visual-mode="neural"]) .r2{transform:rotateY(64deg) rotateZ(-12deg)}
 :host([data-visual-mode="neural"]) .r3{transform:rotateX(58deg) rotateY(20deg)}
 :host([data-visual-mode="neural"]) .r4{transform:rotateY(58deg) rotateX(-18deg)}
 :host([data-visual-mode="neural"]) .r5{transform:rotateX(74deg)}
 :host([data-visual-mode="neural"]) .glow{width:18%;height:28%;border-radius:45% 45% 50% 50%;animation:jvBrainBreath 3.2s ease-in-out infinite}
 @keyframes jvBrainBreath{0%,100%{transform:scale(.96) translateZ(20px)}50%{transform:scale(1.06) translateZ(34px)}}

 @media(max-width:899px){
  :host([data-visual-mode="holo"]) .app,:host([data-visual-mode="sentinel"]) .app,:host([data-visual-mode="glass"]) .app,:host([data-visual-mode="neural"]) .app{display:block;padding-left:12px;padding-right:12px}
  :host([data-visual-mode="holo"]) .core,:host([data-visual-mode="sentinel"]) .core,:host([data-visual-mode="glass"]) .core,:host([data-visual-mode="neural"]) .core{position:relative;top:auto;width:74vw;height:74vw;max-width:390px;max-height:390px;margin:12px auto 44px}
  :host([data-visual-mode="glass"]) .grid,:host([data-visual-mode="neural"]) .grid,:host([data-visual-mode="holo"]) .grid,:host([data-visual-mode="sentinel"]) .grid{grid-template-columns:1fr}
 }
 `};
 Panel.prototype._jarvisInstallLayoutModes=function(){const root=this._core?.shadowRoot;if(!root||root.getElementById('jarvisLayoutModesStyle'))return;const style=document.createElement('style');style.id='jarvisLayoutModesStyle';style.textContent=this._jarvisLayoutCss();root.appendChild(style)};
 const baseBoot=Panel.prototype._bootCore;Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallLayoutModes()};
 Panel.prototype.__jarvisLayoutModesInstalled=true;
}
