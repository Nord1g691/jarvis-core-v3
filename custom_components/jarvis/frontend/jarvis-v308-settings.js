/* JARVIS Core V3.0.8 — lightweight settings layer. */
(() => {
  const SETTINGS_KEY='jarvis_settings_v1';
  const defaults={volume:70};
  const get=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}}catch(_){return {...defaults}}};
  const save=v=>localStorage.setItem(SETTINGS_KEY,JSON.stringify(v));
  const patchVolume=()=>{
    if(window.__jarvisVolumePatched)return;
    const original=window.speechSynthesis?.speak?.bind(window.speechSynthesis);
    if(!original)return;
    window.__jarvisVolumePatched=true;
    window.speechSynthesis.speak=(utterance)=>{try{utterance.volume=get().volume/100}catch(_){} return original(utterance)};
  };
  const inject=()=>{
    const el=document.querySelector('jarvis-core-hud');
    if(!el?.shadowRoot)return;
    const root=el.shadowRoot;
    if(root.querySelector('#jarvis-settings-card'))return;
    const card=document.createElement('section');
    card.id='jarvis-settings-card';card.className='card';
    card.innerHTML=`<div class="title">⚙️ RÉGLAGES JARVIS</div><button id="jarvis-settings-toggle" type="button">⚙️ OUVRIR LES RÉGLAGES</button><div id="jarvis-settings-panel" style="display:none;margin-top:8px"><label style="font-size:9px">🔊 VOLUME ASSIST <span id="jarvis-volume-value">70%</span><input id="jarvis-volume" type="range" min="0" max="100" value="70" style="width:100%"></label><div style="font-size:8px;color:#73aac0;margin-top:6px">Le volume est mémorisé sur cet appareil.</div></div>`;
    const anchor=root.querySelector('.grid .card:last-child')||root.querySelector('.grid');
    if(anchor?.parentNode)anchor.parentNode.insertBefore(card,anchor);else root.appendChild(card);
    const s=get(),slider=card.querySelector('#jarvis-volume'),value=card.querySelector('#jarvis-volume-value'),panel=card.querySelector('#jarvis-settings-panel');
    slider.value=s.volume;value.textContent=s.volume+'%';
    slider.oninput=()=>{const n=Number(slider.value);value.textContent=n+'%';save({...get(),volume:n});patchVolume()};
    card.querySelector('#jarvis-settings-toggle').onclick=()=>{const open=panel.style.display!=='none';panel.style.display=open?'none':'block';};
    patchVolume();
  };
  const watch=()=>{patchVolume();inject();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
  new MutationObserver(watch).observe(document.documentElement,{childList:true,subtree:true});
})();
