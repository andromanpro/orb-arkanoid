'use strict';
// ============================================================
// === ORB ARKANOID v0.1.0 — Phase 1 =========================
// ============================================================

var CFG = {
  MAX_LIVES:5, INIT_LIVES:3, BALL_RADIUS:8,
  BALL_SPEED_NORMAL:340, BALL_SPEED_EASY:260, BALL_SPEED_HARD:420,
  PADDLE_W_NORMAL:104, PADDLE_H:14, PADDLE_FRICTION:0.22,
  BLOCK_COLS:13, BLOCK_ROWS_MAX:10, BLOCK_PAD:4, BLOCK_CORNER:5,
  BLOCK_TOP_OFFSET:72, BLOCK_AREA_H_FRAC:0.48, PADDLE_Y_FRAC:0.87,
  MAX_PARTICLES:800, COMBO_WINDOW:1500, POWERUP_FALL_SPEED:90,
  STORAGE_KEY:'orb-arkanoid-v1', STORAGE_LB_KEY:'orb-arkanoid-lb-v1',
  LASER_SPEED:600, VERSION:'0.1.0'
};

var DIFFICULTY = {
  easy:  {speed:0.76, paddle:1.30, score:0.75},
  normal:{speed:1.00, paddle:1.00, score:1.00},
  hard:  {speed:1.22, paddle:0.75, score:1.50}
};

var BLOCK_DEFS = {
  'F':{hp:1,pts:25, color:'#ff4400',glow:'rgba(255,80,0,0.7)',  name:'Fire',   type:'fire'},
  'I':{hp:1,pts:10, color:'#66ccff',glow:'rgba(80,160,255,0.6)',name:'Ice',    type:'ice'},
  'W':{hp:1,pts:15, color:'#2288ff',glow:'rgba(30,100,255,0.5)',name:'Water',  type:'water'},
  'E':{hp:2,pts:20, color:'#886633',glow:'rgba(140,90,30,0.6)', name:'Earth',  type:'earth'},
  'L':{hp:3,pts:50, color:'#ff2200',glow:'rgba(255,0,0,0.8)',   name:'Lava',   type:'lava'},
  'S':{hp:999,pts:0,color:'#778899',glow:'rgba(120,140,160,0.4)',name:'Steel', type:'steel'},
  'G':{hp:1,pts:100,color:'#ffcc00',glow:'rgba(255,200,0,0.8)', name:'Gold',   type:'gold'},
  'T':{hp:1,pts:30, color:'#ff6600',glow:'rgba(255,100,0,0.7)', name:'TNT',    type:'tnt'},
  'R':{hp:1,pts:40, color:'#aa44ff',glow:'rgba(180,80,255,0.6)',name:'Rainbow',type:'rainbow'}
};


var LEVELS = [
  {name:'Ignition',     music:'inferno',bg:'fire',  grid:['.....FFF.....','....FFFFF....','...FFFFFFF...','..FFFFFFFFF..','..FFFFFFFFF..','...FFFFFFF...']},
  {name:'Frost Bite',   music:'frost',  bg:'ice',   grid:['IIIIIIIIIIIII','I...........I','I.EEEEEEEEE.I','I.E.......E.I','I.EEEEEEEEE.I','IIIIIIIIIIIII']},
  {name:'Fortress Wall',music:'war',    bg:'dark',  grid:['SS.SSSSSSS.SS','S..SSSSSSS..S','...FFFFFFF...','FFFFFFFFFFF..','FFFFFFFFFFF..','FFFFFFFFFFF..']},
  {name:'Gold Rush',    music:'arcade', bg:'gold',  grid:['....GGGGG....','...GGGGGGG...','..GGGGGGGGG..','..GRGRGRGR...','...RRRRRRR...','....RRRRR....']},
  {name:'TNT Minefield',music:'war',    bg:'fire',  grid:['EEEEEEEEEEEEE','E.T.E.T.E.T.E','EEE.EEE.EEE.E','E.T.E.T.E.T.E','EEEEEEEEEEEEE','E...........E']},
  {name:'Ice Palace',   music:'frost',  bg:'ice',   grid:['IIIIIIIIIIIII','IW.IIIIIII.WI','I...........I','I.IIIIIIIII.I','IW.........WI','IIIIIIIIIIIII']},
  {name:'Lava Forge',   music:'inferno',bg:'lava',  grid:['S..LLLLLLL..S','S.L.LLLLL.L.S','SLL.LLLLL.LLS','SLLL.LLL.LLLS','SLLLL.L.LLLLS','SLLLLL.LLLLLS']},
  {name:'Checkered',    music:'arcade', bg:'dark',  grid:['FIFIFIFIIFIFI','IFIFFFIFIFICI','FIFIFIFIIFIFI','IFIFFFIFIFICI','FIFIFIFIIFIFI','IFIFFFIFIFICI']},
  {name:'The Gauntlet', music:'war',    bg:'dark',  grid:['SSSSSSSSSSSSS','S.F.F.F.F.F.S','S...........S','S.F.F.F.F.F.S','S...........S','SSSSSSSSSSSSS']},
  {name:'Rainbow Road', music:'arcade', bg:'rainbow',grid:['RRRRRRRRRRRRR','R...........R','RGRGRGRGRGRGR','R...........R','RRRRRRRRRRRRR','RGRGRGRGRGRGR']},
  {name:'Earth Quake',  music:'war',    bg:'dark',  grid:['EEEEEEEEEEEEE','E.E.E.E.E.E.E','EEEEEEEEEEEEE','L.L.L.L.L.L.L','LLLLLLLLLLLLL','L...........L']},
  {name:'Twin Fortress',music:'war',    bg:'fire',  grid:['SSSSS.F.SSSSS','S.F.S.F.S.F.S','SSSSS.F.SSSSS','F.F.F.F.F.F.F','FFFFF.F.FFFFF','SSSSS.F.SSSSS']},
  {name:'Inferno Core', music:'inferno',bg:'lava',  grid:['LLLLLLLLLLLLL','LTLLLLLLLLTLL','LLLLLLLLLLLLL','LTLLLLLLLLTLL','LLLLLLLLLLLLL','LTLLLLLLLLTLL']},
  {name:'The Labyrinth',music:'arcade', bg:'dark',  grid:['SGSGSGSGSGSGS','G.G.G.G.G.G.G','SGSGSGSGSGSGS','G.G.G.G.G.G.G','SGSGSGSGSGSGS','GGGGGGGGGGGGG']},
  {name:'Final Eruption',music:'inferno',bg:'lava', grid:['LGLTGLGTLGLTG','GLLGLLGLLGLLG','LTLLLLLLLLTLL','GLGLLGLGLGLGL','LGLTGLGTLGLTG','GGGGGGGGGGGGG']}
];


var STRINGS = {
  en:{play:'PLAY',settings:'SETTINGS',leaderboard:'LEADERBOARD',back:'BACK',resume:'RESUME',restart:'RESTART',quit:'QUIT',retry:'RETRY',next_level:'NEXT LEVEL',main_menu:'MAIN MENU',paused:'PAUSED',game_over:'GAME OVER',victory:'VICTORY!',score:'SCORE',level:'LEVEL',name:'NAME',level_short:'LVL',music:'MUSIC',sound:'SOUND',visual:'VISUAL FX',difficulty:'DIFFICULTY',language:'LANGUAGE',on:'ON',off:'OFF',easy:'EASY',normal:'NORMAL',hard:'HARD',tagline:'Break the Orbs',combo:'COMBO',press_start:'Press SPACE or tap to launch',level_clear:'LEVEL CLEAR!',all_clear:'ALL LEVELS CLEARED!',no_scores:'No scores yet. Play to get on the board!'},
  ru:{play:'\u0418\u0413\u0420\u0410\u0422\u042c',settings:'\u041d\u0410\u0421\u0422\u0420\u041e\u0419\u041a\u0418',leaderboard:'\u0420\u0415\u041a\u041e\u0420\u0414\u042b',back:'\u041d\u0410\u0417\u0410\u0414',resume:'\u041f\u0420\u041e\u0414\u041e\u041b\u0416\u0418\u0422\u042c',restart:'\u0421\u041d\u0410\u0427\u0410\u041b\u0410',quit:'\u0412\u042b\u0419\u0422\u0418',retry:'\u0415\u0429\u0401 \u0420\u0410\u0417',next_level:'\u0421\u041b\u0415\u0414\u0423\u042e\u0429\u0418\u0419',main_menu:'\u041c\u0415\u041d\u042e',paused:'\u041f\u0410\u0423\u0417\u0410',game_over:'\u0418\u0413\u0420\u0410 \u041e\u041a\u041e\u041d\u0427\u0415\u041d\u0410',victory:'\u041f\u041e\u0411\u0415\u0414\u0410!',score:'\u0421\u0427\u0401\u0422',level:'\u0423\u0420\u041e\u0412\u0415\u041d\u042c',name:'\u0418\u041c\u042f',level_short:'\u0423\u0420',music:'\u041c\u0423\u0417\u042b\u041a\u0410',sound:'\u0417\u0412\u0423\u041a\u0418',visual:'\u042d\u0424\u0424\u0415\u041a\u0422\u042b',difficulty:'\u0421\u041b\u041e\u0416\u041d\u041e\u0421\u0422\u042c',language:'\u042f\u0417\u042b\u041a',on:'\u0412\u041a\u041b',off:'\u0412\u042b\u041a\u041b',easy:'\u041b\u0415\u0413\u041a\u041e',normal:'\u041d\u041e\u0420\u041c\u0410\u041b',hard:'\u0421\u041b\u041e\u0416\u041d\u041e',tagline:'\u0420\u0430\u0437\u0431\u0438\u0432\u0430\u0439 \u043e\u0440\u0431\u044b',combo:'\u041a\u041e\u041c\u0411\u041e',press_start:'\u041f\u0440\u043e\u0431\u0435\u043b \u0438\u043b\u0438 \u0442\u0430\u043f \u0434\u043b\u044f \u0437\u0430\u043f\u0443\u0441\u043a\u0430',level_clear:'\u0423\u0420\u041e\u0412\u0415\u041d\u042c \u041f\u0420\u041e\u0419\u0414\u0415\u041d!',all_clear:'\u0412\u0421\u0415 \u0423\u0420\u041e\u0412\u041d\u0418 \u041f\u0420\u041e\u0419\u0414\u0415\u041d\u042b!',no_scores:'\u0420\u0435\u043a\u043e\u0440\u0434\u043e\u0432 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442. \u0421\u044b\u0433\u0440\u0430\u0439\u0442\u0435!'}
};

function t(key){var lang=settings?settings.language:'en';return(STRINGS[lang]&&STRINGS[lang][key])||STRINGS.en[key]||key}

function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(function(el){el.textContent=t(el.getAttribute('data-i18n'))});
  document.querySelectorAll('.toggle-btn').forEach(function(btn){btn.textContent=btn.classList.contains('active')?t('on'):t('off')});
}

var settings={language:'en',musicOn:true,sfxOn:true,visualFX:true,difficulty:'normal'};

function loadSettings(){try{var r=localStorage.getItem(CFG.STORAGE_KEY+'-settings');if(r)Object.assign(settings,JSON.parse(r))}catch(e){}}
function saveSettings(){try{localStorage.setItem(CFG.STORAGE_KEY+'-settings',JSON.stringify(settings))}catch(e){}}

function applySettingsUI(){
  var m=document.getElementById('btn-music'),s=document.getElementById('btn-sfx'),v=document.getElementById('btn-visual');
  if(m){m.classList.toggle('active',settings.musicOn);m.textContent=settings.musicOn?t('on'):t('off')}
  if(s){s.classList.toggle('active',settings.sfxOn);s.textContent=settings.sfxOn?t('on'):t('off')}
  if(v){v.classList.toggle('active',settings.visualFX);v.textContent=settings.visualFX?t('on'):t('off')}
  ['easy','normal','hard'].forEach(function(d){var e=document.getElementById('diff-'+d);if(e)e.classList.toggle('active',settings.difficulty===d)});
  ['en','ru'].forEach(function(l){var e=document.getElementById('lang-'+l);if(e)e.classList.toggle('active',settings.language===l)});
}

var gameState={running:false,paused:false,lives:CFG.INIT_LIVES,score:0,combo:0,comboTimer:0,level:0,totalScore:0,levelStartScore:0,blocks:[],balls:[],paddle:null,particles:[],powerups:[],lasers:[],activeEffects:{expand:0,shrink:0,sticky:0,laser:0,slow:0,fireball:0},shake:0,flashAlpha:0,flashColor:'#ffffff'};
var lastTime=0, animFrame=null, currentScreen='screen-start';

function showScreen(id){document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});var e=document.getElementById(id);if(e)e.classList.add('active');currentScreen=id}


function loadLeaderboard(){try{return JSON.parse(localStorage.getItem(CFG.STORAGE_LB_KEY))||[]}catch(e){return[]}}
function saveLeaderboard(lb){try{localStorage.setItem(CFG.STORAGE_LB_KEY,JSON.stringify(lb))}catch(e){}}
function addLeaderboardEntry(name,score,level){var lb=loadLeaderboard();lb.push({name:name||'ORB',score:score,level:level,date:Date.now()});lb.sort(function(a,b){return b.score-a.score});lb=lb.slice(0,10);saveLeaderboard(lb)}
function renderLeaderboard(){
  var lb=loadLeaderboard(),tbody=document.getElementById('lb-body');if(!tbody)return;
  if(lb.length===0){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text2)">'+t('no_scores')+'</td></tr>';return}
  tbody.innerHTML=lb.map(function(e,i){return'<tr><td class="lb-rank">'+(i+1)+'</td><td>'+(e.name||'ORB')+'</td><td style="color:var(--text2)">'+(e.level||1)+'</td><td class="lb-score">'+e.score.toLocaleString()+'</td></tr>'}).join('');
}

var canvas,ctx,CW=0,CH=0;
function initCanvas(){canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');resizeCanvas()}
function resizeCanvas(){CW=window.innerWidth;CH=window.innerHeight;canvas.width=CW;canvas.height=CH;if(gameState.running)recalcLayout()}

var layout={blockW:0,blockH:0,gridX:0,gridY:0,gridW:0,gridH:0,paddleY:0,cols:13};

function recalcLayout(){
  var cols=CFG.BLOCK_COLS,pad=CFG.BLOCK_PAD,totalW=CW*0.92;
  var bw=Math.floor((totalW-pad*(cols+1))/cols);
  var bh=Math.max(16,Math.floor(bw*0.46));
  var gw=bw*cols+pad*(cols+1);
  layout.blockW=bw;layout.blockH=bh;layout.gridX=Math.floor((CW-gw)/2);layout.gridY=CFG.BLOCK_TOP_OFFSET;layout.gridW=gw;layout.cols=cols;layout.paddleY=Math.floor(CH*CFG.PADDLE_Y_FRAC);
}

function parseLevel(levelDef){
  var blocks=[],grid=levelDef.grid,cols=layout.cols,pad=CFG.BLOCK_PAD;
  for(var row=0;row<grid.length;row++){var line=grid[row];for(var col=0;col<cols&&col<line.length;col++){var ch=line[col];if(ch==='.'||ch===' ')continue;var def=BLOCK_DEFS[ch];if(!def)continue;
    var bx=layout.gridX+pad+col*(layout.blockW+pad),by=layout.gridY+pad+row*(layout.blockH+pad);
    blocks.push({x:bx,y:by,w:layout.blockW,h:layout.blockH,type:ch,hp:def.hp,maxHp:def.hp,pts:def.pts,def:def,hitAnim:0,alive:true})}}
  return blocks;
}


function makeBall(x,y){return{x:x||CW/2,y:y||(layout.paddleY-CFG.BALL_RADIUS-2),vx:0,vy:0,radius:CFG.BALL_RADIUS,stuck:true,fireball:false,trail:[],alive:true}}
function getBallSpeed(){var d=DIFFICULTY[settings.difficulty]||DIFFICULTY.normal;return CFG.BALL_SPEED_NORMAL*d.speed}
function launchBall(ball){if(!ball.stuck)return;var a=(Math.random()*60-30)*Math.PI/180;var s=getBallSpeed();ball.vx=Math.sin(a)*s;ball.vy=-Math.cos(a)*s;ball.stuck=false}
function updateBallStuck(ball){if(!ball||!ball.stuck)return;var p=gameState.paddle;ball.x=p.x;ball.y=p.y-ball.radius-1}

function makePaddle(){var d=DIFFICULTY[settings.difficulty]||DIFFICULTY.normal;var w=CFG.PADDLE_W_NORMAL*d.paddle;return{x:CW/2,y:layout.paddleY,width:w,baseWidth:w,height:CFG.PADDLE_H,targetX:CW/2,glow:0,hitAnim:0}}

function updatePaddle(dt){
  var p=gameState.paddle;p.x+=(p.targetX-p.x)*(1-Math.pow(1-CFG.PADDLE_FRICTION,dt*60));
  var hw=p.width/2;p.x=Math.max(hw,Math.min(CW-hw,p.x));
  if(p.glow>0)p.glow-=dt*2;if(p.hitAnim>0)p.hitAnim-=dt*4;
  var d=DIFFICULTY[settings.difficulty]||DIFFICULTY.normal,baseW=CFG.PADDLE_W_NORMAL*d.paddle,eff=gameState.activeEffects,tw=baseW;
  if(eff.expand>0)tw=baseW*1.5;if(eff.shrink>0)tw=baseW*0.7;p.width+=(tw-p.width)*0.15;
}

function circleRectCollision(cx,cy,cr,rx,ry,rw,rh){
  var closestX=Math.max(rx,Math.min(cx,rx+rw)),closestY=Math.max(ry,Math.min(cy,ry+rh));
  var dx=cx-closestX,dy=cy-closestY,d2=dx*dx+dy*dy;
  if(d2<cr*cr){var d=Math.sqrt(d2)||0.0001;return{hit:true,nx:dx/d,ny:dy/d,depth:cr-d}}
  return{hit:false};
}

function reflectVelocity(vx,vy,nx,ny){var dot=vx*nx+vy*ny;return{vx:vx-2*dot*nx,vy:vy-2*dot*ny}}

function enforceMinVY(ball){
  var spd=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);if(spd===0)return;
  var minVY=spd*0.28;
  if(Math.abs(ball.vy)<minVY){var sign=ball.vy>=0?1:-1;var newVY=sign*minVY;var vx2=spd*spd-newVY*newVY;ball.vx=(ball.vx>=0?1:-1)*Math.sqrt(Math.max(0,vx2));ball.vy=newVY}
}

function paddleReflect(ball){
  var p=gameState.paddle,off=Math.max(-1,Math.min(1,(ball.x-p.x)/(p.width/2)));
  var a=off*60*Math.PI/180,spd=getBallSpeed();if(gameState.activeEffects.slow>0)spd*=0.7;
  ball.vx=Math.sin(a)*spd;ball.vy=-Math.cos(a)*spd;if(Math.abs(ball.vy)<spd*0.28)ball.vy=-spd*0.28;
}

function checkBallWalls(ball){
  var r=ball.radius,hit=false;
  if(ball.x-r<0){ball.x=r;ball.vx=Math.abs(ball.vx);hit=true;playSFX('wall')}
  else if(ball.x+r>CW){ball.x=CW-r;ball.vx=-Math.abs(ball.vx);hit=true;playSFX('wall')}
  if(ball.y-r<0){ball.y=r;ball.vy=Math.abs(ball.vy);hit=true;playSFX('wall')}
  if(ball.y-r>CH){ball.alive=false;hit=true}
  return hit;
}

function checkBallPaddle(ball){
  var p=gameState.paddle;if(ball.vy<=0)return false;
  var c=circleRectCollision(ball.x,ball.y,ball.radius,p.x-p.width/2,p.y-p.height/2,p.width,p.height);
  if(!c.hit)return false;
  if(gameState.activeEffects.sticky>0){ball.stuck=true;ball.vx=0;ball.vy=0;updateBallStuck(ball);playSFX('paddle');return true}
  paddleReflect(ball);ball.y=p.y-p.height/2-ball.radius-1;p.glow=1;p.hitAnim=1;
  playSFX('paddle');spawnImpactParticles(ball.x,ball.y,'spark',4);return true;
}

function checkBallBlocks(ball){
  var hitAny=false;
  for(var i=0;i<gameState.blocks.length;i++){var b=gameState.blocks[i];if(!b.alive)continue;
    var c=circleRectCollision(ball.x,ball.y,ball.radius,b.x,b.y,b.w,b.h);if(!c.hit)continue;hitAny=true;
    if(!ball.fireball){var rv=reflectVelocity(ball.vx,ball.vy,c.nx,c.ny);ball.vx=rv.vx;ball.vy=rv.vy;enforceMinVY(ball);ball.x+=c.nx*(c.depth+0.5);ball.y+=c.ny*(c.depth+0.5)}
    b.hitAnim=1;b.hp--;
    if(b.hp<=0){b.alive=false;onBlockDestroyed(b,ball)}else{playSFX('hit');spawnImpactParticles(ball.x,ball.y,'spark',3)}
    if(!ball.fireball)break}
  return hitAny;
}


function comboMultiplier(combo){return 1+(combo-1)*0.5}
var comboHideTimer=null;
function showCombo(n){var el=document.getElementById('combo-display');if(!el)return;el.textContent=t('combo')+' \u00d7'+n;el.classList.add('visible');clearTimeout(comboHideTimer);comboHideTimer=setTimeout(function(){el.classList.remove('visible')},1200)}

function onBlockDestroyed(block,ball){
  var now=Date.now();if(now-gameState.comboTimer<CFG.COMBO_WINDOW)gameState.combo++;else gameState.combo=1;gameState.comboTimer=now;
  var mult=comboMultiplier(gameState.combo),pts=Math.round(block.pts*mult*(DIFFICULTY[settings.difficulty]||DIFFICULTY.normal).score);
  gameState.score+=pts;showScorePopup(block.x+block.w/2,block.y+block.h/2,pts);updateHUD();
  if(gameState.combo>=2)showCombo(gameState.combo);
  if(block.type==='F'){spawnImpactParticles(block.x+block.w/2,block.y+block.h/2,'fire',8);playSFX('break_fire')}
  else if(block.type==='I'){spawnImpactParticles(block.x+block.w/2,block.y+block.h/2,'ice',6);playSFX('break_ice');if(ball)speedBall(ball,0.8,3000)}
  else if(block.type==='G'){spawnImpactParticles(block.x+block.w/2,block.y+block.h/2,'spark',12);playSFX('break_gold');spawnPowerup(block.x+block.w/2,block.y+block.h/2,'random')}
  else{spawnImpactParticles(block.x+block.w/2,block.y+block.h/2,'spark',5);playSFX('break_generic')}
  gameState.shake=Math.max(gameState.shake,block.type==='L'||block.type==='T'?8:3);
  gameState.flashAlpha=Math.min(1,gameState.flashAlpha+0.08);gameState.flashColor=block.def.glow||'#ffffff';
  checkLevelClear();
}

var POWERUP_DEFS={
  expand:{color:'#00ff88',icon:'\u2b1b',duration:15000},shrink:{color:'#ff4488',icon:'\u2b1c',duration:10000},
  fireball:{color:'#ff6600',icon:'\U0001f525',duration:8000},multiball:{color:'#ffff00',icon:'\u26aa',duration:0},
  sticky:{color:'#8844ff',icon:'\U0001f7e3',duration:12000},laser:{color:'#ff0044',icon:'\U0001f534',duration:10000},
  life:{color:'#ff2222',icon:'\u2764',duration:0},slow:{color:'#44aaff',icon:'\U0001f535',duration:10000}
};
var POWERUP_TYPES=Object.keys(POWERUP_DEFS);

function spawnPowerup(x,y,type){
  if(type==='random')type=POWERUP_TYPES[Math.floor(Math.random()*POWERUP_TYPES.length)];
  var def=POWERUP_DEFS[type];if(!def)return;
  gameState.powerups.push({x:x,y:y,type:type,def:def,w:28,h:28,alive:true});
}

function updatePowerups(dt){
  var p=gameState.paddle;
  for(var i=gameState.powerups.length-1;i>=0;i--){var pu=gameState.powerups[i];if(!pu.alive){gameState.powerups.splice(i,1);continue}
    pu.y+=CFG.POWERUP_FALL_SPEED*dt;
    if(Math.abs(pu.x-p.x)<p.width/2+pu.w/2&&Math.abs(pu.y-p.y)<p.height/2+pu.h/2){collectPowerup(pu);pu.alive=false}
    if(pu.y>CH+40)pu.alive=false}
}

function collectPowerup(pu){
  var type=pu.type,eff=gameState.activeEffects,def=pu.def;playSFX('powerup');gameState.flashAlpha=0.25;gameState.flashColor=def.color;
  if(type==='life'){gameState.lives=Math.min(CFG.MAX_LIVES,gameState.lives+1);updateHUD();return}
  if(type==='multiball'){var ex=gameState.balls.filter(function(b){return b.alive&&!b.stuck});if(ex.length>0){for(var k=0;k<2;k++){var nb=makeBall(ex[0].x,ex[0].y);nb.stuck=false;nb.vx=ex[0].vx*(k===0?0.8:-0.8);nb.vy=ex[0].vy;gameState.balls.push(nb)}}return}
  if(def.duration>0)eff[type]=def.duration;updatePowerupBar();
}

function updateEffects(dt){var eff=gameState.activeEffects,ms=dt*1000;Object.keys(eff).forEach(function(k){if(eff[k]>0)eff[k]=Math.max(0,eff[k]-ms)});updatePowerupBar()}

function updatePowerupBar(){
  var bar=document.getElementById('powerup-bar');if(!bar)return;var eff=gameState.activeEffects,html='';
  Object.keys(eff).forEach(function(k){if(eff[k]<=0)return;var def=POWERUP_DEFS[k];if(!def||def.duration<=0)return;var frac=eff[k]/def.duration;
    html+='<div class="powerup-icon" style="background:'+def.color+'22;border-color:'+def.color+'">'+def.icon+'<div class="powerup-timer" style="transform:scaleX('+frac+');background:'+def.color+'"></div></div>'});
  bar.innerHTML=html;
}

function speedBall(ball,factor,dur){var s=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);if(!s)return;ball.vx=ball.vx/s*s*factor;ball.vy=ball.vy/s*s*factor;
  setTimeout(function(){if(!ball.alive)return;var cs=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);if(!cs)return;var ts=getBallSpeed();ball.vx=ball.vx/cs*ts;ball.vy=ball.vy/cs*ts},dur)}


var particlePool=[],MAX_P=CFG.MAX_PARTICLES;
function poolAlloc(){for(var i=0;i<particlePool.length;i++){if(!particlePool[i]._alive){particlePool[i]._alive=true;return particlePool[i]}}if(particlePool.length<MAX_P){var p={_alive:true};particlePool.push(p);return p}particlePool[0]._alive=true;return particlePool[0]}
function poolKill(p){p._alive=false}

function spawnImpactParticles(x,y,type,count){
  if(!settings.visualFX)return;
  for(var i=0;i<count;i++){var p=poolAlloc();var a=Math.random()*Math.PI*2,s=80+Math.random()*200;
    var c;if(type==='fire')c=['#ff6600','#ff8800','#ffaa00','#ff4400'][Math.floor(Math.random()*4)];
    else if(type==='ice')c=['#aaddff','#66bbff','#ffffff','#cceeff'][Math.floor(Math.random()*4)];
    else c=['#ffcc00','#ff8800','#ffffff','#ffee88'][Math.floor(Math.random()*4)];
    p.x=x;p.y=y;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s-60;p.color=c;p.alpha=1;p.radius=2+Math.random()*3;p.life=0.4+Math.random()*0.4;p.maxLife=p.life;p.gravity=200;p.type=type}
}

function updateParticles(dt){for(var i=0;i<particlePool.length;i++){var p=particlePool[i];if(!p._alive)continue;p.life-=dt;if(p.life<=0){poolKill(p);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;p.alpha=p.life/p.maxLife;p.radius*=0.98}}

function renderParticles(){
  ctx.save();for(var i=0;i<particlePool.length;i++){var p=particlePool[i];if(!p._alive||p.alpha<=0)continue;
    ctx.globalAlpha=p.alpha*0.9;ctx.globalCompositeOperation='lighter';ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0.5,p.radius),0,Math.PI*2);ctx.fill()}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.restore();
}

function fireLasers(){var p=gameState.paddle;gameState.lasers.push({x:p.x-p.width/2+8,y:p.y-p.height/2,vy:-CFG.LASER_SPEED,w:3,h:14,alive:true,color:'#ff2244'});gameState.lasers.push({x:p.x+p.width/2-8,y:p.y-p.height/2,vy:-CFG.LASER_SPEED,w:3,h:14,alive:true,color:'#ff2244'});playSFX('laser')}

function updateLasers(dt){
  for(var i=gameState.lasers.length-1;i>=0;i--){var l=gameState.lasers[i];if(!l.alive){gameState.lasers.splice(i,1);continue}
    l.y+=l.vy*dt;if(l.y<-20){l.alive=false;continue}
    for(var j=0;j<gameState.blocks.length;j++){var b=gameState.blocks[j];if(!b.alive)continue;
      if(l.x>b.x&&l.x<b.x+b.w&&l.y>b.y&&l.y<b.y+b.h){l.alive=false;b.hitAnim=1;b.hp--;if(b.hp<=0){b.alive=false;onBlockDestroyed(b,null)}break}}}
}


function checkLevelClear(){
  var rem=gameState.blocks.filter(function(b){return b.alive&&b.type!=='S'}).length;
  if(rem===0)setTimeout(function(){levelClear()},300);
}

function levelClear(){
  gameState.running=false;var isLast=(gameState.level>=LEVELS.length-1);
  var vs=document.getElementById('vic-score'),vb=document.getElementById('vic-sub'),nb=document.getElementById('btn-vic-next');
  if(vs)vs.textContent=gameState.score.toLocaleString()+' pts';
  if(vb)vb.textContent=isLast?t('all_clear'):t('level_clear');
  if(nb)nb.style.display=isLast?'none':'';
  document.getElementById('overlay-victory').classList.add('visible');playSFX('victory');
  for(var i=0;i<40;i++){(function(j){setTimeout(function(){spawnImpactParticles(Math.random()*CW,Math.random()*CH*0.6,'spark',3)},j*80)})(i)}
}

function startLevel(idx){
  if(idx>=LEVELS.length)idx=LEVELS.length-1;gameState.level=idx;var lvl=LEVELS[idx];
  recalcLayout();gameState.blocks=parseLevel(lvl);gameState.balls=[];gameState.powerups=[];gameState.lasers=[];
  gameState.combo=0;gameState.comboTimer=0;gameState.shake=0;gameState.flashAlpha=0;
  gameState.activeEffects={expand:0,shrink:0,sticky:0,laser:0,slow:0,fireball:0};
  gameState.levelStartScore=gameState.score;gameState.paddle=makePaddle();
  var ball=makeBall();updateBallStuck(ball);gameState.balls.push(ball);updateHUD();
  var oN=document.getElementById('overlay-level-num'),oL=document.getElementById('overlay-level-name'),oH=document.getElementById('overlay-level-hint');
  if(oN)oN.textContent=t('level')+' '+(idx+1)+' / '+LEVELS.length;if(oL)oL.textContent=lvl.name;if(oH)oH.textContent=t('press_start');
  document.getElementById('overlay-victory').classList.remove('visible');document.getElementById('overlay-gameover').classList.remove('visible');
  document.getElementById('overlay-pause').classList.remove('visible');document.getElementById('overlay-level').classList.add('visible');
  gameState.running=false;
}

function startGame(){
  gameState.score=0;gameState.totalScore=0;gameState.lives=CFG.INIT_LIVES;gameState.running=false;gameState.paused=false;
  showScreen('screen-game');startLevel(0);if(!animFrame){lastTime=performance.now();animFrame=requestAnimationFrame(gameLoop)}
}

function loseLife(){
  gameState.lives--;playSFX('death');updateHUD();
  if(gameState.lives<=0){gameOver();return}
  gameState.balls=gameState.balls.filter(function(b){return b.alive});
  if(gameState.balls.length===0){var ball=makeBall();updateBallStuck(ball);gameState.balls.push(ball);document.getElementById('overlay-level').classList.add('visible');gameState.running=false}
  gameState.shake=12;gameState.flashAlpha=0.4;gameState.flashColor='#ff2200';
}

function gameOver(){
  gameState.running=false;var gs=document.getElementById('go-score'),gb=document.getElementById('go-sub');
  if(gs)gs.textContent=gameState.score.toLocaleString()+' pts';if(gb)gb.textContent=t('level')+' '+(gameState.level+1);
  document.getElementById('overlay-gameover').classList.add('visible');addLeaderboardEntry('ORB',gameState.score,gameState.level+1);playSFX('gameover');
}

function updateHUD(){
  var se=document.getElementById('hud-score'),le=document.getElementById('hud-level'),li=document.getElementById('lives-display');
  if(se)se.textContent=gameState.score.toLocaleString();if(le)le.textContent=(gameState.level+1)+' / '+LEVELS.length;
  if(li){var h='';for(var i=0;i<CFG.MAX_LIVES;i++)h+='<div class="life-orb'+(i>=gameState.lives?' lost':'')+'"></div>';li.innerHTML=h}
}

function showScorePopup(x,y,pts){var el=document.createElement('div');el.className='score-popup';el.style.left=x+'px';el.style.top=y+'px';el.textContent='+'+pts;document.body.appendChild(el);setTimeout(function(){el.remove()},850)}


var audioCtx=null,audioReady=false;
function ensureAudio(){if(!audioCtx){audioCtx=new(window.AudioContext||window.webkitAudioContext)();audioReady=true}if(audioCtx.state==='suspended')audioCtx.resume()}
function playSFX(type){if(!settings.sfxOn||!audioReady)return;try{_playSFX(type)}catch(e){}}

function _playSFX(type){
  var ac=audioCtx,now=ac.currentTime;
  function osc(f,t,g,s,d){var o=ac.createOscillator(),gn=ac.createGain();o.type=t||'sine';o.frequency.setValueAtTime(f,s);gn.gain.setValueAtTime(g,s);gn.gain.exponentialRampToValueAtTime(0.001,s+d);o.connect(gn);gn.connect(ac.destination);o.start(s);o.stop(s+d+0.01)}
  function sw(f1,f2,t,g,s,d){var o=ac.createOscillator(),gn=ac.createGain();o.type=t||'sine';o.frequency.setValueAtTime(f1,s);o.frequency.exponentialRampToValueAtTime(f2,s+d);gn.gain.setValueAtTime(g,s);gn.gain.exponentialRampToValueAtTime(0.001,s+d);o.connect(gn);gn.connect(ac.destination);o.start(s);o.stop(s+d+0.01)}
  function ns(g,s,d,freq){var bl=Math.ceil(ac.sampleRate*d),buf=ac.createBuffer(1,bl,ac.sampleRate),data=buf.getChannelData(0);for(var i=0;i<bl;i++)data[i]=Math.random()*2-1;var src=ac.createBufferSource();src.buffer=buf;var gn=ac.createGain();gn.gain.setValueAtTime(g,s);gn.gain.exponentialRampToValueAtTime(0.001,s+d);if(freq){var bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=freq;bp.Q.value=2;src.connect(bp);bp.connect(gn)}else src.connect(gn);gn.connect(ac.destination);src.start(s);src.stop(s+d+0.01)}

  switch(type){
    case'paddle':sw(380,220,'square',0.12,now,0.1);sw(600,300,'sine',0.08,now,0.08);break;
    case'wall':sw(280,160,'sine',0.10,now,0.07);break;
    case'hit':sw(440,280,'square',0.06,now,0.06);break;
    case'break_fire':sw(220,80,'sawtooth',0.18,now,0.18);ns(0.12,now,0.14,600);break;
    case'break_ice':osc(2093,'sine',0.12,now,0.08);osc(2794,'sine',0.08,now+0.03,0.06);osc(3520,'sine',0.06,now+0.06,0.05);ns(0.06,now,0.10,4000);break;
    case'break_gold':osc(1047,'sine',0.12,now,0.12);osc(1319,'sine',0.10,now+0.05,0.10);osc(1568,'sine',0.08,now+0.10,0.08);break;
    case'break_generic':sw(320,140,'square',0.10,now,0.12);ns(0.08,now,0.08,800);break;
    case'powerup':sw(440,880,'sine',0.14,now,0.12);sw(660,1320,'sine',0.10,now+0.08,0.10);break;
    case'laser':sw(800,2400,'sawtooth',0.08,now,0.06);break;
    case'death':sw(300,60,'sawtooth',0.22,now,0.45);ns(0.12,now+0.1,0.3,200);break;
    case'gameover':sw(440,110,'sawtooth',0.20,now,0.6);sw(330,82,'sawtooth',0.15,now+0.3,0.6);sw(220,55,'sawtooth',0.10,now+0.6,0.5);break;
    case'victory':[523,659,784,1047].forEach(function(f,i){osc(f,'sine',0.14-i*0.02,now+i*0.12,0.4)});break;
    case'launch':sw(200,600,'sine',0.10,now,0.12);break;
  }
}


function renderBackground(){ctx.fillStyle='#0a0806';ctx.fillRect(0,0,CW,CH);ctx.strokeStyle='rgba(255,80,20,0.04)';ctx.lineWidth=1;var gs=44;for(var x=0;x<CW;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke()}for(var y=0;y<CH;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke()}}

function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function adjustBrightness(hex,f){var c=hex.replace('#','');if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];return'rgb('+Math.min(255,Math.round(parseInt(c.substr(0,2),16)*f))+','+Math.min(255,Math.round(parseInt(c.substr(2,2),16)*f))+','+Math.min(255,Math.round(parseInt(c.substr(4,2),16)*f))+')'}

function renderBlocks(){
  var pad=CFG.BLOCK_CORNER;
  for(var i=0;i<gameState.blocks.length;i++){var b=gameState.blocks[i];if(!b.alive)continue;var def=b.def,ft=b.hitAnim;if(b.hitAnim>0)b.hitAnim-=0.08;
    var hf=b.hp/b.maxHp,br=0.5+hf*0.5;ctx.save();if(ft>0.5)ctx.globalAlpha=0.5+ft*0.5;
    if(ft>0.3||hf>0.5){ctx.shadowColor=def.glow;ctx.shadowBlur=8+ft*12}
    var g=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);g.addColorStop(0,adjustBrightness(def.color,br*1.3));g.addColorStop(1,adjustBrightness(def.color,br*0.7));
    ctx.fillStyle=g;roundRect(ctx,b.x,b.y,b.w,b.h,pad);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,'+(0.12+ft*0.25)+')';ctx.lineWidth=1;roundRect(ctx,b.x,b.y,b.w,b.h,pad);ctx.stroke();
    if(b.maxHp>1){for(var d=0;d<b.maxHp;d++){ctx.beginPath();ctx.arc(b.x+b.w/2+(d-(b.maxHp-1)/2)*6,b.y+b.h-5,2,0,Math.PI*2);ctx.fillStyle=d<b.hp?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.4)';ctx.fill()}}
    if(b.type==='S'){ctx.save();ctx.beginPath();roundRect(ctx,b.x,b.y,b.w,b.h,pad);ctx.clip();ctx.strokeStyle='rgba(180,200,220,0.2)';ctx.lineWidth=1;for(var hx=b.x-b.h;hx<b.x+b.w+b.h;hx+=8){ctx.beginPath();ctx.moveTo(hx,b.y);ctx.lineTo(hx+b.h,b.y+b.h);ctx.stroke()}ctx.restore()}
    ctx.restore()}
}

function renderPaddle(){
  var p=gameState.paddle,x=p.x-p.width/2,y=p.y-p.height/2,w=p.width,h=p.height;ctx.save();
  ctx.shadowColor='rgba(255,100,20,0.7)';ctx.shadowBlur=10+p.glow*14;
  var g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#dd6622');g.addColorStop(0.4,'#ff8833');g.addColorStop(1,'#662200');
  ctx.fillStyle=g;roundRect(ctx,x,y,w,h,5);ctx.fill();
  ctx.strokeStyle='rgba(255,200,100,0.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+6,y+2);ctx.lineTo(x+w-6,y+2);ctx.stroke();
  if(p.hitAnim>0){ctx.fillStyle='rgba(255,220,80,'+p.hitAnim*0.4+')';roundRect(ctx,x,y,w,h,5);ctx.fill()}
  if(gameState.activeEffects.sticky>0){ctx.strokeStyle='rgba(150,80,255,0.8)';ctx.lineWidth=2;roundRect(ctx,x-1,y-1,w+2,h+2,6);ctx.stroke()}
  ctx.restore();
}

function renderBalls(){for(var i=0;i<gameState.balls.length;i++){renderBall(gameState.balls[i])}}
function renderBall(ball){
  if(!ball.alive&&!ball.stuck)return;var r=ball.radius;ctx.save();
  for(var t=0;t<ball.trail.length;t++){var tr=ball.trail[t];var ta=(1-tr.age)*0.4;if(ta<=0)continue;ctx.globalAlpha=ta;ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ff4400';ctx.beginPath();ctx.arc(tr.x,tr.y,r*(1-tr.age*0.6),0,Math.PI*2);ctx.fill()}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.shadowColor=ball.fireball?'#ff6600':'rgba(255,120,0,0.8)';ctx.shadowBlur=12+(ball.fireball?8:0);
  var g=ctx.createRadialGradient(ball.x-r*0.3,ball.y-r*0.3,r*0.1,ball.x,ball.y,r);
  if(ball.fireball){g.addColorStop(0,'#ffee80');g.addColorStop(0.4,'#ff6600');g.addColorStop(1,'#cc2200')}
  else{g.addColorStop(0,'#ffcc66');g.addColorStop(0.45,'#ff5500');g.addColorStop(1,'#881100')}
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(ball.x,ball.y,r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,240,180,0.55)';ctx.beginPath();ctx.arc(ball.x-r*0.28,ball.y-r*0.28,r*0.38,0,Math.PI*2);ctx.fill();ctx.restore();
}

function renderPowerups(){for(var i=0;i<gameState.powerups.length;i++){var pu=gameState.powerups[i];if(!pu.alive)continue;var def=pu.def;ctx.save();ctx.shadowColor=def.color;ctx.shadowBlur=8;ctx.fillStyle=def.color+'33';ctx.strokeStyle=def.color;ctx.lineWidth=1.5;roundRect(ctx,pu.x-pu.w/2,pu.y-pu.h/2,pu.w,pu.h,6);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=0.9;ctx.font='14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(def.icon,pu.x,pu.y);ctx.restore()}}
function renderLasers(){for(var i=0;i<gameState.lasers.length;i++){var l=gameState.lasers[i];if(!l.alive)continue;ctx.save();ctx.shadowColor=l.color;ctx.shadowBlur=6;ctx.fillStyle=l.color;ctx.fillRect(l.x-l.w/2,l.y,l.w,l.h);ctx.restore()}}
function renderFlash(){if(gameState.flashAlpha<=0)return;ctx.save();ctx.globalAlpha=gameState.flashAlpha*0.35;ctx.fillStyle=gameState.flashColor;ctx.fillRect(0,0,CW,CH);ctx.restore();gameState.flashAlpha*=0.82;if(gameState.flashAlpha<0.005)gameState.flashAlpha=0}


var lastDt=0.016;
function gameLoop(ts){
  var dt=Math.min((ts-lastTime)/1000,0.05);lastTime=ts;lastDt=dt;animFrame=requestAnimationFrame(gameLoop);
  updateParticles(dt);if(!gameState.running||gameState.paused){render();return}
  updatePaddle(dt);updateEffects(dt);updatePowerups(dt);updateLasers(dt);
  if(gameState.activeEffects.laser>0){gameState._laserTimer=(gameState._laserTimer||0)-dt;if(gameState._laserTimer<=0){fireLasers();gameState._laserTimer=0.4}}
  for(var i=0;i<gameState.balls.length;i++){var b=gameState.balls[i];if(b.stuck||!b.alive){updateBallStuck(b);continue}
    b.trail.push({x:b.x,y:b.y,age:0});if(b.trail.length>12)b.trail.shift();b.trail.forEach(function(tr){tr.age+=dt*4});b.trail=b.trail.filter(function(tr){return tr.age<1})}
  var moving=gameState.balls.filter(function(b){return b.alive&&!b.stuck});
  for(var bi=0;bi<moving.length;bi++)moveBall(moving[bi],dt);
  var alive=gameState.balls.filter(function(b){return b.alive}),stuck=gameState.balls.find(function(b){return b.stuck});
  if(alive.length===0&&!stuck){gameState.balls=[];loseLife()}else gameState.balls=gameState.balls.filter(function(b){return b.alive||b.stuck});
  if(gameState.shake>0)gameState.shake*=0.85;render();
}

function moveBall(ball,dt){
  var spd=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy),minD=Math.min(layout.blockW||40,layout.blockH||18);
  var steps=Math.max(1,Math.min(8,Math.ceil(spd*dt/(minD*0.5)))),subDt=dt/steps;
  for(var s=0;s<steps;s++){ball.x+=ball.vx*subDt;ball.y+=ball.vy*subDt;checkBallWalls(ball);if(!ball.alive)break;if(checkBallPaddle(ball))break;checkBallBlocks(ball)}
}

function render(){
  ctx.save();if(gameState.shake>0.5)ctx.translate((Math.random()-0.5)*gameState.shake,(Math.random()-0.5)*gameState.shake);
  renderBackground();renderBlocks();renderLasers();renderPowerups();renderPaddle();renderBalls();renderParticles();renderFlash();ctx.restore();
}

var keys={},mouseX=0;
function initInput(){
  document.addEventListener('mousemove',function(e){mouseX=e.clientX;if(currentScreen==='screen-game'&&gameState.paddle)gameState.paddle.targetX=e.clientX});
  document.addEventListener('touchmove',function(e){if(currentScreen!=='screen-game')return;e.preventDefault();var t=e.touches[0];if(t&&gameState.paddle)gameState.paddle.targetX=t.clientX},{passive:false});
  document.addEventListener('touchstart',function(e){ensureAudio();if(currentScreen==='screen-game')handleGameTap()});
  document.addEventListener('mousedown',function(e){ensureAudio();if(currentScreen==='screen-game'&&e.button===0)handleGameTap()});
  document.addEventListener('keydown',function(e){keys[e.code]=true;
    if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();ensureAudio();if(currentScreen==='screen-game')handleSpacebar()}
    if(e.code==='Escape'||e.code==='KeyP'){if(currentScreen==='screen-game')togglePause()}
    if(e.code==='KeyM'){settings.sfxOn=!settings.sfxOn;settings.musicOn=!settings.musicOn;saveSettings()}
    if(currentScreen==='screen-game'&&gameState.running&&!gameState.paused){
      if(e.code==='ArrowLeft'||e.code==='KeyA'){if(gameState.paddle)gameState.paddle.targetX-=30}
      if(e.code==='ArrowRight'||e.code==='KeyD'){if(gameState.paddle)gameState.paddle.targetX+=30}}});
  document.addEventListener('keyup',function(e){keys[e.code]=false});
  setInterval(function(){if(currentScreen!=='screen-game'||!gameState.running||gameState.paused)return;var p=gameState.paddle;if(!p)return;if(keys['ArrowLeft']||keys['KeyA'])p.targetX-=6;if(keys['ArrowRight']||keys['KeyD'])p.targetX+=6},16);
}
function handleSpacebar(){var lo=document.getElementById('overlay-level');if(lo&&lo.classList.contains('visible')){dismissLevelOverlay();return}gameState.balls.forEach(function(b){if(b.stuck){launchBall(b);playSFX('launch')}})}
function handleGameTap(){var lo=document.getElementById('overlay-level');if(lo&&lo.classList.contains('visible')){dismissLevelOverlay();return}gameState.balls.forEach(function(b){if(b.stuck){launchBall(b);playSFX('launch')}})}
function dismissLevelOverlay(){var lo=document.getElementById('overlay-level');if(lo)lo.classList.remove('visible');gameState.running=true}
function togglePause(){if(!gameState.running&&!gameState.paused)return;gameState.paused=!gameState.paused;var po=document.getElementById('overlay-pause');if(gameState.paused){if(po)po.classList.add('visible')}else{if(po)po.classList.remove('visible')}}


function initButtons(){
  document.getElementById('btn-play').addEventListener('click',function(){ensureAudio();startGame()});
  document.getElementById('btn-settings').addEventListener('click',function(){showScreen('screen-settings');applySettingsUI()});
  document.getElementById('btn-leaderboard').addEventListener('click',function(){showScreen('screen-leaderboard');renderLeaderboard()});
  document.getElementById('btn-back-settings').addEventListener('click',function(){saveSettings();showScreen('screen-start')});
  document.getElementById('btn-music').addEventListener('click',function(){settings.musicOn=!settings.musicOn;applySettingsUI();saveSettings()});
  document.getElementById('btn-sfx').addEventListener('click',function(){settings.sfxOn=!settings.sfxOn;applySettingsUI();saveSettings()});
  document.getElementById('btn-visual').addEventListener('click',function(){settings.visualFX=!settings.visualFX;applySettingsUI();saveSettings()});
  ['easy','normal','hard'].forEach(function(d){document.getElementById('diff-'+d).addEventListener('click',function(){settings.difficulty=d;applySettingsUI();saveSettings()})});
  ['en','ru'].forEach(function(l){document.getElementById('lang-'+l).addEventListener('click',function(){settings.language=l;applyI18n();applySettingsUI();saveSettings()})});
  document.getElementById('btn-back-lb').addEventListener('click',function(){showScreen('screen-start')});
  document.getElementById('btn-pause').addEventListener('click',function(){togglePause()});
  document.getElementById('btn-mute').addEventListener('click',function(){settings.sfxOn=!settings.sfxOn;settings.musicOn=!settings.musicOn;var b=document.getElementById('btn-mute');if(b)b.textContent=(settings.sfxOn||settings.musicOn)?'\U0001f50a':'\U0001f507';saveSettings()});
  document.getElementById('btn-resume').addEventListener('click',function(){togglePause()});
  document.getElementById('btn-restart').addEventListener('click',function(){document.getElementById('overlay-pause').classList.remove('visible');startGame()});
  document.getElementById('btn-quit').addEventListener('click',function(){document.getElementById('overlay-pause').classList.remove('visible');gameState.running=false;gameState.paused=false;showScreen('screen-start')});
  document.getElementById('btn-go-retry').addEventListener('click',function(){document.getElementById('overlay-gameover').classList.remove('visible');startGame()});
  document.getElementById('btn-go-menu').addEventListener('click',function(){document.getElementById('overlay-gameover').classList.remove('visible');gameState.running=false;showScreen('screen-start')});
  document.getElementById('btn-vic-next').addEventListener('click',function(){document.getElementById('overlay-victory').classList.remove('visible');startLevel(gameState.level+1)});
  document.getElementById('btn-vic-menu').addEventListener('click',function(){document.getElementById('overlay-victory').classList.remove('visible');gameState.running=false;showScreen('screen-start')});
}

// ============================================================
// === TESTS ==================================================
// ============================================================
function runTests(){
  var passed=0,failed=0,results=[];
  function assert(name,condition,detail){if(condition){passed++;results.push({ok:true,name:name})}else{failed++;results.push({ok:false,name:name,detail:detail||''})}}

  // 1: circleRectCollision - hit top
  (function(){var r=circleRectCollision(50,38,8,40,40,30,15);assert('CRC: hit top face',r.hit&&r.ny<=0,'ny='+(r.ny||'?'))})();
  // 2: miss
  (function(){var r=circleRectCollision(0,0,8,100,100,30,15);assert('CRC: no hit when far',!r.hit)})();
  // 3: hit left
  (function(){var r=circleRectCollision(33,50,8,40,40,30,20);assert('CRC: hit left face',r.hit&&r.nx<=0,'nx='+(r.nx||'?'))})();
  // 4: reflect up
  (function(){var rv=reflectVelocity(0,100,0,-1);assert('Reflect: vy reverses',rv.vy<0,'vy='+rv.vy);assert('Reflect: vx unchanged',Math.abs(rv.vx)<0.01,'vx='+rv.vx)})();
  // 5: reflect preserves speed
  (function(){var s1=Math.sqrt(9+16),rv=reflectVelocity(3,4,0,-1),s2=Math.sqrt(rv.vx*rv.vx+rv.vy*rv.vy);assert('Reflect: speed preserved',Math.abs(s1-s2)<0.01)})();
  // 6: combo multiplier
  (function(){assert('Combo x1=1.0',Math.abs(comboMultiplier(1)-1.0)<0.001);assert('Combo x2=1.5',Math.abs(comboMultiplier(2)-1.5)<0.001);assert('Combo x3=2.0',Math.abs(comboMultiplier(3)-2.0)<0.001);assert('Combo x5=3.0',Math.abs(comboMultiplier(5)-3.0)<0.001)})();
  // 7: i18n
  (function(){var sl=settings.language;settings.language='en';assert('i18n EN score',t('score')==='SCORE',t('score'));assert('i18n EN play',t('play')==='PLAY');settings.language='ru';assert('i18n RU score',t('score')==='\u0421\u0427\u0401\u0422',t('score'));assert('i18n RU play',t('play')==='\u0418\u0413\u0420\u0410\u0422\u042c');assert('i18n missing key',t('xyz_missing')==='xyz_missing');settings.language=sl})();
  // 8: parseLevel
  (function(){recalcLayout();var bl=parseLevel(LEVELS[0]);assert('Level 1: has blocks',bl.length>0);assert('Level 1: all Fire',bl.every(function(b){return b.type==='F'}));assert('Level 1: positions set',bl[0].x>0&&bl[0].y>0)})();
  // 9: makeBall
  (function(){var b=makeBall(100,200);assert('Ball: starts stuck',b.stuck===true);assert('Ball: position',b.x===100&&b.y===200);assert('Ball: radius',b.radius===CFG.BALL_RADIUS);assert('Ball: alive',b.alive===true)})();
  // 10: launchBall
  (function(){var b=makeBall(300,500);launchBall(b);assert('Launch: not stuck',!b.stuck);assert('Launch: vy<0',b.vy<0);var s=Math.sqrt(b.vx*b.vx+b.vy*b.vy);assert('Launch: speed matches',Math.abs(s-getBallSpeed())<2)})();
  // 11: paddle per difficulty
  (function(){var sd=settings.difficulty;recalcLayout();settings.difficulty='normal';var p1=makePaddle();settings.difficulty='easy';var p2=makePaddle();settings.difficulty='hard';var p3=makePaddle();assert('Paddle easy>normal',p2.width>p1.width);assert('Paddle hard<normal',p3.width<p1.width);settings.difficulty=sd})();
  // 12: stuck ball follows paddle
  (function(){recalcLayout();gameState.paddle=makePaddle();gameState.paddle.x=350;var b=makeBall();b.stuck=true;updateBallStuck(b);assert('Stuck ball X=paddle X',Math.abs(b.x-350)<0.5);assert('Stuck ball Y above paddle',b.y<gameState.paddle.y)})();
  // 13: enforceMinVY
  (function(){var b=makeBall();b.vx=300;b.vy=10;b.stuck=false;var s=Math.sqrt(b.vx*b.vx+b.vy*b.vy);enforceMinVY(b);assert('MinVY: raised',Math.abs(b.vy)>=s*0.28-0.01);var ns=Math.sqrt(b.vx*b.vx+b.vy*b.vy);assert('MinVY: speed preserved',Math.abs(ns-s)<1)})();
  // 14: block defs
  (function(){var types=['F','I','W','E','L','S','G','T','R'];assert('BlockDefs: all 9',types.every(function(t){return!!BLOCK_DEFS[t]}));assert('BlockDefs: colors',types.every(function(t){return!!BLOCK_DEFS[t].color}));assert('Steel indestructible',BLOCK_DEFS.S.hp>=999)})();
  // 15: levels
  (function(){assert('15 levels',LEVELS.length===15);assert('All have grid',LEVELS.every(function(l){return l.grid&&l.grid.length>0}));assert('All have name',LEVELS.every(function(l){return!!l.name}))})();
  // 16: corner collision
  (function(){var r=circleRectCollision(40,40,8,40,40,30,20);assert('CRC: corner overlap=hit',r.hit)})();
  // 17: powerup collection
  (function(){recalcLayout();gameState.paddle=makePaddle();gameState.paddle.x=300;gameState.paddle.y=layout.paddleY;gameState.powerups=[];spawnPowerup(300,layout.paddleY,'life');var sl=gameState.lives;updatePowerups(0.016);assert('Powerup collected',gameState.lives===sl+1||gameState.powerups.filter(function(p){return p.alive}).length===0)})();
  // 18: adjustBrightness
  (function(){assert('adjustBrightness returns rgb',adjustBrightness('#ff4400',1.0).startsWith('rgb'));assert('adjustBrightness dims',adjustBrightness('#808080',0.5).includes('64'))})();

  var pct=Math.round(passed/(passed+failed)*100);
  console.log('\n=== ORB ARKANOID TESTS ===');
  results.forEach(function(r){console.log((r.ok?'\u2705':'\u274c')+' '+r.name+(r.detail?' ['+r.detail+']':''))});
  console.log('\n'+passed+'/'+(passed+failed)+' passed ('+pct+'%)');
  if(failed===0)console.log('\U0001f389 ALL TESTS PASSED');
  else console.log('\u26a0\ufe0f '+failed+' test(s) failed');
  return failed===0;
}

// ============================================================
// === INIT ===================================================
// ============================================================
document.addEventListener('DOMContentLoaded',function(){
  loadSettings();initCanvas();initInput();initButtons();applyI18n();applySettingsUI();showScreen('screen-start');updateHUD();
  setTimeout(function(){recalcLayout();runTests()},100);
});
window.addEventListener('resize',resizeCanvas);
window.OA={runTests:runTests,startGame:startGame,startLevel:startLevel,gameState:gameState,settings:settings,CFG:CFG};
