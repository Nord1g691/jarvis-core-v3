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

   /* Temporary conversation states intentionally override the persistent agent palette. */
   .core.state-listen .ring,.core.state-listen .orbit,.core.state-listen .r1,.core.state-listen .r2,.core.state-listen .r3,.core.state-listen .r4,.core.state-listen .r5{border-color:#39ff88!important;box-shadow:0 0 16px #39ff8899,inset 0 0 12px #39ff8844!important}
   .core.state-listen .led,.core.state-listen .voiceBar{background:#39ff88!important;box-shadow:0 0 10px #39ff88,0 0 22px #39ff8899!important}
   .core.state-listen .glow{background:radial-gradient(circle,#fff 0 4%,#39ff88 14%,#39ff8899 35%,#39ff8844 56%,transparent 75%)!important;box-shadow:0 0 48px #39ff88,0 0 120px #39ff8899,0 0 180px #39ff8844!important;filter:saturate(1.55) brightness(1.18)!important}

   .core.state-think .ring,.core.state-think .r1,.core.state-think .r2,.core.state-think .r3,.core.state-think .r4,.core.state-think .r5{border-color:#ffb000!important;box-shadow:0 0 16px #ffb00099,inset 0 0 12px #ffb00044!important}
   .core.state-think .led{background:#ffb000!important;box-shadow:0 0 10px #ffb000,0 0 22px #ffb00099!important}
   .core.state-think .glow{background:radial-gradient(circle,#fff 0 4%,#ffb000 14%,#ffb00099 35%,#ffb00044 56%,transparent 75%)!important;box-shadow:0 0 50px #ffb000,0 0 125px #ffb00099,0 0 185px #ffb00044!important;filter:saturate(1.55) brightness(1.18)!important}

   .core.state-search .ring,.core.state-search .orbit,.core.state-search .r1,.core.state-search .r2,.core.state-search .r3,.core.state-search .r4,.core.state-search .r5{border-color:#00eaff!important;box-shadow:0 0 16px #00eaff99,inset 0 0 12px #00eaff44!important}
   .core.state-search .led{background:#00eaff!important;box-shadow:0 0 10px #00eaff,0 0 22px #00eaff99!important}
   .core.state-search .glow{background:radial-gradient(circle,#fff 0 4%,#00eaff 14%,#00eaff99 35%,#00eaff44 56%,transparent 75%)!important;box-shadow:0 0 48px #00eaff,0 0 120px #00eaff99,0 0 180px #00eaff44!important}

   .core.state-speak .ring,.core.state-speak .orbit,.core.state-speak .r1,.core.state-speak .r2,.core.state-speak .r3,.core.state-speak .r4,.core.state-speak .r5{border-color:#b56cff!important;box-shadow:0 0 17px #b56cff99,inset 0 0 12px #b56cff44!important}
   .core.state-speak .led,.core.state-speak .voiceBar{background:#b56cff!important;box-shadow:0 0 11px #b56cff,0 0 24px #b56cff99!important}
   .core.state-speak .glow{background:radial-gradient(circle,#fff 0 4%,#b56cff 14%,#b56cff99 35%,#b56cff44 56%,transparent 75%)!important;box-shadow:0 0 52px #b56cff,0 0 130px #b56cff99,0 0 190px #b56cff44!important;filter:saturate(1.55) brightness(1.2)!important}
  `;root.appendChild(style)}
 };
 Panel.prototype._jarvisInstallAgentVoice=function(){if(!this._core)return;const panel=this;this._core.__jarvisThemePanel=this;this._core.speak=function(text){if(this.muted)return Promise.resolve();return new Promise(resolve=>{const t=panel._jarvisActiveTheme||DEFAULT;this.setState('JARVIS PARLE','#b56cff');const u=new SpeechSynthesisUtterance(text);u.lang='fr-FR';u.rate=t.rate||.92;u.pitch=t.pitch||1;u.volume=Math.max(0,Math.min(1,Number(panel._prefs?.volume??70)/100));const voices=panel._jarvisFrenchVoices();if(voices.length)u.voice=voices[Math.abs(Number(t.voice)||0)%voices.length];u.onend=()=>{this.setState('OPÉRATIONNEL',t.color);resolve()};u.onerror=()=>{this.setState('OPÉRATIONNEL',t.color);resolve()};speechSynthesis.cancel();speechSynthesis.speak(u)})}};
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisApplyAgentTheme();this._jarvisInstallAgentVoice();const root=this._core?.shadowRoot,select=root?.getElementById('pipelineSelect');if(select&&!select.__jarvisThemeBound){select.addEventListener('change',()=>setTimeout(()=>{this._jarvisApplyAgentTheme();this._jarvisInstallAgentVoice()},0));select.__jarvisThemeBound=true}if(this._jarvisAgentThemeObserver)this._jarvisAgentThemeObserver.disconnect();if(select){const mo=new MutationObserver(()=>this._jarvisApplyAgentTheme());mo.observe(select,{childList:true,subtree:true,attributes:true});this._jarvisAgentThemeObserver=mo}};
 Panel.prototype.__jarvisAgentThemeInstalled=true;
}
