"use strict";
(function(){
class AudioFX{
  constructor(){
    this.ctx=null;this.master=null;this.musicTimer=null;
    this.muted=false;
    try{this.muted=localStorage.getItem('neonoid_mute')==='1';}catch(e){}
  }
  ensure(){
    if(!this.ctx){
      var AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return false;
      this.ctx=new AC();
      this.master=this.ctx.createGain();
      this.master.gain.value=this.muted?0:0.55;
      this.master.connect(this.ctx.destination);
    }
    if(this.ctx.state==='suspended'){this.ctx.resume().catch(function(){});}
    return true;
  }
  setMuted(m){
    this.muted=m;
    try{localStorage.setItem('neonoid_mute',m?'1':'0');}catch(e){}
    if(this.master&&this.ctx){this.master.gain.setTargetAtTime(m?0:0.55,this.ctx.currentTime,0.01);}
  }
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
    osc.connect(g);g.connect(this.master);
    osc.start(t0);osc.stop(t0+(o.d||0.1)+0.05);
  }
  noise(d,v,at){
    if(!this.ctx||this.muted)return;
    var t0=this.ctx.currentTime+(at||0);
    var len=Math.max(1,(this.ctx.sampleRate*d)|0);
    var buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate);
    var data=buf.getChannelData(0);
    for(var i=0;i<len;i++){data[i]=(Math.random()*2-1)*(1-i/len);}
    var src=this.ctx.createBufferSource();src.buffer=buf;
    var g=this.ctx.createGain();g.gain.value=v||0.2;
    src.connect(g);g.connect(this.master);src.start(t0);
  }
  paddle(){this.tone({f:196,f2:150,type:'square',d:0.07,v:0.22});}
  wall(){this.tone({f:520,type:'triangle',d:0.03,v:0.1});}
  brick(c){
    var sc=[523,587,659,784,880,988,1175,1319];
    this.tone({f:sc[Math.min(c,sc.length-1)],type:'triangle',d:0.07,v:0.2});
    this.noise(0.03,0.05);
  }
  silver(){this.tone({f:1244,f2:932,type:'square',d:0.05,v:0.14});this.noise(0.04,0.08);}
  gold(){this.tone({f:220,type:'square',d:0.05,v:0.18});this.noise(0.05,0.1);}
  boom(){this.noise(0.35,0.3);this.tone({f:120,f2:40,type:'sawtooth',d:0.35,v:0.25});}
  laser(){this.tone({f:980,f2:240,type:'sawtooth',d:0.09,v:0.13});}
  powGood(){var s=this;[523,659,784].forEach(function(f,i){s.tone({f:f,type:'square',d:0.09,v:0.16,at:i*0.06});});}
  powBad(){var s=this;[392,311].forEach(function(f,i){s.tone({f:f,type:'sawtooth',d:0.12,v:0.16,at:i*0.08});});}
  life(){
    this.tone({f:660,type:'triangle',d:0.1,v:0.2});
    this.tone({f:880,type:'triangle',d:0.14,v:0.2,at:0.1});
    this.tone({f:1320,type:'triangle',d:0.22,v:0.2,at:0.2});
  }
  lose(){var s=this;[440,349,262].forEach(function(f,i){s.tone({f:f,type:'sawtooth',d:0.16,v:0.2,at:i*0.12});});}
  launch(){this.tone({f:300,f2:700,type:'square',d:0.09,v:0.16});}
  fanfare(){
    var s=this;
    [523,659,784,1046].forEach(function(f,i){s.tone({f:f,type:'square',d:0.12,v:0.18,at:i*0.1});});
    this.tone({f:1318,type:'square',d:0.3,v:0.18,at:0.45});
  }
  victory(){
    var s=this;
    [523,523,659,784,880,1046].forEach(function(f,i){
      s.tone({f:f,type:'square',d:i===5?0.4:0.11,v:0.18,at:i*0.12});
    });
  }
  over(){var s=this;[392,370,349,330,262].forEach(function(f,i){s.tone({f:f,type:'triangle',d:0.22,v:0.2,at:i*0.18});});}
  click(){this.tone({f:800,type:'square',d:0.03,v:0.1});}
  startMusic(level){
    this.stopMusic();
    if(!this.ensure())return;
    var roots=[
      [110,131,147,165,196],
      [98,117,131,165,196],
      [104,125,139,156,187]
    ][level%3];
    var bpm=104+level*6;
    var beat=60/bpm/2;
    var pat=[0,0,3,0,4,0,2,3];
    var step=0;
    var self=this;
    this.musicTimer=setInterval(function(){
      if(self.muted||!self.ctx){return;}
      var t0=self.ctx.currentTime+0.05;
      var n=roots[pat[step%8]];
      self._note(n,'square',beat*0.9,0.05,t0);
      if(step%4===2){self._note(n*2,'triangle',beat*0.5,0.035,t0);}
      step++;
    },beat*1000);
  }
  _note(f,type,d,v,t0){
    var osc=this.ctx.createOscillator();
    var g=this.ctx.createGain();
    osc.type=type;osc.frequency.value=f;
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.linearRampToValueAtTime(v,t0+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+d);
    osc.connect(g);g.connect(this.master);
    osc.start(t0);osc.stop(t0+d+0.05);
  }
  stopMusic(){if(this.musicTimer){clearInterval(this.musicTimer);this.musicTimer=null;}}
}
window.AudioFX=AudioFX;
})();
