/* JARVIS Core V3.0.26 — persistent settings bridge with local fallback. */
await import('/jarvis_core/jarvis-premium-core.js?v=3.0.26');
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
 Panel.prototype._jarvisHydratePersistentSettings=async function(){
  if(this.__jarvisSettingsHydrated)return;this.__jarvisSettingsHydrated=true;
  try{
   const data=await this._hass?.callApi?.('GET','jarvis/settings');
   const settings=data?.settings||{},initialized=Boolean(data?.initialized);
   if(!initialized){
    for(const section of Object.keys(LOCAL_KEYS)){
     const local=readLocal(section);if(!usefulLocal(section,local))continue;
     await this._hass?.callApi?.('POST','jarvis/settings',{section,value:local});
    }
   }else{
    for(const section of Object.keys(LOCAL_KEYS)){
     const value=settings?.[section];if(value===undefined||value===null)continue;writeLocal(section,value);
    }
   }
   this._jarvisApplyVisualMode?.();
   this._jarvisApplyCoreSize?.();
  }catch(_){/* localStorage remains the fallback */}
 };
 const wrap=(name,section,getValue)=>{
  const original=Panel.prototype[name];if(typeof original!=='function'||original.__jarvisPersistentWrapped)return;
  const wrapped=function(...args){const out=original.apply(this,args);try{const value=getValue.call(this,...args);this._jarvisPersistSetting?.(section,value)}catch(_){}return out};
  wrapped.__jarvisPersistentWrapped=true;Panel.prototype[name]=wrapped;
 };
 wrap('_jarvisSetAutonomy','agent_autonomy',function(){return this._jarvisAutonomyPolicy?.()||{}});
 wrap('_jarvisSetEntityRole','entity_roles',function(){return this._jarvisEntityRoles?.()||{}});
 wrap('_jarvisSetPipelineForAgent','pipeline_map',function(){return this._jarvisPipelineMap?.()||{}});
 wrap('_jarvisSetVisualMode','visual_mode',function(key){return key||this._jarvisVisualMode?.()||'classic'});
 const boot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await boot.call(this);await this._jarvisHydratePersistentSettings?.()};
 Panel.prototype.__jarvisPersistentSettingsInstalled=true;
}
