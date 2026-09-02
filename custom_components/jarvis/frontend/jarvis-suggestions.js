/* JARVIS Core V3.0.26 — read-only suggestions card. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisSuggestionsInstalled){
 const AGENT_LABELS={jarvis:'JARVIS',energy:'ÉNERGIE',home:'MAISON',technical:'TECHNIQUE',sentinel:'SENTINEL',climate:'CLIMAT',water:'EAU',media:'MÉDIA',garden:'JARDIN',calendar:'CALENDRIER',chef:'CHEF'};
 Panel.prototype._jarvisLoadSuggestions=async function(){
  const box=this._core?.shadowRoot?.getElementById('jarvisSuggestionsList');
  if(!box)return;
  box.textContent='Analyse des suggestions…';
  try{
   if(!this._hass?.callApi)throw Error('API Home Assistant indisponible');
   const d=await this._hass.callApi('GET','jarvis/suggestions');
   const items=Array.isArray(d?.suggestions)?d.suggestions:[];
   box.innerHTML='';
   if(!items.length){box.textContent='Aucune suggestion actuellement.';return;}
   items.forEach(item=>{
    const row=document.createElement('div');row.className='jarvis-suggestion';
    const confidence=Math.round(Number(item.confidence||0)*100);
    row.innerHTML='<div class="jarvis-suggestion-head"><strong></strong><span></span></div><div class="jarvis-suggestion-reason"></div><small></small>';
    row.querySelector('strong').textContent=item.title||'Suggestion JARVIS';
    row.querySelector('span').textContent=AGENT_LABELS[item.agent]||String(item.agent||'JARVIS').toUpperCase();
    row.querySelector('.jarvis-suggestion-reason').textContent=item.reason||'';
    row.querySelector('small').textContent=`Confiance ${confidence}% · observation seule · confirmation requise`;
    box.appendChild(row);
   });
  }catch(e){box.textContent='Suggestions indisponibles : '+e.message}
 };
 Panel.prototype._jarvisInstallSuggestions=function(){
  const root=this._core?.shadowRoot,grid=root?.querySelector('.grid');if(!grid||root.getElementById('jarvisSuggestionsCard'))return;
  const card=document.createElement('section');card.className='card';card.id='jarvisSuggestionsCard';
  card.innerHTML='<div class="title">💡 SUGGESTIONS JARVIS</div><div id="jarvisSuggestionsList" class="jarvis-suggestions-list"></div><div class="row"><button type="button" id="jarvisSuggestionsRefresh">ACTUALISER</button></div>';
  grid.appendChild(card);
  const st=document.createElement('style');st.textContent='.jarvis-suggestions-list{display:grid;gap:7px;margin-top:8px}.jarvis-suggestion{padding:8px;border:1px solid #00eaff22;border-radius:8px;background:#03111c99}.jarvis-suggestion-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.jarvis-suggestion-head strong{font-size:10px}.jarvis-suggestion-head span{font-size:8px;letter-spacing:1px;color:#8bd6ea}.jarvis-suggestion-reason{font-size:9px;line-height:1.4;margin:5px 0;opacity:.8}.jarvis-suggestion small{font-size:7px;opacity:.55}';root.appendChild(st);
  card.querySelector('#jarvisSuggestionsRefresh').onclick=()=>this._jarvisLoadSuggestions();
  this._jarvisLoadSuggestions();
 };
 const baseBoot=Panel.prototype._bootCore;Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallSuggestions()};
 Panel.prototype.__jarvisSuggestionsInstalled=true;
}
