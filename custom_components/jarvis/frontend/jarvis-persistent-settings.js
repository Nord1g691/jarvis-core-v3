/* JARVIS Core V3.0.26 — persistent settings bridge with local fallback. */
await import('/jarvis_core/jarvis-premium-core.js?v=3.0.26');
await import('/jarvis_core/jarvis-premium-state.js?v=3.0.26');
await import('/jarvis_core/jarvis-premium-polish.js?v=3.0.26');
await import('/jarvis_core/jarvis-premium-choreography.js?v=3.0.26');
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisPersistentSettingsInstalled){
 const LOCAL_KEYS={
  agent_autonomy:'jarvis_agent_autonomy_v326',
  entity_roles:'jarvis_entity_roles_v326',
  pipeline_map:'jarvis_agent_pipeline_map_v326',
  visual_mode:'jarvis_visual_mode_v326',
  core_size:'jarvis_core_size_v326'
 };
 const writeLocal=(section,value)=>{try{const key=LOCAL_KEYS[section];if(!key)return;if(typeof value==='string')localStorage.setItem(key,value);else localStorage.setItem(key,JSON.stringify(value))}catch(_){}};
 const readLocal=section=>{try{const key=LOCAL_KEYS[section];if(!key)return undefined;const raw=localStorage.getItem(key);if(raw==null)return undefined;if(section==='visual_mode')return raw;return JSON.parse(raw)}catch(_){return undefined}};
 const usefulLocal=(section,value)=>section==='visual_mode'?typeof value==='string'&&value.length>0:section==='core_size'?Number.isFinite(Number(value)):value&&typeof value==='object'&&Object.keys(value).length>0;
 Panel.prototype._jarvisPersistSetting=async function(section,value){
  writeLocal(section,value);
  try{await this._hass?.callApi?.('POST','jarvis/settings',{section,value});return true}catch(_){return false}
 };
 Panel.prototype._jarvisLoadPersistentSettings=async function(){
  try{
   const d=await this._hass?.callApi?.('GET','jarvis/settings');const s=d?.settings||{};
   if(d?.initialized){Object.entries(s).forEach(([k,v])=>writeLocal(k,v));}
   else{
    const migrated={};for(const k of Object.keys(LOCAL_KEYS)){const v=readLocal(k);if(usefulLocal(k,v))migrated[k]=v}
    for(const [k,v] of Object.entries(migrated))await this._jarvisPersistSetting(k,v);
   }
   const mode=d?.initialized?s.visual_mode:readLocal('visual_mode');if(mode){writeLocal('visual_mode',mode);this._jarvisApplyVisualMode?.()}
   const size=d?.initialized?s.core_size:readLocal('core_size');if(size!==undefined){writeLocal('core_size',size);this._jarvisSetCoreScale?.(Number(size),false)}
   return d;
  }catch(_){this._jarvisApplyVisualMode?.();return null}
 };
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);await this._jarvisLoadPersistentSettings()};
 Panel.prototype.__jarvisPersistentSettingsInstalled=true;
}
