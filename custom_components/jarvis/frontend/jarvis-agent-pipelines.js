/* JARVIS Core V3.0.26 — explicit specialist -> Assist pipeline mapping. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisAgentPipelineMapInstalled){
 const KEY='jarvis_agent_pipeline_map_v326';
 const AGENTS=[
  ['jarvis','JARVIS'],['chef','Chef'],['energy','Énergie'],['sentinel','Sentinel'],
  ['climate','Climat'],['water','Eau / Piscine'],['media','Média'],['garden','Jardin'],
  ['calendar','Calendrier'],['mail','Messagerie'],['home','Maison'],['technical','Technique']
 ];
 const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch(_){return{}}};
 const save=v=>{try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}};
 Panel.prototype._jarvisPipelineMap=function(){return read()};
 Panel.prototype._jarvisSetPipelineForAgent=function(agent,pipeline){const map=read();if(pipeline)map[agent]=pipeline;else delete map[agent];save(map)};
 Panel.prototype._jarvisFetchPipelines=async function(){
  if(this.__jarvisPipelineCache)return this.__jarvisPipelineCache;
  try{
   const d=await this._hass?.callApi?.('GET','jarvis/structure');
   const p=Array.isArray(d?.pipelines)?d.pipelines:[];
   this.__jarvisPipelineCache=p;
   return p;
  }catch(_){return[]}
 };
 Panel.prototype._jarvisRenderPipelineMapping=async function(details){
  const body=details?.querySelector('.jarvis-agent-pipeline-body');if(!body)return;
  body.innerHTML='<div class="jarvis-setting-note">Chargement des pipelines Assist…</div>';
  const pipelines=await this._jarvisFetchPipelines(),map=read();
  if(!pipelines.length){body.innerHTML='<div class="jarvis-setting-empty">Aucun pipeline Assist détecté. Le routage spécialiste reste informatif.</div>';return}
  body.innerHTML=AGENTS.map(([key,label])=>`<div class="jarvis-agent-pipeline-row"><span>${label}</span><select data-agent-pipeline="${key}"><option value="">Pipeline actuel / aucun routage</option>${pipelines.map(p=>`<option value="${this._escapeSetting?.(p.id)||p.id}"${map[key]===p.id?' selected':''}>${this._escapeSetting?.(p.name||p.id)||p.name||p.id}</option>`).join('')}</select></div>`).join('');
  body.querySelectorAll('[data-agent-pipeline]').forEach(sel=>sel.onchange=()=>this._jarvisSetPipelineForAgent(sel.dataset.agentPipeline,sel.value));
 };
 const baseRender=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){
  baseRender.call(this);
  const box=this.shadowRoot?.getElementById('cards');if(!box)return;
  let details=box.querySelector('.jarvis-agent-pipeline-settings');
  if(!details){
   details=document.createElement('details');details.className='jarvis-settings-details jarvis-agent-pipeline-settings';details.dataset.card='agent-pipelines';
   details.innerHTML='<summary><span>🧠 AGENTS → PIPELINES ASSIST</span><b>RÉGLER</b></summary><div class="jarvis-settings-body jarvis-agent-pipeline-body"><div class="jarvis-setting-note">Chargement…</div></div>';
   details.addEventListener('toggle',()=>{if(details.open)this._jarvisRenderPipelineMapping(details)});
   box.appendChild(details);
  }
  if(details.open)this._jarvisRenderPipelineMapping(details);
  if(!this.shadowRoot.getElementById('jarvisAgentPipelineStyle')){const s=document.createElement('style');s.id='jarvisAgentPipelineStyle';s.textContent='.jarvis-agent-pipeline-row{display:grid;grid-template-columns:1fr minmax(150px,1.5fr);gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid #00eaff12}.jarvis-agent-pipeline-row select{min-width:0;height:32px;border:1px solid #00eaff33;border-radius:6px;background:#020b14;color:#dffaff;padding:0 6px}@media(max-width:650px){.jarvis-agent-pipeline-row{grid-template-columns:1fr}}';this.shadowRoot.appendChild(s)}
 };
 Panel.prototype.__jarvisAgentPipelineMapInstalled=true;
}
