/* JARVIS Core V3.0.17 — persistent memory UI. Legacy storage keys/IDs are preserved for backward compatibility. */
(() => {
  const boot = () => {
    const host = document.querySelector('jarvis-core-hud');
    const root = host?.shadowRoot;
    const app = root?.querySelector('.app');
    if (!root || !app) return setTimeout(boot, 400);
    if (root.getElementById('j313-memory-style')) return;
    const style = document.createElement('style');
    style.id = 'j313-memory-style';
    style.textContent = `
      .j313-memory-btn{position:fixed;top:12px;right:60px;z-index:10020;width:40px;height:40px;min-height:40px;margin:0;padding:0;border:1px solid #00eaff66;border-radius:10px;background:#020711ee;color:#00eaff;font-size:17px;box-shadow:0 0 14px #00eaff22}
      .j313-memory-panel{position:fixed;top:58px;right:12px;z-index:10022;width:min(410px,calc(100vw - 24px));max-height:82vh;overflow:auto;padding:14px;border:1px solid #00eaff55;border-radius:14px;background:#031322f7;color:#dffaff;backdrop-filter:blur(14px);box-shadow:0 18px 50px #000b;display:none;text-align:left}
      .j313-memory-panel.open{display:block}.j313-title{font-size:10px;letter-spacing:2px;color:#8bd6ea;margin:2px 0 9px}.j313-note{font-size:8px;color:#7096a6;margin-bottom:10px}.j313-row{display:flex;gap:7px;margin-top:7px}.j313-row input{flex:1;min-width:0;height:38px;padding:0 10px;border:1px solid #00eaff44;border-radius:7px;background:#020b14;color:#dffaff}.j313-row button{width:auto;min-width:82px;margin:0}.j313-list{margin-top:10px}.j313-item{padding:8px;border-bottom:1px solid #00eaff18;font-size:9px;line-height:1.4}.j313-item small{display:block;color:#668b9b;margin-top:3px}.j313-item button{float:right;width:auto;min-height:28px;margin:0;padding:0 8px}.j313-empty{font-size:9px;color:#70808a;padding:10px 0}
      .j313-core-safe{transform:translateY(-4px)}
      @media(max-width:650px){.j313-memory-btn{right:60px}.j313-core-safe{transform:translateY(-2px)}}
    `;
    root.appendChild(style);
    const btn = document.createElement('button');
    btn.id='j313-memory-btn'; btn.className='j313-memory-btn'; btn.type='button'; btn.textContent='🧠'; btn.title='Mémoire JARVIS';
    const panel = document.createElement('div');
    panel.id='j313-memory-panel'; panel.className='j313-memory-panel';
    panel.innerHTML=`<div class="j313-title">🧠 MÉMOIRE JARVIS</div><div class="j313-note">Mémoire persistante dans Home Assistant. JARVIS ne mémorise automatiquement que ce que tu lui demandes explicitement.</div><div class="j313-row"><input id="j313-memory-input" placeholder="Ex. retiens que je préfère…"><button id="j313-memory-add" type="button">MÉMORISER</button></div><div class="j313-row"><button id="j313-memory-refresh" type="button">ACTUALISER</button><button id="j313-memory-clear" type="button">TOUT EFFACER</button></div><div id="j313-memory-list" class="j313-list"></div>`;
    app.append(btn,panel);
    const api = async (url, options={}) => { const r=await fetch(url, {credentials:'same-origin',headers:{'Content-Type':'application/json',...(options.headers||{})},...options}); if(!r.ok) throw new Error(await r.text()); return r.json(); };
    const list=panel.querySelector('#j313-memory-list');
    const render=async()=>{try{const data=await api('/api/jarvis/memory?limit=50');list.innerHTML='';const items=data.memories||[];if(!items.length){list.innerHTML='<div class="j313-empty">Aucune mémoire enregistrée.</div>';return;}items.forEach(m=>{const e=document.createElement('div');e.className='j313-item';e.innerHTML=`<button type="button">OUBLIER</button><span></span><small></small>`;e.querySelector('span').textContent=String(m.text);e.querySelector('small').textContent=m.category||'personal';e.querySelector('button').onclick=async()=>{await api('/api/jarvis/memory?id='+encodeURIComponent(m.id),{method:'DELETE'});render()};list.appendChild(e)});}catch(err){list.innerHTML='<div class="j313-empty">Mémoire indisponible.</div>';}};
    btn.onclick=()=>{panel.classList.toggle('open');if(panel.classList.contains('open'))render()};
    panel.querySelector('#j313-memory-refresh').onclick=render;
    panel.querySelector('#j313-memory-add').onclick=async()=>{const input=panel.querySelector('#j313-memory-input');const text=input.value.trim();if(!text)return;await api('/api/jarvis/memory',{method:'POST',body:JSON.stringify({text:text.replace(/^(?:retiens|mémorise|memorise)\s+/i,'')})});input.value='';render()};
    panel.querySelector('#j313-memory-clear').onclick=async()=>{if(confirm('Effacer toute la mémoire JARVIS ?')){await api('/api/jarvis/memory?q=all',{method:'DELETE'});render()}};
    render();
    const core = root.querySelector('.core');
    if(core){core.classList.add('j313-core-safe');core.style.marginTop='8px';core.style.marginBottom='22px';core.style.maxHeight='min(68vw,420px)';core.style.maxWidth='min(68vw,420px)';}
    const label = root.getElementById('state');
    if(label){label.style.bottom='-18px';label.style.zIndex='20';label.style.pointerEvents='none';}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});
})();
