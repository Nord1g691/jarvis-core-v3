/* JARVIS Core V3.0.26 — structural layouts for selectable visual modes. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisLayoutModesInstalled){
 Panel.prototype._jarvisLayoutCss=function(){return `
 /* Classic intentionally untouched. */
 @media(min-width:900px){
  :host([data-visual-mode="holo"]) .app{display:grid;grid-template-columns:minmax(360px,.85fr) minmax(440px,1.25fr);grid-template-rows:auto auto auto 1fr;column-gap:26px;align-items:start;padding:18px 24px 90px}
  :host([data-visual-mode="holo"]) header{grid-column:1/-1;grid-row:1;text-align:left;padding-left:14px;border-left:2px solid #66f7ff55}
  :host([data-visual-mode="holo"]) .core{grid-column:1;grid-row:2/5;width:min(42vw,480px);height:min(42vw,480px);position:sticky;top:70px;margin:18px auto}
  :host([data-visual-mode="holo"]) #stateDock,:host([data-visual-mode="holo"]) #agentRouteDock{grid-column:1}
  :host([data-visual-mode="holo"]) #cardsDrawer{grid-column:2;grid-row:2/5;margin-top:18px;width:100%}
  :host([data-visual-mode="holo"]) #cardsDrawer>.grid{grid-template-columns:1fr 1fr}

  :host([data-visual-mode="sentinel"]) .app{display:grid;grid-template-columns:minmax(410px,1.1fr) minmax(360px,.9fr);grid-template-rows:auto auto auto 1fr;gap:12px 18px;padding:14px 20px 80px}
  :host([data-visual-mode="sentinel"]) header{grid-column:1/-1;grid-row:1;text-align:left;padding:10px 14px;border-top:2px solid #ff4d4566;border-bottom:1px solid #ff4d4525;background:linear-gradient(90deg,#ff4d4510,transparent 60%)}
  :host([data-visual-mode="sentinel"]) .core{grid-column:2;grid-row:2/5;width:min(38vw,430px);height:min(38vw,430px);position:sticky;top:72px;margin:12px auto}
  :host([data-visual-mode="sentinel"]) #stateDock,:host([data-visual-mode="sentinel"]) #agentRouteDock{grid-column:2}
  :host([data-visual-mode="sentinel"]) #cardsDrawer{grid-column:1;grid-row:2/5;margin:12px 0 0;width:100%}
  :host([data-visual-mode="sentinel"]) #cardsDrawer>.grid{grid-template-columns:1fr}
  :host([data-visual-mode="sentinel"]) #cardsDrawer .card{position:relative;padding-left:18px}
  :host([data-visual-mode="sentinel"]) #cardsDrawer .card::before{content:'SEC';position:absolute;right:8px;top:7px;font:7px monospace;letter-spacing:2px;color:#ff5f5880}

  :host([data-visual-mode="glass"]) .app{display:grid;grid-template-columns:minmax(300px,.75fr) minmax(520px,1.35fr) minmax(220px,.55fr);grid-template-rows:auto auto auto 1fr;gap:14px 18px;padding:20px 28px 100px}
  :host([data-visual-mode="glass"]) header{grid-column:1/-1;grid-row:1}
  :host([data-visual-mode="glass"]) .core{grid-column:2;grid-row:2;width:min(40vw,460px);height:min(40vw,460px);margin:6px auto 0}
  :host([data-visual-mode="glass"]) #stateDock{grid-column:2;grid-row:3}
  :host([data-visual-mode="glass"]) #agentRouteDock{grid-column:2;grid-row:4;align-self:start}
  :host([data-visual-mode="glass"]) #cardsDrawer{grid-column:1/-1;grid-row:5;width:100%;margin-top:8px}
  :host([data-visual-mode="glass"]) #cardsDrawer>.grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
  :host([data-visual-mode="glass"]) #cardsDrawer .card{min-height:118px}

  :host([data-visual-mode="neural"]) .app{display:grid;grid-template-columns:minmax(260px,.6fr) minmax(470px,1.15fr) minmax(260px,.6fr);grid-template-rows:auto auto auto 1fr;gap:10px 16px;padding:16px 24px 90px}
  :host([data-visual-mode="neural"]) header{grid-column:1/-1;grid-row:1}
  :host([data-visual-mode="neural"]) .core{grid-column:2;grid-row:2/4;width:min(42vw,500px);height:min(42vw,500px);margin:0 auto}
  :host([data-visual-mode="neural"]) #stateDock{grid-column:2;grid-row:4}
  :host([data-visual-mode="neural"]) #agentRouteDock{grid-column:2;grid-row:5}
  :host([data-visual-mode="neural"]) #cardsDrawer{grid-column:1/-1;grid-row:6;width:100%;margin-top:8px}
  :host([data-visual-mode="neural"]) #cardsDrawer>.grid{grid-template-columns:repeat(2,minmax(0,1fr));max-width:1200px}
  :host([data-visual-mode="neural"]) #cardsDrawer .card:nth-child(odd){transform:translateY(8px)}
 }

 :host([data-visual-mode="holo"]) header .logo{font-family:monospace;text-align:left;font-size:34px;letter-spacing:8px}
 :host([data-visual-mode="holo"]) .core{border-radius:7%;overflow:visible}
 :host([data-visual-mode="holo"]) .core::after{content:'';position:absolute;inset:-6%;border-radius:4%;border:1px solid #66f7ff22;box-shadow:inset 0 0 0 1px #66f7ff0d;opacity:1;transform:none}
 :host([data-visual-mode="holo"]) .glow{border-radius:16%;transform:rotate(45deg)}
 :host([data-visual-mode="holo"]) .voiceBars{transform:translate(-50%,-50%) rotate(-45deg)}

 :host([data-visual-mode="sentinel"]) .logo{font-size:30px;letter-spacing:8px;text-align:left}
 :host([data-visual-mode="sentinel"]) .core{border-radius:0;clip-path:polygon(10% 0,90% 0,100% 10%,100% 90%,90% 100%,10% 100%,0 90%,0 10%)}
 :host([data-visual-mode="sentinel"]) .ring{border-radius:0;clip-path:polygon(12% 0,88% 0,100% 12%,100% 88%,88% 100%,12% 100%,0 88%,0 12%)}
 :host([data-visual-mode="sentinel"]) .glow{border-radius:3px;width:22%;height:22%}
 :host([data-visual-mode="sentinel"]) .orbit,:host([data-visual-mode="sentinel"]) .orbit2{border-radius:3px}

 :host([data-visual-mode="glass"]) .logo{font-weight:300;letter-spacing:16px;font-size:38px}
 :host([data-visual-mode="glass"]) .core{transform:translateZ(0) rotateX(2deg)}
 :host([data-visual-mode="glass"]) .r1{inset:0}.r2{transition:.4s}
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
  :host([data-visual-mode="holo"]) .core,:host([data-visual-mode="sentinel"]) .core,:host([data-visual-mode="glass"]) .core,:host([data-visual-mode="neural"]) .core{position:relative;top:auto;width:88vw;height:88vw;max-width:500px;max-height:500px;margin:12px auto}
  :host([data-visual-mode="glass"]) #cardsDrawer>.grid,:host([data-visual-mode="neural"]) #cardsDrawer>.grid{grid-template-columns:1fr}
 }
 `};
 Panel.prototype._jarvisInstallLayoutModes=function(){
  const root=this._core?.shadowRoot;if(!root||root.getElementById('jarvisLayoutModesStyle'))return;
  const style=document.createElement('style');style.id='jarvisLayoutModesStyle';style.textContent=this._jarvisLayoutCss();root.appendChild(style);
 };
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallLayoutModes()};
 Panel.prototype.__jarvisLayoutModesInstalled=true;
}
