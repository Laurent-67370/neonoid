"use strict";
(function(){
class AudioFX{
  constructor(){
    this.ctx=null;this.master=null;this.musicGain=null;this.sfxGain=null;
    this.musicTimer=null;
    this.muted=false;
    try{this.muted=localStorage.getItem('neonoid_mute')==='1';}catch(e){}
  }
  ensure(){
    if(!this.ctx){
      var AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return false;
      this.ctx=new AC();
      this.master=this.ctx.createGain();
      this.master.gain.value=this.muted?0:0.5;
      this.master.connect(this.ctx.destination);
      this.sfxGain=this.ctx.createGain();
      this.sfxGain.gain.value=0.7;
      this.sfxGain.connect(this.master);
      this.musicGain=this.ctx.createGain();
      this.musicGain.gain.value=0.35;
      this.musicGain.connect(this.master);
    }
    if(this.ctx.state==='suspended'){this.ctx.resume().catch(function(){});}
    return true;
  }
  setMuted(m){
    this.muted=m;
    try{localStorage.setItem('neonoid_mute',m?'1':'0');}catch(e){}
    if(this.master&&this.ctx){this.master.gain.setTargetAtTime(m?0:0.5,this.ctx.currentTime,0.01);}
  }

  /* ═══════════════════════════════════════════════
     SFX — effets sonores améliorés
     ═══════════════════════════════════════════════ */

  tone(o){
    if(!this.ctx||this.muted)return;
    var t0=this.ctx.currentTime+(o.at||0);
    var osc=this.ctx.createOscillator();
    var g=this.ctx.createGain();
    osc.type=o.type||'square';
    osc.frequency.setValueAtTime(o.f,t0);
    if(o.f2){osc.frequency.exponentialRampToValueAtTime(Math.max(1,o.f2),t0+(o.d||0.1));}
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.linearRampToValueAtTime(o.v||0.2,t0+(o.a||0.005));
    g.gain.exponentialRampToValueAtTime(0.0001,t0+(o.d||0.1));
    osc.connect(g);g.connect(this.sfxGain);
    osc.start(t0);osc.stop(t0+(o.d||0.1)+0.05);
  }
  /* Tonalité avec second oscillateur (harmonique) */
  tone2(o){
    if(!this.ctx||this.muted)return;
    var t0=this.ctx.currentTime+(o.at||0);
    for(var h=0;h<2;h++){
      var osc=this.ctx.createOscillator();
      var g=this.ctx.createGain();
      osc.type=o.type||'square';
      var freq=o.f*(h===0?1:(o.harmonic||1.5));
      osc.frequency.setValueAtTime(freq,t0);
      if(o.f2){osc.frequency.exponentialRampToValueAtTime(Math.max(1,o.f2*(h===0?1:(o.harmonic||1.5))),t0+(o.d||0.1));}
      var vol=(o.v||0.2)*(h===0?1:0.4);
      g.gain.setValueAtTime(0.0001,t0);
      g.gain.linearRampToValueAtTime(vol,t0+(o.a||0.005));
      g.gain.exponentialRampToValueAtTime(0.0001,t0+(o.d||0.1));
      osc.connect(g);g.connect(this.sfxGain);
      osc.start(t0);osc.stop(t0+(o.d||0.1)+0.05);
    }
  }
  noise(d,v,at,filter){
    if(!this.ctx||this.muted)return;
    var t0=this.ctx.currentTime+(at||0);
    var len=Math.max(1,(this.ctx.sampleRate*d)|0);
    var buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate);
    var data=buf.getChannelData(0);
    for(var i=0;i<len;i++){data[i]=(Math.random()*2-1)*(1-i/len);}
    var src=this.ctx.createBufferSource();src.buffer=buf;
    var g=this.ctx.createGain();g.gain.value=v||0.2;
    if(filter){
      var f=this.ctx.createBiquadFilter();
      f.type=filter.type||'lowpass';
      f.frequency.value=filter.freq||1000;
      src.connect(f);f.connect(g);g.connect(this.sfxGain);
    }else{
      src.connect(g);g.connect(this.sfxGain);
    }
    src.start(t0);
  }

  paddle(){this.tone2({f:220,f2:160,type:'square',d:0.06,v:0.18,harmonic:2});}
  wall(){this.tone({f:660,type:'triangle',d:0.03,v:0.1});this.tone({f:880,type:'sine',d:0.02,v:0.05,at:0.005});}
  brick(c){
    var sc=[523,587,659,784,880,988,1175,1319];
    var f=sc[Math.min(c,sc.length-1)];
    this.tone2({f:f,type:'triangle',d:0.07,v:0.18,harmonic:2});
    this.noise(0.025,0.04,0,{type:'highpass',freq:2000});
  }
  silver(){this.tone2({f:1244,f2:932,type:'square',d:0.06,v:0.12,harmonic:1.5});this.noise(0.04,0.06,0,{type:'bandpass',freq:3000});}
  gold(){this.tone({f:180,type:'sine',d:0.08,v:0.15});this.tone({f:270,type:'sine',d:0.06,v:0.1,at:0.01});this.noise(0.05,0.08,0,{type:'lowpass',freq:800});}
  boom(){
    this.noise(0.4,0.35,0,{type:'lowpass',freq:600});
    this.tone({f:120,f2:40,type:'sawtooth',d:0.4,v:0.22});
    this.tone({f:80,f2:30,type:'square',d:0.35,v:0.15,at:0.02});
  }
  laser(){this.tone({f:1200,f2:300,type:'sawtooth',d:0.08,v:0.1});this.tone({f:800,f2:200,type:'square',d:0.06,v:0.06,at:0.005});}
  powGood(){
    var s=this;
    [523,659,784,1046].forEach(function(f,i){
      s.tone2({f:f,type:'square',d:0.09,v:0.14,harmonic:2,at:i*0.05});
    });
  }
  powBad(){
    var s=this;
    [392,311,247].forEach(function(f,i){
      s.tone({f:f,type:'sawtooth',d:0.12,v:0.14,at:i*0.06});
    });
    this.noise(0.08,0.06,0,{type:'lowpass',freq:500});
  }
  life(){
    this.tone2({f:660,type:'triangle',d:0.1,v:0.18,harmonic:1.5});
    this.tone2({f:880,type:'triangle',d:0.12,v:0.18,harmonic:1.5,at:0.1});
    this.tone2({f:1320,type:'triangle',d:0.2,v:0.18,harmonic:1.5,at:0.2});
    this.tone2({f:1760,type:'sine',d:0.25,v:0.12,at:0.25});
  }
  lose(){
    var s=this;
    [440,349,262,196].forEach(function(f,i){
      s.tone({f:f,type:'sawtooth',d:0.15,v:0.18,at:i*0.1});
    });
    this.noise(0.2,0.1,0.3,{type:'lowpass',freq:400});
  }
  launch(){this.tone({f:200,f2:800,type:'square',d:0.1,v:0.14});this.noise(0.04,0.06,0,{type:'highpass',freq:1500});}
  fanfare(){
    var s=this;
    [523,659,784,1046,1318].forEach(function(f,i){
      s.tone2({f:f,type:'square',d:i===4?0.3:0.1,v:0.16,harmonic:2,at:i*0.08});
    });
  }
  victory(){
    var s=this;
    var mel=[523,659,784,1046,784,1046,1318];
    mel.forEach(function(f,i){
      s.tone2({f:f,type:'square',d:i===mel.length-1?0.4:0.1,v:0.16,harmonic:2,at:i*0.12});
    });
    s.tone2({f:262,type:'triangle',d:1.5,v:0.08,harmonic:2,at:0});
  }
  over(){
    var s=this;
    [392,370,349,330,311,262].forEach(function(f,i){
      s.tone({f:f,type:'triangle',d:0.2,v:0.18,at:i*0.15});
    });
    this.noise(0.3,0.08,0.6,{type:'lowpass',freq:300});
  }
  click(){this.tone({f:1000,type:'sine',d:0.02,v:0.08});}

  /* ═══════════════════════════════════════════════
     MUSIQUE — synthwave générée en boucle
     Basse + mélodie + arpèges + drums
     ═══════════════════════════════════════════════ */

  startMusic(level){
    this.stopMusic();
    if(!this.ensure())return;

    /* Progressions harmoniques — 3 groupes qui changent par niveau */
    var progressions=[
      /* Groupe 0 — néon classique (Am-F-C-G) */
      {bass:[110,87.3,130.8,98],chord:[220,174.6,261.6,196],scale:[220,247,262,294,330,349,392,440]},
      /* Groupe 1 — sombre (Dm-Bb-Gm-A) */
      {bass:[73.4,116.5,98,110],chord:[146.8,233.1,196,220],scale:[146.8,164.6,174.6,196,220,233.1,261.6,293.7]},
      /* Groupe 2 — planant (Em-C-G-D) */
      {bass:[82.4,130.8,98,146.8],chord:[164.8,261.6,196,293.7],scale:[164.8,184.9,196,220,247,262,294,330]}
    ];
    var prog=progressions[level%3];
    var bpm=108+level*4;
    var beatLen=60/bpm;
    var stepLen=beatLen/2;
    var step=0;
    var self=this;

    /* Patterns : 16 steps par mesure (4 temps × 4 subdivisions) */
    var bassPat=[0,-1,-1,0, 2,-1,-1,2, 0,-1,-1,0, 3,-1,3,-1];
    var melodyPat=[4,-1,5,-1, 6,-1,7,-1, 4,-1,5,-1, 6,7,6,5];
    var drumPat=[1,0,0,0, 1,0,0,1, 1,0,0,0, 1,0,1,0]; /* kick */
    var snarePat=[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0]; /* snare */
    var hatPat=[1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1]; /* hihat */

    this.musicTimer=setInterval(function(){
      if(self.muted||!self.ctx){return;}
      var s=step%16;
      var chordIdx=Math.floor(s/4);
      var t0=self.ctx.currentTime+0.02;

      /* Basse synthwave */
      if(bassPat[s]>=0){
        var bf=prog.bass[bassPat[s]];
        self._musicNote(bf,'sawtooth',stepLen*0.9,0.12,t0,0);
        self._musicNote(bf*2,'square',stepLen*0.5,0.04,t0,0);
      }
      /* Mélodie */
      if(melodyPat[s]>=0){
        var mf=prog.scale[melodyPat[s]%prog.scale.length]*2;
        self._musicNote(mf,'square',stepLen*0.7,0.07,t0,0);
        self._musicNote(mf*1.5,'triangle',stepLen*0.4,0.02,t0,0);
      }
      /* Arpège doux */
      if(s%2===0){
        var af=prog.chord[chordIdx]*(s%4===0?1:1.5);
        self._musicNote(af,'triangle',stepLen*0.6,0.03,t0,0);
      }
      /* Kick drum */
      if(drumPat[s]){
        self._kick(t0);
      }
      /* Snare */
      if(snarePat[s]){
        self._snare(t0);
      }
      /* Hi-hat */
      if(hatPat[s]){
        self._hat(t0,s%2===0?0.03:0.015);
      }

      step++;
    },stepLen*1000);
  }

  _musicNote(f,type,d,v,t0,dest){
    var osc=this.ctx.createOscillator();
    var g=this.ctx.createGain();
    osc.type=type;osc.frequency.value=f;
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.linearRampToValueAtTime(v,t0+0.008);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+d);
    osc.connect(g);g.connect(this.musicGain);
    osc.start(t0);osc.stop(t0+d+0.05);
  }
  _kick(t0){
    var osc=this.ctx.createOscillator();
    var g=this.ctx.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(120,t0);
    osc.frequency.exponentialRampToValueAtTime(40,t0+0.1);
    g.gain.setValueAtTime(0.25,t0);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+0.12);
    osc.connect(g);g.connect(this.musicGain);
    osc.start(t0);osc.stop(t0+0.15);
  }
  _snare(t0){
    var len=Math.max(1,(this.ctx.sampleRate*0.08)|0);
    var buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate);
    var data=buf.getChannelData(0);
    for(var i=0;i<len;i++){data[i]=(Math.random()*2-1)*(1-i/len);}
    var src=this.ctx.createBufferSource();src.buffer=buf;
    var f=this.ctx.createBiquadFilter();f.type='highpass';f.frequency.value=1500;
    var g=this.ctx.createGain();g.gain.value=0.12;
    src.connect(f);f.connect(g);g.connect(this.musicGain);
    src.start(t0);
  }
  _hat(t0,v){
    var len=Math.max(1,(this.ctx.sampleRate*0.03)|0);
    var buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate);
    var data=buf.getChannelData(0);
    for(var i=0;i<len;i++){data[i]=(Math.random()*2-1)*(1-i/len);}
    var src=this.ctx.createBufferSource();src.buffer=buf;
    var f=this.ctx.createBiquadFilter();f.type='highpass';f.frequency.value=7000;
    var g=this.ctx.createGain();g.gain.value=v;
    src.connect(f);f.connect(g);g.connect(this.musicGain);
    src.start(t0);
  }

  stopMusic(){if(this.musicTimer){clearInterval(this.musicTimer);this.musicTimer=null;}}
}
window.AudioFX=AudioFX;
})();