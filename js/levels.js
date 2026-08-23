"use strict";
(function(){
window.LEVELS=[
  {name:"Premières lumières",map:[
    "rrrrrrrrrrrrrr",
    "oooooooooooooo",
    "yyyyyyyyyyyyyy",
    "gggggggggggggg",
    "bbbbbbbbbbbbbb"
  ]},
  {name:"Le damier",map:[
    "r.r.r.r.r.r.r.",
    ".o.o.o.o.o.o.o",
    "y.y.y.y.y.y.y.",
    ".g.g.g.g.g.g.g",
    "b.b.b.b.b.b.b.",
    ".v.v.v.v.v.v.v"
  ]},
  {name:"La pyramide",map:[
    "......rr......",
    ".....oooo.....",
    "....yyyyyy....",
    "...gggggggg...",
    "..bbbbbbbbbb..",
    ".vvvvvvvvvvvv.",
    "cccccccccccccc"
  ]},
  {name:"Le donjon",map:[
    "GGGG......GGGG",
    "G..G.r..r.G..G",
    "G..G.rrrr.G..G",
    "GGGG......GGGG",
    "....SSSSSS....",
    "....S....S....",
    "....SD..DS....",
    "....SSSSSS...."
  ]},
  {name:"L'envahisseur",map:[
    "....g.....g...",
    ".....g...g....",
    "..ggggggggg...",
    "...gg.ggg.gg..",
    "..ggggggggggg.",
    "..g.ggggggg.g.",
    "..g.g.....g.g.",
    ".....gg.gg...."
  ]},
  {name:"La galaxie",map:[
    "......rr......",
    "....rr..rr....",
    "..rr..SS..rr..",
    ".rr..S..S..rr.",
    "rr..S.XX.S..rr",
    ".rr..S..S..rr.",
    "..rr..SS..rr..",
    "....rr..rr....",
    "......rr......"
  ]},
  {name:"Le cœur",map:[
    "..rrr....rrr..",
    ".rrrrr..rrrrr.",
    "rrrrrrrrrrrrrr",
    ".rrrrrrDDrrrr.",
    "..rrrrrrrrrr..",
    "...rrrrrrrr...",
    "....rrrrrr....",
    "......rr......"
  ]},
  {name:"Les escaliers",map:[
    "SS............",
    "..SS..........",
    "....SS........",
    "......SS......",
    "........SS....",
    "..........SS..",
    "............SS",
    "D.D.D.D.D.D.D."
  ]},
  {name:"La cible",map:[
    "bbbbbbbbbbbbbb",
    "b............b",
    "b.vvvvvvvvvv.b",
    "b.v........v.b",
    "b.v.yyyyyy.v.b",
    "b.v.yGGGGy.v.b",
    "b.v.yyyyyy.v.b",
    "b.v........v.b",
    "b.vvvvvvvvvv.b",
    "b............b",
    "bbbbbbbbbbbbbb"
  ]},
  {name:"Le noyau final",map:[
    "..SSSSSSSSSS..",
    ".SrrXXrrXXrrS.",
    ".SooyyyyyyooS.",
    ".SggbggbbggS..",
    "SSDDSSDDSSDDSS",
    "..gggggggggg..",
    "...rrXXrrXX...",
    "....SSSSSS....",
    "....gXXggXXg.."
  ]},
  /* ═══════════════════════════════════════════════
     10 nouveaux niveaux — fun & conviviaux
     ═══════════════════════════════════════════════ */
  {name:"L'arc-en-ciel",map:[
    "r..o..y..g..b.",
    ".r..o..y..g..b",
    "v..c..r..o..y.",
    ".v..c..r..o..y",
    "g..b..v..c..r.",
    ".g..b..v..c..r"
  ]},
  {name:"Le pacman",map:[
    "yyyyyyyyyyyyyy",
    "y............y",
    "y.ooo....ooo.y",
    "y.o..........y",
    "y...oooooo...y",
    "y...o....o...y",
    "y...o.SSSo...y",
    "y...oooooo...y",
    "y............y",
    "yyyyyyyyyyyyyy"
  ]},
  {name:"Le flipper",map:[
    "G............G",
    ".S..........S.",
    "..S........S..",
    "...S......S...",
    "....r....r....",
    "....S....S....",
    "...S......S...",
    "..S........S..",
    ".S..........S.",
    "G...DDDDDD..G."
  ]},
  {name:"Le labyrinthe",map:[
    "GGGGGGGGGGGGGG",
    "G..r..g..b..G.",
    "G.Gr.Gg.Gb.GG.",
    "G.G.GG.GG.GGG.",
    "G.G..G..G..G..",
    "G.SS.GG.GG.G..",
    "G..G..X..G..G.",
    "G.GG.GG.GG.G..",
    "G..D..G..D..G.",
    "GGGGGGGGGGGGGG"
  ]},
  {name:"La montagne",map:[
    "......yy......",
    ".....oyyo.....",
    "....oooyoo....",
    "...rooooorr...",
    "..rroooo rr...",
    "..g rooooor...",
    ".gg rrrooor...",
    ".ggg rrooorr..",
    "gggg rrrroorr.",
    "bbbbbGGGbbbbbb"
  ]},
  {name:"Le smiley",map:[
    "....yyyyyy....",
    "..yy......yy..",
    ".y..........y.",
    "y..rr....rr..y",
    "y..rr....rr..y",
    "y............y",
    "y..g......g..y",
    "y...gggggg...y",
    ".y..........y.",
    "..yy......yy..",
    "....yyyyyy...."
  ]},
  {name:"La croix",map:[
    "......gg......",
    "......gg......",
    "......gg......",
    "rrrrrrggrrrrrr",
    ".rrrrrggrrrrr.",
    "..rrrrggrrrr..",
    "......SS......",
    "..bbbbssbbbb..",
    ".bbbbbssbbbbb.",
    "......oo......",
    "......oo......"
  ]},
  {name:"Le circuit",map:[
    "SS..........SS",
    "S..rrrrrrrr..S",
    "S.r........r.S",
    "S.r.SSSSSS.r.S",
    "S.r.S....S.r.S",
    "S.r.S.XX.S.r.S",
    "S.r.S....S.r.S",
    "S.r.SSSSSS.r.S",
    "S.r........r.S",
    "S..DDDDDDDD..S",
    "SS..........SS"
  ]},
  {name:"Les bulles",map:[
    "...oo....bb...",
    ".ooooo..bbbbb.",
    "..ooo....bb...",
    "....g....y....",
    "...ggg..yyy...",
    "..gggg..yyyy..",
    "...ggg..yyy...",
    "....v....r....",
    "..vvvv..rrrr..",
    "...vv....rr...",
    ".....c........",
    "....ccc......."
  ]},
  {name:"Le damier géant",map:[
    "rrrr....bbbb..",
    "rrrr....bbbb..",
    "....yyyy....vv",
    "....yyyy....vv",
    "gggg....cccc..",
    "gggg....cccc..",
    "....rrrr....bb",
    "....rrrr....bb"
  ]},
  {name:"Le cœur géant",map:[
    "..rrr....rrr..",
    ".rrrrr..rrrrr.",
    "rrrSSrrrrSSrrr",
    "rrSDDDSrrSDDrr",
    "rrSDDDDSrrSDDr",
    ".rrSDDDSrrrrr.",
    "..rrSSSSSrrr..",
    "...rrrSSrrr...",
    "....rrrrrr....",
    "......rr......"
  ]}
];

/* ─────────────────────────────────────────────────────────────
   Feature #2 : Mode infini — génération aléatoire (n >= 10)
   window.generateLevel(n) retourne {name, map:[…]} avec
   14 colonnes et 5-9 rangées. La difficulté augmente avec n :
   plus de briques argentées (S) et explosives (X), moins de
   briques couleur faciles.
   ───────────────────────────────────────────────────────────── */
var GCOLS=14;
var GCOLORS=['r','o','y','g','b','v','c'];
function gpick(a){return a[Math.floor(Math.random()*a.length)];}
function grnd(a,b){return a+Math.floor(Math.random()*(b-a+1));}

/* Choisit le type d'une brique selon la difficulté d∈[0,1].
   d augmente avec n → plus de S/X/G/D, moins de couleur facile. */
function gcell(d){
  var r=Math.random();
  if(r<0.03+0.05*d) return 'X';          // explosive
  if(r<0.10+0.20*d) return 'S';          // argentée (multi-coups)
  if(r<0.13+0.21*d) return 'G';          // dorée (indestructible)
  if(r<0.16+0.22*d) return 'D';          // drop garanti
  return gpick(GCOLORS);                 // couleur classique
}
function gpad(row){while(row.length<GCOLS)row+='.';return row.slice(0,GCOLS);}

function genDamier(rows,d){
  var m=[];
  for(var r=0;r<rows;r++){
    var s='';
    for(var c=0;c<GCOLS;c++){s+=((r+c)%2===0)?gcell(d):'.';}
    m.push(gpad(s));
  }
  return m;
}
function genPyramide(rows,d){
  var m=[],mid=GCOLS/2;
  for(var r=0;r<rows;r++){
    var half=Math.min(GCOLS/2,Math.floor((r+1)*GCOLS/(2*rows))+1);
    var s='';
    for(var c=0;c<GCOLS;c++){s+=(c>=mid-half&&c<mid+half)?gcell(d):'.';}
    m.push(gpad(s));
  }
  return m;
}
function genVagues(rows,d){
  var m=[],phase=Math.random()*6,k=2+Math.random()*2;
  for(var r=0;r<rows;r++){
    var s='';
    for(var c=0;c<GCOLS;c++){
      var v=Math.sin((c+phase+r*0.7)/k);
      s+=(v>0.1)?gcell(d):'.';
    }
    m.push(gpad(s));
  }
  return m;
}
function genColonnes(rows,d){
  var m=[],ncol=grnd(6,10),cols={};
  for(var i=0;i<ncol;i++){cols[grnd(0,GCOLS-1)]=true;}
  for(var r=0;r<rows;r++){
    var s='';
    for(var c=0;c<GCOLS;c++){s+=(cols[c]&&Math.random()>0.15)?gcell(d):'.';}
    m.push(gpad(s));
  }
  return m;
}
function genSpiral(rows,d){
  var m=[],cx=GCOLS/2-0.5,cy=rows/2-0.5,maxR=Math.hypot(GCOLS/2,rows/2);
  for(var r=0;r<rows;r++){
    var s='';
    for(var c=0;c<GCOLS;c++){
      var dx=c-cx,dy=r-cy,dist=Math.hypot(dx,dy);
      var sv=Math.sin(Math.atan2(dy,dx)*2+dist*1.2);
      s+=(sv>0.3&&dist<maxR*0.95)?gcell(d):'.';
    }
    m.push(gpad(s));
  }
  return m;
}
function genBlocs(rows,d){
  var m=[];
  for(var r=0;r<rows;r++){var s='';for(var c=0;c<GCOLS;c++)s+='.';m.push(s);}
  var nblocks=grnd(4,8);
  for(var b=0;b<nblocks;b++){
    var bw=grnd(2,4),bh=grnd(1,2),bx=grnd(0,GCOLS-bw),by=grnd(0,rows-bh);
    for(var r=by;r<by+bh;r++){
      for(var c=bx;c<bx+bw;c++){
        m[r]=m[r].substring(0,c)+gcell(d)+m[r].substring(c+1);
      }
    }
  }
  return m;
}

window.generateLevel=function(n){
  var patterns=['damier','pyramide','vagues','colonnes','spiral','blocs'];
  var pat=gpick(patterns);
  var rows=grnd(5,9);
  var d=Math.min(1,(n-10)/20);           /* difficulté 0→1 */
  var map;
  if(pat==='damier')map=genDamier(rows,d);
  else if(pat==='pyramide')map=genPyramide(rows,d);
  else if(pat==='vagues')map=genVagues(rows,d);
  else if(pat==='colonnes')map=genColonnes(rows,d);
  else if(pat==='spiral')map=genSpiral(rows,d);
  else map=genBlocs(rows,d);
  /* Sécurité : si la map est vide ou sans brique destructible,
     on régénère en damier (toujours au moins quelques briques). */
  var hasBrick=false;
  for(var r=0;r<map.length;r++){for(var c=0;c<GCOLS;c++){
    if(map[r][c]!=='.'){hasBrick=true;break;}}
    if(hasBrick)break;
  }
  if(!hasBrick)map=genDamier(rows,d);
  var names={
    damier:'Damier néon',pyramide:'Pyramide infinity',vagues:'Vagues cosmiques',
    colonnes:'Colonnes laser',spiral:'Spirale quantique',blocs:'Champ de blocs'
  };
  return {name:names[pat]+' '+n,map:map};
};
})();
