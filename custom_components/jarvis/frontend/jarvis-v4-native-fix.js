/* JARVIS V4.1.1 — native shell cleanup + reliable Home Assistant navigation. */
export function installJarvisV4NativeFix(Panel){
 if(!Panel||Panel.prototype.__jarvisV4NativeFixInstalled)return;
 const install=function(){
  const panelRoot=this.shadowRoot,root=this._core?.shadowRoot,core=root?.getElementById('core');
  if(!root||!core)return;

  panelRoot?.querySelector('.version')?.replaceChildren(document.createTextNode('JARVIS V4.1.1'));

  if(!root.getElementById('jarvisV4NativeFixStyle')){
   const s=document.createElement('style');
   s.id='jarvisV4NativeFixStyle';
   s.textContent=`
    /* The V4.0 base rings remain only as a faint structural underlay. */
    .core>.orbit,.core>.orbit2{opacity:0!important}
    .core>.r1{opacity:.16!important}
    .core>.r2{opacity:.07!important}
    .core>.r3{opacity:.10!important}
    .core>.r4{opacity:.06!important}
    .core>.r5{opacity:.08!important}
    .core>.glow{opacity:0!important;background:transparent!important;box-shadow:none!important}
    #backButton{min-width:82px!important;z-index:10020!important}
   `;
   root.appendChild(s);
  }

  const back=root.getElementById('backButton');
  if(back){
   back.textContent='← ACCUEIL';
   back.title='Revenir à Home Assistant';
   back.onclick=()=>{
    const before=location.pathname+location.search+location.hash;
    if(history.length>1){
     history.back();
     setTimeout(()=>{
      const after=location.pathname+location.search+location.hash;
      if(after===before)location.assign('/');
     },650);
    }else location.assign('/');
   };
  }
 };
 const base=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){const out=await base.call(this);install.call(this);return out};
 Panel.prototype._v4InstallNativeFix=install;
 Panel.prototype.__jarvisV4NativeFixInstalled=true;
}
