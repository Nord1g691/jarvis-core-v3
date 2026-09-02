/* JARVIS Core V3.0.26 — global health score card + subtle core health ring. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisHealthInstalled){
 const LABELS={core:'CORE',assist:'ASSIST',security:'SÉCURITÉ',memory:'MÉMOIRE',structure:'STRUCTURE'};
 const levelLabel=l=>({excellent:'EXCELLENT',good:'BON',warning:'À SURVEILLER',critical:'CRITIQUE'}[l]||String(l||'').toUpperCase());
 const levelColor=l=>({excellent:'#39ff88',good:'#00eaff',warning:'#ffb000',critical:'#ff4050'}[l]||'#00eaff');
 Panel.prototype._jarvisHealthRing=function(){
  const root=this._core?.shadowRoot,core=root?.getElementById('core');if(!root||!core)return null;
  let ring=core.querySelector('.jarvis-health-ring');
  if(!ring){
   ring=document.createElement('div');ring.className='jarvis-health-ring';ring.innerHTML='<div class="jarvis-health-ring-track"></div><div class="jarvis-health-ring-progress"></div><div class="jarvis-health-ring-dot"></div>';
   core.prepend(ring);
  }
  if(!root.getElementById('jarvisHealthRingStyle')){
   const s=document.createElement('style');s.id='jarvisHealthRingStyle';s.textContent=`
    .jarvis-health-ring{position:absolute;inset:-5.5%;border-radius:50%;pointer-events:none;z-index:0;opacity:.72;--jv-health-score:0;--jv-health-color:#00eaff;transition:opacity .3s ease}
    .jarvis-health-ring-track,.jarvis-health-ring-progress{position:absolute;inset:0;border-radius:50%}
    .jarvis-health-ring-track{border:1px solid #ffffff12;box-shadow:0 0 18px #0008 inset}
    .jarvis-health-ring-progress{background:conic-gradient(var(--jv-health-color) calc(var(--jv-health-score)*1%),transparent 0);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2px));mask:radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2px));filter:drop-shadow(0 0 5px var(--jv-health-color));transition:background .45s ease,filter .45s ease}
    .jarvis-health-ring-dot{position:absolute;left:50%;top:-2px;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--jv-health-color);box-shadow:0 0 8px var(--jv-health-color);transform-origin:2.5px calc(50% + 2px);transform:rotate(calc(var(--jv-health-score)*3.6deg)) translateY(0);opacity:.9}
    :host([data-visual-mode="holo"]) .jarvis-health-ring{inset:-7%;border-radius:6%;opacity:.9}.jarvis-health-ring-track{transition:.3s}
    :host([data-visual-mode="holo"]) .jarvis-health-ring-track,:host([data-visual-mode="holo"]) .jarvis-health-ring-progress{border-radius:6%}
    :host([data-visual-mode="sentinel"]) .jarvis-health-ring{inset:-7%;border-radius:0;clip-path:polygon(10% 0,90% 0,100% 10%,100% 90%,90% 100%,10% 100%,0 90%,0 10%);opacity:.88}
    :host([data-visual-mode="glass"]) .jarvis-health-ring{inset:-8%;opacity:.55;filter:blur(.15px)}
    :host([data-visual-mode="neural"]) .jarvis-health-ring{inset:-9%;opacity:.85;animation:jvHealthBreathe 4.5s ease-in-out infinite}
    @keyframes jvHealthBreathe{0%,100%{filter:drop-shadow(0 0 3px var(--jv-health-color))}50%{filter:drop-shadow(0 0 10px var(--jv-health-color))}}
    @media(prefers-reduced-motion:reduce){.jarvis-health-ring{animation:none!important}.jarvis-health-ring-progress{transition:none!important}}
   `;root.appendChild(s)
  }
  return ring;
 };
 Panel.prototype._jarvisApplyHealthToCore=function(score,level){
  const ring=this._jarvisHealthRing();if(!ring)return;
  const safe=Math.max(0,Math.min(100,Number(score)||0));
  ring.style.setProperty('--jv-health-score',String(safe));
  ring.style.setProperty('--jv-health-color',levelColor(level));
  ring.dataset.level=String(level||'unknown');
  ring.title=`Santé JARVIS / Maison : ${safe}/100 · ${levelLabel(level)}`;
 };
 Panel.prototype._jarvisLoadHealth=async function(){
  const root=this._core?.shadowRoot,scoreEl=root?.getElementById('jarvisHealthScore'),levelEl=root?.getElementById('jarvisHealthLevel'),bars=root?.getElementById('jarvisHealthBars'),issues=root?.getElementById('jarvisHealthIssues');
  if(!scoreEl||!levelEl||!bars||!issues)return;
  try{
   const d=await this._hass.callApi('GET','jarvis/diagnostics');
   const h=d?.health||{},score=Number(h.score||0),subs=h.sub_scores||{};
   scoreEl.textContent=String(score);
   levelEl.textContent=levelLabel(h.level);
   levelEl.dataset.level=h.level||'warning';
   this._jarvisApplyHealthToCore(score,h.level);
   bars.innerHTML=Object.entries(subs).map(([k,v])=>`<div class="jv-health-row"><span>${LABELS[k]||k.toUpperCase()}</span><div><i style="width:${Math.max(0,Math.min(100,Number(v)||0))}%"></i></div><b>${Number(v)||0}</b></div>`).join('');
   const list=Array.isArray(h.issues)?h.issues:[];
   issues.innerHTML=list.length?list.map(x=>`<div class="jv-health-issue ${String(x.severity||'info')}"><b>${String(x.area||'system').toUpperCase()}</b><span>${String(x.message||'')}</span></div>`).join(''):'<div class="jv-health-ok">Aucun problème prioritaire détecté.</div>';
  }catch(e){scoreEl.textContent='--';levelEl.textContent='INDISPONIBLE';issues.textContent='Health Score indisponible : '+e.message;this._jarvisApplyHealthToCore(0,'critical')}
 };
 Panel.prototype._jarvisInstallHealth=function(){
  const root=this._core?.shadowRoot,grid=root?.querySelector('.grid');if(!grid||root.getElementById('jarvisHealthCard'))return;
  const card=document.createElement('section');card.className='card';card.id='jarvisHealthCard';
  card.innerHTML='<div class="title">🩺 JARVIS / MAISON · HEALTH SCORE</div><div class="jv-health-head"><div class="jv-health-score" id="jarvisHealthScore">--</div><div><strong id="jarvisHealthLevel">ANALYSE…</strong><small>SCORE GLOBAL / 100</small></div></div><div id="jarvisHealthBars" class="jv-health-bars"></div><details class="jv-health-details"><summary>DÉTAIL DES ALERTES</summary><div id="jarvisHealthIssues" class="jv-health-issues"></div></details><button type="button" id="jarvisHealthRefresh">ACTUALISER</button>';
  grid.prepend(card);
  const s=document.createElement('style');s.textContent='.jv-health-head{display:flex;align-items:center;gap:12px}.jv-health-score{font-size:44px;font-weight:800;line-height:1}.jv-health-head strong{display:block;font-size:11px;letter-spacing:1px}.jv-health-head small{font-size:7px;opacity:.5}.jv-health-bars{display:grid;gap:6px;margin-top:10px}.jv-health-row{display:grid;grid-template-columns:72px 1fr 28px;gap:8px;align-items:center;font-size:8px}.jv-health-row>div{height:5px;background:#00131f;border-radius:99px;overflow:hidden}.jv-health-row i{display:block;height:100%;background:currentColor;box-shadow:0 0 8px currentColor}.jv-health-row b{text-align:right}.jv-health-details{margin-top:10px}.jv-health-details summary{cursor:pointer;font-size:8px;letter-spacing:1px;opacity:.7}.jv-health-issues{display:grid;gap:5px;margin-top:8px}.jv-health-issue{display:grid;grid-template-columns:80px 1fr;gap:8px;padding:6px;border:1px solid #00eaff20;border-radius:6px;font-size:8px}.jv-health-issue.critical{border-color:#ff405055}.jv-health-issue.warning{border-color:#ffb00044}.jv-health-ok{font-size:8px;opacity:.65;padding:6px 0}';root.appendChild(s);
  card.querySelector('#jarvisHealthRefresh').onclick=()=>this._jarvisLoadHealth();
  this._jarvisHealthRing();
  this._jarvisLoadHealth();
 };
 const baseBoot=Panel.prototype._bootCore;Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallHealth()};
 Panel.prototype.__jarvisHealthInstalled=true;
}
