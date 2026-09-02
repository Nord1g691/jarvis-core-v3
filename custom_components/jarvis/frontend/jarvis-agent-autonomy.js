/* JARVIS Core V3.0.26 — per-agent autonomy policy, UI only. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisAgentAutonomyInstalled){
 const KEY='jarvis_agent_autonomy_v326';
 const AGENTS=[['jarvis','JARVIS'],['chef','Chef'],['energy','Énergie'],['sentinel','Sentinel'],['climate','Climat'],['water','Eau / Piscine'],['media','Média'],['garden','Jardin'],['calendar','Calendrier'],['mail','Messagerie'],['home','Maison'],['technical','Technique']];
 const LEVELS=[['observe','Observer'],['suggest','Suggérer'],['confirm','Agir avec confirmation'],['authorized','Autorisé']];
 const defaults=()=>Object.fromEntries(AGENTS.map(([k])=>[k,k==='jarvis'?'suggest':'observe']));
 const read=()=>{try{return {...defaults(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(_){return defaults()}};
 const save=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}};
 Panel.prototype._jarvisAutonomyPolicy=function(){return read()};
 Panel.prototype._jarvisSetAutonomy=function(agent,level){if(!LEVELS.some(([k])=>k===level))return;const v=read();v[agent]=level;save(v)};
 const baseRender=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){
  baseRender.call(this);const box=this.shadowRoot?.getElementById('cards');if(!box)return;
  let details=box.querySelector('.jarvis-autonomy-settings');
  if(!details){details=document.createElement('details');details.className='jarvis-settings-details jarvis-autonomy-settings';details.dataset.card='agent-autonomy';details.innerHTML='<summary><span>🛡️ AUTONOMIE DES AGENTS</span><b>POLITIQUE</b></summary><div class="jarvis-settings-body jarvis-autonomy-body"></div>';box.appendChild(details)}
  const body=details.querySelector('.jarvis-autonomy-body'),policy=read();
  body.innerHTML='<div class="jarvis-setting-note">Les niveaux définissent la politique future. En V3.0.26, aucune action sensible n’est exécutée automatiquement.</div>'+AGENTS.map(([k,label])=>`<div class="jarvis-autonomy-row"><span>${label}</span><select data-autonomy-agent="${k}">${LEVELS.map(([v,n])=>`<option value="${v}"${policy[k]===v?' selected':''}>${n}</option>`).join('')}</select></div>`).join('');
  body.querySelectorAll('[data-autonomy-agent]').forEach(sel=>sel.onchange=()=>this._jarvisSetAutonomy(sel.dataset.autonomyAgent,sel.value));
  if(!this.shadowRoot.getElementById('jarvisAutonomyStyle')){const s=document.createElement('style');s.id='jarvisAutonomyStyle';s.textContent='.jarvis-autonomy-row{display:grid;grid-template-columns:1fr minmax(170px,1.2fr);gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid #00eaff12}.jarvis-autonomy-row select{height:32px;border:1px solid #00eaff33;border-radius:6px;background:#020b14;color:#dffaff;padding:0 6px}@media(max-width:650px){.jarvis-autonomy-row{grid-template-columns:1fr}}';this.shadowRoot.appendChild(s)}
 };
 Panel.prototype.__jarvisAgentAutonomyInstalled=true;
}
