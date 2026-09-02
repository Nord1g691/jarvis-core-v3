/* JARVIS Core V3.0.26 — selectable visual skins without altering Classic HUD. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisVisualModesInstalled){
 const KEY='jarvis_visual_mode_v326';
 const MODES=[
  {key:'classic',name:'Classic HUD',tag:'ORIGINAL',desc:'Le design JARVIS actuel, conservé intact.'},
  {key:'holo',name:'Holo Grid',tag:'FUTURISTE',desc:'Grille holographique, scanner et panneaux techniques.'},
  {key:'sentinel',name:'Sentinel Tactical',tag:'SÉCURITÉ',desc:'Centre de contrôle tactique, angles nets et alertes.'},
  {key:'glass',name:'Glass Orbital',tag:'PREMIUM',desc:'Verre sombre, profondeur et orbites lumineuses.'},
  {key:'neural',name:'Neural Core',tag:'EXPÉRIMENTAL',desc:'Présence IA abstraite, matrice neurale et visage synthétique.'},
 ];
 const mode=()=>{const v=localStorage.getItem(KEY)||'classic';return MODES.some(x=>x.key===v)?v:'classic'};
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 Panel.prototype._jarvisVisualModes=function(){return MODES.map(x=>({...x}))};
 Panel.prototype._jarvisVisualMode=function(){return mode()};
 Panel.prototype._jarvisSetVisualMode=function(key){
  if(!MODES.some(x=>x.key===key))key='classic';localStorage.setItem(KEY,key);this._jarvisApplyVisualMode?.();this._jarvisSyncVisualPicker?.();
 };
 Panel.prototype._jarvisVisualCss=function(){return `
 :host{--jv-accent:#00eaff;--jv-accent2:#39ff88;--jv-surface:#031322dd;--jv-line:#00bfff33;--jv-radius:10px;--jv-font:Arial,sans-serif}
 :host([data-visual-mode="holo"]){--jv-accent:#66f7ff;--jv-accent2:#22ffc8;--jv-surface:#02131bd8;--jv-line:#66f7ff3f;--jv-radius:2px;--jv-font:monospace}
 :host([data-visual-mode="holo"]) .app{font-family:var(--jv-font);background-image:linear-gradient(#00eaff0c 1px,transparent 1px),linear-gradient(90deg,#00eaff0c 1px,transparent 1px),radial-gradient(circle at 50% 32%,#06384c 0,transparent 43%);background-size:28px 28px,28px 28px,auto;background-color:#01080d}
 :host([data-visual-mode="holo"]) header::after{content:'HOLOGRAPHIC INTERFACE // LIVE';display:block;margin:7px auto 0;font:8px monospace;letter-spacing:3px;color:#66f7ff88}
 :host([data-visual-mode="holo"]) .core{filter:drop-shadow(0 0 18px #00eaff35)}
 :host([data-visual-mode="holo"]) .ring{border-radius:3%;border-color:#66f7ff66}.core .jarvis-theme-overlay{position:absolute;inset:0;pointer-events:none;z-index:0;display:none}
 :host([data-visual-mode="holo"]) .jarvis-theme-overlay{display:block;background:linear-gradient(90deg,transparent 49.8%,#66f7ff32 50%,transparent 50.2%),linear-gradient(transparent 49.8%,#66f7ff32 50%,transparent 50.2%);clip-path:circle(48%);animation:jvHoloScan 4s linear infinite}
 :host([data-visual-mode="holo"]) .card{border-radius:2px;border-color:#66f7ff44;background:linear-gradient(135deg,#021923e8,#010b11e8);box-shadow:inset 0 0 24px #00eaff0a;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))}
 :host([data-visual-mode="holo"]) button{border-radius:1px;text-transform:uppercase}
 :host([data-visual-mode="sentinel"]){--jv-accent:#ff4d45;--jv-accent2:#ffb000;--jv-surface:#17090bdc;--jv-line:#ff4d4548;--jv-radius:3px}
 :host([data-visual-mode="sentinel"]) .app{background:radial-gradient(circle at 50% 32%,#3c0c10 0,transparent 38%),linear-gradient(135deg,#090607,#120708);font-family:monospace}
 :host([data-visual-mode="sentinel"]) .logo{color:#ffd6d4;text-shadow:0 0 12px #ff4038}.sub{transition:.3s}
 :host([data-visual-mode="sentinel"]) .sub{color:#ff8c86}:host([data-visual-mode="sentinel"]) .status{border-color:#ff4d4566}
 :host([data-visual-mode="sentinel"]) .core{border:1px solid #ff4d451c}.core .jarvis-theme-overlay{position:absolute;inset:0;pointer-events:none;z-index:0}
 :host([data-visual-mode="sentinel"]) .jarvis-theme-overlay{display:block;background:conic-gradient(from 0deg,transparent 0 77%,#ff4d4524 78% 80%,transparent 81%);clip-path:circle(49%);animation:spin 5s linear infinite}
 :host([data-visual-mode="sentinel"]) .ring{border-color:#ff5a5152}.core.state-listen .ring{transition:.3s}
 :host([data-visual-mode="sentinel"]) .card{border-radius:3px;border-color:#ff5a513c;background:#13090bdd;box-shadow:inset 3px 0 0 #ff4d4538}
 :host([data-visual-mode="sentinel"]) .title{color:#ff8b85}:host([data-visual-mode="sentinel"]) button{border-color:#ff5a514f;background:#5e12162e;border-radius:2px}
 :host([data-visual-mode="glass"]){--jv-accent:#8ee9ff;--jv-accent2:#c2a3ff;--jv-surface:#10223876;--jv-line:#bfefff32;--jv-radius:18px}
 :host([data-visual-mode="glass"]) .app{background:radial-gradient(circle at 18% 16%,#7048c733 0,transparent 28%),radial-gradient(circle at 82% 26%,#00cfff28 0,transparent 30%),linear-gradient(145deg,#050816,#0a1424 55%,#050712)}
 :host([data-visual-mode="glass"]) .core{filter:drop-shadow(0 20px 35px #0008)}
 :host([data-visual-mode="glass"]) .ring{border-color:#a6eaff42;box-shadow:inset 0 0 12px #9d7bff0c}
 :host([data-visual-mode="glass"]) .jarvis-theme-overlay{display:block;inset:11%;border-radius:50%;background:linear-gradient(135deg,#fff2,transparent 35%,#80dfff0d 62%,#cba8ff1f);border:1px solid #fff2;backdrop-filter:blur(2px);box-shadow:inset -18px -18px 50px #885cff11,inset 12px 12px 40px #8ee9ff10}
 :host([data-visual-mode="glass"]) .card{border-radius:18px;border-color:#d6f7ff28;background:linear-gradient(145deg,#13263c91,#09131f88);backdrop-filter:blur(18px);box-shadow:0 14px 35px #0005,inset 0 1px 0 #fff1}
 :host([data-visual-mode="glass"]) button{border-radius:14px;background:#76dfff15;border-color:#bcefff2f;backdrop-filter:blur(8px)}
 :host([data-visual-mode="neural"]){--jv-accent:#a974ff;--jv-accent2:#00eaff;--jv-surface:#090819e5;--jv-line:#a974ff38;--jv-radius:9px}
 :host([data-visual-mode="neural"]) .app{background:radial-gradient(ellipse at 50% 28%,#37146666 0,transparent 34%),radial-gradient(circle at 50% 50%,#001c33 0,transparent 52%),#03030b;font-family:monospace}
 :host([data-visual-mode="neural"]) .logo{background:linear-gradient(90deg,#68efff,#b576ff,#fff,#b576ff,#68efff);background-clip:text;-webkit-background-clip:text;color:transparent;text-shadow:none}
 :host([data-visual-mode="neural"]) .core{perspective:700px}.core .jarvis-neural-face{display:none;position:absolute;inset:30%;z-index:4;pointer-events:none;border-radius:46% 46% 52% 52%;border:1px solid #ba8cff38;box-shadow:inset 0 0 35px #924dff22,0 0 28px #00eaff18}
 :host([data-visual-mode="neural"]) .jarvis-neural-face{display:block;animation:jvNeuralFloat 4.5s ease-in-out infinite}
 :host([data-visual-mode="neural"]) .jarvis-neural-face::before{content:'';position:absolute;left:18%;right:18%;top:33%;height:7px;background:radial-gradient(ellipse at 12% 50%,#fff 0 7%,#00eaff 8% 25%,transparent 27%),radial-gradient(ellipse at 88% 50%,#fff 0 7%,#a974ff 8% 25%,transparent 27%);filter:drop-shadow(0 0 7px #9e76ff)}
 :host([data-visual-mode="neural"]) .jarvis-neural-face::after{content:'';position:absolute;left:32%;right:32%;bottom:24%;height:1px;background:linear-gradient(90deg,transparent,#9ddfff,#c088ff,transparent);box-shadow:0 0 8px #a974ff}
 :host([data-visual-mode="neural"]) .jarvis-theme-overlay{display:block;inset:6%;border-radius:50%;background:repeating-radial-gradient(circle,#a974ff0f 0 1px,transparent 2px 18px);animation:jvNeuralPulse 3s ease-in-out infinite}
 :host([data-visual-mode="neural"]) .ring{border-color:#a974ff48}:host([data-visual-mode="neural"]) .card{border-color:#a974ff30;background:linear-gradient(160deg,#100c24e8,#041220dc);box-shadow:inset 0 0 25px #763cff0a}
 :host([data-visual-mode="neural"]) .title{color:#c5a7ff}
 @keyframes jvHoloScan{0%{transform:translateY(-3%);opacity:.45}50%{transform:translateY(3%);opacity:.9}100%{transform:translateY(-3%);opacity:.45}}
 @keyframes jvNeuralFloat{0%,100%{transform:rotateX(2deg) translateY(0);opacity:.7}50%{transform:rotateX(-3deg) translateY(-5px);opacity:1}}
 @keyframes jvNeuralPulse{0%,100%{transform:scale(.98);opacity:.35}50%{transform:scale(1.025);opacity:.8}}
 `};
 Panel.prototype._jarvisEnsureVisualLayers=function(){
  const root=this._core?.shadowRoot,core=root?.getElementById('core');if(!root||!core)return;
  if(!root.getElementById('jarvisVisualModesStyle')){const s=document.createElement('style');s.id='jarvisVisualModesStyle';s.textContent=this._jarvisVisualCss();root.appendChild(s)}
  if(!core.querySelector('.jarvis-theme-overlay')){const o=document.createElement('div');o.className='jarvis-theme-overlay';core.prepend(o)}
  if(!core.querySelector('.jarvis-neural-face')){const f=document.createElement('div');f.className='jarvis-neural-face';core.appendChild(f)}
 };
 Panel.prototype._jarvisApplyVisualMode=function(){const hud=this._core;if(!hud)return;this._jarvisEnsureVisualLayers();hud.setAttribute('data-visual-mode',mode())};
 Panel.prototype._jarvisPreviewHtml=function(active){return MODES.map(m=>`<button type="button" class="jv-theme-card ${active===m.key?'active':''}" data-jv-theme="${m.key}"><span class="jv-mini jv-mini-${m.key}"><i></i><i></i><i></i></span><strong>${esc(m.name)}</strong><small>${esc(m.tag)}</small><em>${esc(m.desc)}</em></button>`).join('')};
 Panel.prototype._jarvisSyncVisualPicker=function(){
  const active=mode();const root=this._core?.shadowRoot;
  root?.querySelectorAll('[data-jv-quick-theme]').forEach(b=>b.classList.toggle('active',b.dataset.jvQuickTheme===active));
  this.shadowRoot?.querySelectorAll('[data-jv-theme]').forEach(b=>b.classList.toggle('active',b.dataset.jvTheme===active));
 };
 Panel.prototype._jarvisInstallCornerVisualPicker=function(){
  const root=this._core?.shadowRoot;if(!root||root.getElementById('jarvisVisualButton'))return;
  const btn=document.createElement('button');btn.id='jarvisVisualButton';btn.type='button';btn.title='Changer le design JARVIS';btn.textContent='◈';btn.style.cssText='position:fixed;right:12px;top:12px;z-index:10002;width:36px;min-width:36px;height:34px;min-height:34px;margin:0;padding:0;border-radius:9px;font-size:18px;backdrop-filter:blur(12px)';
  const pop=document.createElement('div');pop.id='jarvisVisualPopover';pop.hidden=true;pop.innerHTML='<div class="jv-pop-title">DESIGN JARVIS</div>'+MODES.map(m=>`<button type="button" data-jv-quick-theme="${m.key}"><span class="jv-dot jv-dot-${m.key}"></span>${esc(m.name)}</button>`).join('');pop.style.cssText='position:fixed;right:12px;top:54px;z-index:10003;width:200px;padding:8px;border:1px solid #00eaff33;border-radius:10px;background:#020711ee;backdrop-filter:blur(18px);box-shadow:0 12px 35px #0009';
  root.append(btn,pop);btn.onclick=()=>{pop.hidden=!pop.hidden};pop.querySelectorAll('[data-jv-quick-theme]').forEach(b=>b.onclick=()=>{this._jarvisSetVisualMode(b.dataset.jvQuickTheme);pop.hidden=true});
  const st=document.createElement('style');st.id='jarvisVisualPickerStyle';st.textContent='#jarvisVisualPopover .jv-pop-title{padding:4px 6px 7px;font:8px monospace;letter-spacing:2px;opacity:.6}#jarvisVisualPopover button{display:flex;align-items:center;gap:8px;width:100%;min-height:30px;margin:2px 0;padding:0 7px;text-align:left;font-size:9px}#jarvisVisualPopover button.active{border-color:#fff7}.jv-dot{width:9px;height:9px;border-radius:50%;background:#00eaff;box-shadow:0 0 6px currentColor}.jv-dot-holo{background:#66f7ff}.jv-dot-sentinel{background:#ff4d45}.jv-dot-glass{background:#bda2ff}.jv-dot-neural{background:#a974ff}';root.appendChild(st);this._jarvisSyncVisualPicker();
 };
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisApplyVisualMode();this._jarvisInstallCornerVisualPicker()};
 const baseRender=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){
  baseRender.call(this);const box=this.shadowRoot?.getElementById('cards');if(!box)return;
  let details=box.querySelector('.jarvis-visual-mode-settings');
  if(!details){details=document.createElement('details');details.className='jarvis-settings-details jarvis-visual-mode-settings';details.dataset.card='visual-modes';details.innerHTML='<summary><span>◈ APPARENCE / DESIGN JARVIS</span><b>CHOISIR</b></summary><div class="jarvis-settings-body"><div class="jarvis-setting-note">Le mode Classic reste exactement le HUD original. Les autres sont des skins indépendants.</div><div class="jv-theme-gallery"></div></div>';box.appendChild(details)}
  const gallery=details.querySelector('.jv-theme-gallery');if(gallery){gallery.innerHTML=this._jarvisPreviewHtml(mode());gallery.querySelectorAll('[data-jv-theme]').forEach(b=>b.onclick=()=>this._jarvisSetVisualMode(b.dataset.jvTheme))}
  if(!this.shadowRoot.getElementById('jarvisVisualGalleryStyle')){const s=document.createElement('style');s.id='jarvisVisualGalleryStyle';s.textContent='.jv-theme-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:9px}.jv-theme-card{display:grid!important;grid-template-columns:64px 1fr auto!important;grid-template-rows:auto auto 1fr!important;gap:2px 8px!important;align-items:center!important;text-align:left!important;padding:8px!important;min-height:82px!important;margin:0!important;background:#020b14!important}.jv-theme-card.active{border-color:#39ff88!important;box-shadow:inset 0 0 18px #39ff8810}.jv-theme-card strong{font-size:10px}.jv-theme-card small{font-size:6px;letter-spacing:1px;opacity:.55}.jv-theme-card em{grid-column:2/4;font-size:7px;font-style:normal;opacity:.55;align-self:start}.jv-mini{grid-row:1/4;position:relative;width:58px;height:58px;border-radius:8px;overflow:hidden;background:#020711;border:1px solid #00eaff33}.jv-mini i{position:absolute;left:50%;top:50%;border:1px solid #00eaff66;border-radius:50%;transform:translate(-50%,-50%)}.jv-mini i:nth-child(1){width:44px;height:44px}.jv-mini i:nth-child(2){width:31px;height:31px}.jv-mini i:nth-child(3){width:10px;height:10px;background:#00eaff;box-shadow:0 0 8px #00eaff}.jv-mini-holo{background:linear-gradient(#00eaff12 1px,transparent 1px),linear-gradient(90deg,#00eaff12 1px,transparent 1px),#01090d;background-size:9px 9px}.jv-mini-holo i{border-radius:3%;border-color:#66f7ff88}.jv-mini-sentinel{background:#120708}.jv-mini-sentinel i{border-color:#ff4d4566}.jv-mini-sentinel i:nth-child(3){background:#ff4d45;box-shadow:0 0 8px #ff4d45}.jv-mini-glass{background:radial-gradient(circle at 25% 20%,#7c5cff55,transparent 42%),#081225}.jv-mini-glass i{border-color:#c4eeff55;box-shadow:inset 0 0 8px #9f7cff22}.jv-mini-neural{background:radial-gradient(circle,#391767,#03030b 70%)}.jv-mini-neural i:nth-child(1){border-radius:45%}.jv-mini-neural i:nth-child(2){width:24px;height:5px;border:0;background:linear-gradient(90deg,#00eaff,transparent 40%,#a974ff)}.jv-mini-neural i:nth-child(3){width:20px;height:1px;background:#b78aff;box-shadow:0 0 6px #a974ff}@media(max-width:650px){.jv-theme-gallery{grid-template-columns:1fr}}';this.shadowRoot.appendChild(s)}this._jarvisSyncVisualPicker();
 };
 Panel.prototype.__jarvisVisualModesInstalled=true;
}
