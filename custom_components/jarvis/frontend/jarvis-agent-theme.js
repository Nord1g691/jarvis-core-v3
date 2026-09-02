/* JARVIS Core V3.0.26 — agent-aware HUD theme and voice bridge. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisAgentThemeInstalled){
 const THEMES=[
  {match:/chef|cuist|cuisine/i,name:'CHEF',color:'#ff9f1c',soft:'#ff9f1c99',faint:'#ff9f1c44',text:'#ffe1b3',voice:1,rate:.98,pitch:1.08},
  {match:/jardin|paysag|maison|domotique/i,name:'JARDIN',color:'#39ff88',soft:'#39ff8899',faint:'#39ff8844',text:'#dfffe9',voice:2,rate:.92,pitch:.98},
  {match:/énergie|energie|solar|solaire/i,name:'ÉNERGIE',color:'#ffd60a',soft:'#ffd60a99',faint:'#ffd60a44',text:'#fff4a8',voice:3,rate:.96,pitch:1.02},
  {match:/sécur|secur|caméra|camera/i,name:'SÉCURITÉ',color:'#ff4050',soft:'#ff405099',faint:'#ff405044',text:'#ffd5d9',voice:0,rate:.88,pitch:.86},
  {match:/média|media|music|musique/i,name:'MÉDIA',color:'#b56cff',soft:'#b56cff99',faint:'#b56cff44',text:'#ead9ff',voice:4,rate:1,pitch:1.06},
  {match:/climat|chauff|thermostat/i,name:'CLIMAT',color:'#7dd3fc',soft:'#7dd3fc99',faint:'#7dd3fc44',text:'#dff6ff',voice:2,rate:.9,pitch:1},
  {match:/mémoire|memoire/i,name:'MÉMOIRE',color:'#ff4fd8',soft:'#ff4fd899',faint:'#ff4fd844',text:'#ffd9f6',voice:1,rate:.9,pitch:1.04},
  {match:/tech|diagnostic|debug/i,name:'TECHNIQUE',color:'#3b82f6',soft:'#3b82f699',faint:'#3b82f644',text:'#dbeafe',voice:0,rate:1,pitch:.9},
  {match:/secours|général|general/i,name:'SECOURS',color:'#d7e3ea',soft:'#d7e3ea99',faint:'#d7e3ea44',text:'#f6fbff',voice:3,rate:.94,pitch:1}
 ];
 const DEFAULT={name:'JARVIS',color:'#00eaff',soft:'#00eaff99',faint:'#00eaff44',text:'#dffaff',voice:0,rate:.92,pitch:.88};
 Panel.prototype._jarvisThemeForAgent=function(label){return THEMES.find(t=>t.match.test(label||''))||DEFAULT};
 Panel.prototype._jarvisAgentLabel=function(){const root=this._core?.shadowRoot,select=root?.getElementById('pipelineSelect'),selected=select?.selectedOptions?.[0];return (selected?.textContent||select?.value||localStorage.getItem('jarvis_assist_pipeline')||'').trim()};
 Panel.prototype._jarvisFrenchVoices=function(){const voices=speechSynthesis?.getVoices?.()||[];const fr=voices.filter(v=>/^fr([_-]|$)/i.test(v.lang||''));return fr.length?fr:voices};
 Panel.prototype._jarvisApplyAgentTheme=function(labelOverride){
  const root=this._core?.shadowRoot;if(!root)return;
  const label=(labelOverride||this._jarvisAgentLabel()||'').trim();
  const t=this._jarvisThemeForAgent(label);this._jarvisActiveTheme=t;this._jarvisActiveAgentLabel=label;
  const app=root.querySelector('.app');if(app){app.dataset.jarvisAgent=t.name;app.dataset.jarvisAgentLabel=label}
  root.host.style.setProperty('--jarvis-agent',t.color);root.host.style.setProperty('--jarvis-agent-soft',t.soft);root.host.style.setProperty('--jarvis-agent-faint',t.faint);root.host.style.setProperty('--jarvis-agent-text',t.text);
  let style=root.getElementById('jarvisAgentThemeStyle');
  if(!style){style=document.createElement('style');style.id='jarvisAgentThemeStyle';style.textContent=`
   :host{--jarvis-agent:#00eaff;--jarvis-agent-soft:#00eaff99;--jarvis-agent-faint:#00eaff44;--jarvis-agent-text:#dffaff}
   .logo{color:var(--jarvis-agent-text)!important;text-shadow:0 0 16px var(--jarvis-agent),0 0 28px var(--jarvis-agent-soft)!important}
   .status,.title,.sub,#state{color:var(--jarvis-agent-text)!important;text-shadow:0 0 10px var(--jarvis-agent-soft)!important}
   .ring,.orbit,.r1,.r2,.r3,.r4{border-color:var(--jarvis-agent)!important;box-shadow:0 0 12px var(--jarvis-agent-soft),inset 0 0 10px var(--jarvis-agent-faint)!important}
   .satellite,.led{background:var(--jarvis-agent)!important;box-shadow:0 0 10px var(--jarvis-agent),0 0 18px var(--jarvis-agent-soft)!important}
   .glow{background:radial-gradient(circle,#fff 0 4%,var(--jarvis-agent) 13%,var(--jarvis-agent-soft) 34%,var(--jarvis-agent-faint) 53%,transparent 74%)!important;box-shadow:0 0 42px var(--jarvis-agent),0 0 105px var(--jarvis-agent-soft),0 0 160px var(--jarvis-agent-faint)!important;filter:saturate(1.35) brightness(1.12)!important}
   .voiceBar{background:var(--jarvis-agent)!important;box-shadow:0 0 8px var(--jarvis-agent),0 0 14px var(--jarvis-agent-soft)!important}
   .card,.jarvis-cards-drawer,.jarvis-entity{border-color:var(--jarvis-agent-faint)!important}
   button,select,.commandInput input{border-color:var(--jarvis-agent-soft)!important;color:var(--jarvis-agent-text)!important}
   .fill{background:var(--jarvis-agent)!important;box-shadow:0 0 12px var(--jarvis-agent),0 0 18px var(--jarvis-agent-soft)!important}
   #stateDock{color:var(--jarvis-agent-text)!important;text-shadow:0 0 14px var(--jarvis-agent),0 0 24px var(--jarvis-agent-soft)!important}
  `;root.appendChild(style)}
 };
 Panel.prototype._jarvisInstallAgentVoice=function(){if(!this._core)return;const panel=this;this._core.__jarvisThemePanel=this;this._core.speak=function(text){if(this.muted)return Promise.resolve();return new Promise(resolve=>{const t=panel._jarvisActiveTheme||DEFAULT;this.setState('JARVIS PARLE',t.color);const u=new SpeechSynthesisUtterance(text);u.lang='fr-FR';u.rate=t.rate||.92;u.pitch=t.pitch||1;u.volume=Math.max(0,Math.min(1,Number(panel._prefs?.volume??70)/100));const voices=panel._jarvisFrenchVoices();if(voices.length)u.voice=voices[Math.abs(Number(t.voice)||0)%voices.length];u.onend=()=>{this.setState('OPÉRATIONNEL',t.color);resolve()};u.onerror=()=>{this.setState('OPÉRATIONNEL',t.color);resolve()};speechSynthesis.cancel();speechSynthesis.speak(u)})}};
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisApplyAgentTheme();this._jarvisInstallAgentVoice();const root=this._core?.shadowRoot,select=root?.getElementById('pipelineSelect');if(select&&!select.__jarvisThemeBound){select.addEventListener('change',()=>setTimeout(()=>{this._jarvisApplyAgentTheme();this._jarvisInstallAgentVoice()},0));select.__jarvisThemeBound=true}if(this._jarvisAgentThemeObserver)this._jarvisAgentThemeObserver.disconnect();if(select){const mo=new MutationObserver(()=>this._jarvisApplyAgentTheme());mo.observe(select,{childList:true,subtree:true,attributes:true});this._jarvisAgentThemeObserver=mo}};
 Panel.prototype.__jarvisAgentThemeInstalled=true;
}
