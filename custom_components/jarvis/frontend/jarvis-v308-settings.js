/* JARVIS Core V3.0.13 — complete persistent HUD settings. */
(() => {
  const KEY='jarvis_settings_v2';
  const DEFAULTS={volume:70,visible:['energy','commands','pipeline','led','console'],order:['energy','commands','pipeline','led','console']};
  const META={
    energy:{label:'⚡ ÉNERGIE SOLAIRE',match:'ÉNERGIE SOLAIRE'},
    commands:{label:'🎙️ COMMANDES JARVIS',match:'COMMANDES JARVIS'},
    pipeline:{label:'🧠 ASSISTANT / PIPELINE',match:'ASSISTANT / PIPELINE'},
    led:{label:'💡 RÉGLAGE LED',match:'RÉGLAGE LED'},
    console:{label:'CONSOLE JARVIS',match:'CONSOLE JARVIS'}
  };
  const get=()=>{try{return {...DEFAULTS,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(_){return {...DEFAULTS}}};
  const save=v=>localStorage.setItem(KEY,JSON.stringify(v));
  const patchVolume=()=>{
    if(window.__jarvisVolumePatched)return;
    const synth=window.speechSynthesis;
    const original=synth?.speak?.bind(synth);
    if(!original)return;
    window.__jarvisVolumePatched=true;
    synth.speak=(u)=>{try{u.volume=get().volume/100}catch(_){} return original(u)};
  };
  const cards=()=>{
    const root=document.querySelector('jarvis-core-hud')?.shadowRoot;
    if(!root)return [];
    return [...root.querySelectorAll('.grid > .card')].filter(c=>c.id!=='jarvis-settings-card');
  };
  const keyFor=c=>{
    const t=c.querySelector('.title')?.textContent||'';
    return Object.entries(META).find(([,m])=>t.includes(m.match))?.[0]||null;
  };
  const apply=()=>{
    const s=get(), list=cards();
    const byKey=new Map(list.map(c=>[keyFor(c),c]));
    s.visible.forEach(k=>{const c=byKey.get(k);if(c)c.style.display=''})
    Object.keys(META).filter(k=>!s.visible.includes(k)).forEach(k=>{const c=byKey.get(k);if(c)c.style.display='none'});
    const grid=list[0]?.parentElement;
    if(grid){s.order.forEach(k=>{const c=byKey.get(k);if(c)grid.appendChild(c)});}
  };
  const inject=()=>{
    const el=document.querySelector('jarvis-core-hud');
    const root=el?.shadowRoot;
    if(!root)return;
    const grid=root.querySelector('.grid');
    if(!grid)return;
    let card=root.querySelector('#jarvis-settings-card');
    if(!card){
      card=document.createElement('section');
      card.id='jarvis-settings-card';card.className='card';card.style.gridColumn='1/-1';
      card.innerHTML=`<div class="title">⚙️ RÉGLAGES JARVIS</div><button id="jarvis-settings-toggle" type="button">⚙️ OUVRIR LES RÉGLAGES</button><div id="jarvis-settings-panel" style="display:none;margin-top:10px"><div style="font-size:9px;color:#8bd6ea;margin:8px 0">CARTES AFFICHÉES</div><div id="jarvis-card-list"></div><div style="font-size:9px;color:#8bd6ea;margin:12px 0 6px">🔊 VOLUME JARVIS</div><div style="display:flex;align-items:center;gap:8px"><input id="jarvis-volume" type="range" min="0" max="100" value="70" style="flex:1"><span id="jarvis-volume-value">70%</span></div><div style="font-size:8px;color:#73aac0;margin-top:5px">Les réglages restent enregistrés sur cet appareil.</div></div>`;
      grid.insertBefore(card,grid.firstChild);
    }
    const s=get();
    const panel=card.querySelector('#jarvis-settings-panel');
    const list=card.querySelector('#jarvis-card-list');
    const render=()=>{
      const now=get();list.innerHTML='';
      now.order.forEach((k,i)=>{
        const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:5px;margin:5px 0;padding:5px;border:1px solid #00bfff22;border-radius:7px;background:#0005';
        const cb=document.createElement('input');cb.type='checkbox';cb.checked=now.visible.includes(k);cb.title='Afficher/masquer';
        const name=document.createElement('span');name.textContent=META[k].label;name.style.cssText='flex:1;font-size:9px';
        const up=document.createElement('button');up.type='button';up.textContent='▲';up.style.cssText='width:34px;min-height:30px;margin:0';up.disabled=i===0;
        const down=document.createElement('button');down.type='button';down.textContent='▼';down.style.cssText='width:34px;min-height:30px;margin:0';down.disabled=i===now.order.length-1;
        cb.onchange=()=>{const x=get();x.visible=cb.checked?[...new Set([...x.visible,k])]:x.visible.filter(v=>v!==k);save(x);apply()};
        up.onclick=()=>{const x=get(),p=x.order.indexOf(k);if(p>0){[x.order[p-1],x.order[p]]=[x.order[p],x.order[p-1]];save(x);apply();render()}};
        down.onclick=()=>{const x=get(),p=x.order.indexOf(k);if(p<x.order.length-1){[x.order[p+1],x.order[p]]=[x.order[p],x.order[p+1]];save(x);apply();render()}};
        row.append(cb,name,up,down);list.appendChild(row);
      });
    };
    card.querySelector('#jarvis-settings-toggle').onclick=()=>{const open=panel.style.display!=='none';panel.style.display=open?'none':'block';if(!open)render()};
    const slider=card.querySelector('#jarvis-volume'),value=card.querySelector('#jarvis-volume-value');
    slider.value=s.volume;value.textContent=s.volume+'%';
    slider.oninput=()=>{const n=Number(slider.value);value.textContent=n+'%';save({...get(),volume:n});patchVolume()};
    apply();patchVolume();
  };
  const watch=()=>{inject();patchVolume()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
  new MutationObserver(watch).observe(document.documentElement,{childList:true,subtree:true});
})();
