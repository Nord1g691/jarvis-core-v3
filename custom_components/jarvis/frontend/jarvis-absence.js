/* JARVIS Core V3.0.26 — absence history and Sentinel timeline. */
const Panel=customElements.get('jarvis-panel');
if(Panel&&!Panel.prototype.__jarvisAbsenceInstalled){
 const SECURITY_CLASSES=new Set(['door','window','opening','motion','occupancy','presence','smoke','moisture','safety','gas','carbon_monoxide','sound']);
 Panel.prototype._jarvisLogbookToken=function(){return this._hass?.auth?.data?.access_token||''};
 Panel.prototype._jarvisInterestingEvent=function(x){
  const id=String(x?.entity_id||'');
  const domain=id.split('.')[0];
  if(['alarm_control_panel','lock','camera','cover'].includes(domain))return true;
  if(domain==='binary_sensor'){
   const s=this._hass?.states?.[id];
   return SECURITY_CLASSES.has(String(s?.attributes?.device_class||''));
  }
  if(domain==='person'||domain==='device_tracker')return true;
  return /alarm|alarme|camera|caméra|portail|porte|fen[eê]tre|garage|mouvement|motion|presence|présence|fum[ée]e|smoke|fuite|leak|sound|son/i.test(String(`${x?.name||''} ${x?.message||''}`));
 };
 Panel.prototype._jarvisEventSeverity=function(x){
  const text=String(`${x?.entity_id||''} ${x?.name||''} ${x?.message||''} ${x?.state||''}`).toLowerCase();
  if(/triggered|alarme|intrusion|smoke|fum|carbon|gaz|gas|fuite|moisture|safety/.test(text))return 'critical';
  if(/motion|mouvement|door|porte|window|fenêtre|opening|open|presence|présence|sound|son/.test(text))return 'attention';
  return 'info';
 };
 Panel.prototype._jarvisBuildAbsenceSummary=function(items,hours){
  const security=items.filter(x=>this._jarvisInterestingEvent(x));
  const critical=security.filter(x=>this._jarvisEventSeverity(x)==='critical');
  const attention=security.filter(x=>this._jarvisEventSeverity(x)==='attention');
  const cameras=security.filter(x=>String(x.entity_id||'').startsWith('camera.'));
  return {hours,total:items.length,security:security.length,critical:critical.length,attention:attention.length,cameras:cameras.length,items:security.slice(0,40)};
 };
 Panel.prototype._jarvisFetchAbsence=async function(hours=8){
  const token=this._jarvisLogbookToken();if(!token)throw Error('auth indisponible');
  const since=new Date(Date.now()-hours*3600*1000).toISOString();
  const r=await fetch('/api/logbook/'+encodeURIComponent(since),{headers:{Authorization:'Bearer '+token}});
  if(!r.ok)throw Error('HTTP '+r.status);
  const raw=await r.json();const items=(Array.isArray(raw)?raw:[]).slice().reverse();
  return this._jarvisBuildAbsenceSummary(items,hours);
 };
 Panel.prototype._jarvisInstallAbsenceCard=function(){
  const root=this._core?.shadowRoot,grid=root?.querySelector('.grid');if(!grid||root.getElementById('jarvisAbsenceCard'))return;
  const card=document.createElement('section');card.className='card';card.id='jarvisAbsenceCard';
  card.innerHTML='<div class="title">🛡️ SENTINEL · ABSENCE</div><div class="jarvis-absence-summary">Analyse non lancée.</div><div class="row"><button type="button" data-hours="4">4 H</button><button type="button" data-hours="8">8 H</button><button type="button" data-hours="24">24 H</button></div><div class="console jarvis-absence-log" style="display:none;margin-top:8px"></div>';
  grid.prepend(card);
  const summary=card.querySelector('.jarvis-absence-summary'),log=card.querySelector('.jarvis-absence-log');
  const run=async h=>{summary.textContent='Analyse Sentinel…';log.style.display='none';try{const d=await this._jarvisFetchAbsence(h);summary.innerHTML=`<b>${d.security}</b> événements sécurité · <b>${d.critical}</b> critiques · <b>${d.attention}</b> à vérifier`;log.style.display='block';log.innerHTML=d.items.length?d.items.map(x=>{const t=x.when||x.time_fired||Date.now();const sev=this._jarvisEventSeverity(x);return `<span class="jarvis-absence-${sev}">${new Date(t).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} · ${x.name||x.entity_id||'Événement'} · ${x.message||x.state||''}</span>`}).join('<br>'):'Aucun événement sécurité notable sur cette période.'}catch(e){summary.textContent='Analyse indisponible : '+e.message}};
  card.querySelectorAll('[data-hours]').forEach(b=>b.onclick=()=>run(Number(b.dataset.hours)));
  const st=document.createElement('style');st.textContent='.jarvis-absence-summary{padding:8px 0;font-size:10px;letter-spacing:.5px}.jarvis-absence-critical{color:#ff4050}.jarvis-absence-attention{color:#ffb000}.jarvis-absence-info{color:#8bd6ea}';root.appendChild(st);
 };
 const baseBoot=Panel.prototype._bootCore;
 Panel.prototype._bootCore=async function(){await baseBoot.call(this);this._jarvisInstallAbsenceCard()};
 Panel.prototype.__jarvisAbsenceInstalled=true;
}
