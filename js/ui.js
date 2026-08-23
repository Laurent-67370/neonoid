"use strict";
(function(){
var TIPS=[
  "Astuce : touchez la balle avec les bords du palet pour viser en diagonale.",
  "Les briques argentées demandent plusieurs coups.",
  "L'or est indestructible… mais ça fait un bruit sympa.",
  "Combos : enchaînez les briques sans toucher le palet, jusqu'à ×8 !",
  "Le palet collant vous permet de viser chaque lancer.",
  "Sur mobile : glissez le doigt pour déplacer, tapez pour lancer/tirer.",
  "Une vie bonus tous les 10 000 points.",
  "Les briques à danger explosent en chaîne 💥"
];
function getScores(){
  try{
    var raw=localStorage.getItem('neonoid_scores');
    var arr=raw?JSON.parse(raw):[];
    return Array.isArray(arr)?arr:[];
  }catch(e){return[];}
}
function putScores(arr){
  try{localStorage.setItem('neonoid_scores',JSON.stringify(arr));}catch(e){}
}

window.NEOUI={
  init:function(game,audio){
    this.g=game;this.audio=audio;
    var self=this;
    this.$=function(id){return document.getElementById(id);};
    this.tipI=Math.floor(Math.random()*TIPS.length);
    this.$('tip').textContent=TIPS[this.tipI];
    setInterval(function(){
      if(self.$('scr-title').classList.contains('hidden'))return;
      self.tipI=(self.tipI+1)%TIPS.length;
      self.$('tip').textContent=TIPS[self.tipI];
    },5200);
    this.bind();
    this.syncSound();
    this.show('scr-title');
    this.refreshBest();
  },
  bind:function(){
    var self=this,g=this.g,a=this.audio;
    function wire(id,fn){
      self.$(id).addEventListener('click',function(e){
        a.ensure();a.click();fn(e);
      });
    }
    wire('btn-play',function(){g.startGame();self.show(null);});
    wire('btn-help',function(){self.show('scr-help');});
    wire('btn-help-back',function(){self.show('scr-title');});
    wire('btn-scores',function(){self.openScores(-1);});
    wire('btn-end-scores-back',function(){
      if(g.state==='over'||g.state==='won'){g.toTitle();}
      else{self.show('scr-title');self.refreshBest();}
    });
    wire('btn-scores-reset',function(){putScores([]);self.openScores(-1);});
    wire('btn-sound',function(){a.setMuted(!a.muted);self.syncSound();});
    wire('btn-resume',function(){g.togglePause(false);});
    wire('btn-quit',function(){g.toTitle();});
    wire('btn-replay',function(){g.startGame();self.show(null);});
    wire('btn-menu2',function(){g.toTitle();});
    wire('btn-name-ok',function(){self.submitName();});
    this.$('name-in').addEventListener('keydown',function(e){
      e.stopPropagation();
      if(e.key==='Enter'){self.submitName();}
    });
  },
  show:function(id){
    var screens=document.querySelectorAll('.screen');
    for(var i=0;i<screens.length;i++)screens[i].classList.add('hidden');
    if(id)this.$(id).classList.remove('hidden');
  },
  refreshBest:function(){
    var hi=0;
    try{hi=+(localStorage.getItem('neonoid_hi')||0)||0;}catch(e){}
    if(hi>0){
      this.$('best-line').textContent='🏆 RECORD : '+hi.toLocaleString('fr-FR')+' pts';
    }else{
      this.$('best-line').textContent='';
    }
  },
  syncSound:function(){
    this.$('btn-sound').textContent=this.audio.muted?'🔇 SON':'🔊 SON';
  },
  banner:function(main,sub){
    var b=this.$('banner');
    this.$('banner-main').textContent='NIVEAU '+main;
    this.$('banner-sub').textContent=sub||'';
    b.classList.remove('go');
    void b.offsetWidth;
    b.classList.add('go');
  },
  toast:function(msg){
    var t=this.$('toast');
    t.textContent=msg;
    t.classList.add('on');
    clearTimeout(this._tt);
    this._tt=setTimeout(function(){t.classList.remove('on');},1900);
  },
  pauseShow:function(p){
    if(this.g.state==='over'||this.g.state==='won')return;
    if(p)this.show('scr-pause');
    else this.show(null);
  },
  openScores:function(highlightIdx){
    var list=getScores();
    var ol=this.$('scores-list');
    ol.innerHTML='';
    if(!list.length){
      var li=document.createElement('li');
      li.innerHTML='<span class="empty" style="width:100%">Aucun score… à vous de jouer !</span>';
      ol.appendChild(li);
    }
    for(var i=0;i<list.length;i++){
      var e=list[i];
      var li=document.createElement('li');
      if(i===highlightIdx)li.className='me';
      var medal=['🥇','🥈','🥉'][i]||(i+1)+'.';
      li.innerHTML='<span class="rank">'+medal+'</span>'+
        '<span class="nm">'+String(e.n).replace(/[<>&]/g,'')+'</span>'+
        '<span class="lv">NIV '+e.l+'</span>'+
        '<span class="sc">'+Number(e.s).toLocaleString('fr-FR')+'</span>';
      ol.appendChild(li);
    }
    this.show('scr-scores');
  },
  end:function(res){
    this._end=res;
    this.$('end-title').textContent=res.win?'🏆 VICTOIRE TOTALE !':'💀 GAME OVER';
    this.$('end-stats').textContent='Score '+Number(res.score).toLocaleString('fr-FR')+' · Niveau '+res.level+'/'+window.LEVELS.length+(res.win?' terminé !':'');
    var list=getScores();
    var qualify=list.length<5||res.score>list[list.length-1].s;
    this.$('name-form').classList.toggle('hidden',!qualify);
    this.$('btn-replay').classList.remove('hidden');
    if(qualify){
      var inp=this.$('name-in');
      inp.value='';
      setTimeout(function(){inp.focus();},150);
    }else{
      setTimeout(function(){
        document.getElementById('name-form').classList.add('hidden');
      },0);
    }
    this.show('scr-end');
  },
  submitName:function(){
    var res=this._end;
    if(!res)return;
    var name=(this.$('name-in').value||'AAA').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3)||'AAA';
    var list=getScores();
    var entry={n:name,s:res.score,l:res.level};
    list.push(entry);
    list.sort(function(a,b){return b.s-a.s;});
    list=list.slice(0,5);
    putScores(list);
    var idx=list.indexOf(entry);
    this.openScores(idx);
  }
};
})();
