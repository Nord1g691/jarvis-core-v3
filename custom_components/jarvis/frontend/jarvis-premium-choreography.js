/* JARVIS Premium cinematic choreography — structural motion per semantic state. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisPremiumChoreographyInstalled){
 Panel.prototype._jarvisPremiumChoreography=function(){
  const root=this._core?.shadowRoot;if(!root||root.getElementById('jarvisPremiumChoreographyStyle'))return;
  const s=document.createElement('style');s.id='jarvisPremiumChoreographyStyle';s.textContent=`
   :host([data-visual-mode="premium"]) .jv-premium-stage{transition:opacity .55s ease,transform .75s cubic-bezier(.2,.82,.2,1),filter .55s ease}
   :host([data-visual-mode="premium"]) .jvp-ring,:host([data-visual-mode="premium"]) .jvp-iris,:host([data-visual-mode="premium"]) .jvp-nucleus,:host([data-visual-mode="premium"]) .jvp-mesh,:host([data-visual-mode="premium"]) .jvp-arc{transition:inset .65s cubic-bezier(.2,.82,.2,1),opacity .45s ease,filter .45s ease,border-width .45s ease}

   /* ÉCOUTE — ouverture du Core vers la pièce, respiration lente et large. */
   :host([data-visual-mode="premium"]) .core.state-listen .jv-premium-stage{transform:scale(1.045) rotateX(3deg);filter:drop-shadow(0 0 16px color-mix(in srgb,var(--jvp-state) 25%,transparent))}
   :host([data-visual-mode="premium"]) .core.state-listen .jvp-r1{inset:-1%;opacity:1}
   :host([data-visual-mode="premium"]) .core.state-listen .jvp-r2{inset:7%;border-width:8px}
   :host([data-visual-mode="premium"]) .core.state-listen .jvp-r5{inset:34%}
   :host([data-visual-mode="premium"]) .core.state-listen .jvp-iris{inset:35%;opacity:.72}

   /* RÉFLEXION — contraction centrale, profondeur et contre-rotation plus dense. */
   :host([data-visual-mode="premium"]) .core.state-think .jv-premium-stage{transform:scale(.965) rotateX(9deg) rotateY(-5deg);filter:drop-shadow(0 0 20px color-mix(in srgb,var(--jvp-state) 28%,transparent))}
   :host([data-visual-mode="premium"]) .core.state-think .jvp-r1{inset:4%;opacity:.48}
   :host([data-visual-mode="premium"]) .core.state-think .jvp-r2{inset:12%;border-width:9px}
   :host([data-visual-mode="premium"]) .core.state-think .jvp-r3{inset:20%}
   :host([data-visual-mode="premium"]) .core.state-think .jvp-r5{inset:39%}
   :host([data-visual-mode="premium"]) .core.state-think .jvp-iris{inset:39%;opacity:1;filter:drop-shadow(0 0 8px var(--jvp-state))}
   :host([data-visual-mode="premium"]) .core.state-think .jvp-mesh{opacity:.68}

   /* RECHERCHE — ouverture radar, anneaux séparés et balayage dominant. */
   :host([data-visual-mode="premium"]) .core.state-search .jv-premium-stage{transform:scale(1.015) rotateX(5deg);filter:drop-shadow(0 0 18px color-mix(in srgb,var(--jvp-state) 30%,transparent))}
   :host([data-visual-mode="premium"]) .core.state-search .jvp-r1{inset:-3%;opacity:1}
   :host([data-visual-mode="premium"]) .core.state-search .jvp-r2{inset:5%;border-width:4px}
   :host([data-visual-mode="premium"]) .core.state-search .jvp-r3{inset:16%}
   :host([data-visual-mode="premium"]) .core.state-search .jvp-r4{inset:29%;opacity:.55}
   :host([data-visual-mode="premium"]) .core.state-search .jvp-scan{inset:3%;opacity:.95;filter:drop-shadow(0 0 9px var(--jvp-state))}
   :host([data-visual-mode="premium"]) .core.state-search .jvp-mesh{opacity:.28}

   /* PARLE — cœur projeté vers l'avant, iris ouvert et arcs énergétiques. */
   :host([data-visual-mode="premium"]) .core.state-speak .jv-premium-stage{transform:scale(1.035) translateZ(22px);filter:drop-shadow(0 0 24px color-mix(in srgb,var(--jvp-state) 34%,transparent))}
   :host([data-visual-mode="premium"]) .core.state-speak .jvp-r2{inset:8%;border-width:7px}
   :host([data-visual-mode="premium"]) .core.state-speak .jvp-r5{inset:33%}
   :host([data-visual-mode="premium"]) .core.state-speak .jvp-iris{inset:33%;opacity:.9}
   :host([data-visual-mode="premium"]) .core.state-speak .jvp-nucleus{inset:39%;filter:drop-shadow(0 0 18px var(--jvp-state))}
   :host([data-visual-mode="premium"]) .core.state-speak .jvp-arc{border-width:4px;opacity:1}

   /* ERREUR — rupture contrôlée, sans clignotement agressif. */
   :host([data-visual-mode="premium"]) .core.state-error .jv-premium-stage{transform:scale(.93) rotateZ(-2deg);filter:drop-shadow(0 0 18px #ff405066)}
   :host([data-visual-mode="premium"]) .core.state-error .jvp-r2{inset:11%;border-width:10px;opacity:.72}
   :host([data-visual-mode="premium"]) .core.state-error .jvp-mesh{opacity:.18}

   @media(max-width:760px){
    :host([data-visual-mode="premium"]) .core.state-listen .jv-premium-stage,:host([data-visual-mode="premium"]) .core.state-search .jv-premium-stage,:host([data-visual-mode="premium"]) .core.state-speak .jv-premium-stage{transform:scale(1.015)}
    :host([data-visual-mode="premium"]) .core.state-think .jv-premium-stage{transform:scale(.975) rotateX(4deg)}
   }
   @media(orientation:landscape) and (max-height:650px){
    :host([data-visual-mode="premium"]) .jv-premium-stage{filter:none!important}
    :host([data-visual-mode="premium"]) .core.state-listen .jv-premium-stage,:host([data-visual-mode="premium"]) .core.state-search .jv-premium-stage,:host([data-visual-mode="premium"]) .core.state-speak .jv-premium-stage{transform:scale(1)}
   }
   @media(prefers-reduced-motion:reduce){:host([data-visual-mode="premium"]) .jv-premium-stage{transform:none!important;filter:none!important}}
  `;root.appendChild(s);
 };
 const boot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await boot.call(this);this._jarvisPremiumChoreography()};
 Panel.prototype.__jarvisPremiumChoreographyInstalled=true;
}
