/* JARVIS Premium compatibility polish — safe CSS for iOS/WebView and mobile load. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisPremiumPolishInstalled){
 Panel.prototype._jarvisPremiumPolish=function(){
  const root=this._core?.shadowRoot;if(!root||root.getElementById('jarvisPremiumPolishStyle'))return;
  const s=document.createElement('style');s.id='jarvisPremiumPolishStyle';s.textContent=`
   :host([data-visual-mode="premium"]) .jvp-spark{transform:rotate(calc(var(--i) * 10deg)) translateY(-44%)!important;opacity:.42}
   :host([data-visual-mode="premium"]) .jvp-tick{opacity:.42}
   :host([data-visual-mode="premium"]) .jvp-ring,:host([data-visual-mode="premium"]) .jvp-arc,:host([data-visual-mode="premium"]) .jvp-mesh{will-change:transform,opacity}
   :host([data-visual-mode="premium"]) .jvp-nucleus,:host([data-visual-mode="premium"]) .jvp-aura{will-change:transform,opacity,filter}
   @media(max-width:760px){
    :host([data-visual-mode="premium"]) .jvp-spark:nth-child(n+19){display:none}
    :host([data-visual-mode="premium"]) .jvp-tick:nth-child(2n){opacity:.24}
    :host([data-visual-mode="premium"]) .jvp-mesh-c{display:none}
   }
   @media(orientation:landscape) and (max-height:650px){
    :host([data-visual-mode="premium"]) .jvp-spark:nth-child(n+13){display:none}
    :host([data-visual-mode="premium"]) .jvp-mesh-b,:host([data-visual-mode="premium"]) .jvp-mesh-c{display:none}
    :host([data-visual-mode="premium"]) .jvp-aura{filter:blur(3px)}
   }
   @media(prefers-reduced-motion:reduce){
    :host([data-visual-mode="premium"]) .jvp-spark,:host([data-visual-mode="premium"]) .jvp-scan{display:none!important}
   }
  `;root.appendChild(s);
 };
 const boot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await boot.call(this);this._jarvisPremiumPolish()};
 Panel.prototype.__jarvisPremiumPolishInstalled=true;
}
