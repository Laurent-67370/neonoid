"use strict";
(function(){
var W=600,H=800,WALL=14,TOP=54;
var LEFT=WALL,RIGHT=W-WALL;
var COLS=14;
var CELLW=(RIGHT-LEFT)/COLS;
var BW=CELLW-3,BH=19,BH_PITCH=22;
var GRIDY=TOP+16;
var PALETTE={r:'#ff5577',o:'#ff9a3d',y:'#ffe14d',g:'#4ade80',b:'#38bdf8',v:'#a78bfa',c:'#2dd4bf'};
var HUES=[222,262,205,282,330,190,246,168,300,12];
var KINDS={
  EXPAND:{c:'#22d3ee',l:'E',txt:'PALET LARGE'},
  SHRINK:{c:'#ef4444',l:'!',txt:'PALET RéTRéCI'},
  MULTI:{c:'#a78bfa',l:'M',txt:'MULTI-BALLES'},
  LASER:{c:'#fb7185',l:'L',txt:'LASERS'},
  CATCH:{c:'#4ade80',l:'C',txt:'PALET COLLANT'},
  SLOW:{c:'#38bdf8',l:'S',txt:'BALLE LENTE'},
  FAST:{c:'#facc15',l:'F',txt:'BALLE RAPIDE'},
  FIRE:{c:'#fb923c',l:'B',txt:'BOULE DE FEU'},
  LIFE:{c:'#f472b6',l:'+',txt:'+1 VIE'}
};
var BAD={SHRINK:1,FAST:1};
var POOL=[['EXPAND',20],['MULTI',16],['LASER',14],['CATCH',12],['SLOW',12],['FIRE',10],['LIFE',6],['SHRINK',5],['FAST',5]];
var POOL_TOTAL=POOL.reduce(function(a,p){return a+p[1];},0);

function rnd(a,b){return a+Math.random()*(b-a);}
function clamp(v,a,b){return v<a?a:(v>b?b:v);}
function lighten(hex,amt){
  var n=parseInt(hex.slice(1),16);
  var r=clamp(((n>>16)&255)+amt,0,255),g=clamp(((n>>8)&255)+amt,0,255),b=clamp((n&255)+amt,0,255);
  return 'rgb('+r+','+g+','+b+')';
}
function rr(ctx,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function NeoGame(canvas,audio,hooks){
  this.cv=canvas;
  this.ctx=canvas.getContext('2d');
  this.audio=audio;
  this.hooks=hooks||{};
  this.state='title';
  this.paused=false;
  this.score=0;this.nextLifeAt=10000;
  this.lives=3;this.levelIdx=0;this.combo=0;
  try{this.hi=+(localStorage.getItem('neonoid_hi')||0)||0;}catch(e){this.hi=0;}
  this.input={left:false,right:false,targetX:null};
  this.eff=this.blankEff();
  this.parts=[];this.pops=[];this.pus=[];this.lasers=[];
  this.balls=[];
  this.bricks=[];this.grid=[];this.remaining=0;
  this.paddle={x:W/2,y:H-46,w:96,tw:96,h:13,pulse:0};
  this.stars=[];
  for(var i=0;i<110;i++){this.stars.push({x:Math.random()*W,y:Math.random()*H,z:rnd(0.3,1),tw:rnd(1,3),ph:rnd(0,6)});}
  this.sprites=new Map();
  this.shake=0;this.t=0;this.stateT=0;this.fwT=0;this.lcd=0;this.lastPos={x:W/2,y:H-100};
  this.accent='#38bdf8';
  this.loadLevel(0);
  this.resetBall(true);
  requestAnimationFrame(this.loop.bind(this));
}

NeoGame.prototype.blankEff=function(){return{expand:0,shrink:0,laser:0,catch:0,slow:0,fast:0,fire:0};};

NeoGame.prototype.speedBase=function(){return 330+this.levelIdx*14;};

NeoGame.prototype.loadLevel=function(idx){
  var def=window.LEVELS[idx];
  this.levelIdx=idx;
  this.bricks=[];this.grid=[];
  this.remaining=0;
  var hue=HUES[idx%HUES.length];
  this.accent='hsl('+hue+',90%,62%)';
  this.bgGrad=this.ctx.createLinearGradient(0,0,0,H);
  this.bgGrad.addColorStop(0,'hsl('+hue+',45%,11%)');
  this.bgGrad.addColorStop(1,'hsl('+hue+',50%,4%)');
  for(var r=0;r<def.map.length;r++){
    var row='';
    for(var c=0;c<COLS;c++){row+=def.map[r][c]||'.';}
    this.grid.push([]);
    for(c=0;c<COLS;c++){
      var ch=row[c];
      if(ch==='.'||ch===' '){this.grid[r].push(null);continue;}
      var brk={r:r,c:c,x:LEFT+c*CELLW+1.5,y:GRIDY+r*BH_PITCH,w:BW,h:BH,alive:true,key:ch,color:null,type:'color',hp:1,maxHp:1,drop:false,variant:''};
      if(PALETTE[ch]){brk.color=PALETTE[ch];}
      else if(ch==='S'){brk.type='S';brk.color='#cbd5e1';brk.hp=2+(idx>=6?1:0);brk.maxHp=brk.hp;}
      else if(ch==='G'){brk.type='gold';brk.color='#fbbf24';}
      else if(ch==='X'){brk.type='X';brk.color='#fb7185';}
      else if(ch==='D'){var keys=Object.keys(PALETTE);brk.color=PALETTE[keys[Math.floor(Math.random()*keys.length)]];brk.drop=true;}
      else{brk.color='#94a3b8';}
      this.bricks.push(brk);
      this.grid[r].push(brk);
      if(brk.type!=='gold'){this.remaining++;}
    }
  }
  this.eff=this.blankEff();
  this.pus=[];this.lasers=[];this.parts=[];this.pops=[];
  this.combo=0;
  this.paddle.w=96;this.paddle.tw=96;this.paddle.x=W/2;
};

NeoGame.prototype.makeBall=function(stuck){
  return{x:this.paddle.x,y:this.paddle.y-10,vx:0,vy:0,r:7,speed:this.speedBase(),trail:[],stuck:stuck,stuckDX:0,fire:false,dead:false};
};
NeoGame.prototype.resetBall=function(stuck){this.balls=[this.makeBall(stuck)];};

NeoGame.prototype.startGame=function(){
  this.score=0;this.nextLifeAt=10000;this.lives=3;this.combo=0;
  this.paused=false;
  this.loadLevel(0);
  this.resetBall(true);
  this.state='playing';
  this.audio.startMusic(0);
  if(this.hooks.level){this.hooks.level(window.LEVELS[0].name,0);}
};
NeoGame.prototype.toTitle=function(){
  this.state='title';this.paused=false;
  this.audio.stopMusic();
  this.loadLevel(0);this.resetBall(true);
  if(this.hooks.title){this.hooks.title();}
};

NeoGame.prototype.togglePause=function(p){
  if(this.state!=='playing'&&this.state!=='dying')return;
  this.paused=(p===undefined)?!this.paused:p;
  if(this.paused){this.audio.stopMusic();}
  else{this.audio.startMusic(this.levelIdx);}
  if(this.hooks.pause){this.hooks.pause(this.paused);}
};

NeoGame.prototype.launchAction=function(){
  if(this.state!=='playing'||this.paused)return;
  var st=null;
  for(var i=0;i<this.balls.length;i++){if(this.balls[i].stuck){st=this.balls[i];break;}}
  if(st){
    for(i=0;i<this.balls.length;i++){
      var b=this.balls[i];
      if(b.stuck){
        b.stuck=false;
        var a=rnd(-0.5,0.5);
        b.vx=Math.sin(a)*b.speed;b.vy=-Math.cos(a)*b.speed;
      }
    }
    this.audio.launch();
  }else{
    this.fireLaser();
  }
};

NeoGame.prototype.movePaddle=function(dt){
  var p=this.paddle;
  var kb=(this.input.right?1:0)-(this.input.left?1:0);
  if(kb!==0){
    p.x+=kb*560*dt;
    this.input.targetX=p.x;
  }else if(this.input.targetX!==null){
    p.x+=(this.input.targetX-p.x)*Math.min(1,dt*20);
  }
  p.tw=this.eff.expand>0?150:(this.eff.shrink>0?62:96);
  p.w+=(p.tw-p.w)*Math.min(1,dt*8);
  p.x=clamp(p.x,LEFT+p.w/2+4,RIGHT-p.w/2-4);
  p.pulse=Math.max(0,p.pulse-dt*4);
  for(var i=0;i<this.balls.length;i++){
    var b=this.balls[i];
    if(b.stuck){
      b.x=clamp(p.x+b.stuckDX,LEFT+p.w/2-30,RIGHT-p.w/2+30);
      b.y=p.y-b.r-3;
    }
  }
};

NeoGame.prototype.speedMul=function(){
  if(this.eff.slow>0)return 0.68;
  if(this.eff.fast>0)return 1.35;
  return 1;
};

NeoGame.prototype.stepBall=function(b,dt){
  var mul=this.speedMul();
  var cur=Math.hypot(b.vx,b.vy);
  if(cur>1e-6){var f=(b.speed*mul)/cur;b.vx*=f;b.vy*=f;}
  if(!b.stuck&&Math.abs(b.vy)<0.18*b.speed*mul){
    var sg=b.vy===0?-1:Math.sign(b.vy);
    b.vy=sg*0.18*b.speed*mul;
    cur=Math.hypot(b.vx,b.vy);
    f=(b.speed*mul)/cur;b.vx*=f;b.vy*=f;
  }
  var dist=Math.hypot(b.vx,b.vy)*dt;
  var steps=Math.max(1,Math.ceil(dist/5));
  var sdt=dt/steps;
  for(var i=0;i<steps;i++){
    b.x+=b.vx*sdt;b.y+=b.vy*sdt;
    this.hitWalls(b);
    this.hitPaddle(b);
    this.hitBricks(b);
    if(b.y>H+40){b.dead=true;return;}
  }
  b.trail.push({x:b.x,y:b.y});
  if(b.trail.length>9){b.trail.shift();}
};

NeoGame.prototype.hitWalls=function(b){
  var hit=false;
  if(b.x-b.r<LEFT){b.x=LEFT+b.r;if(b.vx<0)b.vx=-b.vx;hit=true;}
  else if(b.x+b.r>RIGHT){b.x=RIGHT-b.r;if(b.vx>0)b.vx=-b.vx;hit=true;}
  if(b.y-b.r<TOP){b.y=TOP+b.r;if(b.vy<0)b.vy=-b.vy;hit=true;}
  if(hit){
    this.audio.wall();
    this.addSpark(b.x,b.y,'#bae6fd',3);
  }
};

NeoGame.prototype.hitPaddle=function(b){
  var p=this.paddle;
  if(b.vy<=0)return;
  var nx=clamp(b.x,p.x-p.w/2,p.x+p.w/2);
  var ny=clamp(b.y,p.y-p.h/2,p.y+p.h/2);
  var dx=b.x-nx,dy=b.y-ny;
  if(dx*dx+dy*dy>b.r*b.r)return;
  b.y=p.y-p.h/2-b.r-0.5;
  this.combo=0;
  p.pulse=1;
  if(this.eff.catch>0&&!b.fire){
    b.stuck=true;b.stuckDX=clamp(b.x-p.x,-p.w/2+10,p.w/2-10);b.vx=0;b.vy=0;
    this.audio.paddle();
    return;
  }
  var rel=clamp((b.x-p.x)/(p.w/2),-1,1);
  var ang=rel*1.05;
  var s=b.speed*this.speedMul();
  b.vx=Math.sin(ang)*s;b.vy=-Math.cos(ang)*s;
  this.audio.paddle();
  this.addSpark(b.x,p.y-p.h/2,this.accent,5);
};

NeoGame.prototype.brickAtPoint=function(x,y){
  var c=Math.floor((x-LEFT)/CELLW);
  var r=Math.floor((y-GRIDY)/BH_PITCH);
  if(r<0||r>=this.grid.length||c<0||c>=COLS)return null;
  var brk=this.grid[r][c];
  return(brk&&brk.alive)?brk:null;
};

NeoGame.prototype.hitBricks=function(b){
  var r0=Math.floor((b.y-b.r-GRIDY)/BH_PITCH),r1=Math.floor((b.y+b.r-GRIDY)/BH_PITCH);
  var c0=Math.floor((b.x-b.r-LEFT)/CELLW),c1=Math.floor((b.x+b.r-LEFT)/CELLW);
  for(var r=r0;r<=r1;r++){
    if(r<0||r>=this.grid.length)continue;
    for(var c=c0;c<=c1;c++){
      if(c<0||c>=COLS)continue;
      var brk=this.grid[r][c];
      if(!brk||!brk.alive)continue;
      var cx=brk.x+brk.w/2,cy=brk.y+brk.h/2;
      var dxc=b.x-cx,dyc=b.y-cy;
      var ox=brk.w/2+b.r-Math.abs(dxc);
      var oy=brk.h/2+b.r-Math.abs(dyc);
      if(ox<=0||oy<=0)continue;
      if(!(b.fire&&brk.type!=='gold')){
        if(ox<oy){b.vx=(dxc>0?1:-1)*Math.abs(b.vx);b.x=cx+(dxc>0?1:-1)*(brk.w/2+b.r+0.5);}
        else{b.vy=(dyc>0?1:-1)*Math.abs(b.vy);b.y=cy+(dyc>0?1:-1)*(brk.h/2+b.r+0.5);}
      }
      this.damageBrick(brk,false);
      return;
    }
  }
};

NeoGame.prototype.damageBrick=function(brk,silent){
  if(!brk.alive)return;
  if(brk.type==='gold'){
    if(!silent)this.audio.gold();
    this.addSpark(brk.x+brk.w/2,brk.y+brk.h/2,'#fde68a',6);
    return;
  }
  brk.hp--;
  if(brk.hp>0){
    brk.variant='damaged';
    if(!silent)this.audio.silver();
    this.addSpark(brk.x+brk.w/2,brk.y+brk.h/2,'#e2e8f0',5);
    return;
  }
  this.destroyBrick(brk);
};

NeoGame.prototype.destroyBrick=function(brk){
  if(!brk.alive)return;
  brk.alive=false;
  this.grid[brk.r][brk.c]=null;
  this.remaining--;
  var cx=brk.x+brk.w/2,cy=brk.y+brk.h/2;
  this.combo++;
  var pts=(brk.type==='S'?80:(brk.type==='X'?90:50))*Math.min(this.combo,8);
  this.addScore(pts);
  this.addPopup(pts+(this.combo>1?' x'+Math.min(this.combo,8):''),cx,cy,brk.color);
  this.addBurst(cx,cy,brk.color,brk.type==='X'?22:12,brk.type==='X'?300:210);
  if(brk.type==='X'){
    this.audio.boom();
    this.shake=Math.min(10,this.shake+6);
    var saved=this.grid;
    var list=[];
    for(var dr=-1;dr<=1;dr++){
      for(var dc=-1;dc<=1;dc++){
        if(dr===0&&dc===0)continue;
        var rr_=brk.r+dr,cc=brk.c+dc;
        if(rr_<0||rr_>=saved.length||cc<0||cc>=COLS)continue;
        var nb=saved[rr_][cc];
        if(nb&&nb.alive)list.push(nb);
      }
    }
    for(var i=0;i<list.length;i++){
      if(list[i].type==='gold'){this.damageBrick(list[i],true);continue;}
      this.destroyBrick(list[i]);
    }
  }else{
    this.audio.brick(this.combo);
    this.shake=Math.min(6,this.shake+1.1);
  }
  this.maybeDrop(brk,cx,cy);
  if(this.remaining<=0){this.beginClear();}
};

NeoGame.prototype.maybeDrop=function(brk,x,y){
  if(brk.type==='gold')return;
  var p=brk.drop?1:(brk.type==='S'?0.42:0.21);
  if(Math.random()>=p)return;
  this.spawnPU(this.rollKind(),x,y);
};
NeoGame.prototype.rollKind=function(){
  var roll=Math.random()*POOL_TOTAL;
  for(var i=0;i<POOL.length;i++){
    roll-=POOL[i][1];
    if(roll<=0)return POOL[i][0];
  }
  return 'EXPAND';
};
NeoGame.prototype.spawnPU=function(kind,x,y){
  this.pus.push({kind:kind,x:x,y:y,bob:rnd(0,6)});
};

NeoGame.prototype.applyPower=function(kind){
  var e=this.eff;
  var good=!BAD[kind];
  if(good)this.audio.powGood();else this.audio.powBad();
  switch(kind){
    case 'EXPAND':e.expand=20;e.shrink=0;break;
    case 'SHRINK':e.shrink=14;e.expand=0;break;
    case 'LASER':e.laser=12;break;
    case 'CATCH':e.catch=15;break;
    case 'SLOW':e.slow=10;e.fast=0;break;
    case 'FAST':e.fast=8;e.slow=0;break;
    case 'FIRE':
      e.fire=9;
      for(var i=0;i<this.balls.length;i++)this.balls[i].fire=true;
      break;
    case 'LIFE':
      this.lives=Math.min(this.lives+1,6);
      this.audio.life();
      if(this.hooks.toast)this.hooks.toast('+1 VIE ❤');
      break;
    case 'MULTI':{
      var src=null;
      for(i=0;i<this.balls.length;i++){if(!this.balls[i].stuck){src=this.balls[i];break;}}
      if(!src&&this.balls.length){src=this.balls[0];src.stuck=false;src.vx=0;src.vy=-src.speed;}
      if(src){
        var base=Math.atan2(src.vy,src.vx);
        if(base===0){base=-Math.PI/2;}
        var list=[base-0.42,base+0.42];
        for(var j=0;j<list.length;j++){
          if(this.balls.length>=6)break;
          var nb=this.makeBall(false);
          nb.x=src.x;nb.y=src.y;
          nb.vx=Math.cos(list[j])*src.speed;nb.vy=Math.sin(list[j])*src.speed;
          nb.fire=src.fire;
          this.balls.push(nb);
        }
      }
      break;
    }
  }
  var info=KINDS[kind];
  if(info){this.addPopup(info.txt,this.paddle.x,this.paddle.y-34,info.c);}
};

NeoGame.prototype.updatePowerups=function(dt){
  var p=this.paddle;
  for(var i=this.pus.length-1;i>=0;i--){
    var u=this.pus[i];
    u.y+=135*dt;
    if(u.y>H+20){this.pus.splice(i,1);continue;}
    if(u.y>p.y-p.h/2-10&&u.y<p.y+p.h/2+10&&Math.abs(u.x-p.x)<p.w/2+16){
      this.applyPower(u.kind);
      this.addBurst(u.x,u.y,KINDS[u.kind].c,10,160);
      this.pus.splice(i,1);
    }
  }
};

NeoGame.prototype.fireLaser=function(){
  if(this.eff.laser<=0||this.lcd>0)return;
  this.lcd=0.27;
  var p=this.paddle;
  this.lasers.push({x:p.x-p.w/2+7,y:p.y-8},{x:p.x+p.w/2-7,y:p.y-8});
  this.audio.laser();
};

NeoGame.prototype.updateLasers=function(dt){
  this.lcd-=dt;
  for(var i=this.lasers.length-1;i>=0;i--){
    var l=this.lasers[i];
    l.y-=720*dt;
    if(l.y<TOP-10){this.lasers.splice(i,1);continue;}
    var brk=this.brickAtPoint(l.x,l.y);
    if(brk){
      if(brk.type==='gold'){this.audio.gold();}
      else{this.damageBrick(brk,false);}
      this.lasers.splice(i,1);
    }
  }
};

NeoGame.prototype.clearEffects=function(){
  this.eff=this.blankEff();
  this.pus=[];this.lasers=[];
  for(var i=0;i<this.balls.length;i++)this.balls[i].fire=false;
};

NeoGame.prototype.loseLife=function(){
  this.audio.lose();
  this.lives--;
  this.clearEffects();
  this.combo=0;
  this.shake=8;
  this.addBurst(this.lastPos.x,Math.min(this.lastPos.y,H-20),'#f87171',26,320);
  if(this.lives<0){
    this.gameOverNow();
  }else{
    this.state='dying';
    this.stateT=0.95;
  }
};

NeoGame.prototype.beginClear=function(){
  if(this.state!=='playing')return;
  this.state='cleared';
  this.stateT=1.6;
  this.pus=[];this.lasers=[];
  this.addScore(500);
  this.addPopup('NIVEAU TERMINÉ +500',W/2,H/2,'#7dd3fc');
  this.audio.fanfare();
};

NeoGame.prototype.nextLevel=function(){
  var next=this.levelIdx+1;
  if(next>=window.LEVELS.length){this.winNow();return;}
  this.loadLevel(next);
  this.resetBall(true);
  this.state='playing';
  this.audio.startMusic(next);
  if(this.hooks.level){this.hooks.level(window.LEVELS[next].name,next);}
};

NeoGame.prototype.winNow=function(){
  this.state='won';
  this.balls=[];this.pus=[];this.lasers=[];
  this.audio.stopMusic();
  this.audio.victory();
  if(this.score>this.hi){this.hi=this.score;try{localStorage.setItem('neonoid_hi',String(this.hi));}catch(e){}}
  if(this.hooks.end){this.hooks.end({win:true,score:this.score,level:this.levelIdx});}
};

NeoGame.prototype.gameOverNow=function(){
  this.state='over';
  this.balls=[];this.pus=[];this.lasers=[];
  this.audio.stopMusic();
  this.audio.over();
  if(this.score>this.hi){this.hi=this.score;try{localStorage.setItem('neonoid_hi',String(this.hi));}catch(e){}}
  if(this.hooks.end){this.hooks.end({win:false,score:this.score,level:this.levelIdx+1});}
};

NeoGame.prototype.addScore=function(n){
  this.score+=n;
  if(this.score>this.hi){
    this.hi=this.score;
    try{localStorage.setItem('neonoid_hi',String(this.hi));}catch(e){}
  }
  if(this.score>=this.nextLifeAt){
    this.nextLifeAt+=10000;
    if(this.lives<6){
      this.lives++;
      this.audio.life();
      this.addPopup('+1 VIE !',this.paddle.x,this.paddle.y-52,'#f472b6');
      if(this.hooks.toast)this.hooks.toast('+1 VIE ❤ (10 000 pts)');
    }
  }
  if(this.hooks.score){this.hooks.score(this.score);}
};

NeoGame.prototype.addBurst=function(x,y,c,n,sp){
  for(var i=0;i<n;i++){
    var a=rnd(0,Math.PI*2),v=rnd(sp*0.25,sp);
    this.parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-rnd(0,60),g:420,life:rnd(0.35,0.85),max:0.85,s:rnd(2,5),c:c});
  }
};
NeoGame.prototype.addSpark=function(x,y,c,n){
  for(var i=0;i<n;i++){
    var a=rnd(0,Math.PI*2),v=rnd(40,140);
    this.parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:200,life:rnd(0.15,0.35),max:0.35,s:rnd(1,2.5),c:c});
  }
};
NeoGame.prototype.addPopup=function(txt,x,y,c){
  this.pops.push({txt:txt,x:x,y:y,c:c,life:1});
};

NeoGame.prototype.update=function(dt){
  this.t+=dt;
  this.shake*=Math.pow(0.02,dt);
  for(var i=0;i<this.stars.length;i++){
    var s=this.stars[i];
    s.y+=s.z*14*dt;
    if(s.y>H){s.y=-2;s.x=Math.random()*W;}
  }
  for(i=this.parts.length-1;i>=0;i--){
    var pt=this.parts[i];
    pt.life-=dt;
    if(pt.life<=0){this.parts.splice(i,1);continue;}
    pt.vy+=pt.g*dt;pt.x+=pt.vx*dt;pt.y+=pt.vy*dt;
  }
  for(i=this.pops.length-1;i>=0;i--){
    var po=this.pops[i];
    po.life-=dt*0.9;po.y-=32*dt;
    if(po.life<=0)this.pops.splice(i,1);
  }
  switch(this.state){
    case 'playing':{
      var e=this.eff;
      for(var k in e){if(e[k]>0)e[k]-=dt;}
      if(e.fire<=0){for(i=0;i<this.balls.length;i++)this.balls[i].fire=false;}
      this.movePaddle(dt);
      for(i=0;i<this.balls.length;i++){
        var b=this.balls[i];
        if(!b.stuck)this.stepBall(b,dt);
      }
      for(i=this.balls.length-1;i>=0;i--){
        if(this.balls[i].dead){this.lastPos={x:this.balls[i].x,y:this.balls[i].y};this.balls.splice(i,1);}
      }
      if(this.balls.length===0&&this.state==='playing'){this.loseLife();}
      this.updatePowerups(dt);
      this.updateLasers(dt);
      break;
    }
    case 'dying':
      this.movePaddle(dt);
      this.stateT-=dt;
      if(this.stateT<=0){
        this.resetBall(true);
        this.state='playing';
      }
      break;
    case 'cleared':
      this.movePaddle(dt);
      this.stateT-=dt;
      if(this.stateT<=0)this.nextLevel();
      break;
    case 'won':
      this.fwT-=dt;
      if(this.fwT<=0){
        this.fwT=0.4;
        var cols=['#38bdf8','#a78bfa','#f472b6','#4ade80','#fbbf24'];
        this.addBurst(rnd(80,W-80),rnd(120,460),cols[Math.floor(Math.random()*cols.length)],26,330);
      }
      break;
  }
};

NeoGame.prototype.loop=function(ts){
  var dt=Math.min(0.033,(ts-(this._lt||ts))/1000);
  this._lt=ts;
  if(!this.paused)this.update(dt);
  this.draw();
  requestAnimationFrame(this.loop.bind(this));
};

NeoGame.prototype.sprite=function(brk){
  var key=brk.key+'|'+brk.variant+'|'+brk.color;
  var img=this.sprites.get(key);
  if(img)return img;
  var pad=5;
  img=document.createElement('canvas');
  img.width=BW+pad*2;img.height=BH+pad*2;
  var c=img.getContext('2d');
  var col=brk.color;
  if(brk.type==='S'){
    var g1=c.createLinearGradient(0,pad,0,pad+BH);
    g1.addColorStop(0,'#f1f5f9');g1.addColorStop(0.5,'#94a3b8');g1.addColorStop(1,'#cbd5e1');
    col=g1;
  }else if(brk.type==='gold'){
    var g2=c.createLinearGradient(0,pad,0,pad+BH);
    g2.addColorStop(0,'#fef08a');g2.addColorStop(0.5,'#f59e0b');g2.addColorStop(1,'#fbbf24');
    col=g2;
  }
  c.shadowColor=typeof col==='string'?col:'#fbbf24';
  c.shadowBlur=8;
  c.fillStyle=col;
  rr(c,pad,pad,BW,BH,4);c.fill();
  c.shadowBlur=0;
  var gl=c.createLinearGradient(0,pad,0,pad+BH*0.55);
  gl.addColorStop(0,'rgba(255,255,255,.4)');gl.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=gl;
  rr(c,pad+1,pad+1,BW-2,BH*0.55,3);c.fill();
  c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;
  rr(c,pad+0.5,pad+0.5,BW-1,BH-1,4);c.stroke();
  if(brk.type==='gold'){
    c.fillStyle='rgba(255,255,255,.85)';
    c.beginPath();c.arc(pad+BW*0.72,pad+BH*0.3,2,0,7);c.fill();
  }
  if(brk.variant==='damaged'){
    c.strokeStyle='rgba(15,23,42,.65)';c.lineWidth=1.4;
    c.beginPath();
    c.moveTo(pad+BW*0.3,pad+2);c.lineTo(pad+BW*0.42,pad+BH*0.45);c.lineTo(pad+BW*0.3,pad+BH-2);
    c.moveTo(pad+BW*0.66,pad+2);c.lineTo(pad+BW*0.58,pad+BH*0.55);c.lineTo(pad+BW*0.7,pad+BH-2);
    c.stroke();
  }
  if(brk.type==='X'){
    c.fillStyle='rgba(69,10,10,.9)';
    c.beginPath();
    c.moveTo(pad+BW/2,pad+4);c.lineTo(pad+BW-6,pad+BH-4);c.lineTo(pad+6,pad+BH-4);
    c.closePath();c.fill();
    c.fillStyle='#fecaca';
    c.fillRect(pad+BW/2-1,pad+8,2,6);
    c.fillRect(pad+BW/2-1,pad+16,2,2);
  }
  this.sprites.set(key,img);
  return img;
};

NeoGame.prototype.draw=function(){
  var ctx=this.ctx;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=this.bgGrad||'#04060d';
  ctx.fillRect(0,0,W,H);
  for(var i=0;i<this.stars.length;i++){
    var s=this.stars[i];
    ctx.globalAlpha=0.25+0.6*Math.abs(Math.sin(this.t*s.tw+s.ph));
    ctx.fillStyle='#dbeafe';
    var sz=s.z>0.75?2:1;
    ctx.fillRect(s.x,s.y,sz,sz);
  }
  ctx.globalAlpha=1;
  ctx.save();
  if(this.shake>0.3){
    ctx.translate(rnd(-this.shake,this.shake),rnd(-this.shake,this.shake));
  }
  ctx.strokeStyle=this.accent;
  ctx.shadowColor=this.accent;
  ctx.shadowBlur=16;
  ctx.lineWidth=5;
  ctx.beginPath();
  ctx.moveTo(LEFT,H);ctx.lineTo(LEFT,TOP);ctx.lineTo(RIGHT,TOP);ctx.lineTo(RIGHT,H);
  ctx.stroke();
  ctx.shadowBlur=0;
  for(i=0;i<this.bricks.length;i++){
    var brk=this.bricks[i];
    if(!brk.alive)continue;
    ctx.drawImage(this.sprite(brk),brk.x-5,brk.y-5);
    if(brk.type==='gold'){
      var sh=((this.t*60)%(BW+30))-15;
      ctx.globalAlpha=0.35;
      ctx.fillStyle='#fffbeb';
      ctx.fillRect(brk.x+sh,brk.y+2,6,BH-4);
      ctx.globalAlpha=1;
    }
  }
  for(i=0;i<this.pus.length;i++){
    var u=this.pus[i];
    var info=KINDS[u.kind];
    ctx.save();
    ctx.translate(u.x,u.y+Math.sin(this.t*3+u.bob)*2.5);
    ctx.rotate(Math.sin(this.t*2.4+u.bob)*0.16);
    ctx.shadowColor=info.c;ctx.shadowBlur=14;
    ctx.fillStyle=info.c;
    rr(ctx,-18,-10,36,20,10);ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,.32)';
    rr(ctx,-16,-9,32,9,8);ctx.fill();
    ctx.fillStyle='#0b1226';
    ctx.font='900 13px "Courier New",monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(info.l,0,1);
    ctx.restore();
  }
  ctx.fillStyle='#fb7185';
  ctx.shadowColor='#fb7185';ctx.shadowBlur=10;
  for(i=0;i<this.lasers.length;i++){
    var l=this.lasers[i];
    ctx.fillRect(l.x-1.5,l.y-14,3,14);
  }
  ctx.shadowBlur=0;
  this.drawPaddle(ctx);
  for(i=0;i<this.balls.length;i++){
    var b=this.balls[i];
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    for(var ti=0;ti<b.trail.length;ti++){
      var tp=b.trail[ti];
      ctx.globalAlpha=(ti/b.trail.length)*0.3;
      ctx.fillStyle=b.fire?'#fb923c':'#93c5fd';
      ctx.beginPath();ctx.arc(tp.x,tp.y,b.r*(ti/b.trail.length),0,7);ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.shadowColor=b.fire?'#fb923c':'#dbeafe';
    ctx.shadowBlur=18;
    ctx.fillStyle=b.fire?'#fdba74':'#eff6ff';
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='#ffffff';
    ctx.beginPath();ctx.arc(b.x-2,b.y-2,b.r*0.45,0,7);ctx.fill();
    ctx.restore();
  }
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<this.parts.length;i++){
    var pt=this.parts[i];
    ctx.globalAlpha=Math.max(0,pt.life/pt.max);
    ctx.fillStyle=pt.c;
    ctx.fillRect(pt.x-pt.s/2,pt.y-pt.s/2,pt.s,pt.s);
  }
  ctx.restore();
  ctx.font='800 15px "Courier New",monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(i=0;i<this.pops.length;i++){
    var po=this.pops[i];
    ctx.globalAlpha=Math.max(0,po.life);
    ctx.fillStyle=po.c;
    ctx.fillText(po.txt,po.x,po.y);
  }
  ctx.globalAlpha=1;
  ctx.restore();
  this.drawHUD(ctx);
  if(this.state==='dying'){
    ctx.fillStyle='rgba(248,113,113,'+(this.stateT*0.25)+')';
    ctx.fillRect(0,0,W,H);
  }
};

NeoGame.prototype.drawPaddle=function(ctx){
  var p=this.paddle;
  ctx.save();
  ctx.translate(p.x,p.y);
  ctx.scale(1+p.pulse*0.12,1-p.pulse*0.25);
  var core=this.eff.laser>0?'#fb7185':(this.eff.catch>0?'#4ade80':(this.eff.expand>0?'#22d3ee':(this.eff.shrink>0?'#ef4444':this.accent)));
  ctx.shadowColor=core;ctx.shadowBlur=14;
  var g=ctx.createLinearGradient(0,-p.h/2,0,p.h/2);
  g.addColorStop(0,'#f8fafc');g.addColorStop(0.5,'#94a3b8');g.addColorStop(1,'#e2e8f0');
  ctx.fillStyle=g;
  rr(ctx,-p.w/2,-p.h/2,p.w,p.h,p.h/2);ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle=core;
  rr(ctx,-p.w/2+5,-2.5,p.w-10,5,2.5);ctx.fill();
  if(this.eff.laser>0){
    ctx.fillStyle='#f87171';
    ctx.shadowColor='#f87171';ctx.shadowBlur=8;
    ctx.fillRect(-p.w/2+4,-p.h/2-7,6,8);
    ctx.fillRect(p.w/2-10,-p.h/2-7,6,8);
    ctx.shadowBlur=0;
  }
  ctx.restore();
};

NeoGame.prototype.drawHUD=function(ctx){
  var pad6=function(n){return String(n).padStart(6,'0');};
  ctx.textBaseline='alphabetic';
  ctx.font='700 17px "Courier New",monospace';
  ctx.textAlign='left';
  ctx.fillStyle='#e2e8f0';
  ctx.shadowColor='#38bdf8';ctx.shadowBlur=8;
  ctx.fillText('SCORE '+pad6(this.score),LEFT+8,36);
  ctx.shadowBlur=0;
  ctx.textAlign='center';
  ctx.fillStyle='#94a3b8';
  ctx.fillText('HI '+pad6(this.hi),W/2,36);
  ctx.textAlign='right';
  ctx.fillStyle='#a5b4fc';
  ctx.fillText((this.levelIdx+1)+'/'+window.LEVELS.length,RIGHT-8,36);
  for(var i=0;i<Math.max(0,this.lives);i++){
    ctx.fillStyle='#4ade80';
    ctx.shadowColor='#4ade80';ctx.shadowBlur=6;
    rr(ctx,RIGHT-24-i*24,44,16,5,2.5);ctx.fill();
    ctx.shadowBlur=0;
  }
  if(this.state==='playing'&&this.hasStuck()){
    ctx.textAlign='center';
    ctx.font='700 15px "Segoe UI",sans-serif';
    ctx.globalAlpha=0.6+0.4*Math.sin(this.t*4);
    ctx.fillStyle='#bae6fd';
    ctx.fillText('ESPACE OU TAP POUR LANCER',W/2,H-110);
    ctx.globalAlpha=1;
  }
};
NeoGame.prototype.hasStuck=function(){
  for(var i=0;i<this.balls.length;i++){if(this.balls[i].stuck)return true;}
  return false;
};

NeoGame.prototype.debugClear=function(){
  var list=[];
  for(var i=0;i<this.bricks.length;i++){
    var b=this.bricks[i];
    if(b.alive&&b.type!=='gold')list.push(b);
  }
  for(i=0;i<list.length;i++){list[i].hp=1;this.destroyBrick(list[i]);}
};
NeoGame.prototype.setScore=function(n){
  this.score=n;
  if(n>this.hi){this.hi=n;try{localStorage.setItem('neonoid_hi',String(n));}catch(e){}}
  if(this.hooks.score)this.hooks.score(n);
};

window.NeoGame=NeoGame;
})();
