/* JARVIS V4.0.0 — canonical native runtime. */
const JARVIS_RUNTIME_VERSION='4.0.0';
const JARVIS_PANEL_TAG='jarvis-panel-v4';
const JARVIS_CORE_TAG='jarvis-core-v4';
const asset=name=>`/jarvis_core/${name}?v=${JARVIS_RUNTIME_VERSION}`;

/* V4 owns its panel and core. No V3 custom-element bridge is used. */
await import(asset('jarvis-core-v4.js'));
await import(asset('jarvis-panel-v4.js'));

/* Legacy feature modules are loaded only as optional V4 extensions. Their generic
 * constructor lookups are routed to V4 without creating a V3 panel/core. */
const registry=customElements;
if(!registry.__jarvisV4Aliases){
 const nativeGet=registry.get.bind(registry),nativeWhenDefined=registry.whenDefined.bind(registry);
 registry.get=name=>name==='jarvis-panel'?nativeGet(JARVIS_PANEL_TAG):name==='jarvis-core-hud'?nativeGet(JARVIS_CORE_TAG):nativeGet(name);
 registry.whenDefined=name=>name==='jarvis-panel'?nativeWhenDefined(JARVIS_PANEL_TAG):name==='jarvis-core-hud'?nativeWhenDefined(JARVIS_CORE_TAG):nativeWhenDefined(name);
 registry.__jarvisV4Aliases=true;
}

const optional=['jarvis-domains.js','jarvis-settings.js','jarvis-smart-groups.js','jarvis-agent-theme.js','jarvis-agent-colors.js','jarvis-enhancements.js','jarvis-intelligence.js','jarvis-absence.js','jarvis-quick-consumers.js','jarvis-suggestions.js','jarvis-agent-pipelines.js','jarvis-structure-ui.js','jarvis-visual-modes.js','jarvis-layout-modes.js','jarvis-pro-polish.js','jarvis-cinematic.js','jarvis-agent-autonomy.js','jarvis-entity-roles.js','jarvis-persistent-settings.js','jarvis-health.js','jarvis-core-sizing.js','jarvis-v4-ui.js'];
for(const name of optional){try{await import(asset(name))}catch(e){console.warn('[JARVIS V4] Extension ignorée:',name,e)}}

const Panel=customElements.get(JARVIS_PANEL_TAG),Core=customElements.get(JARVIS_CORE_TAG);
if(!Panel||!Core)throw new Error('JARVIS V4 natif incomplet');
try{const ui=await import(asset('jarvis-v4-ui.js'));ui.installJarvisV4Ui?.(Panel)}catch(e){console.warn('[JARVIS V4] UI extension:',e)}

if(!Panel.prototype.__jarvisRuntimeV4Patched){
 const boot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await boot.call(this);const root=this._core?.shadowRoot,state=root?.getElementById('state'),core=root?.getElementById('core');if(state&&core&&!root.getElementById('stateDock')){const dock=document.createElement('div');dock.id='stateDock';dock.style.cssText='display:flex;justify-content:center;align-items:center;width:100%;text-align:center;letter-spacing:4px;font-size:12px;min-height:28px;margin:-4px auto 12px;transition:.25s;';core.insertAdjacentElement('afterend',dock);dock.appendChild(state)}if(core&&!root.getElementById('agentRouteDock')){const route=document.createElement('div');route.id='agentRouteDock';route.style.cssText='text-align:center;min-height:18px;margin:-9px auto 8px;font-size:8px;letter-spacing:2px;color:#8bd6ea;opacity:.75;';route.textContent='ROUTE · JARVIS';(root.getElementById('stateDock')||core).insertAdjacentElement('afterend',route)}this._v4InstallCore?.();this._v4ApplyDisplay?.()};
 Panel.prototype.__jarvisRuntimeV4Patched=true;
}

/* Conversation orchestration remains on the V4 Core constructor. */
if(!Core.prototype.__jarvisConversationV4Patched){
 const baseProcess=Core.prototype.process;
 Core.prototype.process=async function(text){return baseProcess.call(this,text)};
 Core.prototype.__jarvisConversationV4Patched=true;
}
