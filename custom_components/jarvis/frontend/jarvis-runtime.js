/* JARVIS Core V3.0.23 — focused runtime bridge. */
await import('/jarvis_core/jarvis-panel.js?v=3.0.23');
await import('/jarvis_core/jarvis-domains.js?v=3.0.23');
await import('/jarvis_core/jarvis-settings.js?v=3.0.23');

const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisRuntimePatched){
 const render=Panel.prototype._render;
 Panel.prototype._render=function(){render.call(this);this.shadowRoot?.querySelector('.section.sat')?.remove()};
 const boot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){
  await boot.call(this);
  const root=this._core?.shadowRoot,state=root?.getElementById('state'),core=root?.getElementById('core');
  if(state&&core&&!root.getElementById('stateDock')){
   const dock=document.createElement('div');dock.id='stateDock';dock.style.cssText='text-align:center;letter-spacing:4px;font-size:12px;min-height:22px;margin:-4px auto 16px;transition:.25s;';core.insertAdjacentElement('afterend',dock);dock.appendChild(state);state.style.cssText='position:static;display:inline-block;pointer-events:none;';
  }
 };
 Panel.prototype.__jarvisRuntimePatched=true;
}

customElements.whenDefined('jarvis-core-hud').then(()=>{
 const Core=customElements.get('jarvis-core-hud');if(!Core||Core.prototype.__jarvisConversationPatched)return;
 Core.prototype.process=async function(text){
  if(this.processing||!text)return;this.processing=true;this.voiceActivity=1;if(this.listenTimer){clearTimeout(this.listenTimer);this.listenTimer=null}try{this.recognition?.stop()}catch(_){}
  this.log('VOUS: '+text);this.setState('JARVIS RÉFLÉCHIT','#ffb000');
  try{
   const token=this.token();if(!token)throw Error('Authentification Home Assistant indisponible');const body={text};const pipe=localStorage.getItem('jarvis_assist_pipeline')||'';if(pipe)body.pipeline=pipe;if(this.conversationId)body.conversation_id=this.conversationId;
   const r=await fetch(location.origin+'/api/jarvis/conversation',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d?.message||d?.error||('HTTP '+r.status));this.conversationId=d.conversation_id||this.conversationId;const speech=d?.response?.speech?.plain?.speech||d?.response?.speech?.ssml?.speech||'';this.log('JARVIS: '+(speech||'[réponse sans texte vocal]'));if(speech)await this.speak(speech);else this.setState('OPÉRATIONNEL','#00eaff');
  }catch(e){this.log('✗ '+e.message);this.setState('JARVIS ERREUR','#ff4050');await new Promise(r=>setTimeout(r,800));this.setState('OPÉRATIONNEL','#00eaff')}
  finally{this.processing=false;if(this.conversationMode)this.startListeningWindow()}
 };
 Core.prototype.toggleConversation=function(){if(this.conversationMode){this.stopConversation();this.setState('OPÉRATIONNEL','#00eaff');return}this.conversationMode=true;this.conversationId=null;this.startListeningWindow()};
 Core.prototype.startListeningWindow=function(){
  if(!this.conversationMode||this.processing)return;if(this.listenTimer)clearTimeout(this.listenTimer);this.voiceActivity=.15;this.setState('JARVIS ÉCOUTE','#39ff88');const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){this.log('⚠️ Reconnaissance vocale indisponible');this.stopConversation();return}
  try{try{this.recognition?.stop()}catch(_){}const recognition=new SR();this.recognition=recognition;recognition.lang='fr-FR';recognition.continuous=false;recognition.interimResults=true;recognition.onresult=e=>{const result=e.results?.[e.results.length-1],text=result?.[0]?.transcript?.trim();if(text)this.voiceActivity=Math.min(1.4,this.voiceActivity+.35);if(result?.isFinal&&text){if(this.listenTimer){clearTimeout(this.listenTimer);this.listenTimer=null}this.process(text)}};recognition.onerror=e=>{const err=e.error||'erreur';if(err==='aborted'||err==='no-speech')return;this.log('⚠️ Écoute · '+err);this.stopConversation();this.setState('OPÉRATIONNEL','#00eaff')};recognition.onend=()=>{if(this.recognition===recognition)this.recognition=null};recognition.start();this.listenTimer=setTimeout(()=>{if(this.processing)return;try{this.recognition?.stop()}catch(_){}this.stopConversation();this.setState('OPÉRATIONNEL','#00eaff');this.log('⏹️ Fenêtre d’écoute terminée')},this.listenTimeoutMs);
  }catch(e){this.log('⚠️ Micro · '+e.message);this.stopConversation()}
 };
 Core.prototype.stopConversation=function(){this.conversationMode=false;if(this.listenTimer){clearTimeout(this.listenTimer);this.listenTimer=null}try{this.recognition?.stop()}catch(_){}this.recognition=null};
 Core.prototype.__jarvisConversationPatched=true;
});
