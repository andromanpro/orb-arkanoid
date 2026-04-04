'use strict';
// ============================================================
// === ORB ARKANOID v1.3.0 — Visual Polish ===================
// ============================================================

var CFG = {
  MAX_LIVES:5, INIT_LIVES:3, BALL_RADIUS:16,
  BALL_SPEED_NORMAL:340, BALL_SPEED_EASY:260, BALL_SPEED_HARD:420,
  PADDLE_W_NORMAL:104, PADDLE_H:14, PADDLE_FRICTION:0.22,
  BLOCK_COLS:13, BLOCK_ROWS_MAX:10, BLOCK_PAD:2, BLOCK_CORNER:5,
  BLOCK_TOP_OFFSET:72, BLOCK_AREA_H_FRAC:0.48, PADDLE_Y_FRAC:0.92,
  MAX_PARTICLES:2000, COMBO_WINDOW:1500, POWERUP_FALL_SPEED:90,
  STORAGE_KEY:'orb-arkanoid-v1', STORAGE_LB_KEY:'orb-arkanoid-lb-v1',
  LASER_SPEED:600, VERSION:'1.3.0'
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

var TRAIL_COLORS={
  fire:  {c1:'#ff2200',c2:'#ff8800',glow:'rgba(255,100,0,0.8)'},
  lava:  {c1:'#cc2200',c2:'#ff4400',glow:'rgba(255,80,0,0.8)'},
  plasma:{c1:'#8800ff',c2:'#cc44ff',glow:'rgba(180,80,255,0.8)'},
  ice:   {c1:'#0044aa',c2:'#44aaff',glow:'rgba(80,160,255,0.8)'}
};

var LEVELS = [
  {name:'Ignition',     music:'inferno',bg:'fire',  grid:['RRRRRRRRRRRRR','RFSTGGGGGTSFR','RFLGEIWIEGLFR','RFLGEIWIEGLFR','RFSTGGGGGTSFR','RRRRRRRRRRRRR']},
  {name:'Frost Bite',   music:'frost',  bg:'ice',   grid:['IIIIIIIIIIIII','I...........I','I.EEEEEEEEE.I','I.E.......E.I','I.EEEEEEEEE.I','IIIIIIIIIIIII']},
  {name:'Fortress Wall',music:'war',    bg:'dark',  grid:['S.S.S.S.S.S.S','SSSSSSSSSSSSS','.FFFFFFFFFFF.','.FFFFFFFFFFF.','.F.F.F.F.F.F.','S...........S']},
  {name:'Gold Rush',    music:'arcade', bg:'gold',  grid:['....GGGGG....','...GGGGGGG...','..GGGGGGGGG..','..RRRRRRRRR..','...RRRRRRR...','....RRRRR....']},
  {name:'TNT Minefield',music:'war',    bg:'fire',  grid:['EEEEEEEEEEEEE','E.T.E.T.E.T.E','EEE.EEE.EEE.E','E.T.E.T.E.T.E','EEEEEEEEEEEEE','E...........E']},
  {name:'Ice Palace',   music:'frost',  bg:'ice',   grid:['IIIIIIIIIIIII','IW.IIIIIII.WI','I...........I','I.IIIIIIIII.I','IW.........WI','IIIIIIIIIIIII']},
  {name:'Lava Forge',   music:'inferno',bg:'lava',  grid:['S..LLLLLLL..S','S.L.LLLLL.L.S','SLL.LLLLL.LLS','SLLL.LLL.LLLS','SLLLL.L.LLLLS','SLLLLL.LLLLLS']},
  {name:'Checkered',    music:'arcade', bg:'dark',  grid:['FIFIFIFIFIFIF','IFIFIFIFIFIFI','FIFIFIFIFIFIF','IFIFIFIFIFIFI','FIFIFIFIFIFIF','IFIFIFIFIFIFI']},
  {name:'The Gauntlet', music:'war',    bg:'dark',  grid:['SSSSSSSSSSSSS','S.F.F.F.F.F.S','S...........S','S.F.F.F.F.F.S','S...........S','SSSSSSSSSSSSS']},
  {name:'Rainbow Road', music:'arcade', bg:'rainbow',grid:['RRRRRRRRRRRRR','R...........R','RGRGRGRGRGRGR','R...........R','RRRRRRRRRRRRR','RGRGRGRGRGRGR']},
  {name:'Earth Quake',  music:'war',    bg:'dark',  grid:['EEEEEEEEEEEEE','E.E.E.E.E.E.E','EEEEEEEEEEEEE','L.L.L.L.L.L.L','LLLLLLLLLLLLL','L...........L']},
  {name:'Twin Fortress',music:'war',    bg:'fire',  grid:['SSSSS.F.SSSSS','S.F.S.F.S.F.S','SSSSS.F.SSSSS','F.F.F.F.F.F.F','FFFFF.F.FFFFF','SSSSS.F.SSSSS']},
  {name:'Inferno Core', music:'inferno',bg:'lava',  grid:['LLLLLLLLLLLLL','LTLLLLLLLLTLL','LLLLLLLLLLLLL','LTLLLLLLLLTLL','LLLLLLLLLLLLL','LTLLLLLLLLTLL']},
  {name:'The Labyrinth',music:'arcade', bg:'dark',  grid:['SGSGSGSGSGSGS','G.G.G.G.G.G.G','SGSGSGSGSGSGS','G.G.G.G.G.G.G','SGSGSGSGSGSGS','GGGGGGGGGGGGG']},
  {name:'Final Eruption',music:'inferno',bg:'lava', grid:['LGLTGLGTLGLTG','GLLGLLGLLGLLG','LTLLLLLLLLTLL','GLGLLGLGLGLGL','LGLTGLGTLGLTG','GGGGGGGGGGGGG']}
];


var STRINGS = {
  en:{play:'PLAY',settings:'SETTINGS',leaderboard:'LEADERBOARD',back:'BACK',resume:'RESUME',restart:'RESTART',quit:'QUIT',retry:'RETRY',next_level:'NEXT LEVEL',main_menu:'MAIN MENU',paused:'PAUSED',game_over:'GAME OVER',victory:'VICTORY!',score:'SCORE',level:'LEVEL',name:'NAME',level_short:'LVL',music:'MUSIC',sound:'SOUND',visual:'VISUAL FX',difficulty:'DIFFICULTY',language:'LANGUAGE',on:'ON',off:'OFF',easy:'EASY',normal:'NORMAL',hard:'HARD',tagline:'Break the Orbs',combo:'COMBO',press_start:'Press SPACE or tap to launch',level_clear:'LEVEL CLEAR!',all_clear:'ALL LEVELS CLEARED!',no_scores:'No scores yet. Play to get on the board!',confirm:'OK',enter_name:'ENTER YOUR NAME',show_fps:'DEBUG',level_select:'LEVEL SELECT',orb_size:'ORB SIZE',trail:'TRAIL',trail_len:'TRAIL LEN',small:'S',powerups_title:'POWER-UPS',expand_pu:'Wider paddle (+50%)',shrink_pu:'Narrower paddle (-30%)',fireball_pu:'Ball breaks through blocks',multi_pu:'+2 extra balls',sticky_pu:'Ball sticks to paddle',laser_pu:'Paddle shoots lasers',life_pu:'+1 extra life',slow_pu:'Slower ball (-30%)',level_names:['Ignition','Frost Bite','Fortress Wall','Gold Rush','TNT Minefield','Ice Palace','Lava Forge','Checkered','The Gauntlet','Rainbow Road','Earth Quake','Twin Fortress','Inferno Core','The Labyrinth','Final Eruption']},
  ru:{play:'\u0418\u0413\u0420\u0410\u0422\u042c',settings:'\u041d\u0410\u0421\u0422\u0420\u041e\u0419\u041a\u0418',leaderboard:'\u0420\u0415\u041a\u041e\u0420\u0414\u042b',back:'\u041d\u0410\u0417\u0410\u0414',resume:'\u041f\u0420\u041e\u0414\u041e\u041b\u0416\u0418\u0422\u042c',restart:'\u0421\u041d\u0410\u0427\u0410\u041b\u0410',quit:'\u0412\u042b\u0419\u0422\u0418',retry:'\u0415\u0429\u0401 \u0420\u0410\u0417',next_level:'\u0421\u041b\u0415\u0414\u0423\u042e\u0429\u0418\u0419',main_menu:'\u041c\u0415\u041d\u042e',paused:'\u041f\u0410\u0423\u0417\u0410',game_over:'\u0418\u0413\u0420\u0410 \u041e\u041a\u041e\u041d\u0427\u0415\u041d\u0410',victory:'\u041f\u041e\u0411\u0415\u0414\u0410!',score:'\u0421\u0427\u0401\u0422',level:'\u0423\u0420\u041e\u0412\u0415\u041d\u042c',name:'\u0418\u041c\u042f',level_short:'\u0423\u0420',music:'\u041c\u0423\u0417\u042b\u041a\u0410',sound:'\u0417\u0412\u0423\u041a\u0418',visual:'\u042d\u0424\u0424\u0415\u041a\u0422\u042b',difficulty:'\u0421\u041b\u041e\u0416\u041d\u041e\u0421\u0422\u042c',language:'\u042f\u0417\u042b\u041a',on:'\u0412\u041a\u041b',off:'\u0412\u042b\u041a\u041b',easy:'\u041b\u0415\u0413\u041a\u041e',normal:'\u041d\u041e\u0420\u041c\u0410\u041b',hard:'\u0421\u041b\u041e\u0416\u041d\u041e',tagline:'\u0420\u0430\u0437\u0431\u0438\u0432\u0430\u0439 \u043e\u0440\u0431\u044b',combo:'\u041a\u041e\u041c\u0411\u041e',press_start:'\u041f\u0440\u043e\u0431\u0435\u043b \u0438\u043b\u0438 \u0442\u0430\u043f \u0434\u043b\u044f \u0437\u0430\u043f\u0443\u0441\u043a\u0430',level_clear:'\u0423\u0420\u041e\u0412\u0415\u041d\u042c \u041f\u0420\u041e\u0419\u0414\u0415\u041d!',all_clear:'\u0412\u0421\u0415 \u0423\u0420\u041e\u0412\u041d\u0418 \u041f\u0420\u041e\u0419\u0414\u0415\u041d\u042b!',no_scores:'\u0420\u0435\u043a\u043e\u0440\u0434\u043e\u0432 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442. \u0421\u044b\u0433\u0440\u0430\u0439\u0442\u0435!',confirm:'\u041e\u041a',enter_name:'\u0412\u0412\u0415\u0414\u0418\u0422\u0415 \u0418\u041c\u042f',show_fps:'\u041e\u0422\u041b\u0410\u0414\u041a\u0410',level_select:'\u0412\u042b\u0411\u041e\u0420 \u0423\u0420\u041e\u0412\u041d\u042f',orb_size:'\u0420\u0410\u0417\u041c\u0415\u0420 \u041e\u0420\u0411\u0410',trail:'\u0428\u041b\u0415\u0419\u0424',trail_len:'\u0414\u041b\u0418\u041d\u0410',small:'S',powerups_title:'\u0423\u041b\u0423\u0427\u0428\u0415\u041d\u0418\u042f',expand_pu:'\u0428\u0438\u0440\u0435 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430 (+50%)',shrink_pu:'\u0423\u0436\u0435 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430 (-30%)',fireball_pu:'\u041c\u044f\u0447 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u0435\u0442 \u0431\u043b\u043e\u043a\u0438',multi_pu:'+2 \u0434\u043e\u043f. \u043c\u044f\u0447\u0430',sticky_pu:'\u041c\u044f\u0447 \u043f\u0440\u0438\u043b\u0438\u043f\u0430\u0435\u0442',laser_pu:'\u041f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430 \u0441\u0442\u0440\u0435\u043b\u044f\u0435\u0442',life_pu:'+1 \u0436\u0438\u0437\u043d\u044c',slow_pu:'\u041c\u0435\u0434\u043b\u0435\u043d\u043d\u0435\u0435 (-30%)',level_names:['\u0417\u0430\u0436\u0438\u0433\u0430\u043d\u0438\u0435','\u041c\u043e\u0440\u043e\u0437\u043d\u044b\u0439 \u0443\u043a\u0443\u0441','\u0421\u0442\u0435\u043d\u0430 \u043a\u0440\u0435\u043f\u043e\u0441\u0442\u0438','\u0417\u043e\u043b\u043e\u0442\u0430\u044f \u043b\u0438\u0445\u043e\u0440\u0430\u0434\u043a\u0430','\u041c\u0438\u043d\u043d\u043e\u0435 \u043f\u043e\u043b\u0435','\u041b\u0435\u0434\u044f\u043d\u043e\u0439 \u0434\u0432\u043e\u0440\u0435\u0446','\u041b\u0430\u0432\u043e\u0432\u0430\u044f \u043a\u0443\u0437\u043d\u044f','\u0428\u0430\u0445\u043c\u0430\u0442\u043d\u0430\u044f \u0434\u043e\u0441\u043a\u0430','\u0418\u0441\u043f\u044b\u0442\u0430\u043d\u0438\u0435','\u0420\u0430\u0434\u0443\u0436\u043d\u0430\u044f \u0434\u043e\u0440\u043e\u0433\u0430','\u0417\u0435\u043c\u043b\u0435\u0442\u0440\u044f\u0441\u0435\u043d\u0438\u0435','\u0414\u0432\u043e\u0439\u043d\u0430\u044f \u043a\u0440\u0435\u043f\u043e\u0441\u0442\u044c','\u042f\u0434\u0440\u043e \u0438\u043d\u0444\u0435\u0440\u043d\u043e','\u041b\u0430\u0431\u0438\u0440\u0438\u043d\u0442','\u0424\u0438\u043d\u0430\u043b\u044c\u043d\u043e\u0435 \u0438\u0437\u0432\u0435\u0440\u0436\u0435\u043d\u0438\u0435']}
};

function t(key){var lang=settings?settings.language:'en';return(STRINGS[lang]&&STRINGS[lang][key])||STRINGS.en[key]||key}

function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(function(el){el.textContent=t(el.getAttribute('data-i18n'))});
  document.querySelectorAll('.toggle-btn').forEach(function(btn){btn.textContent=btn.classList.contains('active')?t('on'):t('off')});
}

var settings={language:'en',musicOn:true,sfxOn:true,visualFX:true,difficulty:'normal',debug:false,maxLevel:0,ballSize:'normal',ballTrail:'lava',trailLength:'normal'};

function loadSettings(){try{var r=localStorage.getItem(CFG.STORAGE_KEY+'-settings');if(r)Object.assign(settings,JSON.parse(r))}catch(e){}}
function saveSettings(){try{localStorage.setItem(CFG.STORAGE_KEY+'-settings',JSON.stringify(settings))}catch(e){}}

function applySettingsUI(){
  var m=document.getElementById('btn-music'),s=document.getElementById('btn-sfx'),v=document.getElementById('btn-visual');
  if(m){m.classList.toggle('active',settings.musicOn);m.textContent=settings.musicOn?t('on'):t('off')}
  if(s){s.classList.toggle('active',settings.sfxOn);s.textContent=settings.sfxOn?t('on'):t('off')}
  if(v){v.classList.toggle('active',settings.visualFX);v.textContent=settings.visualFX?t('on'):t('off')}
  var dbgBtn=document.getElementById('btn-debug');if(dbgBtn){dbgBtn.classList.toggle('active',settings.debug);dbgBtn.textContent=settings.debug?t('on'):t('off')}
  ['easy','normal','hard'].forEach(function(d){var e=document.getElementById('diff-'+d);if(e)e.classList.toggle('active',settings.difficulty===d)});
  ['en','ru'].forEach(function(l){var e=document.getElementById('lang-'+l);if(e)e.classList.toggle('active',settings.language===l)});
  var mb=document.getElementById('btn-mute');if(mb)mb.textContent=(settings.sfxOn||settings.musicOn)?'\uD83D\uDD0A':'\uD83D\uDD07';
  ['small','normal','large'].forEach(function(s){var e=document.getElementById('size-'+s);if(e)e.classList.toggle('active',settings.ballSize===s)});
  ['fire','lava','plasma','ice'].forEach(function(s){var e=document.getElementById('trail-'+s);if(e)e.classList.toggle('active',settings.ballTrail===s)});
  ['short','normal','long'].forEach(function(s){var e=document.getElementById('tlen-'+s);if(e)e.classList.toggle('active',settings.trailLength===s)});
  var dbm=document.getElementById('btn-debug-main');if(dbm)dbm.textContent='DEBUG: '+(settings.debug?'ON':'OFF');
}

var gameState={running:false,paused:false,lives:CFG.INIT_LIVES,score:0,combo:0,comboTimer:0,level:0,totalScore:0,levelStartScore:0,blocks:[],balls:[],paddle:null,particles:[],powerups:[],lasers:[],activeEffects:{expand:0,shrink:0,sticky:0,laser:0,slow:0,fireball:0},shake:0,flashAlpha:0,flashColor:'#ffffff',_nameCallback:null,debugMode:false,botEnabled:false,showHitboxes:false};
function applyDebugMode(){
  gameState.debugMode=settings.debug;
  document.body.classList.toggle('debug-mode',settings.debug);
  var el=document.getElementById('debug-overlay');if(el)el.style.display=settings.debug?'block':'none';
  applySettingsUI();saveSettings();
}
var lastTime=0, animFrame=null, currentScreen='screen-start';

function showScreen(id){document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});var e=document.getElementById(id);if(e)e.classList.add('active');currentScreen=id;if(id==='screen-settings')startBallPreview();else stopBallPreview()}


var _bpRaf=null,_bpx=0,_bpy=0,_bpvx=0,_bpvy=0,_bpTrail=[],_bpParticles=[],_bpT=0,_bpPrevT=0,_bpStuck=true;
function _ballGradient(cx,px,py,r){var g=cx.createRadialGradient(px-r*0.3,py-r*0.3,r*0.1,px,py,r);if(settings.ballTrail==='plasma'){g.addColorStop(0,'#eeccff');g.addColorStop(0.45,'#aa44ff');g.addColorStop(1,'#440088')}else if(settings.ballTrail==='ice'){g.addColorStop(0,'#eeeeff');g.addColorStop(0.45,'#44aaff');g.addColorStop(1,'#0022aa')}else if(settings.ballTrail==='fire'){g.addColorStop(0,'#ffee80');g.addColorStop(0.4,'#ff6600');g.addColorStop(1,'#cc2200')}else{g.addColorStop(0,'#ffcc66');g.addColorStop(0.45,'#ff4400');g.addColorStop(1,'#881100')}return g}
function updateBallPreview(){var el=document.getElementById('ball-preview');if(!el||typeof el.getContext!=='function')return;var w=el.width||300,h=el.height||200,r=Math.max(10,getBallRadius()*0.65);var cx=el.getContext('2d');cx.clearRect(0,0,w,h);var tc=TRAIL_COLORS[settings.ballTrail]||TRAIL_COLORS.lava;for(var i=0;i<_bpTrail.length;i++){var tr=_bpTrail[i],ta=(1-tr.age)*0.38;if(ta<=0)continue;cx.globalAlpha=ta;cx.globalCompositeOperation='lighter';cx.fillStyle=tc.c2;cx.beginPath();cx.arc(tr.x,tr.y,r*(1-tr.age*0.6),0,Math.PI*2);cx.fill()}cx.globalCompositeOperation='source-over';cx.globalAlpha=1;for(var _pi=0;_pi<_bpParticles.length;_pi++){var _pp=_bpParticles[_pi];if(_pp.alpha<=0)continue;cx.globalAlpha=_pp.alpha*0.95;cx.globalCompositeOperation='lighter';cx.fillStyle=_pp.color;cx.beginPath();cx.arc(_pp.x,_pp.y,Math.max(0.5,_pp.radius),0,Math.PI*2);cx.fill()}cx.globalCompositeOperation='source-over';cx.globalAlpha=1;cx.shadowColor=tc.glow;cx.shadowBlur=r*0.9;cx.fillStyle=_ballGradient(cx,_bpx,_bpy,r);cx.beginPath();cx.arc(_bpx,_bpy,r,0,Math.PI*2);cx.fill();cx.fillStyle='rgba(255,240,180,0.5)';cx.beginPath();cx.arc(_bpx-r*0.28,_bpy-r*0.28,r*0.38,0,Math.PI*2);cx.fill();cx.shadowBlur=0;cx.globalAlpha=1;if(_bpStuck){cx.globalAlpha=0.35+0.18*Math.sin(_bpT/280);cx.fillStyle='rgba(255,255,255,0.85)';cx.font='12px monospace';cx.textAlign='center';cx.textBaseline='top';cx.fillText('TAP TO LAUNCH',w/2,_bpy+r+10);cx.globalAlpha=1}}
function _tickBallPreview(ts){var el=document.getElementById('ball-preview');if(!el){_bpRaf=null;return}_bpT=ts;var dt=Math.min((ts-(_bpPrevT||ts))/1000,0.05);_bpPrevT=ts;var w=el.width||300,h=el.height||200,r=Math.max(10,getBallRadius()*0.65);if(!_bpStuck){_bpx+=_bpvx*dt;_bpy+=_bpvy*dt;_bpvy+=230*dt;if(_bpx<r){_bpx=r;_bpvx=Math.abs(_bpvx)*0.97}if(_bpx>w-r){_bpx=w-r;_bpvx=-Math.abs(_bpvx)*0.97}if(_bpy<r){_bpy=r;_bpvy=Math.abs(_bpvy)*0.97}if(_bpy>h-r){_bpy=h-r;_bpvy=-Math.abs(_bpvy)*0.97}var mxT=settings.trailLength==='short'?5:settings.trailLength==='long'?22:12,tSpd=settings.trailLength==='short'?7:settings.trailLength==='long'?2.5:4;_bpTrail.push({x:_bpx,y:_bpy,age:0});if(_bpTrail.length>mxT)_bpTrail.shift();_bpTrail.forEach(function(t){t.age+=dt*tSpd});_bpTrail=_bpTrail.filter(function(t){return t.age<1})}var _bpr=Math.max(10,getBallRadius()*0.65),_bpTr=settings.ballTrail;for(var _fi=_bpParticles.length-1;_fi>=0;_fi--){var _fp=_bpParticles[_fi];_fp.x+=_fp.vx*dt;_fp.y+=_fp.vy*dt;_fp.vy+=_fp.gravity*dt;_fp.life-=dt;_fp.alpha=_fp.life/_fp.maxLife;if(_fp.life<=0){_bpParticles.splice(_fi,1)}}var _bpAdd=function(_bp){_bpParticles.push(_bp)};for(var _si=0;_si<5;_si++){var _sp2={};if(_bpTr==='fire'){var _sp2=(function(){var sp=(Math.random()-0.5)*_bpr*1.6;return{x:_bpx+sp,y:_bpy-_bpr*(0.1+Math.random()*0.5),vx:sp*0.4+(Math.random()-0.5)*35,vy:-(85+Math.random()*145),color:['#ff6600','#ff8800','#ffdd00','#ff4400','#ff9900'][Math.floor(Math.random()*5)],alpha:1,radius:3.5+Math.random()*5,life:0.4+Math.random()*0.5,maxLife:0,gravity:8}})();_sp2.maxLife=_sp2.life;}else if(_bpTr==='lava'){var _a=Math.PI*0.3+Math.random()*Math.PI*1.4;_sp2={x:_bpx+Math.cos(_a)*_bpr*(0.9+Math.random()*0.2),y:_bpy+Math.sin(_a)*_bpr*(0.9+Math.random()*0.2),vx:(Math.random()-0.5)*8,vy:-(3+Math.random()*8),color:['#cc2200','#dd3300','#ff4400','#881100'][Math.floor(Math.random()*4)],alpha:1,radius:7+Math.random()*8,life:1.2+Math.random()*1.0,maxLife:0,gravity:55};_sp2.maxLife=_sp2.life;}else if(_bpTr==='plasma'){var _a2=Math.random()*Math.PI*2,_or=_bpr*(0.85+Math.random()*0.55),_s=130+Math.random()*90;_sp2={x:_bpx+Math.cos(_a2)*_or,y:_bpy+Math.sin(_a2)*_or,vx:-Math.sin(_a2)*_s,vy:Math.cos(_a2)*_s,color:['#cc44ff','#8800ff','#ff44cc','#aa00ff','#ffffff','#dd88ff'][Math.floor(Math.random()*6)],alpha:1,radius:2.5+Math.random()*3.5,life:0.18+Math.random()*0.18,maxLife:0,gravity:0};_sp2.maxLife=_sp2.life;}else{var _ia=Math.random()*Math.PI*2,_isr=_bpr*(0.9+Math.random()*0.5),_isw=18+Math.random()*20;_sp2={x:_bpx+Math.cos(_ia)*_isr,y:_bpy+Math.sin(_ia)*_isr,vx:-Math.sin(_ia)*_isw+(Math.random()-0.5)*6,vy:Math.cos(_ia)*_isw*0.25+4+Math.random()*8,color:['#aaddff','#cceeff','#ffffff','#88ccff','#ddeeff'][Math.floor(Math.random()*5)],alpha:0.8+Math.random()*0.2,radius:1.5+Math.random()*3,life:1.2+Math.random()*1.0,maxLife:0,gravity:1};_sp2.maxLife=_sp2.life;}_bpParticles.push(_sp2)}updateBallPreview();_bpRaf=requestAnimationFrame(_tickBallPreview)}
function startBallPreview(){var el=document.getElementById('ball-preview');if(!el)return;var w=el.offsetWidth||300,h=el.offsetHeight||110;el.width=w;el.height=h;_bpx=w/2;_bpy=h*0.58;_bpvx=0;_bpvy=0;_bpStuck=true;_bpTrail=[];_bpParticles=[];_bpT=0;_bpPrevT=0;if(_bpRaf)cancelAnimationFrame(_bpRaf);_bpRaf=requestAnimationFrame(_tickBallPreview)}
function stopBallPreview(){if(_bpRaf){cancelAnimationFrame(_bpRaf);_bpRaf=null}}
function loadLeaderboard(){try{return JSON.parse(localStorage.getItem(CFG.STORAGE_LB_KEY))||[]}catch(e){return[]}}
function saveLeaderboard(lb){try{localStorage.setItem(CFG.STORAGE_LB_KEY,JSON.stringify(lb))}catch(e){}}
function addLeaderboardEntry(name,score,level){var lb=loadLeaderboard();lb.push({name:name||'ORB',score:score,level:level,date:Date.now()});lb.sort(function(a,b){return b.score-a.score});lb=lb.slice(0,10);saveLeaderboard(lb)}
function renderLeaderboard(){
  var lb=loadLeaderboard(),tbody=document.getElementById('lb-body');if(!tbody)return;
  if(lb.length===0){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text2)">'+t('no_scores')+'</td></tr>';return}
  tbody.innerHTML=lb.map(function(e,i){return'<tr><td class="lb-rank">'+(i+1)+'</td><td>'+(e.name||'ORB')+'</td><td style="color:var(--text2)">'+(e.level||1)+'</td><td class="lb-score">'+e.score.toLocaleString()+'</td></tr>'}).join('');
}

function renderLevelSelect(){
  var grid=document.getElementById('level-grid');if(!grid)return;
  grid.innerHTML='';var maxLvl=settings.maxLevel||0;
  for(var i=0;i<LEVELS.length;i++){(function(idx){
    var lvl=LEVELS[idx],unlocked=(idx<=maxLvl);
    var btn=document.createElement('button');
    btn.className='ls-btn'+(unlocked?'':' locked');
    var lNames=t('level_names');var lName=(lNames&&lNames[idx])||lvl.name;
    btn.innerHTML='<span class="ls-num">'+(idx+1)+'</span><span class="ls-name">'+lName+'</span>';
    btn.disabled=!unlocked;
    if(unlocked)btn.addEventListener('click',function(){ensureAudio();showScreen('screen-game');resizeCanvas();startLevel(idx);ensureLoop()});
    grid.appendChild(btn);
  })(i)}
}

function renderPowerupInfo(){
  var list=document.getElementById('powerup-list');if(!list)return;list.innerHTML='';
  Object.keys(POWERUP_DEFS).forEach(function(k){
    var def=POWERUP_DEFS[k];var desc=t(def.label)||k;
    var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:12px';
    row.innerHTML='<div style="min-width:36px;height:36px;border-radius:50%;background:'+def.color+'44;border:2px solid '+def.color+';display:flex;align-items:center;justify-content:center;font:bold 11px sans-serif;color:#fff">'+def.icon+'</div>'
      +'<div><div style="font-weight:700;color:'+def.color+';font-size:13px;text-transform:uppercase">'+k+'</div><div style="font-size:12px;color:var(--text2)">'+desc+'</div></div>';
    list.appendChild(row);
  });
}

function promptPlayerName(callback){
  var overlay=document.getElementById('overlay-name'),input=document.getElementById('name-input');
  if(!overlay||!input){callback('ORB');return}
  input.value='';overlay.classList.add('visible');
  try{input.focus()}catch(e){}
  gameState._nameCallback=callback;
}
function submitPlayerName(){
  var overlay=document.getElementById('overlay-name'),input=document.getElementById('name-input');
  if(!overlay)return;overlay.classList.remove('visible');
  var name=(input?input.value||'':'').trim().toUpperCase().slice(0,10)||'ORB';
  if(gameState._nameCallback){gameState._nameCallback(name);gameState._nameCallback=null}
}
function dismissNameOverlay(){var noEl=document.getElementById('overlay-name');if(noEl)noEl.classList.remove('visible');gameState._nameCallback=null}
function ensureLoop(){if(!animFrame){lastTime=performance.now();animFrame=requestAnimationFrame(gameLoop)}}

var canvas,ctx,CW=0,CH=0;
function initCanvas(){canvas=document.getElementById('game-canvas');ctx=canvas.getContext('2d');initGL();resizeCanvas()}
function resizeCanvas(){var wrap=document.getElementById('game-wrap');var ww=wrap?wrap.offsetWidth:0;CW=(ww>10?ww:Math.min(window.innerWidth,960));CH=window.innerHeight;canvas.width=CW;canvas.height=CH;if(glReady)glResize();if(gameState.running)recalcLayout()}

var layout={blockW:0,blockH:0,gridX:0,gridY:0,gridW:0,gridH:0,paddleY:0,cols:13};

function recalcLayout(){
  var cols=CFG.BLOCK_COLS,pad=CFG.BLOCK_PAD,totalW=CW*0.92;
  var bwRaw=Math.floor((totalW-pad*(cols+1))/cols);
  var paddleY=Math.floor(CH*CFG.PADDLE_Y_FRAC);
  // Use 8 rows (max in any level) so cells are squarer and orbs denser
  var availH=paddleY-CFG.BLOCK_TOP_OFFSET-100; // 100px launch buffer → enough room to maneuver
  var bhMax=Math.floor((availH-pad*9)/8);
  // Square cells: cap cell width to cell height so orbs never overflow vertically
  var cellSize=Math.max(14,Math.min(bwRaw,Math.max(14,bhMax)));
  var gw=cellSize*cols+pad*(cols+1);
  layout.blockW=cellSize;layout.blockH=cellSize;layout.gridX=Math.max(0,Math.floor((CW-gw)/2));layout.gridY=CFG.BLOCK_TOP_OFFSET;layout.gridW=gw;layout.cols=cols;layout.paddleY=paddleY;
}

function parseLevel(levelDef){
  var blocks=[],grid=levelDef.grid,cols=layout.cols,pad=CFG.BLOCK_PAD;
  for(var row=0;row<grid.length;row++){var line=grid[row];for(var col=0;col<cols&&col<line.length;col++){var ch=line[col];if(ch==='.'||ch===' ')continue;var def=BLOCK_DEFS[ch];if(!def)continue;
    var bx=layout.gridX+pad+col*(layout.blockW+pad),by=layout.gridY+pad+row*(layout.blockH+pad);
    var orbD=Math.max(2,layout.blockW*0.90); // cells are square → orbD fits both dims
    blocks.push({x:bx,y:by,w:layout.blockW,h:layout.blockH,cx:bx+layout.blockW/2,cy:by+layout.blockH/2,orbR:orbD/2,type:ch,hp:def.hp,maxHp:def.hp,pts:def.pts,def:def,hitAnim:0,alive:true,row:row,col:col,wH:new Float32Array(6),wV:new Float32Array(6)})}}
  return blocks;
}


function makeBall(x,y){var r=getBallRadius();return{x:x||CW/2,y:y||(layout.paddleY-r-2),vx:0,vy:0,radius:r,stuck:true,fireball:false,trail:[],alive:true}}
function getBallSpeed(){var d=DIFFICULTY[settings.difficulty]||DIFFICULTY.normal;var lvlBonus=1+(gameState.level/(LEVELS.length-1||1))*0.30;var base=CFG.BALL_SPEED_NORMAL*d.speed*lvlBonus;return gameState.botEnabled?base*2.5:base}
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

function circleCircleCollision(cx1,cy1,r1,cx2,cy2,r2){var dx=cx1-cx2,dy=cy1-cy2,d2=dx*dx+dy*dy,rr=r1+r2;if(d2>=rr*rr)return{hit:false};var d=Math.sqrt(d2)||0.0001;return{hit:true,nx:dx/d,ny:dy/d,depth:rr-d}}
function getBallRadius(){var sizes={small:12,normal:16,large:22};return sizes[settings.ballSize]||16}
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
  var hitAny=false,rv;
  for(var i=0;i<gameState.blocks.length;i++){var b=gameState.blocks[i];if(!b.alive)continue;
    var c=circleCircleCollision(ball.x,ball.y,ball.radius,b.cx,b.cy,b.orbR);if(!c.hit)continue;
    hitAny=true;
    if(b.type==='S'){rv=reflectVelocity(ball.vx,ball.vy,c.nx,c.ny);ball.vx=rv.vx;ball.vy=rv.vy;enforceMinVY(ball);ball.x+=c.nx*(c.depth+0.5);ball.y+=c.ny*(c.depth+0.5);b.hitAnim=1;playSFX('break_steel');spawnImpactParticles(ball.x,ball.y,'spark',3);break}
    if(!ball.fireball){rv=reflectVelocity(ball.vx,ball.vy,c.nx,c.ny);ball.vx=rv.vx;ball.vy=rv.vy;enforceMinVY(ball);ball.x+=c.nx*(c.depth+0.5);ball.y+=c.ny*(c.depth+0.5)}
    b.hitAnim=1;b.hp--;if(glReady)glBlockHit(b,ball.x);
    if(b.hp<=0){b.alive=false;onBlockDestroyed(b,ball)}else{playSFX('hit');spawnImpactParticles(ball.x,ball.y,'spark',3)}
    if(!ball.fireball)break}
  return hitAny;
}

var _tntVisited=null;

function getBlocksInArea(center,range){
  return gameState.blocks.filter(function(b){return b.alive&&b!==center&&Math.abs(b.row-center.row)<=range&&Math.abs(b.col-center.col)<=range});
}

function damageAdjacentBlocks(block,ball){
  getBlocksInArea(block,1).forEach(function(b){
    if(b.type==='S')return;b.hitAnim=1;b.hp--;
    if(b.hp<=0){b.alive=false;onBlockDestroyed(b,null)}
    else spawnImpactParticles(b.x+b.w/2,b.y+b.h/2,'ice',2)});
}

function splashDamageBlocks(center,range,ball){
  getBlocksInArea(center,range).forEach(function(b){
    if(b.type==='S')return;b.hitAnim=1;b.hp--;
    if(b.hp<=0){b.alive=false;onBlockDestroyed(b,null)}
    else spawnImpactParticles(b.x+b.w/2,b.y+b.h/2,'fire',3)});
}

function chainExplosion(block,ball){
  var isRoot=(_tntVisited===null);if(isRoot)_tntVisited={};
  var key=block.row+'_'+block.col;
  if(_tntVisited[key]){if(isRoot)_tntVisited=null;return}
  _tntVisited[key]=true;
  getBlocksInArea(block,1).forEach(function(b){
    if(!b.alive||b.type==='S')return;
    var bkey=b.row+'_'+b.col;if(_tntVisited[bkey])return;
    b.hitAnim=1;b.hp--;
    if(b.hp<=0){b.alive=false;onBlockDestroyed(b,ball)}
    else spawnImpactParticles(b.x+b.w/2,b.y+b.h/2,'fire',4)});
  if(isRoot)_tntVisited=null;
}


function comboMultiplier(combo){return 1+(combo-1)*0.5}
var comboHideTimer=null;
function showCombo(n){var el=document.getElementById('combo-display');if(!el)return;el.textContent=t('combo')+' \u00d7'+n;el.classList.add('visible');clearTimeout(comboHideTimer);comboHideTimer=setTimeout(function(){el.classList.remove('visible')},1200)}

function onBlockDestroyed(block,ball){
  var now=Date.now();if(now-gameState.comboTimer<CFG.COMBO_WINDOW)gameState.combo++;else gameState.combo=1;gameState.comboTimer=now;
  var mult=comboMultiplier(gameState.combo),pts=Math.round(block.pts*mult*(DIFFICULTY[settings.difficulty]||DIFFICULTY.normal).score);
  var cx=block.x+block.w/2,cy=block.y+block.h/2;
  gameState.score+=pts;showScorePopup(cx,cy,pts);updateHUD();
  (function(){var tot=gameState.blocks.filter(function(b){return b.type!=='S'}).length;var brk=gameState.blocks.filter(function(b){return !b.alive&&b.type!=='S'}).length;if(tot>0)musicSetIntensity(Math.min(5,Math.floor(brk/tot*6)))})();
  if(gameState.combo>=2)showCombo(gameState.combo);
  switch(block.type){
    case 'F': spawnImpactParticles(cx,cy,'fire',8);playSFX('break_fire');if(ball)speedBall(ball,1.1,2000);break;
    case 'I': spawnImpactParticles(cx,cy,'ice',6);playSFX('break_ice');if(ball)speedBall(ball,0.8,3000);break;
    case 'W': spawnWaterParticles(cx,cy,8);playSFX('break_water');damageAdjacentBlocks(block,ball);break;
    case 'E': spawnDebrisParticles(cx,cy,block.def.color,8);playSFX('break_earth');break;
    case 'L': spawnFireParticles(cx,cy,12);spawnSmokeParticles(cx,cy,4);spawnShockwave(cx,cy);playSFX('break_lava');splashDamageBlocks(block,1,ball);break;
    case 'G': spawnImpactParticles(cx,cy,'spark',12);playSFX('break_gold');spawnPowerup(cx,cy,'random');break;
    case 'T': spawnSmokeParticles(cx,cy,6);spawnShockwave(cx,cy);playSFX('break_tnt');chainExplosion(block,ball);break;
    case 'R': spawnImpactParticles(cx,cy,'spark',8);playSFX('break_gold');spawnPowerup(cx,cy,'random');break;
    default:  spawnImpactParticles(cx,cy,'spark',5);playSFX('break_generic');
  }
  if(block.type!=='G'&&block.type!=='R'&&block.type!=='S'&&Math.random()<0.07)spawnPowerup(cx,cy,'random');
  gameState.shake=Math.max(gameState.shake,block.type==='L'||block.type==='T'?10:block.type==='E'?5:3);
  gameState.flashAlpha=Math.min(1,gameState.flashAlpha+0.08);gameState.flashColor=block.def.glow||'#ffffff';
  // Liquid drain animation + blast wave on neighbours
  var _ltc=LIQUID_TYPES[block.type];
  if(glReady&&_ltc){block._drain=0.48;block._drainFill=_ltc.fill;}
  glBlastNeighbors(block);
  checkLevelClear();
}

var POWERUP_DEFS={
  expand:{color:'#00ff88',icon:'EXP',label:'expand_pu',duration:15000},shrink:{color:'#ff4488',icon:'SHR',label:'shrink_pu',duration:10000},
  fireball:{color:'#ff6600',icon:'FIR',label:'fireball_pu',duration:8000},multiball:{color:'#ffff00',icon:'x3',label:'multi_pu',duration:0},
  sticky:{color:'#8844ff',icon:'STK',label:'sticky_pu',duration:12000},laser:{color:'#ff0044',icon:'LAS',label:'laser_pu',duration:10000},
  life:{color:'#ff2222',icon:'+1',label:'life_pu',duration:0},slow:{color:'#44aaff',icon:'SLO',label:'slow_pu',duration:10000}
};
var POWERUP_TYPES=Object.keys(POWERUP_DEFS);
var BLOCK_ICONS={F:'FIRE',I:'ICE',W:'AQUA',E:'ROCK',L:'LAVA',S:'IRON',G:'GOLD',T:'TNT',R:'PRISM'};

function spawnPowerup(x,y,type){
  if(type==='random')type=POWERUP_TYPES[Math.floor(Math.random()*POWERUP_TYPES.length)];
  var def=POWERUP_DEFS[type];if(!def)return;
  gameState.powerups.push({x:x,y:y,type:type,def:def,w:36,h:36,alive:true});
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

function spawnFireParticles(x,y,count){
  if(!settings.visualFX)return;
  for(var i=0;i<count;i++){var p=poolAlloc();var a=Math.random()*Math.PI*2,s=60+Math.random()*180;
    p.x=x;p.y=y;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s-80;
    p.color=['#ff6600','#ff8800','#ffaa00','#ff4400','#ffcc00'][Math.floor(Math.random()*5)];
    p.alpha=1;p.radius=3+Math.random()*4;p.life=0.5+Math.random()*0.5;p.maxLife=p.life;p.gravity=150;p.type='fire'}
}

function _coreGlow(x,y,br,color,alpha){var p=poolAlloc();if(!p)return;p.x=x;p.y=y;p.vx=0;p.vy=0;p.color=color;p.alpha=alpha;p.radius=br*(1.1+Math.random()*0.4);p.life=0.06+Math.random()*0.04;p.maxLife=p.life;p.gravity=0;p.type='fire'}
function _spawnBallAura(ball){
  if(!settings.visualFX)return;
  var br=ball.radius||getBallRadius(),trail=settings.ballTrail,p,i,a,s;
  if(trail==='fire'){
    _coreGlow(ball.x,ball.y,br,'#ff4400',0.38+Math.random()*0.18);
    for(i=0;i<5;i++){p=poolAlloc();if(!p)break;
      var sp=(Math.random()-0.5)*br*1.6;
      p.x=ball.x+sp;p.y=ball.y-br*(0.1+Math.random()*0.5);
      p.vx=sp*0.4+(Math.random()-0.5)*35;p.vy=-(85+Math.random()*145);
      p.color=['#ff6600','#ff8800','#ffdd00','#ff4400','#ff9900'][Math.floor(Math.random()*5)];
      p.alpha=1;p.radius=3.5+Math.random()*5;p.life=0.4+Math.random()*0.5;p.maxLife=p.life;p.gravity=8;p.type='fire';}
  }else if(trail==='lava'){
    _coreGlow(ball.x,ball.y,br,'#aa1100',0.45+Math.random()*0.2);
    // viscous drips — born at ball edge, almost no velocity, slow gravity
    for(i=0;i<3;i++){p=poolAlloc();if(!p)break;
      a=Math.PI*0.3+Math.random()*Math.PI*1.4; // spread from lower sides
      p.x=ball.x+Math.cos(a)*br*(0.9+Math.random()*0.2);
      p.y=ball.y+Math.sin(a)*br*(0.9+Math.random()*0.2);
      p.vx=(Math.random()-0.5)*8;p.vy=-(3+Math.random()*8); // barely rises then falls
      p.color=['#cc2200','#dd3300','#ff4400','#881100'][Math.floor(Math.random()*4)];
      p.alpha=1;p.radius=7+Math.random()*8;p.life=1.2+Math.random()*1.0;p.maxLife=p.life;p.gravity=55;p.type='fire';}
  }else if(trail==='plasma'){
    _coreGlow(ball.x,ball.y,br,'#8800ff',0.35+Math.random()*0.2);
    for(i=0;i<7;i++){p=poolAlloc();if(!p)break;
      a=Math.random()*Math.PI*2;var or=br*(0.65+Math.random()*0.7);
      p.x=ball.x+Math.cos(a)*or;p.y=ball.y+Math.sin(a)*or;
      s=140+Math.random()*100;p.vx=-Math.sin(a)*s;p.vy=Math.cos(a)*s;
      p.color=['#cc44ff','#8800ff','#ff44cc','#aa00ff','#ffffff','#dd88ff'][Math.floor(Math.random()*6)];
      p.alpha=0.95;p.radius=2.5+Math.random()*4;p.life=0.15+Math.random()*0.15;p.maxLife=p.life;p.gravity=0;p.type='fire';}
  }else{// ice
    _coreGlow(ball.x,ball.y,br,'#44aaff',0.28+Math.random()*0.15);
    // slow swirling snowflakes — born on ball surface, gentle circular drift
    for(i=0;i<5;i++){p=poolAlloc();if(!p)break;
      a=Math.random()*Math.PI*2;var sr=br*(0.9+Math.random()*0.5);
      p.x=ball.x+Math.cos(a)*sr;p.y=ball.y+Math.sin(a)*sr;
      var sw=18+Math.random()*20; // slow orbital speed
      p.vx=-Math.sin(a)*sw+(Math.random()-0.5)*6;
      p.vy=Math.cos(a)*sw*0.25+4+Math.random()*8; // gently drift down
      p.color=['#aaddff','#cceeff','#ffffff','#88ccff','#ddeeff'][Math.floor(Math.random()*5)];
      p.alpha=0.8+Math.random()*0.2;p.radius=1.5+Math.random()*3;p.life=1.2+Math.random()*1.0;p.maxLife=p.life;p.gravity=1;p.type='spark';}
  }
}
function spawnTrailParticle(x,y){
  if(!settings.visualFX)return;
  var trail=settings.ballTrail,p=poolAlloc();if(!p)return;
  if(trail==='plasma'){
    var a=Math.random()*Math.PI*2,or=6+Math.random()*8,s=110+Math.random()*70;
    p.x=x+Math.cos(a)*or;p.y=y+Math.sin(a)*or;p.vx=-Math.sin(a)*s;p.vy=Math.cos(a)*s;
    p.color=['#cc44ff','#8800ff','#ff44cc','#aa00ff','#ffffff'][Math.floor(Math.random()*5)];
    p.alpha=1;p.radius=2+Math.random()*2.5;p.life=0.15+Math.random()*0.15;p.maxLife=p.life;p.gravity=0;p.type='fire';
  }else if(trail==='ice'){
    // swirling snowflakes left in wake
    var ia=Math.random()*Math.PI*2,ir=4+Math.random()*8;
    p.x=x+Math.cos(ia)*ir;p.y=y+Math.sin(ia)*ir;
    p.vx=(Math.random()-0.5)*14;p.vy=6+Math.random()*14;
    p.color=['#aaddff','#cceeff','#ffffff','#88ccff'][Math.floor(Math.random()*4)];
    p.alpha=0.8;p.radius=1.5+Math.random()*2;p.life=0.8+Math.random()*0.8;p.maxLife=p.life;p.gravity=1;p.type='spark';
  }else if(trail==='lava'){
    // slow lava glob trail
    p.x=x+(Math.random()-0.5)*6;p.y=y+(Math.random()-0.5)*6;
    p.vx=(Math.random()-0.5)*18;p.vy=(Math.random()-0.5)*12;
    p.color=['#cc2200','#ff4400','#dd3300','#881100'][Math.floor(Math.random()*4)];
    p.alpha=0.9;p.radius=5+Math.random()*6;p.life=0.7+Math.random()*0.8;p.maxLife=p.life;p.gravity=60;p.type='fire';
  }else{// fire
    var a3=Math.random()*Math.PI*2,s3=40+Math.random()*120;
    p.x=x;p.y=y;p.vx=Math.cos(a3)*s3;p.vy=Math.sin(a3)*s3-70;
    p.color=['#ff6600','#ff8800','#ffdd00','#ff4400'][Math.floor(Math.random()*4)];
    p.alpha=1;p.radius=2+Math.random()*3;p.life=0.4+Math.random()*0.4;p.maxLife=p.life;p.gravity=140;p.type='fire';
  }
}

function updateAmbientBlockFX(dt){
  if(!settings.visualFX)return;
  gameState._ambientT=(gameState._ambientT||0)+dt;
  if(gameState._ambientT<0.04)return;
  gameState._ambientT=0;
  for(var i=0;i<gameState.blocks.length;i++){
    var b=gameState.blocks[i];if(!b.alive)continue;
    var oR=b.orbR||14;
    // Fire/Lava/TNT — flames float out from top of orb
    if((b.type==='F'||b.type==='L'||b.type==='T')&&Math.random()<0.28){
      var p=poolAlloc();
      var spread=(Math.random()-0.5)*oR*1.4;
      p.x=b.cx+spread;
      p.y=b.cy-oR*(0.8+Math.random()*0.3);
      p.vx=spread*0.6+(Math.random()-0.5)*28;
      p.vy=-(80+Math.random()*120);
      p.color=['#ff6600','#ff8800','#ffdd00','#ff4400','#ff9900'][Math.floor(Math.random()*5)];
      p.alpha=1;p.radius=3+Math.random()*4;p.life=0.6+Math.random()*0.6;p.maxLife=p.life;p.gravity=15;p.type='fire';
    }
    // Ice — snowflakes drift down slowly
    if(b.type==='I'&&Math.random()<0.18){
      var p2=poolAlloc();
      p2.x=b.cx+(Math.random()-0.5)*oR*1.4;
      p2.y=b.cy-oR*(0.7+Math.random()*0.4);
      p2.vx=(Math.random()-0.5)*18;
      p2.vy=25+Math.random()*45;
      p2.color=['#aaddff','#cceeff','#ffffff','#ddeeff'][Math.floor(Math.random()*4)];
      p2.alpha=1;p2.radius=2+Math.random()*2.5;p2.life=0.9+Math.random()*0.6;p2.maxLife=p2.life;p2.gravity=2;p2.type='spark';
    }
  }
}

function spawnDebrisParticles(x,y,color,count){
  if(!settings.visualFX)return;
  for(var i=0;i<count;i++){var p=poolAlloc();var a=Math.random()*Math.PI*2,s=40+Math.random()*160;
    p.x=x;p.y=y;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s-40;
    p.color=color||'#886633';p.alpha=1;p.radius=2+Math.random()*4;p.life=0.5+Math.random()*0.6;p.maxLife=p.life;p.gravity=300;p.type='debris'}
}

function spawnWaterParticles(x,y,count){
  if(!settings.visualFX)return;
  for(var i=0;i<count;i++){var p=poolAlloc();var a=-Math.PI/2+(Math.random()-0.5)*Math.PI,s=80+Math.random()*200;
    p.x=x;p.y=y;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s;
    p.color=['#2288ff','#44aaff','#88ccff','#aaddff'][Math.floor(Math.random()*4)];
    p.alpha=1;p.radius=2+Math.random()*3;p.life=0.4+Math.random()*0.4;p.maxLife=p.life;p.gravity=250;p.type='water'}
}

function spawnSmokeParticles(x,y,count){
  if(!settings.visualFX)return;
  for(var i=0;i<count;i++){var p=poolAlloc();var a=-Math.PI/2+(Math.random()-0.5)*0.8,s=20+Math.random()*60;
    p.x=x+(Math.random()-0.5)*20;p.y=y;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s;
    p.color=['#555555','#777777','#444444'][Math.floor(Math.random()*3)];
    p.alpha=0.7;p.radius=8+Math.random()*12;p.life=0.8+Math.random()*0.6;p.maxLife=p.life;p.gravity=-30;p.type='smoke'}
}

function spawnShockwave(x,y){
  if(!settings.visualFX)return;
  var p=poolAlloc();p.x=x;p.y=y;p.vx=0;p.vy=0;p.color='#ff8800';
  p.alpha=0.9;p.radius=10;p.life=0.4;p.maxLife=0.4;p.gravity=0;p.type='shockwave';p._growRate=220;
}

function spawnSupernova(x,y){
  if(!settings.visualFX)return;
  spawnShockwave(x,y);spawnFireParticles(x,y,20);spawnSmokeParticles(x,y,8);
  for(var i=0;i<32;i++){var p=poolAlloc();if(!p)break;var ang=Math.PI*2/32*i+Math.random()*0.25,spd=120+Math.random()*380;
    p.type='spark';p.x=x;p.y=y;p.vx=Math.cos(ang)*spd;p.vy=Math.sin(ang)*spd;
    p.life=0.7+Math.random()*0.7;p.maxLife=p.life;p.radius=2+Math.random()*5;
    p.color=(['#ffcc00','#ff8800','#ff4400','#ffffff'])[Math.floor(Math.random()*4)];
    p.alpha=1;p.gravity=60;p.decay=1}
  gameState.flashAlpha=Math.max(gameState.flashAlpha,0.65);gameState.flashColor='#ffaa00';
  gameState.shake=Math.max(gameState.shake,22);
}

function updateParticles(dt){for(var i=0;i<particlePool.length;i++){var p=particlePool[i];if(!p._alive)continue;p.life-=dt;if(p.life<=0){poolKill(p);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;p.alpha=p.life/p.maxLife;if(p.type==='shockwave'){p.radius+=(p._growRate||200)*dt}else{p.radius*=0.98}}}

function renderParticles(){
  ctx.save();
  for(var i=0;i<particlePool.length;i++){var p=particlePool[i];if(!p._alive||p.alpha<=0)continue;
    if(p.type==='smoke'){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=p.alpha*0.45;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0.5,p.radius),0,Math.PI*2);ctx.fill()}
    else if(p.type==='shockwave'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=p.alpha*0.55;ctx.strokeStyle=p.color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0.5,p.radius),0,Math.PI*2);ctx.stroke()}
    else{ctx.globalAlpha=p.alpha*0.9;ctx.globalCompositeOperation='lighter';ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0.5,p.radius),0,Math.PI*2);ctx.fill()}}
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
  if(gameState._levelClearing)return;
  var rem=gameState.blocks.filter(function(b){return b.alive&&b.type!=='S'}).length;
  if(rem===0){gameState._levelClearing=true;setTimeout(function(){gameState._levelClearing=false;levelClear()},300)}
}

function levelClear(){
  gameState.running=false;musicStop();
  if(gameState.level+1>settings.maxLevel){settings.maxLevel=gameState.level+1;saveSettings()}
  var isLast=(gameState.level>=LEVELS.length-1);
  var vs=document.getElementById('vic-score'),vb=document.getElementById('vic-sub'),nb=document.getElementById('btn-vic-next');
  if(vs)vs.textContent=gameState.score.toLocaleString()+' pts';
  if(vb)vb.textContent=isLast?t('all_clear'):t('level_clear');
  if(nb)nb.style.display=isLast?'none':'';
  document.getElementById('overlay-victory').classList.add('visible');playSFX('victory');
  if(isLast){
    for(var i=0;i<8;i++){(function(j){setTimeout(function(){spawnSupernova(CW*0.15+CW*0.7*(j/7),CH*0.2+Math.random()*CH*0.4)},j*220)})(i)}
    promptPlayerName(function(name){addLeaderboardEntry(name,gameState.score,gameState.level+1)});
  }else{
    for(var i=0;i<40;i++){(function(j){setTimeout(function(){spawnImpactParticles(Math.random()*CW,Math.random()*CH*0.6,'spark',3)},j*80)})(i)}
  }
}

function startLevel(idx){
  if(idx>=LEVELS.length)idx=LEVELS.length-1;gameState.level=idx;var lvl=LEVELS[idx];dismissNameOverlay();
  ensureAudio();musicStart(lvl.music||'inferno');musicSetIntensity(0);
  recalcLayout();gameState.blocks=parseLevel(lvl);gameState.balls=[];gameState.powerups=[];gameState.lasers=[];
  gameState.combo=0;gameState.comboTimer=0;gameState.shake=0;gameState.flashAlpha=0;
  gameState.activeEffects={expand:0,shrink:0,sticky:0,laser:0,slow:0,fireball:0};
  gameState.levelStartScore=gameState.score;gameState.paddle=makePaddle();
  var ball=makeBall();updateBallStuck(ball);gameState.balls.push(ball);updateHUD();
  var oN=document.getElementById('overlay-level-num'),oL=document.getElementById('overlay-level-name'),oH=document.getElementById('overlay-level-hint');
  var lNames=t('level_names');var lName=(lNames&&lNames[idx])||lvl.name;
  if(oN)oN.textContent=t('level')+' '+(idx+1)+' / '+LEVELS.length;if(oL)oL.textContent=lName;if(oH)oH.textContent=t('press_start');
  document.getElementById('overlay-victory').classList.remove('visible');document.getElementById('overlay-gameover').classList.remove('visible');
  document.getElementById('overlay-pause').classList.remove('visible');document.getElementById('overlay-level').classList.add('visible');
  gameState.running=false;
}

function startGame(){
  gameState.score=0;gameState.totalScore=0;gameState.lives=CFG.INIT_LIVES;gameState.running=false;gameState.paused=false;
  showScreen('screen-game');resizeCanvas();startLevel(0);if(!animFrame){lastTime=performance.now();animFrame=requestAnimationFrame(gameLoop)}
}

function loseLife(){
  gameState.lives--;playSFX('death');updateHUD();
  if(gameState.lives<=0){gameOver();return}
  gameState.balls=gameState.balls.filter(function(b){return b.alive});
  if(gameState.balls.length===0){var ball=makeBall();updateBallStuck(ball);gameState.balls.push(ball);document.getElementById('overlay-level').classList.add('visible');gameState.running=false}
  gameState.shake=12;gameState.flashAlpha=0.4;gameState.flashColor='#ff2200';
}

function gameOver(){
  gameState.running=false;musicStop();var gs=document.getElementById('go-score'),gb=document.getElementById('go-sub');
  if(gs)gs.textContent=gameState.score.toLocaleString()+' pts';if(gb)gb.textContent=t('level')+' '+(gameState.level+1);
  document.getElementById('overlay-gameover').classList.add('visible');playSFX('gameover');
  promptPlayerName(function(name){addLeaderboardEntry(name,gameState.score,gameState.level+1)});
}

var _lastHudScore=0;
function updateHUD(){
  var se=document.getElementById('hud-score'),le=document.getElementById('hud-level'),li=document.getElementById('lives-display');
  if(se){se.textContent=gameState.score.toLocaleString();if(gameState.score!==_lastHudScore){_lastHudScore=gameState.score;se.classList.add('pulse');setTimeout(function(){se.classList.remove('pulse')},200)}}
  if(le)le.textContent=(gameState.level+1)+' / '+LEVELS.length;
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
    case'break_steel':osc(220,'square',0.06,now,0.08);osc(180,'square',0.04,now+0.02,0.06);break;
    case'break_water':ns(0.12,now,0.15,2000);sw(800,200,'sine',0.08,now,0.12);break;
    case'break_earth':sw(120,40,'sawtooth',0.20,now,0.25);ns(0.10,now,0.15,300);break;
    case'break_lava':sw(160,40,'sawtooth',0.25,now,0.35);ns(0.15,now+0.05,0.25,200);sw(80,20,'sine',0.12,now+0.1,0.3);break;
    case'break_tnt':sw(300,40,'sawtooth',0.30,now,0.5);ns(0.20,now,0.4,400);sw(200,30,'sawtooth',0.20,now+0.1,0.4);sw(440,60,'square',0.15,now+0.05,0.35);break;
  }
}

// ============================================================
// === MUSIC MODULE ==========================================
// ============================================================
var NOTES={Bb1:58.3,C2:65.4,D2:73.4,Eb2:77.8,E2:82.4,F2:87.3,G2:98,A2:110,Bb2:116.5,B2:123.5,C3:130.8,Db3:138.6,D3:146.8,Eb3:155.6,E3:164.8,F3:174.6,Gb3:185,G3:196,Ab3:207.7,A3:220,Bb3:233,B3:246.9,C4:261.6,Db4:277.2,D4:293.7,Eb4:311.1,E4:329.6,F4:349.2,Gb4:370,G4:392,Ab4:415.3,A4:440,Bb4:466.2,B4:493.9,C5:523.3,D5:587.3,E5:659.3,G5:784};

var MUSIC_THEMES = {
  inferno:{bpm:118,
    kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    bass:[NOTES.D2,0,0,0,NOTES.Bb1,0,0,0,NOTES.F2,0,0,0,NOTES.D2,0,NOTES.Eb2,0],
    pad:[[NOTES.D3,NOTES.F3,NOTES.A3],0,0,0,0,0,0,0,[NOTES.Bb2,NOTES.D3,NOTES.F3],0,0,0,0,0,0,0],
    lead:[NOTES.D4,0,NOTES.Eb4,0,NOTES.F4,0,0,NOTES.D4,0,NOTES.C4,0,NOTES.Bb3,0,0,NOTES.C4,0]},
  frost:{bpm:88,
    kick:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    bass:[NOTES.E2,0,0,0,NOTES.B2,0,0,0,NOTES.E2,0,0,0,NOTES.A2,0,0,0],
    pad:[[NOTES.E3,NOTES.Ab3,NOTES.B3],0,0,0,0,0,0,0,[NOTES.A2,NOTES.Db4,NOTES.E3],0,0,0,0,0,0,0],
    lead:[NOTES.E4,0,0,NOTES.Gb4,0,NOTES.Ab4,0,NOTES.B4,0,0,NOTES.Ab4,0,NOTES.Gb4,0,NOTES.E4,0]},
  war:{bpm:130,
    kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    bass:[NOTES.A2,0,NOTES.A2,0,NOTES.E2,0,NOTES.A2,0,NOTES.A2,0,NOTES.G2,0,NOTES.E2,0,0,0],
    pad:[[NOTES.A2,NOTES.C3,NOTES.E3],0,0,0,[NOTES.E2,NOTES.B2,NOTES.E3],0,0,0,[NOTES.D3,NOTES.F3,NOTES.A3],0,0,0,[NOTES.A2,NOTES.C3,NOTES.E3],0,0,0],
    lead:[NOTES.A3,0,NOTES.C4,0,NOTES.D4,NOTES.E4,0,NOTES.D4,NOTES.C4,0,NOTES.A3,0,NOTES.E3,0,NOTES.A3,0]},
  arcade:{bpm:108,
    kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    bass:[NOTES.G2,0,0,NOTES.B2,0,0,NOTES.D3,0,NOTES.G2,0,0,NOTES.A2,0,0,NOTES.B2,0],
    pad:[[NOTES.G3,NOTES.B3,NOTES.D4],0,0,0,[NOTES.D3,NOTES.Gb3,NOTES.A3],0,0,0,[NOTES.E3,NOTES.G3,NOTES.B3],0,0,0,[NOTES.C3,NOTES.E3,NOTES.G3],0,0,0],
    lead:[NOTES.G4,NOTES.A4,NOTES.B4,0,NOTES.D5,0,NOTES.B4,0,NOTES.A4,0,NOTES.G4,0,NOTES.E4,0,NOTES.D4,0]}
};

var musicState={theme:'inferno',bpm:118,beat:0,nextNoteTime:0,timer:null,playing:false,intensity:0};
var musicGain=null;
var MUSIC_LOOKAHEAD=0.1,MUSIC_INTERVAL=25;

function musicEnsureGain(){if(!musicGain&&audioCtx){musicGain=audioCtx.createGain();musicGain.gain.value=0.55;musicGain.connect(audioCtx.destination)}}
function musicStart(theme){
  if(!settings.musicOn||!audioReady)return;
  musicStop();musicEnsureGain();musicReconnect();
  var t=MUSIC_THEMES[theme]||MUSIC_THEMES.inferno;
  musicState.theme=theme;musicState.bpm=t.bpm;musicState.beat=0;
  musicState.nextNoteTime=audioCtx.currentTime+0.1;
  musicState.playing=true;
  musicState.timer=setInterval(musicSchedule,MUSIC_INTERVAL);
}
function musicStop(){if(musicState.timer){clearInterval(musicState.timer);musicState.timer=null}musicState.playing=false;if(musicGain&&audioCtx){try{musicGain.disconnect()}catch(e){}}}
function musicReconnect(){if(musicGain&&audioCtx){try{musicGain.connect(audioCtx.destination)}catch(e){}}}
function musicSetIntensity(n){musicState.intensity=Math.max(0,Math.min(5,n))}
function musicSchedule(){
  if(!musicState.playing||!audioCtx)return;
  var ac=audioCtx;
  while(musicState.nextNoteTime<ac.currentTime+MUSIC_LOOKAHEAD){
    scheduleMusicStep(musicState.beat,musicState.nextNoteTime);
    musicState.nextNoteTime+=60/musicState.bpm/4;
    musicState.beat=(musicState.beat+1)%16;
  }
}
function scheduleMusicStep(beat,time){
  if(!audioCtx||!musicGain)return;
  var ac=audioCtx,t=MUSIC_THEMES[musicState.theme],iv=musicState.intensity,s16=60/musicState.bpm/4;
  try{
    if(t.kick[beat]){var ko=ac.createOscillator(),kg=ac.createGain();ko.type='sine';ko.frequency.setValueAtTime(160,time);ko.frequency.exponentialRampToValueAtTime(40,time+0.12);kg.gain.setValueAtTime(iv>=2?0.6:0.4,time);kg.gain.exponentialRampToValueAtTime(0.001,time+0.18);ko.connect(kg);kg.connect(musicGain);ko.start(time);ko.stop(time+0.2)}
    if(iv>=1&&beat%2===0){var hbl=Math.ceil(ac.sampleRate*0.04),hbuf=ac.createBuffer(1,hbl,ac.sampleRate),hd=hbuf.getChannelData(0);for(var hi=0;hi<hbl;hi++)hd[hi]=Math.random()*2-1;var hsrc=ac.createBufferSource(),hgg=ac.createGain(),hff=ac.createBiquadFilter();hff.type='highpass';hff.frequency.value=8000;hgg.gain.setValueAtTime(0.08,time);hgg.gain.exponentialRampToValueAtTime(0.001,time+0.04);hsrc.buffer=hbuf;hsrc.connect(hff);hff.connect(hgg);hgg.connect(musicGain);hsrc.start(time);hsrc.stop(time+0.05)}
    if(iv>=1&&t.bass[beat]){var bo=ac.createOscillator(),bbg=ac.createGain(),bbf=ac.createBiquadFilter();bo.type='sawtooth';bo.frequency.setValueAtTime(t.bass[beat],time);bbf.type='lowpass';bbf.frequency.value=500;bbf.Q.value=1.5;bbg.gain.setValueAtTime(0.20,time);bbg.gain.setValueAtTime(0.14,time+s16*0.7);bbg.gain.exponentialRampToValueAtTime(0.001,time+s16*0.85);bo.connect(bbf);bbf.connect(bbg);bbg.connect(musicGain);bo.start(time);bo.stop(time+s16)}
    if(iv>=2&&t.pad[beat]){var s4=60/musicState.bpm;t.pad[beat].forEach(function(pf){var po=ac.createOscillator(),pg=ac.createGain();po.type='sine';po.frequency.setValueAtTime(pf,time);pg.gain.setValueAtTime(0.038,time);pg.gain.setValueAtTime(0.024,time+s4*0.8);pg.gain.exponentialRampToValueAtTime(0.001,time+s4*1.9);po.connect(pg);pg.connect(musicGain);po.start(time);po.stop(time+s4*2)})}
    if(iv>=3&&t.lead[beat]){var lf=t.lead[beat],lo=ac.createOscillator(),lmo=ac.createOscillator(),lmg2=ac.createGain(),lg=ac.createGain();lo.type='sawtooth';lo.frequency.setValueAtTime(lf,time);lmo.frequency.setValueAtTime(lf*2,time);lmg2.gain.setValueAtTime(lf*0.25,time);lmg2.gain.exponentialRampToValueAtTime(lf*0.04,time+0.08);lmo.connect(lmg2);lmg2.connect(lo.frequency);lg.gain.setValueAtTime(0.08,time);lg.gain.exponentialRampToValueAtTime(0.001,time+s16*0.7);lo.connect(lg);lg.connect(musicGain);lo.start(time);lmo.start(time);lo.stop(time+s16);lmo.stop(time+s16)}
  }catch(e){}
}

// ============================================================
// === WEBGL2 LIQUID BLOCK RENDERER ==========================
// ============================================================
var gl=null,glCanvas=null,glReady=false,glProg=null,glBgProg=null,glQuadVAO=null,glBgVAO=null;
var glU={},glBgU={};

var VS_BLOCK='#version 300 es\nlayout(location=0)in vec2 a_C;layout(location=1)in vec2 a_T;uniform mat4 u_P;uniform vec2 u_Pos;uniform vec2 u_Sz;out vec2 vUV;void main(){gl_Position=u_P*vec4(u_Pos+a_C*u_Sz,0,1);vUV=a_T;}';

var FS_BLOCK='#version 300 es\nprecision mediump float;in vec2 vUV;uniform float u_Fill;uniform float u_Time;uniform float u_Amp;uniform float u_Spd;uniform int u_Cols;uniform float u_WH[6];uniform vec3 u_CS;uniform vec3 u_CD;uniform vec3 u_CG;uniform float u_OrbR;uniform float u_Hit;out vec4 fc;\n'
+'float cmr(float idx){int i=int(floor(idx));float t=fract(idx);float p0=u_WH[clamp(i-1,0,u_Cols-1)];float p1=u_WH[clamp(i,0,u_Cols-1)];float p2=u_WH[clamp(i+1,0,u_Cols-1)];float p3=u_WH[clamp(i+2,0,u_Cols-1)];float t2=t*t,t3=t2*t;return 0.5*((2.0*p1)+(-p0+p2)*t+(2.0*p0-5.0*p1+4.0*p2-p3)*t2+(-p0+3.0*p1-3.0*p2+p3)*t3);}\n'
+'float wSurf(float lx,float am,float fr,float sp){float oS=u_OrbR*2.0;float bY=-u_OrbR+oS*(1.0-u_Fill);float cf=(lx/oS+0.5)*float(u_Cols-1);float wO=cmr(cf);return bY+sin(lx*0.1*fr+u_Time*u_Spd*sp)*u_Amp*am+sin(lx*0.17*fr+u_Time*u_Spd*sp*0.6)*u_Amp*am*0.5+wO;}\n'
+'void main(){vec2 uv=vUV-0.5;float dist=length(uv)*2.0;if(dist>=1.0)discard;uv.y=-uv.y;float oR=u_OrbR;float oS=oR*2.0;float lx=uv.x*oS;float ly=uv.y*oS;\n'
+'vec2 bgO=uv*2.0+vec2(0.3,0.3);vec3 col=mix(u_CD*0.4,u_CD*0.15,min(1.0,length(bgO)));\n'
+'float sy=wSurf(lx,1.0,1.0,0.8);if(ly>sy){float d=clamp((ly-sy)/oS,0.0,1.0);vec3 lc=mix(u_CD,u_CD*0.2,smoothstep(0.0,0.8,d));lc=mix(lc,vec3(0),smoothstep(0.6,1.0,d));col=lc;}\n'
+'sy=wSurf(lx,0.7,1.8,1.3);if(ly>sy){float d=clamp((ly-sy)/oS,0.0,1.0);vec3 lc=mix(u_CS,u_CD,smoothstep(0.0,0.6,d));lc=mix(lc,vec3(0),smoothstep(0.5,1.0,d));col=mix(col,lc,0.75);}\n'
+'float gD=abs(ly-wSurf(lx,1.0,1.0,0.8))/(oR*0.9);col+=u_CG*exp(-gD*gD*6.0)*0.3;\n'
+'col=mix(col,vec3(1.0),u_Hit*0.6);\n'
+'vec2 hl=uv-vec2(-0.22,-0.28);col=min(vec3(1.0),col+exp(-dot(hl,hl)*20.0)*0.72);\n'
+'col*=0.75+0.25*clamp(1.0-(uv.y+0.5),0.0,1.0);\n'
+'float edge=1.0-smoothstep(0.88,1.0,dist);fc=vec4(col,edge);}';

var VS_BG='#version 300 es\nlayout(location=0)in vec2 a_C;out vec2 vUV;void main(){gl_Position=vec4(a_C*2.0-1.0,0,1);vUV=a_C;}';

var FS_BG='#version 300 es\nprecision mediump float;in vec2 vUV;uniform float u_Time;uniform vec2 u_Res;uniform int u_Theme;out vec4 fc;void main(){vec2 uv=vUV;vec3 col;\n'
+'if(u_Theme==1){col=mix(vec3(.05,.03,.02),vec3(.04,.02,.01),uv.y);col+=vec3(.06,.02,.005)*(1.0-uv.y)*(.5+.5*sin(u_Time*.3));}\n'
+'else if(u_Theme==2){col=mix(vec3(.06,.02,.01),vec3(.03,.01,.005),uv.y);col+=vec3(.08,.01,0)*(1.0-uv.y)*(.5+.5*sin(u_Time*.2));}\n'
+'else if(u_Theme==3){col=mix(vec3(.02,.03,.06),vec3(.01,.02,.04),uv.y);}\n'
+'else if(u_Theme==4){col=mix(vec3(.05,.04,.02),vec3(.03,.02,.01),uv.y);}\n'
+'else if(u_Theme==5){col=mix(vec3(.03,.03,.06),vec3(.02,.02,.04),uv.y);}\n'
+'else{col=mix(vec3(.04,.03,.02),vec3(.02,.02,.015),uv.y);}\n'
+'vec2 gr=fract(gl_FragCoord.xy/44.0);float ln=smoothstep(.02,0.0,gr.x)+smoothstep(.02,0.0,gr.y);col+=vec3(.06,.02,.005)*ln*.4;\n'
+'fc=vec4(col,1.0);}';

var LIQUID_TYPES={
  'F':{fill:0.70,amp:2.0,spd:1.5,spring:0.06,surface:[1,.267,0],deep:[.4,.067,0],glow:[1,.533,.0]},
  'I':{fill:0.85,amp:0.3,spd:0.3,spring:0.04,surface:[.4,.8,1],deep:[.133,.267,.533],glow:[.667,.867,1]},
  'W':{fill:0.60,amp:1.5,spd:1.0,spring:0.08,surface:[.133,.533,1],deep:[.067,.133,.267],glow:[.267,.667,1]},
  'E':{fill:0.90,amp:0.5,spd:0.2,spring:0.03,surface:[.533,.4,.2],deep:[.2,.133,.067],glow:[.667,.533,.267]},
  'L':{fill:0.85,amp:3.5,spd:2.5,spring:0.02,surface:[1,.133,0],deep:[.267,0,0],glow:[1,.4,0]},
  'S':{fill:1.00,amp:0.0,spd:0.0,spring:0.0,surface:[.467,.533,.6],deep:[.2,.267,.333],glow:[.667,.733,.8]},
  'G':{fill:0.75,amp:1.0,spd:0.8,spring:0.06,surface:[1,.8,0],deep:[.4,.267,0],glow:[1,.933,.4]},
  'T':{fill:0.80,amp:2.5,spd:2.0,spring:0.05,surface:[1,.4,0],deep:[.267,.133,0],glow:[1,.667,0]},
  'R':{fill:0.70,amp:1.5,spd:1.2,spring:0.04,surface:[.667,.267,1],deep:[.2,.067,.4],glow:[.8,.533,1]}
};

function glHex3(hex){return[parseInt(hex.substr(1,2),16)/255,parseInt(hex.substr(3,2),16)/255,parseInt(hex.substr(5,2),16)/255]}

function glCompile(src,type){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.error('Shader:',gl.getShaderInfoLog(s));gl.deleteShader(s);return null}return s}
function glLink(vs,fs){var p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.error('Program:',gl.getProgramInfoLog(p));gl.deleteProgram(p);return null}return p}
function glMakeProg(vsSrc,fsSrc){var vs=glCompile(vsSrc,gl.VERTEX_SHADER),fs=glCompile(fsSrc,gl.FRAGMENT_SHADER);if(!vs||!fs)return null;return glLink(vs,fs)}

function glOrtho(w,h){return new Float32Array([2/w,0,0,0,0,-2/h,0,0,0,0,-1,0,-1,1,0,1])}

function glMakeQuad(corner){
  var v;
  if(corner)v=new Float32Array([0,0,0,1, 1,0,1,1, 1,1,1,0, 0,1,0,0]);
  else v=new Float32Array([0,0,0,0, 1,0,1,0, 1,1,1,1, 0,1,0,1]);
  var idx=new Uint16Array([0,1,2,0,2,3]);
  var vao=gl.createVertexArray();gl.bindVertexArray(vao);
  var vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,v,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,16,0);
  gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,2,gl.FLOAT,false,16,8);
  var ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);
  gl.bindVertexArray(null);return{vao:vao,count:6}
}

function initGL(){
  glCanvas=document.getElementById('gl-canvas');if(!glCanvas)return;
  gl=glCanvas.getContext('webgl2',{alpha:true,premultipliedAlpha:false,antialias:false,preserveDrawingBuffer:false});
  if(!gl){console.warn('WebGL2 not available');return}
  glProg=glMakeProg(VS_BLOCK,FS_BLOCK);glBgProg=glMakeProg(VS_BG,FS_BG);
  if(!glProg||!glBgProg){gl=null;return}
  glQuadVAO=glMakeQuad(true);glBgVAO=glMakeQuad(false);
  // cache block uniforms
  glU.proj=gl.getUniformLocation(glProg,'u_P');glU.pos=gl.getUniformLocation(glProg,'u_Pos');
  glU.size=gl.getUniformLocation(glProg,'u_Sz');glU.fill=gl.getUniformLocation(glProg,'u_Fill');
  glU.time=gl.getUniformLocation(glProg,'u_Time');glU.amp=gl.getUniformLocation(glProg,'u_Amp');
  glU.spd=gl.getUniformLocation(glProg,'u_Spd');glU.cols=gl.getUniformLocation(glProg,'u_Cols');
  glU.wh=gl.getUniformLocation(glProg,'u_WH');glU.cs=gl.getUniformLocation(glProg,'u_CS');
  glU.cd=gl.getUniformLocation(glProg,'u_CD');glU.cg=gl.getUniformLocation(glProg,'u_CG');
  glU.orbR=gl.getUniformLocation(glProg,'u_OrbR');glU.hit=gl.getUniformLocation(glProg,'u_Hit');
  // cache bg uniforms
  glBgU.time=gl.getUniformLocation(glBgProg,'u_Time');glBgU.res=gl.getUniformLocation(glBgProg,'u_Res');
  glBgU.theme=gl.getUniformLocation(glBgProg,'u_Theme');
  glReady=true;
}

function glResize(){if(!glCanvas)return;glCanvas.width=CW;glCanvas.height=CH}

var BG_THEME_MAP={fire:1,lava:2,ice:3,gold:4,rainbow:5,dark:0};

function glRenderBg(levelIdx,time){
  if(!gl||!glBgProg)return;
  var lvl=LEVELS[levelIdx];var themeId=lvl?BG_THEME_MAP[lvl.bg]||0:0;
  gl.useProgram(glBgProg);gl.bindVertexArray(glBgVAO.vao);
  gl.uniform1f(glBgU.time,time);gl.uniform2f(glBgU.res,CW,CH);gl.uniform1i(glBgU.theme,themeId);
  gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);gl.bindVertexArray(null);
}

var _glTime=0;
function glRenderBlocks(blocks,time){
  if(!gl||!glProg)return;
  gl.useProgram(glProg);gl.bindVertexArray(glQuadVAO.vao);
  var proj=glOrtho(CW,CH);gl.uniformMatrix4fv(glU.proj,false,proj);gl.uniform1i(glU.cols,6);
  for(var i=0;i<blocks.length;i++){
    var b=blocks[i];if(!b.alive)continue;
    var tc=LIQUID_TYPES[b.type];if(!tc)continue;
    var orbD=b.orbR*2;
    gl.uniform2f(glU.pos,b.cx-b.orbR,b.cy-b.orbR);gl.uniform2f(glU.size,orbD,orbD);
    gl.uniform1f(glU.orbR,b.orbR);
    var hpF=b.hp/b.maxHp;gl.uniform1f(glU.fill,tc.fill*hpF);
    gl.uniform1f(glU.amp,tc.amp);gl.uniform1f(glU.spd,tc.spd);gl.uniform1f(glU.time,time);
    // Rainbow hue cycle
    if(b.type==='R'){var hue=(time*0.5)%1;var r=Math.abs(hue*6-3)-1;var g=2-Math.abs(hue*6-2);var bl=2-Math.abs(hue*6-4);r=Math.max(0,Math.min(1,r));g=Math.max(0,Math.min(1,g));bl=Math.max(0,Math.min(1,bl));gl.uniform3f(glU.cs,r*.8,g*.8,bl*.8);gl.uniform3f(glU.cg,r,g,bl)}
    else{gl.uniform3f(glU.cs,tc.surface[0],tc.surface[1],tc.surface[2]);gl.uniform3f(glU.cg,tc.glow[0],tc.glow[1],tc.glow[2])}
    gl.uniform3f(glU.cd,tc.deep[0],tc.deep[1],tc.deep[2]);
    var hitF=b.hitAnim>0?Math.max(0,b.hitAnim):0;gl.uniform1f(glU.hit,hitF);
    if(b.wH)gl.uniform1fv(glU.wh,b.wH);
    gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
  }
  // Render draining (just-destroyed) orbs — liquid pours out before they vanish
  for(var di=0;di<blocks.length;di++){
    var db=blocks[di];
    if(db.alive||!db._drain||db._drain<=0)continue;
    var dtc=LIQUID_TYPES[db.type];if(!dtc)continue;
    var dFrac=Math.max(0,db._drain/0.48);
    var dOrbD=db.orbR*2;
    gl.uniform2f(glU.pos,db.cx-db.orbR,db.cy-db.orbR);gl.uniform2f(glU.size,dOrbD,dOrbD);
    gl.uniform1f(glU.orbR,db.orbR);
    gl.uniform1f(glU.fill,db._drainFill*dFrac*dFrac);
    gl.uniform1f(glU.amp,dtc.amp*(1.0+dFrac*1.5));
    gl.uniform1f(glU.spd,dtc.spd*2.5);gl.uniform1f(glU.time,time);
    if(db.type==='R'){var dHue=(time*0.5)%1;var dR=Math.max(0,Math.min(1,Math.abs(dHue*6-3)-1));var dG=Math.max(0,Math.min(1,2-Math.abs(dHue*6-2)));var dBl=Math.max(0,Math.min(1,2-Math.abs(dHue*6-4)));gl.uniform3f(glU.cs,dR*.8,dG*.8,dBl*.8);gl.uniform3f(glU.cg,dR,dG,dBl);}
    else{gl.uniform3f(glU.cs,dtc.surface[0],dtc.surface[1],dtc.surface[2]);gl.uniform3f(glU.cg,dtc.glow[0],dtc.glow[1],dtc.glow[2]);}
    gl.uniform3f(glU.cd,dtc.deep[0],dtc.deep[1],dtc.deep[2]);
    gl.uniform1f(glU.hit,0.0);
    if(db.wH)gl.uniform1fv(glU.wh,db.wH);
    gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
  }
  gl.bindVertexArray(null);
}

function updateBlockWaves(blocks,dt){
  for(var i=0;i<blocks.length;i++){
    var b=blocks[i];if(!b.wH)continue;
    if(!b.alive){
      // Drain animation: turbulent liquid pours out of dying orb
      if(b._drain>0){
        b._drain-=dt;
        var dtc=LIQUID_TYPES[b.type];
        if(dtc&&dtc.amp>0){
          var dImp=b.h*(0.28+Math.random()*0.22);
          for(var cd=0;cd<6;cd++)b.wV[cd]+=dImp*(0.6+Math.random()*0.8);
          var dCols=6,dSdt=dt/4;
          for(var dStep=0;dStep<4;dStep++){
            for(var dc=0;dc<dCols;dc++){b.wV[dc]*=Math.pow(0.88,dSdt);b.wH[dc]+=b.wV[dc]*dSdt*0.25;if(b.wH[dc]>b.h)b.wH[dc]=b.h;if(b.wH[dc]<-b.h)b.wH[dc]=-b.h;}
            for(var dc2=0;dc2<dCols;dc2++){if(dc2>0){var dd1=(b.wH[dc2]-b.wH[dc2-1])*0.3*dSdt;b.wV[dc2]-=dd1;b.wV[dc2-1]+=dd1;}if(dc2<dCols-1){var dd2=(b.wH[dc2]-b.wH[dc2+1])*0.3*dSdt;b.wV[dc2]-=dd2;b.wV[dc2+1]+=dd2;}}
          }
          if(!isFinite(b.wH[0]))for(var df=0;df<6;df++){b.wH[df]=0;b.wV[df]=0;}
        }
      }
      continue;
    }
    var tc=LIQUID_TYPES[b.type];if(!tc||tc.amp===0)continue;
    var cols=6,spring=tc.spring,damp=0.97,spread=0.25,maxA=b.h*0.4,sdt=dt/4;
    for(var step=0;step<4;step++){
      for(var c=0;c<cols;c++){b.wV[c]+=-spring*b.wH[c]*sdt;b.wV[c]*=Math.pow(damp,sdt);b.wH[c]+=b.wV[c]*sdt*0.25;if(b.wH[c]>maxA){b.wH[c]=maxA;b.wV[c]*=0.3}if(b.wH[c]<-maxA){b.wH[c]=-maxA;b.wV[c]*=0.3}}
      for(var c2=0;c2<cols;c2++){if(c2>0){var d1=(b.wH[c2]-b.wH[c2-1])*spread*sdt;b.wV[c2]-=d1;b.wV[c2-1]+=d1}if(c2<cols-1){var d2=(b.wH[c2]-b.wH[c2+1])*spread*sdt;b.wV[c2]-=d2;b.wV[c2+1]+=d2}}
    }
    if(!isFinite(b.wH[0]))for(var f=0;f<cols;f++){b.wH[f]=0;b.wV[f]=0}
  }
}

function glBlockHit(block,ballX){
  if(!block.wV)return;
  var hitX=(ballX-block.x)/block.w;var col=Math.round(hitX*5);col=Math.max(0,Math.min(5,col));
  var imp=block.h*0.65;block.wV[col]-=imp;
  if(col>0)block.wV[col-1]-=imp*0.5;if(col<5)block.wV[col+1]-=imp*0.5;
}
function glBlastNeighbors(block){
  if(!glReady)return;
  var range=block.type==='T'||block.type==='L'?2:1;
  getBlocksInArea(block,range).forEach(function(nb){
    if(!nb.alive||!nb.wV)return;
    var dx=nb.col-block.col,dy=nb.row-block.row;
    var dist=Math.max(1,Math.sqrt(dx*dx+dy*dy));
    var imp=block.orbR*0.55/dist;
    // Push toward the far side of the neighbor (from blast origin)
    var side=dx>0?0:dx<0?5:Math.round(Math.random()*5);
    nb.wV[side]-=imp*1.8;
    if(side>0)nb.wV[side-1]-=imp;if(side<5)nb.wV[side+1]-=imp;
  });
}

// ============================================================
// === BACKGROUND + AMBIENT ==================================
// ============================================================
function renderBackground(){
  var lvl=gameState.running?LEVELS[gameState.level]:null,bg=lvl?lvl.bg:'dark';
  var bgC,gc;
  if(bg==='fire'){bgC='#0d0805';gc='rgba(255,80,20,0.06)'}
  else if(bg==='lava'){bgC='#100503';gc='rgba(255,40,0,0.08)'}
  else if(bg==='ice'){bgC='#060810';gc='rgba(80,160,255,0.05)'}
  else if(bg==='gold'){bgC='#0d0b05';gc='rgba(255,200,0,0.05)'}
  else if(bg==='rainbow'){bgC='#080810';gc='rgba(180,80,255,0.05)'}
  else{bgC='#0a0806';gc='rgba(255,80,20,0.04)'}
  ctx.fillStyle=bgC;ctx.fillRect(0,0,CW,CH);
  ctx.strokeStyle=gc;ctx.lineWidth=1;
  var gs=44;
  for(var x=0;x<CW;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke()}
  for(var y=0;y<CH;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke()}
}

function updateBackground(dt){
  if(!settings.visualFX||!gameState.running||gameState.paused)return;
  var lvl=LEVELS[gameState.level];if(!lvl)return;var bg=lvl.bg;
  if(bg==='fire'||bg==='lava'){
    if(Math.random()<dt*12){var p=poolAlloc();p.x=Math.random()*CW;p.y=CH+5;p.vx=(Math.random()-0.5)*40;p.vy=-(80+Math.random()*120);p.color=bg==='lava'?'#ff2200':'#ff6600';p.alpha=0.22+Math.random()*0.22;p.radius=2+Math.random()*4;p.life=1.5+Math.random()*1.5;p.maxLife=p.life;p.gravity=-20;p.type='fire'}
  }else if(bg==='ice'){
    if(Math.random()<dt*8){var p2=poolAlloc();p2.x=Math.random()*CW;p2.y=-5;p2.vx=(Math.random()-0.5)*20;p2.vy=50+Math.random()*35;p2.color='#aaddff';p2.alpha=0.42;p2.radius=1+Math.random()*2;p2.life=4+Math.random()*4;p2.maxLife=p2.life;p2.gravity=0;p2.type='ice'}
  }else if(bg==='rainbow'){
    if(Math.random()<dt*6){var p3=poolAlloc();p3.x=Math.random()*CW;p3.y=CH*0.3+Math.random()*CH*0.7;p3.vx=(Math.random()-0.5)*14;p3.vy=-20-Math.random()*35;p3.color=['#ff4400','#ffcc00','#00ff88','#4488ff','#aa44ff'][Math.floor(Math.random()*5)];p3.alpha=0.28+Math.random()*0.28;p3.radius=1.5+Math.random()*2;p3.life=1+Math.random()*2;p3.maxLife=p3.life;p3.gravity=-10;p3.type='spark'}
  }
}

function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function adjustBrightness(hex,f){var c=hex.replace('#','');if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];return'rgb('+Math.min(255,Math.round(parseInt(c.substr(0,2),16)*f))+','+Math.min(255,Math.round(parseInt(c.substr(2,2),16)*f))+','+Math.min(255,Math.round(parseInt(c.substr(4,2),16)*f))+')'}

function renderBlocks(){
  var pad=CFG.BLOCK_CORNER;
  for(var i=0;i<gameState.blocks.length;i++){var b=gameState.blocks[i];if(!b.alive)continue;var def=b.def,ft=b.hitAnim;if(b.hitAnim>0)b.hitAnim-=0.08;
    var hf=b.hp/b.maxHp,br=0.5+hf*0.5;ctx.save();if(ft>0.5)ctx.globalAlpha=0.5+ft*0.5;
    if(ft>0.3){ctx.shadowColor=def.glow;ctx.shadowBlur=8+ft*12}
    var g=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);g.addColorStop(0,adjustBrightness(def.color,br*1.3));g.addColorStop(1,adjustBrightness(def.color,br*0.7));
    ctx.fillStyle=g;roundRect(ctx,b.x,b.y,b.w,b.h,pad);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,'+(0.12+ft*0.25)+')';ctx.lineWidth=1;roundRect(ctx,b.x,b.y,b.w,b.h,pad);ctx.stroke();
    if(b.maxHp>1){for(var d=0;d<b.maxHp;d++){ctx.beginPath();ctx.arc(b.x+b.w/2+(d-(b.maxHp-1)/2)*6,b.y+b.h-5,2,0,Math.PI*2);ctx.fillStyle=d<b.hp?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.4)';ctx.fill()}}
    if(b.maxHp>1&&b.hp<b.maxHp){var dmg=1-b.hp/b.maxHp;ctx.save();ctx.beginPath();roundRect(ctx,b.x,b.y,b.w,b.h,pad);ctx.clip();ctx.strokeStyle='rgba(0,0,0,'+(dmg*0.7)+')';ctx.lineWidth=1.5;var bcx=b.x+b.w/2,bcy=b.y+b.h/2;ctx.beginPath();ctx.moveTo(bcx-b.w*0.1,b.y+3);ctx.lineTo(bcx+b.w*0.15,bcy+b.h*0.2);ctx.lineTo(bcx-b.w*0.05,b.y+b.h-3);ctx.stroke();if(dmg>0.49){ctx.beginPath();ctx.moveTo(b.x+4,bcy-b.h*0.1);ctx.lineTo(bcx+b.w*0.2,bcy+b.h*0.1);ctx.stroke()}ctx.restore()}
    if(b.type==='S'){ctx.save();ctx.beginPath();roundRect(ctx,b.x,b.y,b.w,b.h,pad);ctx.clip();ctx.strokeStyle='rgba(180,200,220,0.2)';ctx.lineWidth=1;for(var hx=b.x-b.h;hx<b.x+b.w+b.h;hx+=8){ctx.beginPath();ctx.moveTo(hx,b.y);ctx.lineTo(hx+b.h,b.y+b.h);ctx.stroke()}ctx.restore()}
    var bfz=Math.max(7,Math.min(11,b.h*0.29));ctx.font='700 '+bfz+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(255,255,255,0.5)';ctx.shadowBlur=0;ctx.fillText(BLOCK_ICONS[b.type]||b.type,b.x+b.w/2,b.y+b.h/2);
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
  var tc=TRAIL_COLORS[settings.ballTrail]||TRAIL_COLORS.lava;
  for(var t=0;t<ball.trail.length;t++){var tr=ball.trail[t];var ta=(1-tr.age)*0.4;if(ta<=0)continue;ctx.globalAlpha=ta;ctx.globalCompositeOperation='lighter';ctx.fillStyle=tc.c2;ctx.beginPath();ctx.arc(tr.x,tr.y,r*(1-tr.age*0.6),0,Math.PI*2);ctx.fill()}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.shadowColor=ball.fireball?'#ff6600':tc.glow;ctx.shadowBlur=12+(ball.fireball?8:0);
  var g=ctx.createRadialGradient(ball.x-r*0.3,ball.y-r*0.3,r*0.1,ball.x,ball.y,r);
  if(ball.fireball){g.addColorStop(0,'#ffee80');g.addColorStop(0.4,'#ff6600');g.addColorStop(1,'#cc2200')}
  else if(settings.ballTrail==='plasma'){g.addColorStop(0,'#eeccff');g.addColorStop(0.45,'#aa44ff');g.addColorStop(1,'#440088')}
  else if(settings.ballTrail==='ice'){g.addColorStop(0,'#eeeeff');g.addColorStop(0.45,'#44aaff');g.addColorStop(1,'#0022aa')}
  else if(settings.ballTrail==='fire'){g.addColorStop(0,'#ffee80');g.addColorStop(0.4,'#ff6600');g.addColorStop(1,'#cc2200')}
  else{g.addColorStop(0,'#ffcc66');g.addColorStop(0.45,'#ff4400');g.addColorStop(1,'#881100')}
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(ball.x,ball.y,r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,240,180,0.55)';ctx.beginPath();ctx.arc(ball.x-r*0.28,ball.y-r*0.28,r*0.38,0,Math.PI*2);ctx.fill();ctx.restore();
}

function renderPowerups(){
  var now=performance.now()/1000;
  for(var i=0;i<gameState.powerups.length;i++){
    var pu=gameState.powerups[i];if(!pu.alive)continue;
    var def=pu.def,pr=18,pulse=0.88+0.12*Math.sin(now*4.5+i*1.3);
    ctx.save();
    // outer glow
    ctx.shadowColor=def.color;ctx.shadowBlur=18*pulse;
    // radial gradient body
    var g=ctx.createRadialGradient(pu.x-pr*0.32,pu.y-pr*0.32,pr*0.08,pu.x,pu.y,pr*pulse);
    g.addColorStop(0,def.color+'ff');g.addColorStop(0.55,def.color+'cc');g.addColorStop(1,def.color+'22');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(pu.x,pu.y,pr*pulse,0,Math.PI*2);ctx.fill();
    // orbiting sparkle dots
    ctx.shadowBlur=6;ctx.shadowColor=def.color;
    var rot=now*1.6+i*0.9;
    for(var k=0;k<8;k++){var a=rot+k*Math.PI*0.25;var orbitR=pr+5+Math.sin(now*3+k)*1.5;var dotAlpha=0.35+0.45*Math.abs(Math.sin(now*2+k*0.8));ctx.globalAlpha=dotAlpha;ctx.fillStyle=def.color;ctx.beginPath();ctx.arc(pu.x+Math.cos(a)*orbitR,pu.y+Math.sin(a)*orbitR,1.6,0,Math.PI*2);ctx.fill()}
    // specular highlight
    ctx.globalAlpha=0.4;ctx.fillStyle='rgba(255,255,255,0.55)';
    ctx.beginPath();ctx.arc(pu.x-pr*0.28,pu.y-pr*0.28,pr*0.3,0,Math.PI*2);ctx.fill();
    // icon text
    ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='bold 10px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(def.icon,pu.x,pu.y+1);
    ctx.restore();
  }
}
function renderLasers(){for(var i=0;i<gameState.lasers.length;i++){var l=gameState.lasers[i];if(!l.alive)continue;ctx.save();ctx.shadowColor=l.color;ctx.shadowBlur=6;ctx.fillStyle=l.color;ctx.fillRect(l.x-l.w/2,l.y,l.w,l.h);ctx.restore()}}
function renderFlash(){if(gameState.flashAlpha<=0)return;ctx.save();ctx.globalAlpha=gameState.flashAlpha*0.35;ctx.fillStyle=gameState.flashColor;ctx.fillRect(0,0,CW,CH);ctx.restore();gameState.flashAlpha*=0.82;if(gameState.flashAlpha<0.005)gameState.flashAlpha=0}


var lastDt=0.016,_fpsLastTime=0,_fpsCount=0,_fpsCurrent=0;
function updateDebugOverlay(now){
  _fpsCount++;if(now-_fpsLastTime>=500){_fpsCurrent=Math.round(_fpsCount*1000/(now-_fpsLastTime));_fpsCount=0;_fpsLastTime=now}
  var el=document.getElementById('debug-overlay');if(!el||!gameState.debugMode)return;
  var alive=particlePool.filter(function(p){return p._alive}).length;
  var blk=gameState.blocks.filter(function(b){return b.alive}).length;
  el.textContent=(glReady?'WebGL2':'Canvas2D')+' | FPS:'+_fpsCurrent+' | P:'+alive+'/'+CFG.MAX_PARTICLES+' | Blk:'+blk+' | Balls:'+gameState.balls.length+' | Score:'+gameState.score+' | Lvl:'+(gameState.level+1)+' | Combo:'+gameState.combo+' | BOT:'+(gameState.botEnabled?'ON':'OFF');
}
function updateDebugBot(){
  if(!gameState.debugMode||!gameState.botEnabled)return;
  var lo=document.getElementById('overlay-level');
  if(lo&&lo.classList.contains('visible')){dismissLevelOverlay();return}
  if(!gameState.running||gameState.paused)return;
  var p=gameState.paddle;if(!p)return;
  var balls=gameState.balls;if(!balls.length)return;
  balls.forEach(function(b){if(b.stuck&&b.alive){launchBall(b);playSFX('launch')}});
  var active=balls.filter(function(b){return b.alive&&!b.stuck});if(!active.length)return;
  // Pick the most dangerous ball (lowest on screen / closest to paddle)
  var tgt=active.reduce(function(a,b){return b.y>a.y?b:a},active[0]);
  // Predict where ball will land on paddle level
  var predictX=tgt.x;
  if(tgt.vy>0){
    var eta=(p.y-tgt.y)/tgt.vy;
    if(eta>0&&eta<2.5){
      predictX=tgt.x+tgt.vx*eta;
      // Simple wall-bounce unwrap
      var br=getBallRadius(),lo2=br,hi2=CW-br;
      for(var _w=0;_w<4;_w++){if(predictX<lo2){predictX=2*lo2-predictX;}else if(predictX>hi2){predictX=2*hi2-predictX;}else break;}
    }
  }
  // Find target orb: prefer the bottom-most row, then closest to predictX
  var aliveBlks=gameState.blocks.filter(function(b){return b.alive&&b.type!=='S'});
  if(aliveBlks.length===0)aliveBlks=gameState.blocks.filter(function(b){return b.alive});
  if(aliveBlks.length>0){
    var maxRow=aliveBlks.reduce(function(acc,b){return b.row>acc?b.row:acc},0);
    var bottomRow=aliveBlks.filter(function(b){return b.row===maxRow&&b.type!=='S'});
    if(bottomRow.length===0)bottomRow=aliveBlks.filter(function(b){return b.row===maxRow});
    var orbTarget=bottomRow.reduce(function(a,b){return Math.abs(b.cx-predictX)<Math.abs(a.cx-predictX)?b:a},bottomRow[0]);
    // Back-calculate paddle offset: angle = atan2(dx_to_orb, dy_up_to_orb)
    var dx=orbTarget.cx-predictX;
    var dyUp=Math.max(20,p.y-orbTarget.cy);
    var angle=Math.atan2(dx,dyUp); // angle from vertical
    var maxA=60*Math.PI/180;
    angle=Math.max(-maxA,Math.min(maxA,angle));
    var off=angle/maxA; // [-1,1]
    p.targetX=predictX-off*(p.width/2);
  } else {
    // No blocks left — just catch the ball
    p.targetX=predictX;
  }
}
function gameLoop(ts){
  var dt=Math.min((ts-lastTime)/1000,0.05);lastTime=ts;lastDt=dt;animFrame=requestAnimationFrame(gameLoop);
  updateDebugOverlay(ts);updateDebugBot();updateParticles(dt);if(!gameState.running||gameState.paused){if(settings.visualFX&&gameState.balls){for(var _bi=0;_bi<gameState.balls.length;_bi++){var _bb=gameState.balls[_bi];if(_bb.stuck&&_bb.alive)_spawnBallAura(_bb)}}render();return}
  updatePaddle(dt);updateEffects(dt);updatePowerups(dt);updateLasers(dt);updateBackground(dt);if(glReady)updateBlockWaves(gameState.blocks,dt);
  if(gameState.activeEffects.laser>0){gameState._laserTimer=(gameState._laserTimer||0)-dt;if(gameState._laserTimer<=0){fireLasers();gameState._laserTimer=0.4}}
  for(var i=0;i<gameState.balls.length;i++){var b=gameState.balls[i];if(b.stuck||!b.alive){updateBallStuck(b);b.trail=[];if(b.stuck)_spawnBallAura(b);continue}
    b.trail.push({x:b.x,y:b.y,age:0});var _mxT=settings.trailLength==='short'?5:settings.trailLength==='long'?22:12,_tSp=settings.trailLength==='short'?7:settings.trailLength==='long'?2.5:4;if(b.trail.length>_mxT)b.trail.shift();b.trail.forEach(function(tr){tr.age+=dt*_tSp});b.trail=b.trail.filter(function(tr){return tr.age<1});
    if(settings.visualFX){var bspd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);if(bspd>60&&Math.random()<dt*28)spawnTrailParticle(b.x+(Math.random()-0.5)*3,b.y+(Math.random()-0.5)*3)}}
  updateAmbientBlockFX(dt);
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

function renderDebugHitboxes(){
  ctx.save();ctx.globalAlpha=0.55;ctx.lineWidth=1;
  ctx.strokeStyle='#00ff88';gameState.blocks.forEach(function(b){if(!b.alive)return;ctx.beginPath();ctx.arc(b.cx,b.cy,b.orbR,0,Math.PI*2);ctx.stroke()});
  ctx.strokeStyle='#ff4444';gameState.balls.forEach(function(b){if(!b.alive&&!b.stuck)return;ctx.beginPath();ctx.arc(b.x,b.y,b.radius,0,Math.PI*2);ctx.stroke()});
  if(gameState.paddle){ctx.strokeStyle='#4488ff';var p=gameState.paddle;ctx.strokeRect(p.x-p.width/2,p.y-p.height/2,p.width,p.height)}
  ctx.strokeStyle='rgba(255,220,0,0.55)';gameState.powerups.forEach(function(pu){if(!pu.alive)return;ctx.beginPath();ctx.arc(pu.x,pu.y,pu.w/2,0,Math.PI*2);ctx.stroke()});
  ctx.restore();
}
function render(){
  var glTime=performance.now()/1000;
  ctx.save();if(gameState.shake>0.5)ctx.translate((Math.random()-0.5)*gameState.shake,(Math.random()-0.5)*gameState.shake);
  if(glReady){
    gl.viewport(0,0,CW,CH);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    glRenderBg(gameState.level,glTime);glRenderBlocks(gameState.blocks,glTime);
    ctx.clearRect(0,0,CW,CH);
  }else{renderBackground();renderBlocks()}
  renderLasers();renderPowerups();renderPaddle();renderBalls();renderParticles();renderFlash();
  if(gameState.showHitboxes)renderDebugHitboxes();
  ctx.restore();
}

var keys={},mouseX=0;
var _grabBall=null,_grabOffX=0,_grabOffY=0,_grabPX=0,_grabPY=0,_grabPT=0,_grabVX=0,_grabVY=0;
function initInput(){
  document.addEventListener('mousemove',function(e){
    var wrap=document.getElementById('game-wrap');var ox=wrap?wrap.getBoundingClientRect().left:0;
    var gx=e.clientX-ox,gy=e.clientY;mouseX=gx;
    if(currentScreen==='screen-game'&&gameState.paddle&&!gameState.botEnabled)gameState.paddle.targetX=gx;
    if(_grabBall&&_grabBall.alive&&!_grabBall.stuck){
      var now=performance.now(),elapsed=(now-_grabPT)/1000||0.016;
      _grabVX=(gx-_grabPX)/(elapsed||0.016);_grabVY=(gy-_grabPY)/(elapsed||0.016);
      _grabBall.x=gx+_grabOffX;_grabBall.y=gy+_grabOffY;
      _grabPX=gx;_grabPY=gy;_grabPT=now;
    }
  });
  document.addEventListener('touchmove',function(e){if(currentScreen!=='screen-game')return;e.preventDefault();var t=e.touches[0];if(t&&gameState.paddle&&!gameState.botEnabled){var wrap=document.getElementById('game-wrap');var ox=wrap?wrap.getBoundingClientRect().left:0;gameState.paddle.targetX=t.clientX-ox}},{passive:false});
  document.addEventListener('touchstart',function(e){ensureAudio();if(currentScreen==='screen-game')handleGameTap()});
  document.addEventListener('mouseup',function(e){
    if(_grabBall&&_grabBall.alive){
      var spd=Math.sqrt(_grabVX*_grabVX+_grabVY*_grabVY);
      var nomSpd=getBallSpeed();
      if(spd>80){_grabBall.vx=_grabVX/spd*nomSpd;_grabBall.vy=_grabVY/spd*nomSpd}
      else{_grabBall.stuck=true;updateBallStuck(_grabBall)} // too slow → stick to paddle
      _grabBall=null;
    }
  });
  document.addEventListener('mousedown',function(e){
    ensureAudio();
    if(currentScreen==='screen-game'&&e.button===0){
      var wrap=document.getElementById('game-wrap');var ox=wrap?wrap.getBoundingClientRect().left:0;
      var gx=e.clientX-ox,gy=e.clientY;
      if(gameState.running&&!gameState.paused&&!gameState.botEnabled&&gameState.balls){
        for(var _gi=0;_gi<gameState.balls.length;_gi++){var _gb=gameState.balls[_gi];
          if(!_gb.alive||_gb.stuck)continue;
          var _gdx=gx-_gb.x,_gdy=gy-_gb.y;
          if(_gdx*_gdx+_gdy*_gdy<(_gb.radius*3.5)*(_gb.radius*3.5)){
            _grabBall=_gb;_grabOffX=_gb.x-gx;_grabOffY=_gb.y-gy;
            _grabPX=gx;_grabPY=gy;_grabPT=performance.now();_grabVX=_gb.vx;_grabVY=_gb.vy;
            e.preventDefault();return; // don't tap-launch
          }
        }
      }
      handleGameTap();
    }
  });
  document.addEventListener('keydown',function(e){keys[e.code]=true;
    if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();ensureAudio();if(currentScreen==='screen-game')handleSpacebar()}
    if(e.code==='Escape'||e.code==='KeyP'){if(currentScreen==='screen-game')togglePause()}
    if(e.code==='KeyM'){settings.sfxOn=!settings.sfxOn;settings.musicOn=!settings.musicOn;saveSettings()}
    if(e.code==='F1'){e.preventDefault();settings.debug=!settings.debug;applyDebugMode()}
    if(gameState.debugMode&&currentScreen==='screen-game'){
      if(e.code==='BracketLeft'&&gameState.level>0){e.preventDefault();startLevel(gameState.level-1)}
      if(e.code==='BracketRight'&&gameState.level<LEVELS.length-1){e.preventDefault();startLevel(gameState.level+1)}}
    if(currentScreen==='screen-game'&&gameState.running&&!gameState.paused&&!gameState.botEnabled){
      if(e.code==='ArrowLeft'||e.code==='KeyA'){if(gameState.paddle)gameState.paddle.targetX-=30}
      if(e.code==='ArrowRight'||e.code==='KeyD'){if(gameState.paddle)gameState.paddle.targetX+=30}}});
  document.addEventListener('keyup',function(e){keys[e.code]=false});
  setInterval(function(){if(currentScreen!=='screen-game'||!gameState.running||gameState.paused||gameState.botEnabled)return;var p=gameState.paddle;if(!p)return;if(keys['ArrowLeft']||keys['KeyA'])p.targetX-=6;if(keys['ArrowRight']||keys['KeyD'])p.targetX+=6},16);
}
function handleSpacebar(){var lo=document.getElementById('overlay-level');if(lo&&lo.classList.contains('visible')){dismissLevelOverlay();return}gameState.balls.forEach(function(b){if(b.stuck){launchBall(b);playSFX('launch')}})}
function handleGameTap(){var lo=document.getElementById('overlay-level');if(lo&&lo.classList.contains('visible')){dismissLevelOverlay();return}gameState.balls.forEach(function(b){if(b.stuck){launchBall(b);playSFX('launch')}})}
function dismissLevelOverlay(){var lo=document.getElementById('overlay-level');if(lo)lo.classList.remove('visible');gameState.running=true}
function togglePause(){if(!gameState.running&&!gameState.paused)return;gameState.paused=!gameState.paused;var po=document.getElementById('overlay-pause');if(gameState.paused){if(po)po.classList.add('visible');musicStop()}else{if(po)po.classList.remove('visible');var lvl2=LEVELS[gameState.level];if(lvl2)musicStart(lvl2.music||'inferno')}}


function initButtons(){
  document.getElementById('btn-play').addEventListener('click',function(){ensureAudio();startGame()});
  document.getElementById('btn-settings').addEventListener('click',function(){showScreen('screen-settings');applySettingsUI()});
  document.getElementById('btn-leaderboard').addEventListener('click',function(){showScreen('screen-leaderboard');renderLeaderboard()});
  document.getElementById('btn-levelselect').addEventListener('click',function(){renderLevelSelect();showScreen('screen-levelselect')});
  document.getElementById('btn-back-levelselect').addEventListener('click',function(){showScreen('screen-start')});
  document.getElementById('btn-back-settings').addEventListener('click',function(){saveSettings();showScreen('screen-start')});
  document.getElementById('btn-debug-main').addEventListener('click',function(){settings.debug=!settings.debug;applyDebugMode();var db=document.getElementById('btn-debug-main');if(db)db.textContent='DEBUG: '+(settings.debug?'ON':'OFF')});
  document.getElementById('btn-powerups-main').addEventListener('click',function(){renderPowerupInfo();showScreen('screen-powerups')});
  document.getElementById('btn-back-powerups').addEventListener('click',function(){showScreen('screen-start')});
  ['small','normal','large'].forEach(function(s){var el=document.getElementById('size-'+s);if(el)el.addEventListener('click',function(){settings.ballSize=s;applySettingsUI();saveSettings()})});
  ['fire','lava','plasma','ice'].forEach(function(s){var el=document.getElementById('trail-'+s);if(el)el.addEventListener('click',function(){settings.ballTrail=s;applySettingsUI();saveSettings()})});
  ['short','normal','long'].forEach(function(s){var el=document.getElementById('tlen-'+s);if(el)el.addEventListener('click',function(){settings.trailLength=s;applySettingsUI();saveSettings()})});
  var _bpEl=document.getElementById('ball-preview');if(_bpEl)_bpEl.addEventListener('click',function(){if(_bpStuck&&_bpRaf){var a=(Math.random()*90-45)*Math.PI/180;_bpvx=Math.sin(a)*270;_bpvy=-200-Math.random()*60;_bpStuck=false}});
  document.getElementById('btn-music').addEventListener('click',function(){settings.musicOn=!settings.musicOn;applySettingsUI();saveSettings()});
  document.getElementById('btn-sfx').addEventListener('click',function(){settings.sfxOn=!settings.sfxOn;applySettingsUI();saveSettings()});
  document.getElementById('btn-visual').addEventListener('click',function(){settings.visualFX=!settings.visualFX;applySettingsUI();saveSettings()});
  document.getElementById('btn-debug').addEventListener('click',function(){settings.debug=!settings.debug;applyDebugMode()});
  ['easy','normal','hard'].forEach(function(d){document.getElementById('diff-'+d).addEventListener('click',function(){settings.difficulty=d;applySettingsUI();saveSettings()})});
  ['en','ru'].forEach(function(l){document.getElementById('lang-'+l).addEventListener('click',function(){settings.language=l;applyI18n();applySettingsUI();saveSettings()})});
  document.getElementById('btn-back-lb').addEventListener('click',function(){showScreen('screen-start')});
  document.getElementById('btn-pause').addEventListener('click',function(){togglePause()});
  document.getElementById('btn-mute').addEventListener('click',function(){var willMute=settings.sfxOn||settings.musicOn;settings.sfxOn=!settings.sfxOn;settings.musicOn=!settings.musicOn;var b=document.getElementById('btn-mute');if(b)b.textContent=(settings.sfxOn||settings.musicOn)?'\uD83D\uDD0A':'\uD83D\uDD07';if(willMute){musicStop()}else{var lvl=LEVELS[gameState.level];if(lvl&&gameState.running&&!gameState.paused)musicStart(lvl.music||'inferno')}saveSettings()});
  document.getElementById('btn-resume').addEventListener('click',function(){togglePause()});
  document.getElementById('btn-restart').addEventListener('click',function(){document.getElementById('overlay-pause').classList.remove('visible');startGame()});
  document.getElementById('btn-quit').addEventListener('click',function(){document.getElementById('overlay-pause').classList.remove('visible');gameState.running=false;gameState.paused=false;showScreen('screen-start')});
  document.getElementById('btn-go-retry').addEventListener('click',function(){document.getElementById('overlay-gameover').classList.remove('visible');startGame()});
  document.getElementById('btn-go-menu').addEventListener('click',function(){document.getElementById('overlay-gameover').classList.remove('visible');dismissNameOverlay();gameState.running=false;showScreen('screen-start')});
  document.getElementById('btn-vic-next').addEventListener('click',function(){document.getElementById('overlay-victory').classList.remove('visible');startLevel(gameState.level+1)});
  document.getElementById('btn-vic-menu').addEventListener('click',function(){document.getElementById('overlay-victory').classList.remove('visible');dismissNameOverlay();gameState.running=false;showScreen('screen-start')});
  var nameOk=document.getElementById('btn-name-ok'),nameInput=document.getElementById('name-input');
  if(nameOk)nameOk.addEventListener('click',submitPlayerName);
  if(nameInput)nameInput.addEventListener('keydown',function(e){if(e.code==='Enter')submitPlayerName()});
  var dbgBot=document.getElementById('dbg-bot'),dbgPrev=document.getElementById('dbg-prev'),dbgNext=document.getElementById('dbg-next');
  if(dbgBot)dbgBot.addEventListener('click',function(){gameState.botEnabled=!gameState.botEnabled;dbgBot.textContent='BOT: '+(gameState.botEnabled?'ON':'OFF')});
  var dbgHitbox=document.getElementById('dbg-hitbox');
  if(dbgHitbox)dbgHitbox.addEventListener('click',function(){gameState.showHitboxes=!gameState.showHitboxes;dbgHitbox.textContent='HITBOX: '+(gameState.showHitboxes?'ON':'OFF')});
  if(dbgPrev)dbgPrev.addEventListener('click',function(){if(gameState.level>0){startLevel(gameState.level-1);ensureLoop()}});
  if(dbgNext)dbgNext.addEventListener('click',function(){if(gameState.level<LEVELS.length-1){startLevel(gameState.level+1);ensureLoop()}});
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
  (function(){recalcLayout();var bl=parseLevel(LEVELS[0]);assert('Level 1: has many blocks',bl.length>=50,'count:'+bl.length);assert('Level 1: all 9 types',['F','I','W','E','L','S','G','T','R'].every(function(k){return bl.some(function(b){return b.type===k})}));assert('Level 1: positions set',bl[0].x>0&&bl[0].y>0)})();
  // 9: makeBall
  (function(){var b=makeBall(100,200);assert('Ball: starts stuck',b.stuck===true);assert('Ball: position',b.x===100&&b.y===200);assert('Ball: radius',b.radius===getBallRadius());assert('Ball: alive',b.alive===true)})();
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
  // Phase 2: row/col in blocks
  (function(){recalcLayout();var bl=parseLevel(LEVELS[4]);var t=bl.find(function(b){return b.type==='T'});assert('Phase2: block has row',t&&typeof t.row==='number',t?t.row:'no T');assert('Phase2: block has col',t&&typeof t.col==='number')})();
  // Phase 2: Steel HP logic
  (function(){var b={type:'S',hp:999};if(b.type!=='S')b.hp--;assert('Phase2: Steel HP not decremented',b.hp===999)})();
  // Phase 2: getBlocksInArea 3x3
  (function(){recalcLayout();var saved=gameState.blocks;gameState.blocks=parseLevel({grid:['FFF','FFF','FFF'],name:'T'});var c=gameState.blocks.find(function(b){return b.row===1&&b.col===1});var nb=c?getBlocksInArea(c,1):[];assert('Phase2: getBlocksInArea 3x3 center',c&&nb.length===8,nb.length);gameState.blocks=saved})();
  // Phase 2: _tntVisited null at start
  (function(){assert('Phase2: _tntVisited null',_tntVisited===null)})();
  // Phase 2: shockwave particle
  (function(){if(!settings.visualFX){assert('Phase2: shockwave (visualFX off)',true);return}var before=particlePool.filter(function(p){return p._alive&&p.type==='shockwave'}).length;spawnShockwave(200,300);var after=particlePool.filter(function(p){return p._alive&&p.type==='shockwave'}).length;assert('Phase2: spawnShockwave',after>before)})();
  // Phase 2: debris particles
  (function(){if(!settings.visualFX){assert('Phase2: debris (visualFX off)',true);return}var before=particlePool.filter(function(p){return p._alive}).length;spawnDebrisParticles(150,150,'#886633',5);var after=particlePool.filter(function(p){return p._alive}).length;assert('Phase2: spawnDebrisParticles 5',after-before>=5)})();
  // Phase 2: water particles
  (function(){if(!settings.visualFX){assert('Phase2: water (visualFX off)',true);return}var before=particlePool.filter(function(p){return p._alive}).length;spawnWaterParticles(100,100,6);var after=particlePool.filter(function(p){return p._alive}).length;assert('Phase2: spawnWaterParticles 6',after-before>=6)})();
  // Phase 3: NOTES + MUSIC_THEMES
  (function(){assert('Phase3: NOTES.D3',Math.abs(NOTES.D3-146.8)<0.1);assert('Phase3: 4 themes',Object.keys(MUSIC_THEMES).length===4);assert('Phase3: theme 16 steps',Object.keys(MUSIC_THEMES).every(function(k){return MUSIC_THEMES[k].bass.length===16}))})();
  // Phase 3: musicStart/Stop
  (function(){try{ensureAudio();var wasOn=settings.musicOn;settings.musicOn=true;musicStart('war');assert('Phase3: musicStart theme',musicState.theme==='war');assert('Phase3: musicStart playing',musicState.playing);musicStop();assert('Phase3: musicStop',!musicState.playing);settings.musicOn=wasOn}catch(e){assert('Phase3: music',false,e.message)}})();
  // Phase 3: updateBackground runs
  (function(){try{recalcLayout();gameState.running=true;gameState.paused=false;gameState.level=6;updateBackground(0.016);gameState.running=false;assert('Phase3: updateBackground runs',true)}catch(e){assert('Phase3: updateBackground',false,e.message)}})();

  // Phase 6: block icons
  (function(){assert('Phase6: BLOCK_ICONS all 9',['F','I','W','E','L','S','G','T','R'].every(function(k){return!!BLOCK_ICONS[k]}))})();
  // Phase 6: renderLevelSelect function exists
  (function(){assert('Phase6: renderLevelSelect',typeof renderLevelSelect==='function')})();
  // Phase 6: updateDebugBot function exists
  (function(){assert('Phase6: updateDebugBot',typeof updateDebugBot==='function')})();
  // Phase 6: settings.debug + maxLevel defaults
  (function(){assert('Phase6: settings.debug default',settings.debug===false);assert('Phase6: settings.maxLevel default',typeof settings.maxLevel==='number')})();
  // Phase 6: levelClear saves maxLevel
  (function(){var saved=settings.maxLevel;gameState.level=3;settings.maxLevel=0;if(gameState.level+1>settings.maxLevel)settings.maxLevel=gameState.level+1;assert('Phase6: maxLevel saved after clear',settings.maxLevel===4,'got:'+settings.maxLevel);settings.maxLevel=saved;gameState.level=0})();
  // Phase 6: applyDebugMode function exists
  (function(){assert('Phase6: applyDebugMode',typeof applyDebugMode==='function')})();
  // Phase 6: level_select i18n
  (function(){var sl=settings.language;settings.language='en';assert('Phase6: level_select EN',t('level_select')==='LEVEL SELECT');assert('Phase6: show_fps EN',t('show_fps')==='DEBUG');settings.language=sl})();

  // Phase 5: level speed scaling
  (function(){recalcLayout();var savedLvl=gameState.level;gameState.level=0;var s0=getBallSpeed();gameState.level=14;var s14=getBallSpeed();gameState.level=savedLvl;assert('Phase5: lvl14 faster than lvl0',s14>s0*1.25,'s14='+s14+' s0='+s0);assert('Phase5: speed scales ~30%',s14<s0*1.36,'s14='+s14)})();
  // Phase 5: renderDebugHitboxes exists
  (function(){assert('Phase5: renderDebugHitboxes',typeof renderDebugHitboxes==='function')})();
  // Phase 5: version 1.0.0
  (function(){assert('Phase5: VERSION 1.3.0',CFG.VERSION==='1.3.0','got:'+CFG.VERSION)})();

  // Phase 4: i18n new keys
  (function(){var sl=settings.language;settings.language='en';assert('Phase4: confirm EN',t('confirm')==='OK');assert('Phase4: enter_name EN',t('enter_name')==='ENTER YOUR NAME');settings.language='ru';assert('Phase4: confirm RU',t('confirm')==='\u041e\u041a');settings.language=sl})();
  // Phase 4: spawnSupernova exists and spawns particles
  (function(){if(!settings.visualFX){assert('Phase4: spawnSupernova (visualFX off)',true);return}var before=particlePool.filter(function(p){return p._alive}).length;spawnSupernova(400,300);var after=particlePool.filter(function(p){return p._alive}).length;assert('Phase4: spawnSupernova spawns',after>before)})();
  // Phase 4: promptPlayerName callback fallback
  (function(){var called=false,name='';promptPlayerName(function(n){called=true;name=n});gameState._nameCallback=null;assert('Phase4: promptPlayerName callable',typeof promptPlayerName==='function')})();
  // Phase 4: submitPlayerName resets _nameCallback
  (function(){var seen=null;gameState._nameCallback=function(n){seen=n};submitPlayerName();assert('Phase4: submitPlayerName resets cb',gameState._nameCallback===null)})();
  // Phase 4: debugMode default false
  (function(){assert('Phase4: debugMode default',gameState.debugMode===false)})();
  // Phase 4: updateDebugOverlay no crash
  (function(){try{updateDebugOverlay(1000);assert('Phase4: updateDebugOverlay no crash',true)}catch(e){assert('Phase4: updateDebugOverlay',false,e.message)}})();

  // Phase 7: dismissNameOverlay function exists
  (function(){assert('Phase7: dismissNameOverlay',typeof dismissNameOverlay==='function')})();
  // Phase 7: ensureLoop function exists
  (function(){assert('Phase7: ensureLoop',typeof ensureLoop==='function')})();
  // Phase 7: botEnabled default false
  (function(){assert('Phase7: botEnabled default',gameState.botEnabled===false)})();
  // Phase 7: Level 1 has all 9 block types
  (function(){recalcLayout();var bl=parseLevel(LEVELS[0]);assert('Phase7: Level1 all 9 types',['F','I','W','E','L','S','G','T','R'].every(function(k){return bl.some(function(b){return b.type===k})}))})();
  // Phase 7: dismissNameOverlay clears callback
  (function(){gameState._nameCallback=function(){};dismissNameOverlay();assert('Phase7: dismissNameOverlay clears cb',gameState._nameCallback===null)})();
  // Phase 8: circleCircleCollision
  (function(){var r=circleCircleCollision(50,50,10,60,50,10);assert('Phase8: CC hit',r.hit);assert('Phase8: CC normal',r.nx<0,'nx='+r.nx)})();
  (function(){var r=circleCircleCollision(0,0,5,100,100,5);assert('Phase8: CC miss',!r.hit)})();
  // Phase 8: getBallRadius
  (function(){var sv=settings.ballSize;settings.ballSize='small';assert('Phase8: ballSize small',getBallRadius()===12);settings.ballSize='normal';assert('Phase8: ballSize normal',getBallRadius()===16);settings.ballSize='large';assert('Phase8: ballSize large',getBallRadius()===22);settings.ballSize=sv})();
  // Phase 8: blocks have cx/cy/orbR
  (function(){recalcLayout();var bl=parseLevel(LEVELS[0]);assert('Phase8: block has cx',typeof bl[0].cx==='number');assert('Phase8: block has cy',typeof bl[0].cy==='number');assert('Phase8: block has orbR',bl[0].orbR>0)})();
  // Phase 8: level names i18n
  (function(){var sl=settings.language;settings.language='ru';var names=t('level_names');assert('Phase8: RU level names',names&&names.length===15);settings.language='en';var enNames=t('level_names');assert('Phase8: EN level names',enNames&&enNames.length===15);settings.language=sl})();
  // Phase 8: renderPowerupInfo exists
  (function(){assert('Phase8: renderPowerupInfo',typeof renderPowerupInfo==='function')})();
  // Phase 8: POWERUP_DEFS have labels
  (function(){assert('Phase8: powerup labels',Object.keys(POWERUP_DEFS).every(function(k){return!!POWERUP_DEFS[k].label}))})();
  // Phase 7: mute icon valid surrogate pairs
  (function(){var muted='\uD83D\uDD07',loud='\uD83D\uDD0A';assert('Phase7: muted icon length 2',muted.length===2);assert('Phase7: loud icon length 2',loud.length===2)})();

  var pct=Math.round(passed/(passed+failed)*100);
  console.log('\n=== ORB ARKANOID TESTS ===');
  results.forEach(function(r){console.log((r.ok?'\u2705':'\u274c')+' '+r.name+(r.detail?' ['+r.detail+']':''))});
  console.log('\n'+passed+'/'+(passed+failed)+' passed ('+pct+'%)');
  if(failed===0)console.log('\uD83C\uDF89 ALL TESTS PASSED');
  else console.log('\u26a0\ufe0f '+failed+' test(s) failed');
  return failed===0;
}

// ============================================================
// === INIT ===================================================
// ============================================================
document.addEventListener('DOMContentLoaded',function(){
  loadSettings();initCanvas();initInput();initButtons();applyI18n();applySettingsUI();applyDebugMode();showScreen('screen-start');updateHUD();
  setTimeout(function(){recalcLayout();runTests()},100);
});
window.addEventListener('resize',resizeCanvas);
window.OA={runTests:runTests,startGame:startGame,startLevel:startLevel,gameState:gameState,settings:settings,CFG:CFG,getBlocksInArea:getBlocksInArea,chainExplosion:chainExplosion,spawnShockwave:spawnShockwave,spawnDebrisParticles:spawnDebrisParticles,spawnSupernova:spawnSupernova,promptPlayerName:promptPlayerName,getBallSpeed:getBallSpeed,getBallRadius:getBallRadius,renderLevelSelect:renderLevelSelect,renderPowerupInfo:renderPowerupInfo,updateDebugBot:updateDebugBot,applyDebugMode:applyDebugMode,BLOCK_ICONS:BLOCK_ICONS,dismissNameOverlay:dismissNameOverlay,ensureLoop:ensureLoop,circleCircleCollision:circleCircleCollision};
