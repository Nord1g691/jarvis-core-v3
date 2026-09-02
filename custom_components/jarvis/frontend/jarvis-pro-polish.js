/* JARVIS Core V3.0.26 — professional visual polish, Classic-safe. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisProPolishInstalled){
 Panel.prototype._jarvisProPolishCss=function(){return `
 :host([data-visual-mode]:not([data-visual-mode="classic"])){--jv-ease:cubic-bezier(.2,.75,.25,1);--jv-ease-spring:cubic-bezier(.16,1,.3,1);--jv-fast:160ms;--jv-mid:280ms;--jv-slow:520ms}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .app{padding-top:max(16px,env(safe-area-inset-top));padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right));padding-bottom:max(100px,calc(88px + env(safe-area-inset-bottom)));transition:background var(--jv-slow) var(--jv-ease),filter var(--jv-mid) var(--jv-ease);text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) header,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .core,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) #cardsDrawer,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .card,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) button,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) input,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) select{transition:transform var(--jv-mid) var(--jv-ease),border-color var(--jv-fast) ease,background-color var(--jv-fast) ease,box-shadow var(--jv-mid) var(--jv-ease),opacity var(--jv-fast) ease}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .logo{font-weight:700;text-rendering:geometricPrecision;-webkit-font-smoothing:antialiased}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .sub,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .title,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) #stateDock,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) #agentRouteDock{font-weight:600;text-rendering:geometricPrecision;-webkit-font-smoothing:antialiased}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .card{position:relative;overflow:hidden;isolation:isolate}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .card::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(120deg,transparent 0 42%,#ffffff09 49%,transparent 56%);transform:translateX(-120%);transition:transform .7s var(--jv-ease-spring);z-index:-1}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .card:hover::after{transform:translateX(120%)}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .card:hover{transform:translateY(-2px)}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) button{cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) button:hover{transform:translateY(-1px)}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) button:active{transform:translateY(0) scale(.985)}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) button:focus-visible,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) input:focus-visible,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) select:focus-visible{outline:2px solid #ffffff66;outline-offset:2px}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) input,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) select{font:inherit}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) #jarvisVisualButton,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) #backButton{box-shadow:0 8px 24px #0006}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) #jarvisVisualPopover{transform-origin:top right;animation:jvPopoverIn var(--jv-fast) var(--jv-ease-spring)}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) #cardsDrawer>summary{min-height:44px}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) #cardsDrawer>summary:hover{background:#ffffff06}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) #stateDock{font-weight:700;text-shadow:0 0 14px currentColor}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) #agentRouteDock{font-weight:600}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .core{will-change:transform;contain:layout paint style}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .glow{will-change:transform,filter}
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .ring,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .orbit,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .voiceBar,
 :host([data-visual-mode]:not([data-visual-mode="classic"])) .led{will-change:transform,opacity}

 :host([data-visual-mode="holo"]) .card:hover{box-shadow:inset 0 0 34px #00eaff10,0 0 0 1px #66f7ff24,0 12px 30px #0006}
 :host([data-visual-mode="holo"]) #cardsDrawer>summary{font-family:monospace}
 :host([data-visual-mode="holo"]) #cardsDrawer>summary::before{content:'SYS // ';opacity:.45}
 :host([data-visual-mode="sentinel"]) .card:hover{box-shadow:inset 3px 0 0 #ff4d4570,0 12px 30px #0007}
 :host([data-visual-mode="sentinel"]) #cardsDrawer>summary::before{content:'CONTROL // ';color:#ff5f5880}
 :host([data-visual-mode="sentinel"]) #stateDock{text-transform:uppercase}
 :host([data-visual-mode="glass"]) .card:hover{transform:translateY(-4px) scale(1.005);box-shadow:0 20px 44px #0007,inset 0 1px 0 #ffffff1c}
 :host([data-visual-mode="glass"]) #jarvisVisualPopover{border-color:#ffffff26;background:#0a1220dc;box-shadow:0 20px 50px #0008,inset 0 1px 0 #fff1}
 :host([data-visual-mode="neural"]) .card:hover{box-shadow:inset 0 0 36px #763cff12,0 0 30px #6e49ff16,0 14px 36px #0008}
 :host([data-visual-mode="neural"]) #stateDock{background:linear-gradient(90deg,#6eeaff,#b27cff,#ffffff,#b27cff,#6eeaff);background-clip:text;-webkit-background-clip:text;color:transparent;text-shadow:none}

 @keyframes jvPopoverIn{from{opacity:0;transform:translateY(-6px) scale(.96)}to{opacity:1;transform:none}}
 @media(hover:none){
  :host([data-visual-mode]:not([data-visual-mode="classic"])) .card:hover,
  :host([data-visual-mode]:not([data-visual-mode="classic"])) button:hover{transform:none}
  :host([data-visual-mode]:not([data-visual-mode="classic"])) .card::after{display:none}
 }
 @media(max-width:650px){
  :host([data-visual-mode]:not([data-visual-mode="classic"])) .app{padding-left:max(10px,env(safe-area-inset-left));padding-right:max(10px,env(safe-area-inset-right));padding-bottom:max(92px,calc(76px + env(safe-area-inset-bottom)))}
  :host([data-visual-mode]:not([data-visual-mode="classic"])) .card{padding:12px}
  :host([data-visual-mode]:not([data-visual-mode="classic"])) button{min-height:44px}
  :host([data-visual-mode]:not([data-visual-mode="classic"])) #jarvisVisualButton{right:max(10px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top))}
  :host([data-visual-mode]:not([data-visual-mode="classic"])) #backButton{left:max(10px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top))}
 }
 @media(prefers-reduced-motion:reduce){
  :host([data-visual-mode]:not([data-visual-mode="classic"])) *,
  :host([data-visual-mode]:not([data-visual-mode="classic"])) *::before,
  :host([data-visual-mode]:not([data-visual-mode="classic"])) *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
 }
 `};
 Panel.prototype._jarvisInstallProPolish=function(){
  const root=this._core?.shadowRoot;if(!root||root.getElementById('jarvisProPolishStyle'))return;
  const style=document.createElement('style');style.id='jarvisProPolishStyle';style.textContent=this._jarvisProPolishCss();root.appendChild(style);
 };
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallProPolish()};
 Panel.prototype.__jarvisProPolishInstalled=true;
}
