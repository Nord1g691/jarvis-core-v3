/* JARVIS V4.1.1 — final premium visual pass. */
export function installJarvisV4Final(Panel){
 if(!Panel||Panel.prototype.__jarvisV4FinalInstalled)return;
 const install=function(){
  const root=this._core?.shadowRoot,core=root?.getElementById('core');if(!root||!core)return;
  core.querySelectorAll('.satellite').forEach(e=>e.remove());
  if(!root.getElementById('jarvisV4FinalStyle')){const s=document.createElement('style');s.id='jarvisV4FinalStyle';s.textContent=`
  :host{--final-cyan:#00eaff;--final-cyan-soft:rgba(0,234,255,.22)}
  .app{background:radial-gradient(circle at 50% 31%,#082d45 0,transparent 36%),linear-gradient(180deg,#020711,#01050a 78%)!important;padding-top:18px!important}
  header{margin-bottom:4px!important}.logo{font-size:38px!important;letter-spacing:11px!important;font-weight:500!important;text-shadow:0 0 14px #00eaff77!important}.sub{font-size:9px!important;letter-spacing:3.2px!important;color:#7fb9ca!important}.status{padding:5px 13px!important;border-radius:999px!important;background:#031019aa!important;border:1px solid #39ff8845!important;color:#8bffc0!important;box-shadow:0 0 18px #39ff880d!important}
  .core{width:min(73vw,410px)!important;height:min(73vw,410px)!important;margin:18px auto 50px!important;filter:drop-shadow(0 20px 42px #0009)!important}
  .ring{box-shadow:none!important;border-color:color-mix(in srgb,var(--jv-core-state) 28%,transparent)!important}.r1{opacity:.16!important}.r2{opacity:.07!important}.r3{opacity:.10!important}.r4{opacity:.06!important}.r5{opacity:.08!important}.orbit,.orbit2{opacity:0!important}
  .leds{opacity:.96!important}.led{width:3px!important;height:17px!important;margin:-8.5px 0 0 -1.5px!important;background:var(--jv-core-state)!important;box-shadow:0 0 7px var(--jv-core-state)!important}
  .glow{width:20%!important;height:20%!important;background:transparent!important;box-shadow:none!important;opacity:0!important;animation:none!important}
  .label{bottom:-11.5%!important;padding:7px 17px!important;border-radius:999px!important;background:linear-gradient(180deg,#07151fe8,#02070de8)!important;border:1px solid color-mix(in srgb,var(--jv-core-state) 52%,transparent)!important;box-shadow:0 0 18px var(--jv-core-state-soft),inset 0 1px 0 #ffffff0a!important;font-size:11px!important;letter-spacing:3.5px!important}
  .grid{max-width:900px!important;gap:12px!important}.card{border-radius:15px!important;border:1px solid #00eaff1e!important;background:linear-gradient(180deg,#071824ca,#031019e8)!important;box-shadow:0 12px 32px #0005,inset 0 1px 0 #ffffff04!important}.title{color:#9defff!important;letter-spacing:1.8px!important}
  .v4-summary{max-width:760px!important;margin-top:-4px!important;margin-bottom:16px!important}.v4-mini{border-radius:14px!important;background:linear-gradient(180deg,#071824d6,#031019e9)!important;border:1px solid #00eaff1e!important;box-shadow:0 10px 28px #0005,inset 0 1px 0 #ffffff05!important}.v4-mini b{font-size:19px!important}.v4-mini small{letter-spacing:1.3px!important}
  #backButton{top:max(12px,calc(env(safe-area-inset-top) + 8px))!important;left:max(12px,calc(env(safe-area-inset-left) + 12px))!important;min-width:82px!important;border-radius:11px!important;background:#04131ee6!important;border:1px solid #00eaff28!important;box-shadow:0 8px 24px #0007!important}
  @media(max-width:650px){.logo{font-size:29px!important;letter-spacing:8px!important}.core{width:78vw!important;height:78vw!important;max-width:370px!important;max-height:370px!important;margin-bottom:54px!important}.label{font-size:10px!important;letter-spacing:3px!important}.v4-summary{max-width:90vw!important}}
  `;root.appendChild(s)}
 };
 const base=Panel.prototype._bootCore;Panel.prototype._bootCore=async function(){const out=await base.call(this);install.call(this);return out};
 Panel.prototype._v4InstallFinal=install;
 Panel.prototype.__jarvisV4FinalInstalled=true;
}