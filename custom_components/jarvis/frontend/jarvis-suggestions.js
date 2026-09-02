/* JARVIS Core V3.0.26 — proposal review center, no automatic execution. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisSuggestionsInstalled){
 const AGENT_LABELS={jarvis:'JARVIS',energy:'ÉNERGIE',home:'MAISON',technical:'TECHNIQUE',sentinel:'SENTINEL',climate:'CLIMAT',water:'EAU',media:'MÉDIA',garden:'JARDIN',calendar:'CALENDRIER',chef:'CHEF'};
 const STATUS_LABELS={pending:'À ÉTUDIER',later:'PLUS TARD',approved:'IDÉE APPROUVÉE',dismissed:'IGNORÉE'};
 Panel.prototype._jarvisProposalReviews=async function(){
  try{const d=await this._hass?.callApi?.('GET','jarvis/settings');return d?.settings?.proposal_reviews||{}}catch(_){return{}}
 };
 Panel.prototype._jarvisSetProposalReview=async function(id,status){
  const reviews=await this._jarvisProposalReviews();reviews[id]={status,updated_at:new Date().toISOString()};
  try{await this._hass?.callApi?.('POST','jarvis/settings',{section:'proposal_reviews',value:reviews})}catch(_){return false}
  await this._jarvisLoadSuggestions();return true;
 };
 Panel.prototype._jarvisAskAboutProposal=function(item){
  const entities=Array.isArray(item.entities)&&item.entities.length?` Entités concernées : ${item.entities.join(', ')}.`:'';
  const text=`Analyse cette proposition JARVIS sans l'exécuter : ${item.title}. Motif : ${item.reason}.${entities} Explique l'intérêt, les risques et ce que tu proposerais exactement avant toute action.`;
  this._core?.process?.(text);
 };
 Panel.prototype._jarvisLoadSuggestions=async function(){
  const box=this._core?.shadowRoot?.getElementById('jarvisSuggestionsList');if(!box)return;
  box.textContent='Analyse des propositions…';
  try{
   if(!this._hass?.callApi)throw Error('API Home Assistant indisponible');
   const [d,reviews]=await Promise.all([this._hass.callApi('GET','jarvis/suggestions'),this._jarvisProposalReviews()]);
   const items=Array.isArray(d?.suggestions)?d.suggestions:[];const autonomy=this._jarvisAutonomyPolicy?.()||{};
   box.innerHTML='';
   if(!items.length){box.textContent='Aucune proposition actuellement.';return;}
   items.forEach(item=>{
    const review=reviews[item.id]||{status:'pending'};const status=review.status||'pending';
    const row=document.createElement('div');row.className=`jarvis-suggestion proposal-${status}`;
    const confidence=Math.round(Number(item.confidence||0)*100);const agent=String(item.agent||'jarvis');const autonomyLevel=autonomy[agent]||'observe';
    row.innerHTML='<div class="jarvis-suggestion-head"><strong></strong><span></span></div><div class="jarvis-suggestion-reason"></div><div class="jarvis-proposal-meta"></div><div class="jarvis-proposal-actions"><button data-act="ask">ANALYSER</button><button data-act="approve">APPROUVER L’IDÉE</button><button data-act="later">PLUS TARD</button><button data-act="dismiss">IGNORER</button></div>';
    row.querySelector('strong').textContent=item.title||'Proposition JARVIS';
    row.querySelector('span').textContent=AGENT_LABELS[agent]||agent.toUpperCase();
    row.querySelector('.jarvis-suggestion-reason').textContent=item.reason||'';
    row.querySelector('.jarvis-proposal-meta').textContent=`${STATUS_LABELS[status]||status} · confiance ${confidence}% · autonomie ${autonomyLevel} · aucune exécution automatique`;
    row.querySelector('[data-act="ask"]').onclick=()=>this._jarvisAskAboutProposal(item);
    row.querySelector('[data-act="approve"]').onclick=()=>this._jarvisSetProposalReview(item.id,'approved');
    row.querySelector('[data-act="later"]').onclick=()=>this._jarvisSetProposalReview(item.id,'later');
    row.querySelector('[data-act="dismiss"]').onclick=()=>this._jarvisSetProposalReview(item.id,'dismissed');
    box.appendChild(row);
   });
  }catch(e){box.textContent='Propositions indisponibles : '+e.message}
 };
 Panel.prototype._jarvisInstallSuggestions=function(){
  const root=this._core?.shadowRoot,grid=root?.querySelector('.grid');if(!grid||root.getElementById('jarvisSuggestionsCard'))return;
  const card=document.createElement('section');card.className='card';card.id='jarvisSuggestionsCard';
  card.innerHTML='<div class="title">💡 CENTRE DE PROPOSITIONS JARVIS</div><div id="jarvisSuggestionsList" class="jarvis-suggestions-list"></div><div class="row"><button type="button" id="jarvisSuggestionsRefresh">ACTUALISER</button></div>';
  grid.appendChild(card);
  const st=document.createElement('style');st.textContent='.jarvis-suggestions-list{display:grid;gap:8px;margin-top:8px}.jarvis-suggestion{padding:9px;border:1px solid #00eaff22;border-radius:8px;background:#03111c99}.jarvis-suggestion.proposal-approved{border-color:#39ff8840}.jarvis-suggestion.proposal-later{opacity:.82}.jarvis-suggestion.proposal-dismissed{opacity:.5}.jarvis-suggestion-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.jarvis-suggestion-head strong{font-size:10px}.jarvis-suggestion-head span{font-size:8px;letter-spacing:1px;color:#8bd6ea}.jarvis-suggestion-reason{font-size:9px;line-height:1.4;margin:5px 0;opacity:.82}.jarvis-proposal-meta{font-size:7px;opacity:.58;margin:5px 0 7px}.jarvis-proposal-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}.jarvis-proposal-actions button{min-height:30px;margin:0;padding:3px 5px;font-size:7px}@media(max-width:650px){.jarvis-proposal-actions{grid-template-columns:1fr 1fr}}';root.appendChild(st);
  card.querySelector('#jarvisSuggestionsRefresh').onclick=()=>this._jarvisLoadSuggestions();this._jarvisLoadSuggestions();
 };
 const baseBoot=Panel.prototype._bootCore;Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallSuggestions()};
 Panel.prototype.__jarvisSuggestionsInstalled=true;
}
