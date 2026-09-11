/* JARVIS V4.0.0 — canonical native runtime. */
const JARVIS_RUNTIME_VERSION='4.0.0';
const JARVIS_PANEL_TAG='jarvis-panel-v4';
const JARVIS_CORE_TAG='jarvis-core-v4';
const asset=name=>`/jarvis_core/${name}?v=${JARVIS_RUNTIME_VERSION}`;

await import(asset('jarvis-core-v4.js'));
await import(asset('jarvis-panel-v4.js'));

const optional=['jarvis-domains.js','jarvis-settings.js','jarvis-smart-groups.js','jarvis-agent-theme.js','jarvis-agent-colors.js','jarvis-enhancements.js','jarvis-intelligence.js','jarvis-absence.js','jarvis-quick-consumers.js','jarvis-suggestions.js','jarvis-agent-pipelines.js','jarvis-structure-ui.js','jarvis-visual-modes.js','jarvis-layout-modes.js','jarvis-pro-polish.js','jarvis-cinematic.js','jarvis-agent-autonomy.js','jarvis-entity-roles.js','jarvis-persistent-settings.js','jarvis-health.js','jarvis-core-sizing.js'];
for(const name of optional){try{await import(asset(name))}catch(e){console.warn('[JARVIS V4] Extension ignorée:',name,e)}}

const Panel=customElements.get(JARVIS_PANEL_TAG),Core=customElements.get(JARVIS_CORE_TAG);
if(!Panel||!Core)throw new Error('JARVIS V4 natif incomplet');

try{const ui=await import(asset('jarvis-v4-ui.js'));ui.installJarvisV4Ui?.(Panel)}catch(e){console.warn('[JARVIS V4] UI extension:',e)}
try{const finalUi=await import(asset('jarvis-v4-final.js'));finalUi.installJarvisV4Final?.(Panel)}catch(e){console.warn('[JARVIS V4] Final UI extension:',e)}

if(!Panel.prototype.__jarvisRuntimeV4Patched){
 const boot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){
  await boot.call(this);
  const root=this._core?.shadowRoot,state=root?.getElementById('state'),core=root?.getElementById('core');
  if(state&&core&&state.parentElement!==core)core.appendChild(state);
  root?.getElementById('stateDock')?.remove();
  root?.getElementById('agentRouteDock')?.remove();
  this._v4InstallCore?.();
  this._v4InstallFinal?.();
  this._v4RegisterCards?.();
  this._applyDisplay?.();
 };
 Panel.prototype.__jarvisRuntimeV4Patched=true;
}

if(!Core.prototype.__jarvisConversationV4Patched){
 const baseProcess=Core.prototype.process;
 Core.prototype.process=async function(text){return baseProcess.call(this,text)};
 Core.prototype.__jarvisConversationV4Patched=true;
}
