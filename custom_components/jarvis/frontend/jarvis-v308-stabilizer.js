/* JARVIS Core V3.0.8 — conversation loop + calm/think HUD patch. */
(() => {
  const apply = () => {
    const C = customElements.get('jarvis-core-hud');
    if (!C || C.__v308Patched) return;
    C.__v308Patched = true;
    const p = C.prototype;

    p.process = async function(text){
      if(this.processing || !text) return;
      this.processing = true;
      if(this.listenTimer){ clearTimeout(this.listenTimer); this.listenTimer = null; }
      try{ this.recognition?.stop(); }catch(_){}
      this.setState('JARVIS RÉFLÉCHIT','#ffb000');
      try{
        const token=this.token();
        if(!token) throw Error('Authentification Home Assistant indisponible');
        const body={text};
        const pipe=localStorage.getItem('jarvis_assist_pipeline')||'';
        if(pipe) body.pipeline=pipe;
        if(this.conversationId) body.conversation_id=this.conversationId;
        const r=await fetch(location.origin+'/api/jarvis/conversation',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
        const d=await r.json();
        if(!r.ok) throw Error(d?.message||d?.error||('HTTP '+r.status));
        this.conversationId=d.conversation_id||this.conversationId;
        const speech=d?.response?.speech?.plain?.speech||d?.response?.speech?.ssml?.speech||'';
        this.log('✓ Réponse JARVIS');
        if(speech) await this.speak(speech); else this.setState('OPÉRATIONNEL','#00eaff');
      }catch(e){
        this.log('✗ '+e.message);
        this.setState('JARVIS ERREUR','#ff4050');
        await new Promise(r=>setTimeout(r,800));
        this.setState('OPÉRATIONNEL','#00eaff');
      }finally{
        this.processing=false;
        if(this.conversationMode) this.startListeningWindow();
      }
    };

    p.startListeningWindow = function(){
      if(!this.conversationMode) return;
      if(this.listenTimer) clearTimeout(this.listenTimer);
      this.setState('JARVIS ÉCOUTE','#39ff88');
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!SR){ this.log('⚠️ Reconnaissance vocale indisponible'); this.stopConversation(); return; }
      const started=Date.now();
      const finish=()=>{
        if(!this.conversationMode || this.processing) return;
        this.conversationMode=false;
        try{this.recognition?.stop();}catch(_){}
        this.recognition=null;
        this.setState('OPÉRATIONNEL','#00eaff');
        this.log('⏹️ Fenêtre d’écoute terminée');
      };
      const arm=()=>{
        if(!this.conversationMode || this.processing) return;
        try{this.recognition?.stop();}catch(_){}
        const left=Math.max(0,this.listenTimeoutMs-(Date.now()-started));
        if(left<=0){ finish(); return; }
        try{
          const r=new SR();
          this.recognition=r;
          r.lang='fr-FR';
          r.continuous=false;
          r.interimResults=false;
          r.onresult=e=>{
            const t=e.results?.[0]?.[0]?.transcript?.trim();
            if(this.listenTimer){clearTimeout(this.listenTimer);this.listenTimer=null;}
            if(t) this.process(t);
          };
          r.onerror=e=>{
            const err=e.error||'erreur';
            if(err==='aborted' || err==='no-speech') return;
            this.log('⚠️ Écoute · '+err);
          };
          r.onend=()=>{
            if(this.recognition===r) this.recognition=null;
            if(this.conversationMode && !this.processing) setTimeout(arm,120);
          };
          r.start();
          this.listenTimer=setTimeout(finish,left);
        }catch(e){
          this.log('⚠️ Micro · '+e.message);
          setTimeout(()=>{if(this.conversationMode&&!this.processing)arm();},250);
        }
      };
      arm();
    };

    p.stopConversation = function(){
      this.conversationMode=false;
      if(this.listenTimer){clearTimeout(this.listenTimer);this.listenTimer=null;}
      try{this.recognition?.stop();}catch(_){}
      this.recognition=null;
    };

    const style = document.createElement('style');
    style.textContent = `
      .satellite{display:none!important}
      .ring,.orbit,.radar:before,.glow{animation-play-state:paused!important}
      .core.state-listen .ring,.core.state-listen .orbit,.core.state-listen .radar:before,.core.state-listen .glow{animation-play-state:running!important}
      .core.state-speak .ring,.core.state-speak .orbit,.core.state-speak .radar:before,.core.state-speak .glow{animation-play-state:running!important}
      .core.state-think .ring{animation:thinkRing 1.8s ease-in-out infinite!important}
      .core.state-think .orbit{animation:thinkOrbit 1.05s ease-in-out infinite alternate!important}
      .core.state-think .radar:before{animation:thinkRadar .9s linear infinite!important}
      .core.state-think .glow{animation:thinkPulse .75s ease-in-out infinite!important}
      .core.state-think .voiceBars i{animation:thinkBars .55s ease-in-out infinite alternate}
      @keyframes thinkRing{0%,100%{transform:scale(1) rotate(0deg);opacity:.55}50%{transform:scale(1.018) rotate(9deg);opacity:1}}
      @keyframes thinkOrbit{from{transform:rotate(18deg) scale(1)}to{transform:rotate(205deg) scale(1.045)}}
      @keyframes thinkRadar{to{transform:rotate(720deg)}}
      @keyframes thinkPulse{50%{transform:scale(1.16);opacity:.92}}
      @keyframes thinkBars{from{transform:scaleY(.55)}to{transform:scaleY(1.8)}}
    `;
    const inject=el=>{ if(el.shadowRoot && !el.shadowRoot.querySelector('#jarvis-v308-style')){style.id='jarvis-v308-style';el.shadowRoot.appendChild(style.cloneNode(true));} };
    document.querySelectorAll('jarvis-core-hud').forEach(inject);
  };
  if(customElements.get('jarvis-core-hud')) apply();
  else customElements.whenDefined('jarvis-core-hud').then(apply);
})();
