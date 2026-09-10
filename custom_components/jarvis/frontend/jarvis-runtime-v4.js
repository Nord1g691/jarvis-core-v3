/* JARVIS V4.0.0 — isolated cache-safe runtime. */
const V4='4.0.0';
const PANEL_V3='jarvis-panel-v3027';
const CORE_V3='jarvis-core-hud-v3027';
const PANEL_V4='jarvis-panel-v4';
const CORE_V4='jarvis-core-v4';

/* Load the proven V3 feature set once, then expose it through brand-new V4 custom-element identities. */
await import('/jarvis_core/jarvis-runtime.js?v=4.0.0-foundation');
const BasePanel=customElements.get(PANEL_V3)||customElements.get('jarvis-panel');
const BaseCore=customElements.get(CORE_V3)||customElements.get('jarvis-core-hud');
if(!BasePanel||!BaseCore)throw new Error('Fondation JARVIS V3 indisponible pour migration V4');
if(!customElements.get(CORE_V4)){class JarvisCoreV4 extends BaseCore{};JarvisCoreV4.__jarvisBuild=V4;customElements.define(CORE_V4,JarvisCoreV4)}
if(!customElements.get(PANEL_V4)){class JarvisPanelV4 extends BasePanel{};customElements.define(PANEL_V4,JarvisPanelV4)}

/* Force V4 panel instances to create only the V4 core. */
const Panel=customElements.get(PANEL_V4);
Panel.prototype._bootCore=async function(){
 if(this._bootPromise)return this._bootPromise;
 this._bootPromise=(async()=>{try{
   const Core=customElements.get(CORE_V4);if(!Core)throw new Error('Core V4 non défini');
   if(this._core?.isConnected)this._core.remove();
   this._core=document.createElement(CORE_V4);this._core.hass=this._hass;
   this.shadowRoot.getElementById('coreHost').appendChild(this._core);
   await this._waitForCore();this._installVolumeControl?.();this._installVolumeSpeech?.();this._applyCards?.();this._applySystemDock?.();this._renderCards?.();this._syncEnergy?.();
   const badge=this.shadowRoot?.getElementById('buildBadge');if(badge)badge.textContent='JARVIS V4.0.0';
   this._log?.('✓ JARVIS V4 chargé');
 }catch(e){this._log?.('✗ V4: '+e.message);throw e}finally{this._bootPromise=null}})();return this._bootPromise;
};
Panel.prototype._revalidateBuild=function(){if(document.visibilityState==='hidden')return;const stale=!this._core||!this._core.isConnected||this._core.localName!==CORE_V4;if(stale){try{this._core?.remove()}catch(_){}this._core=null;this._bootCore().catch(()=>{})}else{this._core.hass=this._hass;this._core.update?.()}};

const {installJarvisV4Ui}=await import('/jarvis_core/jarvis-v4-ui.js?v=4.0.0-ui');
installJarvisV4Ui(Panel);
