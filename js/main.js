"use strict";
(function(){
window.addEventListener('DOMContentLoaded',function(){
  var canvas=document.getElementById('game');
  var audio=new AudioFX();
  var game=new NeoGame(canvas,audio,{
    level:function(name,idx){NEOUI.banner(String(idx+1),name);},
    end:function(res){NEOUI.end(res);},
    toast:function(msg){NEOUI.toast(msg);},
    pause:function(p){NEOUI.pauseShow(p);},
    title:function(){NEOUI.show('scr-title');NEOUI.refreshBest();}
  });
  NEOUI.init(game,audio);
  window.NEOGAME=game;
  window.NEOAUDIO=audio;

  var stage=document.getElementById('stage');

  function stageX(clientX){
    var r=canvas.getBoundingClientRect();
    return (clientX-r.left)*(600/r.width);
  }
  stage.addEventListener('pointermove',function(e){
    if(game.state!=='playing'||game.paused)return;
    game.input.targetX=stageX(e.clientX);
  },{passive:true});
  stage.addEventListener('pointerdown',function(e){
    audio.ensure();
    if(game.state!=='playing'||game.paused)return;
    game.input.targetX=stageX(e.clientX);
    game.launchAction();
    e.preventDefault();
  },{passive:false});
  stage.addEventListener('contextmenu',function(e){e.preventDefault();});

  var KEYS={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
  window.addEventListener('keydown',function(e){
    audio.ensure();
    if(KEYS[e.code]){game.input[KEYS[e.code]]=true;e.preventDefault();return;}
    switch(e.code){
      case 'Space':
        e.preventDefault();
        if(game.state==='playing'&&!game.paused)game.launchAction();
        break;
      case 'Enter':
        if(game.state==='title'&&!NEOUI.$('scr-title').classList.contains('hidden')){
          game.startGame();NEOUI.show(null);
        }
        break;
      case 'KeyP':case 'Escape':
        game.togglePause();
        break;
      case 'KeyM':
        audio.setMuted(!audio.muted);NEOUI.syncSound();
        break;
    }
  });
  window.addEventListener('keyup',function(e){
    if(KEYS[e.code])game.input[KEYS[e.code]]=false;
  });

  function autoPause(){if(game.state==='playing'&&!game.paused)game.togglePause(true);}
  document.addEventListener('visibilitychange',function(){if(document.hidden)autoPause();});
  window.addEventListener('blur',autoPause);
});
})();
