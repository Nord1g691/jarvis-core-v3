/* JARVIS Core V4.0.0 — canonical native runtime. */
const JARVIS_RUNTIME_VERSION='4.0.0';
const JARVIS_PANEL_TAG='jarvis-panel-v4';
const JARVIS_CORE_TAG='jarvis-core-v4';
const asset=name=>`/jarvis_core/${name}?v=${JARVIS_RUNTIME_VERSION}`;

/* Native V4 foundation. */
await import(asset('jarvis-core.js'));
await import(asset('jarvis-panel.js'));

/* Feature modules still ask for the stable generic aliases. Route those aliases
 * directly to the V4 constructors. There is no V3 custom element in the live path. */
const registry=customElements;
if(!registry.__jarvisV4Aliases){
  const nativeGet=registry.get.bind(registry);
  const nativeWhenDefined=registry.whenDefined.bind(registry);
  registry.get=(name)=>{
    if(name==='jarvis-panel')return nativeGet(JARVIS_PANEL_TAG);
    if(name==='jarvis-core-hud')return nativeGet(JARVIS_CORE_TAG);
    return nativeGet(name);
  };
  registry.whenDefined=(name)=>{
    if(name==='jarvis-panel')return nativeWhenDefined(JARVIS_PANEL_TAG);
    if(name==='jarvis-core-hud')return nativeWhenDefined(JARVIS_CORE_TAG);
    return nativeWhenDefined(name);
  };
  registry.__jarvisV4Aliases=true;
}

await import(asset('jarvis-domains.js'));
await import(asset('jarvis-settings.js'));
await import(asset('jarvis-smart-groups.js'));
await import(asset('jarvis-agent-theme.js'));
await import(asset('jarvis-agent-colors.js'));
await import(asset('jarvis-enhancements.js'));
await import(asset('jarvis-intelligence.js'));
await import(asset('jarvis-absence.js'));
await import(asset('jarvis-quick-consumers.js'));
await import(asset('jarvis-suggestions.js'));
await import(asset('jarvis-agent-pipelines.js'));
await import(asset('jarvis-structure-ui.js'));
await import(asset('jarvis-visual-modes.js'));
await import(asset('jarvis-layout-modes.js'));
await import(asset('jarvis-pro-polish.js'));
await import(asset('jarvis-cinematic.js'));
await import(asset('jarvis-agent-autonomy.js'));
await import(asset('jarvis-entity-roles.js'));
await import(asset('jarvis-persistent-settings.js'));
await import(asset('jarvis-health.js'));
await import(asset('jarvis-core-sizing.js'));
await import(asset('jarvis-v4-ui.js'));

const Panel=customElements.get(JARVIS_PANEL_TAG);
if(!Panel)throw new Error('JARVIS V4 panel non défini');
const V4Ui=await import(asset('jarvis-v4-ui.js'));
V4Ui.installJarvisV4Ui?.(Panel);

if(!Panel.prototype.__jarvisRuntimeV4Patched){
 const boot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){
  await boot.call(this);
  const root=this._core?.shadowRoot,state=root?.getElementById('state'),core=root?.getElementById('core');
  if(state&&core&&!root.getElementById('stateDock')){
   const dock=document.createElement('div');dock.id='stateDock';dock.style.cssText='display:flex;justify-content:center;align-items:center;width:100%;text-align:center;letter-spacing:4px;font-size:12px;min-height:28px;margin:-4px auto 12px;transition:.25s;';core.insertAdjacentElement('afterend',dock);dock.appendChild(state);state.style.cssText='position:static;display:inline-flex;align-items:center;justify-content:center;pointer-events:none;text-align:center;';
  }
  if(core&&!root.getElementById('agentRouteDock')){
   const route=document.createElement('div');route.id='agentRouteDock';route.style.cssText='text-align:center;min-height:18px;margin:-9px auto 8px;font-size:8px;letter-spacing:2px;color:#8bd6ea;opacity:.75;';route.textContent='ROUTE · JARVIS';const anchor=root.getElementById('stateDock')||core;anchor.insertAdjacentElement('afterend',route);
  }
  this._applySystemDock?.();this._updateBuildBadge?.();this._v4InstallCore?.();this._v4ApplyDisplay?.();
 };
 Panel.prototype.__jarvisRuntimeV4Patched=true;
}

const Core=customElements.get(JARVIS_CORE_TAG);
if(Core&&!Core.prototype.__jarvisConversationV4Patched){
 const ROUTE_LABELS={jarvis:'JARVIS',chef:'CHEF',energy:'ÉNERGIE',sentinel:'SENTINEL',climate:'CLIMAT',water:'EAU / PISCINE',media:'MÉDIA',garden:'JARDIN',calendar:'CALENDRIER',mail:'MESSAGERIE',home:'MAISON',technical:'TECHNIQUE'};
 Core.prototype.process=async function(text){if(this.processing||!text)return;this.processing=true;this.voiceActivity=1;if(this.listenTimer){clearTimeout(this.listenTimer);this.listenTimer=null}try{this.recognition?.stop()}catch(_){}this.log('VOUS: '+text);this.setState('JARVIS RÉFLÉCHIT','#ffb000');const longSearchTimer=setTimeout(()=>{if(this.processing)this.setState('JARVIS RECHERCHE','#00eaff')},2500);try{const token=this.token();if(!token)throw Error('Authentification Home Assistant indisponible');const body={text};const pmap=this.__jarvisThemePanel?._jarvisPipelineMap?.()||{};if(Object.keys(pmap).length)body.pipeline_map=pmap;const pipe=localStorage.getItem('jarvis_assist_pipeline')||'';if(pipe)body.pipeline=pipe;if(this.conversationId)body.conversation_id=this.conversationId;const r=await fetch(location.origin+'/api/jarvis/conversation',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d?.message||d?.error||('HTTP '+r.status));const routed=String(d?.orchestration?.agent||'jarvis');const dock=this.__jarvisThemePanel?._core?.shadowRoot?.getElementById('agentRouteDock');if(dock)dock.textContent='ROUTE · '+(ROUTE_LABELS[routed]||routed.toUpperCase())+(d?.delegation?.active?' → PIPELINE':'');this.__jarvisThemePanel?._jarvisApplyAgentTheme?.(routed);const liveAgent=`${d?.pipeline_name||''} ${d?.agent_id||''}`.trim();if(liveAgent&&routed==='jarvis')this.__jarvisThemePanel?._jarvisApplyAgentTheme?.(liveAgent);this.conversationId=d.conversation_id||this.conversationId;const speech=d?.response?.speech?.plain?.speech||d?.response?.speech?.ssml?.speech||'';this.log('JARVIS: '+(speech||'[réponse sans texte vocal]'));if(speech)await this.speak(speech);else this.setState('OPÉRATIONNEL',this.__jarvisThemePanel?._jarvisActiveTheme?.color||'#00eaff')}catch(e){this.log('✗ '+e.message);this.setState('JARVIS ERREUR','#ff4050');await new Promise(r=>setTimeout(r,800));this.setState('OPÉRATIONNEL',this.__jarvisThemePanel?._jarvisActiveTheme?.color||'#00eaff')}finally{clearTimeout(longSearchTimer);this.processing=false;if(this.conversationMode)this.startListeningWindow()}};
 Core.prototype.toggleConversation=function(){if(this.conversationMode){this.stopConversation();this.setState('OPÉRATIONNEL',this.__jarvisThemePanel?._jarvisActiveTheme?.color||'#00eaff');return}this.conversationMode=true;this.conversationId=null;this.startListeningWindow()};
 Core.prototype.startListeningWindow=function(){if(!this.conversationMode||this.processing)return;if(this.listenTimer)clearTimeout(this.listenTimer);this.voiceActivity=.15;this.setState('JARVIS ÉCOUTE','#39ff88');const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){this.log('⚠️ Reconnaissance vocale indisponible');this.stopConversation();return}try{try{this.recognition?.stop()}catch(_){}const recognition=new SR();this.recognition=recognition;recognition.lang='fr-FR';recognition.continuous=false;recognition.interimResults=true;recognition.onresult=e=>{const result=e.results?.[e.results.length-1],text=result?.[0]?.transcript?.trim();if(text)this.voiceActivity=Math.min(1.4,this.voiceActivity+.35);if(result?.isFinal&&text){if(this.listenTimer){clearTimeout(this.listenTimer);this.listenTimer=null}this.process(text)}};recognition.onerror=e=>{const err=e.error||'erreur';if(err==='aborted'||err==='no-speech')return;this.log('⚠️ Écoute · '+err);this.stopConversation();this.setState('OPÉRATIONNEL',this.__jarvisThemePanel?._jarvisActiveTheme?.color||'#00eaff')};recognition.onend=()=>{if(this.recognition===recognition)this.recognition=null};recognition.start();this.listenTimer=setTimeout(()=>{if(this.processing)return;try{this.recognition?.stop()}catch(_){}this.stopConversation();this.setState('OPÉRATIONNEL',this.__jarvisThemePanel?._jarvisActiveTheme?.color||'#00eaff');this.log('⏹️ Fenêtre d’écoute terminée')},this.listenTimeoutMs)}catch(e){this.log('⚠️ Micro · '+e.message);this.stopConversation()}};
 Core.prototype.stopConversation=function(){this.conversationMode=false;if(this.listenTimer){clearTimeout(this.listenTimer);this.listenTimer=null}try{this.recognition?.stop()}catch(_){}this.recognition=null};
 Core.prototype.__jarvisConversationV4Patched=true;
}
