/* JARVIS Core V3.0.26 — Home Assistant architecture overview. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisStructureUiInstalled){
 Panel.prototype._jarvisRenderStructureOverview=async function(details){
  const body=details?.querySelector('.jarvis-structure-body');if(!body)return;
  body.innerHTML='<div class="jarvis-setting-note">Lecture de la structure Home Assistant…</div>';
  try{
   const d=await this._hass?.callApi?.('GET','jarvis/structure');
   if(!d)throw Error('structure indisponible');
   const c=d.counts||{},cap=d.capabilities||{},pipelines=Array.isArray(d.pipelines)?d.pipelines:[];
   const helperCount=['input_boolean','input_button','input_text','input_number','input_select','timer','counter'].reduce((n,k)=>n+Number(c[k]||0),0);
   const rows=[
    ['Automatisations',c.automation||0],['Scripts',c.script||0],['Scènes',c.scene||0],['Helpers',helperCount],
    ['Pipelines Assist',pipelines.length],['Entités conversation',c.conversation||0],['Mémoires JARVIS',d.memory?.count||0],
    ['AI Tasks',c.ai_task||0],['Todos / tâches',c.todo||0],['Calendriers',c.calendar||0],['Personnes',c.person||0]
   ];
   body.innerHTML='<div class="jarvis-structure-grid">'+rows.map(([k,v])=>`<div><b>${v}</b><span>${k}</span></div>`).join('')+'</div><div class="jarvis-setting-note" style="margin-top:8px">'+[
    cap.automation?'automatisations ✓':'automatisations —',cap.scripts?'scripts ✓':'scripts —',cap.conversation_agents?'agents conversation ✓':'agents conversation —',cap.ai_tasks?'AI Task ✓':'AI Task —',cap.calendar?'calendrier ✓':'calendrier —',cap.memory?'mémoire ✓':'mémoire —'
   ].join(' · ')+'</div><button type="button" class="jarvis-structure-refresh">ACTUALISER</button>';
   body.querySelector('.jarvis-structure-refresh').onclick=()=>this._jarvisRenderStructureOverview(details);
  }catch(e){body.innerHTML='<div class="jarvis-setting-empty">Architecture indisponible : '+String(e.message||e)+'</div>'}
 };
 const baseRender=Panel.prototype._renderCards;
 Panel.prototype._renderCards=function(){
  baseRender.call(this);const box=this.shadowRoot?.getElementById('cards');if(!box)return;
  let details=box.querySelector('.jarvis-structure-settings');
  if(!details){details=document.createElement('details');details.className='jarvis-settings-details jarvis-structure-settings';details.dataset.card='structure';details.innerHTML='<summary><span>🏗️ ARCHITECTURE HOME ASSISTANT</span><b>VÉRIFIER</b></summary><div class="jarvis-settings-body jarvis-structure-body"><div class="jarvis-setting-note">Ouvre pour analyser la structure existante.</div></div>';details.addEventListener('toggle',()=>{if(details.open)this._jarvisRenderStructureOverview(details)});box.appendChild(details)}
  if(details.open)this._jarvisRenderStructureOverview(details);
  if(!this.shadowRoot.getElementById('jarvisStructureStyle')){const s=document.createElement('style');s.id='jarvisStructureStyle';s.textContent='.jarvis-structure-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.jarvis-structure-grid>div{padding:7px;border:1px solid #00eaff18;border-radius:7px;text-align:center}.jarvis-structure-grid b{display:block;font-size:15px}.jarvis-structure-grid span{display:block;font-size:7px;opacity:.65;margin-top:2px}.jarvis-structure-refresh{margin-top:8px;border:1px solid #00cfff44;border-radius:6px;background:#006b9422;color:inherit;padding:6px 9px}@media(max-width:650px){.jarvis-structure-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}';this.shadowRoot.appendChild(s)}
 };
 Panel.prototype.__jarvisStructureUiInstalled=true;
}
