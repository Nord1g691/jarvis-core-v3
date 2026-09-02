/* JARVIS Core V3.0.26 — unified menu language. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisMenuHarmonyInstalled){
 const baseRender=Panel.prototype._render;
 Panel.prototype._render=function(){
  baseRender.call(this);
  const root=this.shadowRoot;if(!root||root.getElementById('jarvisMenuHarmonyStyle'))return;
  const style=document.createElement('style');
  style.id='jarvisMenuHarmonyStyle';
  style.textContent=`
   :host{--jv-menu-accent:var(--jarvis-agent-color,#00eaff);--jv-menu-text:#dffaff;--jv-menu-muted:#789aaa;--jv-menu-bg:rgba(2,10,18,.96);--jv-menu-line:color-mix(in srgb,var(--jv-menu-accent) 24%,transparent)}
   .tools{gap:8px;top:14px;right:14px;padding:5px;border:1px solid var(--jv-menu-line);border-radius:14px;background:rgba(2,8,15,.76);backdrop-filter:blur(12px);box-shadow:0 10px 30px #0007}
   .tools button{width:38px;height:38px;min-height:38px;border:1px solid transparent;border-radius:9px;background:transparent;color:var(--jv-menu-muted);font-size:16px;transition:border-color .18s,background .18s,color .18s,transform .18s}
   .tools button:hover,.tools button:focus-visible{border-color:var(--jv-menu-line);background:color-mix(in srgb,var(--jv-menu-accent) 10%,transparent);color:var(--jv-menu-accent);outline:none}
   .tools button:active{transform:scale(.96)}
   .panel{top:72px;right:14px;width:min(440px,calc(100vw - 28px));max-height:calc(100vh - 92px);box-sizing:border-box;padding:0;border:1px solid var(--jv-menu-line);border-radius:16px;background:var(--jv-menu-bg);color:var(--jv-menu-text);box-shadow:0 20px 60px #000a;backdrop-filter:blur(18px);overflow:auto}
   .panel>.title:first-child{position:sticky;top:0;z-index:2;margin:0;padding:15px 16px 12px;border-bottom:1px solid var(--jv-menu-line);background:rgba(2,10,18,.94);font-size:10px;font-weight:700;letter-spacing:2px;color:var(--jv-menu-accent)}
   .panel>.note{margin:0;padding:10px 16px 2px;font-size:9px;line-height:1.45;color:var(--jv-menu-muted)}
   .section{margin:12px 16px 0;padding-top:12px;border-top:1px solid var(--jv-menu-line)}
   .section>.title{margin:0 0 8px;font-size:8px;font-weight:700;letter-spacing:1.6px;color:var(--jv-menu-muted)}
   .row{grid-template-columns:32px 1fr 32px 32px;gap:7px;min-height:42px;padding:4px 0;border-bottom:1px solid var(--jv-menu-line);font-size:10px}
   .row button,.actions button,.dock-toggle,.memrow button,.jarvis-settings-details button{border:1px solid var(--jv-menu-line);border-radius:8px;background:color-mix(in srgb,var(--jv-menu-accent) 7%,transparent);color:var(--jv-menu-text);transition:border-color .18s,background .18s,color .18s}
   .row button:hover,.actions button:hover,.dock-toggle:hover,.memrow button:hover,.jarvis-settings-details button:hover{border-color:color-mix(in srgb,var(--jv-menu-accent) 58%,transparent);background:color-mix(in srgb,var(--jv-menu-accent) 13%,transparent)}
   .active,.dock-toggle.on,.jarvis-system-item button.active{border-color:var(--jv-menu-accent)!important;color:var(--jv-menu-accent)!important;background:color-mix(in srgb,var(--jv-menu-accent) 12%,transparent)!important}
   .eye.off{opacity:.35}
   .actions{position:sticky;bottom:0;z-index:2;gap:8px;margin:14px 0 0;padding:12px 16px;border-top:1px solid var(--jv-menu-line);background:rgba(2,10,18,.95)}
   .actions button{min-height:38px;font-size:9px;letter-spacing:.8px}
   .system-tools{gap:0;margin-top:4px}
   .system-tool{min-height:42px;padding:5px 0;border-bottom:1px solid var(--jv-menu-line)}
   .dock-toggle{min-width:92px;min-height:30px;font-size:8px}
   .memrow{gap:8px;padding:12px 16px 0;margin:0}
   .memrow input{height:40px;border:1px solid var(--jv-menu-line);border-radius:8px;background:#010811;color:var(--jv-menu-text);outline:none}
   .memrow input:focus{border-color:var(--jv-menu-accent)}
   #memList{padding:0 16px 14px}
   .memitem{padding:10px 0;border-bottom:1px solid var(--jv-menu-line);font-size:9px}
   .memitem small{color:var(--jv-menu-muted)}
   .jarvis-settings-details{padding:0!important;border-bottom:1px solid var(--jv-menu-line)!important}
   .jarvis-settings-details summary{min-height:42px;padding:0 8px!important;color:var(--jv-menu-text)!important;font-size:9px!important;letter-spacing:.8px!important}
   .jarvis-settings-details summary:before{color:var(--jv-menu-accent)}
   .jarvis-settings-details summary b{font-size:7px!important;color:var(--jv-menu-muted);opacity:1!important}
   .jarvis-settings-body{padding:8px 8px 12px!important}
   .jarvis-setting-entity,.jarvis-system-item{border-bottom:1px solid var(--jv-menu-line)!important}
   .jarvis-setting-note{color:var(--jv-menu-muted)}
   .version{right:14px;bottom:8px;border:1px solid var(--jv-menu-line);background:rgba(2,8,15,.72);color:var(--jv-menu-muted)}
   @media(max-width:600px){.tools{top:8px;right:8px}.panel{top:62px;right:8px;width:calc(100vw - 16px);max-height:calc(100vh - 72px);border-radius:13px}.section{margin-left:12px;margin-right:12px}.panel>.title:first-child{padding-left:12px}.panel>.note,.memrow,#memList{padding-left:12px;padding-right:12px}.actions{padding-left:12px;padding-right:12px}.row{grid-template-columns:30px 1fr 30px 30px}}
  `;
  root.appendChild(style);
 };
 Panel.prototype.__jarvisMenuHarmonyInstalled=true;
}
