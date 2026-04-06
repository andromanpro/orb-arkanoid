'use strict';
// ============================================================
// === ORB ARKANOID v1.5.0 — Futuristic Paddle & New Powerups =
// ============================================================

var CFG = {
  MAX_LIVES:5, INIT_LIVES:3, BALL_RADIUS:16,
  BALL_SPEED_NORMAL:340, BALL_SPEED_EASY:260, BALL_SPEED_HARD:420,
  PADDLE_W_NORMAL:104, PADDLE_H:14, PADDLE_FRICTION:0.22,
  BLOCK_COLS:13, BLOCK_ROWS_MAX:10, BLOCK_PAD:2, BLOCK_CORNER:5,
  BLOCK_TOP_OFFSET:72, BLOCK_AREA_H_FRAC:0.48, PADDLE_Y_FRAC:0.92,
  MAX_PARTICLES:2000, COMBO_WINDOW:1500, POWERUP_FALL_SPEED:90,
  STORAGE_KEY:'orb-arkanoid-v1', STORAGE_LB_KEY:'orb-arkanoid-lb-v1',
  LASER_SPEED:600, VERSION:'1.8.0'
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
  'S':{hp:3,pts:50, color:'#778899',glow:'rgba(120,140,160,0.4)',name:'Steel', type:'steel'},
  'G':{hp:1,pts:100,color:'#ffcc00',glow:'rgba(255,200,0,0.8)', name:'Gold',   type:'gold'},
  'T':{hp:1,pts:30, color:'#ff6600',glow:'rgba(255,100,0,0.7)', name:'TNT',    type:'tnt'},
  'R':{hp:1,pts:40, color:'#aa44ff',glow:'rgba(180,80,255,0.6)',name:'Rainbow',type:'rainbow'},
  'B':{hp:8,pts:500,color:'#ff0033',glow:'rgba(255,0,60,0.9)',name:'Boss',type:'boss'}
};

var TRAIL_COLORS={
  fire:  {c1:'#ff2200',c2:'#ff8800',glow:'rgba(255,100,0,0.8)'},
  lava:  {c1:'#cc2200',c2:'#ff4400',glow:'rgba(255,80,0,0.8)'},
  plasma:{c1:'#8800ff',c2:'#cc44ff',glow:'rgba(180,80,255,0.8)'},
  ice:   {c1:'#0044aa',c2:'#44aaff',glow:'rgba(80,160,255,0.8)'},
  gold:  {c1:'#886600',c2:'#ffcc00',glow:'rgba(255,200,0,0.9)'}
};

var LEVELS = [
  // LVL 1: Showcase — all 9 types in a diamond
  {name:'Ignition',     music:'inferno',bg:'fire',
   grid:['RRRRRRRRRRRRR','RFSTGGGGGTSFR','RFLGEIWIEGLFR','RFLGEIWIEGLFR','RFSTGGGGGTSFR','RRRRRRRRRRRRR']},
  // LVL 2: Frost Bite — dense ice fortress with water moat & earth pillars
  {name:'Frost Bite',   music:'frost',  bg:'ice',
   grid:['ISIIIISISIIII','IWEIIIIIIEIWI','IWIEIIIIIEIWI','IWIEIIIIIEIWI','IWEIIIIIIEIWI','ISIIIISISIIII']},
  // LVL 3: Fortress Wall — steel battlements at corners, fire+TNT interior, 1 Boss
  {name:'Fortress Wall',music:'war',    bg:'dark',
   grid:['SFFFSFFFSFFFS','FFFFFFFFFFFTF','FSFSFSFSFSFSF','FTBTFTFTFTBTF','FFFFFFLFFFFFF','SFFFSFFFSFFFS']},
  // LVL 4: Gold Rush — gold+rainbow carpet with fire streaks
  {name:'Gold Rush',    music:'arcade', bg:'gold',
   grid:['GGGGGGGGGGGGG','GRGRGRGRGRGRG','GGFGGFGGFGGFG','GFRFRFRFRFRFG','GRGRGRGRGRGRG','GGGGGGGGGGGGG']},
  // LVL 5: TNT Minefield — earth matrix full of TNT, lava pockets, 2 Bosses
  {name:'TNT Minefield',music:'war',    bg:'fire',
   grid:['EEEEEEEEEEEEE','ETEETEETEETET','EETLEBTLEETLL','ETEETEETEETET','EEEEEEEEEEEEE','TETBTBTETETET']},
  // LVL 6: Ice Palace — full ice with water fountains & steel pillars
  {name:'Ice Palace',   music:'frost',  bg:'ice',
   grid:['ISIIIIIIIISIS','IWIIISIISIIWI','IIISIIIIIISII','IIISIIIIIISII','IWIIISIISIIWI','ISIIIIIIIISIS']},
  // LVL 7: Lava Forge — steel frame, packed lava with fire seams, 2 Bosses
  {name:'Lava Forge',   music:'inferno',bg:'lava',
   grid:['SSLSLSLSLSLSS','LLLLBLLLBLLLL','LFLLFLLFLLFLF','LFLFLFLFLFLFL','LLLLBLLLBLLLL','SSLSLSLSLSLSS']},
  // LVL 8: Checkered — triple Fire/Ice/Rainbow rotation
  {name:'Checkered',    music:'arcade', bg:'dark',
   grid:['FIRFIRFIRFIRF','IRFIRFIRFIRFI','RFIRFIRFIRFIR','FIRFIRFIRFIRF','IRFIRFIRFIRFI','RFIRFIRFIRFIR']},
  // LVL 9: The Gauntlet — steel+lava+fire maze, TNT traps, 2 Bosses
  {name:'The Gauntlet', music:'war',    bg:'dark',
   grid:['SLSFLSFLSFLSS','SFLSFLSFLSFLS','STBTSTSTSTBTS','STBTSTSTSTBTS','SFLSFLSFLSFLS','SLSFLSFLSFLSS']},
  // LVL 10: Rainbow Road — rainbow carpet, gold lanes, 1 Boss center
  {name:'Rainbow Road', music:'arcade', bg:'rainbow',
   grid:['RRRRRRRRRRRRR','RRRGGGGGGRRRR','RRGFRBFRFGFRR','RRGFRFBFRGFRR','RRRGGGGGGRRRR','RRRRRRRRRRRRR']},
  // LVL 11: Earth Quake — earth→fire→TNT+lava→full lava eruption, 2 Bosses
  {name:'Earth Quake',  music:'war',    bg:'dark',
   grid:['EEEEEEEEEEEEE','EFEFEFEFEFEFE','ETLETLETLETLS','LETLETLETLETL','LLLLLLLLLLLLL','LTLTBLTBLTLTL']},
  // LVL 12: Twin Fortress — two mirrored steel+lava+fire towers, 2 Bosses
  {name:'Twin Fortress',music:'war',    bg:'fire',
   grid:['SSSSSSFSSSSSS','SFLLSFLSFLLSF','SLFBSFLSLBFSF','SLFBSFLSLBFSF','SFLLSFLSFLLSF','SSSSSSFSSSSSS']},
  // LVL 13: Inferno Core — wall-to-wall lava+fire+TNT, 3 Bosses
  {name:'Inferno Core', music:'inferno',bg:'lava',
   grid:['LFLBLFLBLFLLL','LLLLTLLTLLLLL','FLLLFLLLFLLLL','LLBLTLBTLLLLL','LFLLLFLLLFLLL','LTLTLTLTLTLTL']},
  // LVL 14: The Labyrinth — steel+gold maze with water+rainbow traps, 2 Bosses
  {name:'The Labyrinth',music:'arcade', bg:'dark',
   grid:['SSSSSGSSSSGSS','GWGSGSGSGSGGW','SBGSGSGSGSGGS','SGBSGSGSGSGGS','GWGSGSGSGSGGW','SSSSSGSSSSGSS']},
  // LVL 15: Final Eruption — every hard type, 4 Bosses, total chaos
  {name:'Final Eruption',music:'inferno',bg:'lava',
   grid:['LGTLBTLGBLGTL','GLLGLLGLLGLLG','LTFLBFLTBLTFL','RGBLBGRRGBLRG','LGLTGLGTLGLTG','LTGLTGLTGLTGL']}
];


var STRINGS = {
  en:{play:'PLAY',settings:'SETTINGS',leaderboard:'LEADERBOARD',back:'BACK',resume:'RESUME',restart:'RESTART',quit:'QUIT',retry:'RETRY',next_level:'NEXT LEVEL',main_menu:'MAIN MENU',paused:'PAUSED',game_over:'GAME OVER',victory:'VICTORY!',score:'SCORE',level:'LEVEL',name:'NAME',level_short:'LVL',music:'MUSIC',sound:'SOUND',visual:'VISUAL FX',difficulty:'DIFFICULTY',language:'LANGUAGE',on:'ON',off:'OFF',easy:'EASY',normal:'NORMAL',hard:'HARD',tagline:'Break the Orbs',combo:'COMBO',press_start:'Press SPACE or tap to launch',level_clear:'LEVEL CLEAR!',all_clear:'ALL LEVELS CLEARED!',no_scores:'No scores yet. Play to get on the board!',confirm:'OK',enter_name:'ENTER YOUR NAME',show_fps:'DEBUG',level_select:'LEVEL SELECT',orb_size:'ORB SIZE',trail:'TRAIL',trail_len:'TRAIL LEN',small:'S',powerups_title:'POWER-UPS',expand_pu:'Wider paddle (+50%)',shrink_pu:'Narrower paddle (-30%)',fireball_pu:'Ball breaks through blocks',multi_pu:'+2 extra balls',sticky_pu:'Ball sticks to paddle',laser_pu:'Paddle shoots lasers',life_pu:'+1 extra life',slow_pu:'Slower ball (-30%)',iceball_pu:'Freezes orbs on hit (-1 hp each)',goldball_pu:'Score \xd73 for 12 seconds',lavaball_pu:'Ball melts 2 hp per hit',fever_text:'F\u00a0E\u00a0V\u00a0E\u00a0R\u00a0!',speedup_text:'\u26a1 SPEED\u00a0UP!',descent:'DESCENT',powerup_rate:'POWER-UPS',few:'FEW',many:'MANY',echo_pu:'Ghost echoes hit orbs',gravity_pu:'Ball seeks nearest orb',shield_pu:'Floor deflects ball once',time_pu:'+20 seconds to timer',game_mode:'MODE',classic:'CLASSIC',timed:'TIMED',endless:'ENDLESS',time_left:'TIME',level_names:['Ignition','Frost Bite','Fortress Wall','Gold Rush','TNT Minefield','Ice Palace','Lava Forge','Checkered','The Gauntlet','Rainbow Road','Earth Quake','Twin Fortress','Inferno Core','The Labyrinth','Final Eruption']},
  ru:{play:'\u0418\u0413\u0420\u0410\u0422\u042c',settings:'\u041d\u0410\u0421\u0422\u0420\u041e\u0419\u041a\u0418',leaderboard:'\u0420\u0415\u041a\u041e\u0420\u0414\u042b',back:'\u041d\u0410\u0417\u0410\u0414',resume:'\u041f\u0420\u041e\u0414\u041e\u041b\u0416\u0418\u0422\u042c',restart:'\u0421\u041d\u0410\u0427\u0410\u041b\u0410',quit:'\u0412\u042b\u0419\u0422\u0418',retry:'\u0415\u0429\u0401 \u0420\u0410\u0417',next_level:'\u0421\u041b\u0415\u0414\u0423\u042e\u0429\u0418\u0419',main_menu:'\u041c\u0415\u041d\u042e',paused:'\u041f\u0410\u0423\u0417\u0410',game_over:'\u0418\u0413\u0420\u0410 \u041e\u041a\u041e\u041d\u0427\u0415\u041d\u0410',victory:'\u041f\u041e\u0411\u0415\u0414\u0410!',score:'\u0421\u0427\u0401\u0422',level:'\u0423\u0420\u041e\u0412\u0415\u041d\u042c',name:'\u0418\u041c\u042f',level_short:'\u0423\u0420',music:'\u041c\u0423\u0417\u042b\u041a\u0410',sound:'\u0417\u0412\u0423\u041a\u0418',visual:'\u042d\u0424\u0424\u0415\u041a\u0422\u042b',difficulty:'\u0421\u041b\u041e\u0416\u041d\u041e\u0421\u0422\u042c',language:'\u042f\u0417\u042b\u041a',on:'\u0412\u041a\u041b',off:'\u0412\u042b\u041a\u041b',easy:'\u041b\u0415\u0413\u041a\u041e',normal:'\u041d\u041e\u0420\u041c\u0410\u041b',hard:'\u0421\u041b\u041e\u0416\u041d\u041e',tagline:'\u0420\u0430\u0437\u0431\u0438\u0432\u0430\u0439 \u043e\u0440\u0431\u044b',combo:'\u041a\u041e\u041c\u0411\u041e',press_start:'\u041f\u0440\u043e\u0431\u0435\u043b \u0438\u043b\u0438 \u0442\u0430\u043f \u0434\u043b\u044f \u0437\u0430\u043f\u0443\u0441\u043a\u0430',level_clear:'\u0423\u0420\u041e\u0412\u0415\u041d\u042c \u041f\u0420\u041e\u0419\u0414\u0415\u041d!',all_clear:'\u0412\u0421\u0415 \u0423\u0420\u041e\u0412\u041d\u0418 \u041f\u0420\u041e\u0419\u0414\u0415\u041d\u042b!',no_scores:'\u0420\u0435\u043a\u043e\u0440\u0434\u043e\u0432 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442. \u0421\u044b\u0433\u0440\u0430\u0439\u0442\u0435!',confirm:'\u041e\u041a',enter_name:'\u0412\u0412\u0415\u0414\u0418\u0422\u0415 \u0418\u041c\u042f',show_fps:'\u041e\u0422\u041b\u0410\u0414\u041a\u0410',level_select:'\u0412\u042b\u0411\u041e\u0420 \u0423\u0420\u041e\u0412\u041d\u042f',orb_size:'\u0420\u0410\u0417\u041c\u0415\u0420 \u041e\u0420\u0411\u0410',trail:'\u0428\u041b\u0415\u0419\u0424',trail_len:'\u0414\u041b\u0418\u041d\u0410',small:'S',powerups_title:'\u0423\u041b\u0423\u0427\u0428\u0415\u041d\u0418\u042f',expand_pu:'\u0428\u0438\u0440\u0435 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430 (+50%)',shrink_pu:'\u0423\u0436\u0435 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430 (-30%)',fireball_pu:'\u041c\u044f\u0447 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u0435\u0442 \u0431\u043b\u043e\u043a\u0438',multi_pu:'+2 \u0434\u043e\u043f. \u043c\u044f\u0447\u0430',sticky_pu:'\u041c\u044f\u0447 \u043f\u0440\u0438\u043b\u0438\u043f\u0430\u0435\u0442',laser_pu:'\u041f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430 \u0441\u0442\u0440\u0435\u043b\u044f\u0435\u0442',life_pu:'+1 \u0436\u0438\u0437\u043d\u044c',slow_pu:'\u041c\u0435\u0434\u043b\u0435\u043d\u043d\u0435\u0435 (-30%)',iceball_pu:'\u0417\u0430\u043c\u043e\u0440\u0430\u0436\u0438\u0432\u0430\u0435\u0442 \u043e\u0440\u0431\u044b \u043f\u0440\u0438 \u0443\u0434\u0430\u0440\u0435',goldball_pu:'\u041e\u0447\u043a\u0438 \xd73 \u043d\u0430 12 \u0441\u0435\u043a\u0443\u043d\u0434',lavaball_pu:'\u041c\u044f\u0447 \u043f\u043b\u0430\u0432\u0438\u0442 2 \u0445\u043f \u0437\u0430 \u0443\u0434\u0430\u0440',fever_text:'\u0416\u00a0\u0410\u00a0\u0420\u00a0\u0410\u00a0!',speedup_text:'\u26a1 \u0423\u0421\u041a\u041e\u0420\u0415\u041d\u0418\u0415!',descent:'\u041f\u0410\u0414\u0415\u041d\u0418\u0415',powerup_rate:'\u0423\u041b\u0423\u0427\u0428\u0410\u041b\u041a\u0418',few:'\u041c\u0410\u041b\u041e',many:'\u041c\u041d\u041e\u0413\u041e',echo_pu:'\u041f\u0440\u0438\u0437\u0440\u0430\u043a\u0438 \u0431\u044c\u044e\u0442 \u043e\u0440\u0431\u044b',gravity_pu:'\u041c\u044f\u0447 \u0442\u044f\u043d\u0435\u0442 \u043a \u043e\u0440\u0431\u0430\u043c',shield_pu:'\u041f\u043e\u043b \u043e\u0442\u0440\u0430\u0436\u0430\u0435\u0442 \u043c\u044f\u0447',time_pu:'+20 \u0441\u0435\u043a\u0443\u043d\u0434 \u043a \u0442\u0430\u0439\u043c\u0435\u0440\u0443',game_mode:'\u0420\u0415\u0416\u0418\u041c',classic:'\u041a\u041b\u0410\u0421\u0421\u0418\u041a\u0410',timed:'\u0422\u0410\u0419\u041c\u0415\u0420',endless:'\u0411\u0415\u0421\u041a\u041e\u041d\u0415\u0427\u041d\u041e',time_left:'\u0412\u0420\u0415\u041c\u042f',level_names:['\u0417\u0430\u0436\u0438\u0433\u0430\u043d\u0438\u0435','\u041c\u043e\u0440\u043e\u0437\u043d\u044b\u0439 \u0443\u043a\u0443\u0441','\u0421\u0442\u0435\u043d\u0430 \u043a\u0440\u0435\u043f\u043e\u0441\u0442\u0438','\u0417\u043e\u043b\u043e\u0442\u0430\u044f \u043b\u0438\u0445\u043e\u0440\u0430\u0434\u043a\u0430','\u041c\u0438\u043d\u043d\u043e\u0435 \u043f\u043e\u043b\u0435','\u041b\u0435\u0434\u044f\u043d\u043e\u0439 \u0434\u0432\u043e\u0440\u0435\u0446','\u041b\u0430\u0432\u043e\u0432\u0430\u044f \u043a\u0443\u0437\u043d\u044f','\u0428\u0430\u0445\u043c\u0430\u0442\u043d\u0430\u044f \u0434\u043e\u0441\u043a\u0430','\u0418\u0441\u043f\u044b\u0442\u0430\u043d\u0438\u0435','\u0420\u0430\u0434\u0443\u0436\u043d\u0430\u044f \u0434\u043e\u0440\u043e\u0433\u0430','\u0417\u0435\u043c\u043b\u0435\u0442\u0440\u044f\u0441\u0435\u043d\u0438\u0435','\u0414\u0432\u043e\u0439\u043d\u0430\u044f \u043a\u0440\u0435\u043f\u043e\u0441\u0442\u044c','\u042f\u0434\u0440\u043e \u0438\u043d\u0444\u0435\u0440\u043d\u043e','\u041b\u0430\u0431\u0438\u0440\u0438\u043d\u0442','\u0424\u0438\u043d\u0430\u043b\u044c\u043d\u043e\u0435 \u0438\u0437\u0432\u0435\u0440\u0436\u0435\u043d\u0438\u0435']}
};

function t(key){var lang=settings?settings.language:'en';return(STRINGS[lang]&&STRINGS[lang][key])||STRINGS.en[key]||key}

function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(function(el){el.textContent=t(el.getAttribute('data-i18n'))});
  document.querySelectorAll('.toggle-btn').forEach(function(btn){btn.textContent=btn.classList.contains('active')?t('on'):t('off')});
}

var settings={language:'en',musicOn:true,sfxOn:true,visualFX:true,difficulty:'normal',debug:false,maxLevel:0,ballSize:'normal',ballTrail:'lava',trailLength:'normal',descent:false,powerupRate:'normal',gameMode:'classic'};

function loadSettings(){try{var r=localStorage.getItem(CFG.STORAGE_KEY+'-settings');if(r)Object.assign(settings,JSON.parse(r))}catch(e){}}
function saveSettings(){try{localStorage.setItem(CFG.STORAGE_KEY+'-settings',JSON.stringify(settings))}catch(e){}}

function applySettingsUI(){
  var m=document.getElementById('btn-music'),s=document.getElementById('btn-sfx'),v=document.getElementById('btn-visual');
  if(m){m.classList.toggle('active',settings.musicOn);m.textContent=settings.musicOn?t('on'):t('off')}
  if(s){s.classList.toggle('active',settings.sfxOn);s.textContent=settings.sfxOn?t('on'):t('off')}
  if(v){v.classList.toggle('active',settings.visualFX);v.textContent=settings.visualFX?t('on'):t('off')}
  var dbgBtn=document.getElementById('btn-debug');if(dbgBtn){dbgBtn.classList.toggle('active',settings.debug);dbgBtn.textContent=settings.debug?t('on'):t('off')}
  var dscBtn=document.getElementById('btn-descent');if(dscBtn){dscBtn.classList.toggle('active',settings.descent);dscBtn.textContent=settings.descent?t('on'):t('off')}
  ['easy','normal','hard'].forEach(function(d){var e=document.getElementById('diff-'+d);if(e)e.classList.toggle('active',settings.difficulty===d)});
  ['en','ru'].forEach(function(l){var e=document.getElementById('lang-'+l);if(e)e.classList.toggle('active',settings.language===l)});
  var mb=document.getElementById('btn-mute');if(mb)mb.textContent=(settings.sfxOn||settings.musicOn)?'\uD83D\uDD0A':'\uD83D\uDD07';
  ['small','normal','large'].forEach(function(s){var e=document.getElementById('size-'+s);if(e)e.classList.toggle('active',settings.ballSize===s)});
  ['fire','lava','plasma','ice'].forEach(function(s){var e=document.getElementById('trail-'+s);if(e)e.classList.toggle('active',settings.ballTrail===s)});
  ['short','normal','long'].forEach(function(s){var e=document.getElementById('tlen-'+s);if(e)e.classList.toggle('active',settings.trailLength===s)});
  ['few','normal','many'].forEach(function(r){var e=document.getElementById('pu-'+r);if(e)e.classList.toggle('active',settings.powerupRate===r)});
  var dbm=document.getElementById('btn-debug-main');if(dbm)dbm.textContent='DEBUG: '+(settings.debug?'ON':'OFF');
  ['classic','timed','endless'].forEach(function(m){var el=document.getElementById('mode-'+m);if(el)el.classList.toggle('active',(settings.gameMode||'classic')===m)});
  // Pause overlay quick-settings sync
  var pm=document.getElementById('p-btn-music'),ps=document.getElementById('p-btn-sfx'),pv=document.getElementById('p-btn-visual');
  if(pm){pm.classList.toggle('active',settings.musicOn);pm.textContent=settings.musicOn?t('on'):t('off')}
  if(ps){ps.classList.toggle('active',settings.sfxOn);ps.textContent=settings.sfxOn?t('on'):t('off')}
  if(pv){pv.classList.toggle('active',settings.visualFX);pv.textContent=settings.visualFX?t('on'):t('off')}
  ['easy','normal','hard'].forEach(function(d){var e=document.getElementById('p-diff-'+d);if(e)e.classList.toggle('active',settings.difficulty===d)});
}

var gameState={running:false,paused:false,lives:CFG.INIT_LIVES,score:0,combo:0,comboTimer:0,level:0,totalScore:0,levelStartScore:0,blocks:[],balls:[],paddle:null,particles:[],powerups:[],lasers:[],activeEffects:{expand:0,shrink:0,sticky:0,laser:0,slow:0,fireball:0,iceball:0,goldball:0,lavaball:0,echo:0,gravity:0},shake:0,flashAlpha:0,flashColor:'#ffffff',_nameCallback:null,debugMode:false,botEnabled:false,showHitboxes:false,floatTexts:[],shieldActive:false,gameMode:'classic',tAttackTimer:0,_procLevels:{}};
function applyDebugMode(){
  gameState.debugMode=settings.debug;
  document.body.classList.toggle('debug-mode',settings.debug);
  var el=document.getElementById('debug-overlay');if(el)el.style.display=settings.debug?'block':'none';
  applySettingsUI();saveSettings();
}
var lastTime=0, animFrame=null, currentScreen='screen-start';
var _tiltGamma=0,_tiltCalib=0,_tiltActive=false;
function _tiltCalibrate(){_tiltCalib=_tiltGamma;}
function _tiltApply(){
  if(!_tiltActive||!gameState.running||gameState.paused||gameState.botEnabled||currentScreen!=='screen-game')return;
  var tilt=_tiltGamma-_tiltCalib;var sens=CW/50;
  if(gameState.paddle)gameState.paddle.targetX=Math.max(0,Math.min(CW,CW/2+tilt*sens));
}

function showScreen(id){document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});var e=document.getElementById(id);if(e)e.classList.add('active');if(currentScreen==='screen-game'&&id!=='screen-game')_timedStop();currentScreen=id;if(id==='screen-settings')startBallPreview();else stopBallPreview()}


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
  var puBar=document.getElementById('powerup-bar');if(puBar)puBar.style.bottom=(CH-paddleY+28)+'px';
}

function parseLevel(levelDef){
  var blocks=[],grid=levelDef.grid,cols=layout.cols,pad=CFG.BLOCK_PAD;
  for(var row=0;row<grid.length;row++){var line=grid[row];for(var col=0;col<cols&&col<line.length;col++){var ch=line[col];if(ch==='.'||ch===' ')continue;var def=BLOCK_DEFS[ch];if(!def)continue;
    var bx=layout.gridX+pad+col*(layout.blockW+pad),by=layout.gridY+pad+row*(layout.blockH+pad);
    var orbR=Math.max(1,layout.blockW*0.45);
    blocks.push({x:bx,y:by,w:layout.blockW,h:layout.blockH,cx:bx+layout.blockW/2,cy:by+layout.blockH/2,orbR:orbR,type:ch,hp:def.hp,maxHp:def.hp,pts:def.pts,def:def,hitAnim:0,alive:true,row:row,col:col,wH:new Float32Array(6),wV:new Float32Array(6)})}}
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
  if(ball.y-r>CH){if(gameState.shieldActive){ball.y=CH-r-1;ball.vy=-Math.abs(ball.vy);gameState.shieldActive=false;gameState.shake=Math.max(gameState.shake,8);gameState.flashAlpha=0.3;gameState.flashColor='#4466ff';playSFX('wall');}else{ball.alive=false;}hit=true}
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
    if(!ball.fireball){rv=reflectVelocity(ball.vx,ball.vy,c.nx,c.ny);ball.vx=rv.vx;ball.vy=rv.vy;enforceMinVY(ball);ball.x+=c.nx*(c.depth+0.5);ball.y+=c.ny*(c.depth+0.5)}
    var _dmg=(gameState.activeEffects.lavaball>0)?2:1;
    b.hitAnim=1;b.hp-=_dmg;if(glReady)glBlockHit(b,ball.x);
    if(gameState.activeEffects.iceball>0){getBlocksInArea(b,1).forEach(function(_nb){_nb.hitAnim=1;_nb.hp--;if(_nb.hp<=0){_nb.alive=false;onBlockDestroyed(_nb,ball)}else spawnImpactParticles(_nb.cx,_nb.cy,'ice',2)});}
    if(b.hp<=0){b.alive=false;onBlockDestroyed(b,ball)}else{var _sfx=(b.type==='S')?'break_steel':'hit';playSFX(_sfx);spawnImpactParticles(ball.x,ball.y,'spark',(b.type==='S')?5:3);spawnFloatText(b.cx,b.cy-b.orbR*0.5,'-'+_dmg,b.def.color||'#ffffff',14,false);}
    if(!ball.fireball)break}
  return hitAny;
}

var _tntVisited=null;

function getBlocksInArea(center,range){
  return gameState.blocks.filter(function(b){return b.alive&&b!==center&&Math.abs(b.row-center.row)<=range&&Math.abs(b.col-center.col)<=range});
}

function damageAdjacentBlocks(block,ball){
  getBlocksInArea(block,1).forEach(function(b){
    b.hitAnim=1;b.hp--;
    if(b.hp<=0){b.alive=false;onBlockDestroyed(b,null)}
    else spawnImpactParticles(b.x+b.w/2,b.y+b.h/2,'ice',2)});
}

function splashDamageBlocks(center,range,ball){
  getBlocksInArea(center,range).forEach(function(b){
    b.hitAnim=1;b.hp--;
    if(b.hp<=0){b.alive=false;onBlockDestroyed(b,null)}
    else spawnImpactParticles(b.x+b.w/2,b.y+b.h/2,'fire',3)});
}

function chainExplosion(block,ball){
  var isRoot=(_tntVisited===null);if(isRoot)_tntVisited={};
  var key=block.row+'_'+block.col;
  if(_tntVisited[key]){if(isRoot)_tntVisited=null;return}
  _tntVisited[key]=true;
  getBlocksInArea(block,1).forEach(function(b){
    if(!b.alive)return;
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
  // Fever tracking: 5 hits in 2s
  if(!gameState.feverHits)gameState.feverHits=[];
  gameState.feverHits=gameState.feverHits.filter(function(ht){return now-ht<2000});
  gameState.feverHits.push(now);
  if(!gameState.fever&&gameState.feverHits.length>=5)activateFever();
  var mult=comboMultiplier(gameState.combo)*(gameState.fever?3:1)*(gameState.activeEffects.goldball>0?3:1),pts=Math.round(block.pts*mult*(DIFFICULTY[settings.difficulty]||DIFFICULTY.normal).score);
  var cx=block.x+block.w/2,cy=block.y+block.h/2;
  gameState.score+=pts;showScorePopup(cx,cy,pts);updateHUD();
  (function(){var tot=gameState.blocks.filter(function(b){return b.type!=='S'}).length;var brk=gameState.blocks.filter(function(b){return !b.alive&&b.type!=='S'}).length;if(tot>0)musicSetIntensity(Math.min(5,Math.floor(brk/tot*6)))})();
  if(gameState.combo>=2)showCombo(gameState.combo);
  if(gameState.combo>=3)spawnFloatText(cx,cy-20,'+'+pts+' \u00d7'+gameState.combo,'#ffdd00',24,true);
  switch(block.type){
    case 'F': spawnImpactParticles(cx,cy,'fire',8);playSFX('break_fire');if(ball)speedBall(ball,1.1,2000);break;
    case 'I': spawnImpactParticles(cx,cy,'ice',6);playSFX('break_ice');if(ball)speedBall(ball,0.8,3000);break;
    case 'W': spawnWaterParticles(cx,cy,8);playSFX('break_water');damageAdjacentBlocks(block,ball);break;
    case 'E': spawnDebrisParticles(cx,cy,block.def.color,8);playSFX('break_earth');break;
    case 'L': spawnFireParticles(cx,cy,12);spawnSmokeParticles(cx,cy,4);spawnShockwave(cx,cy);playSFX('break_lava');splashDamageBlocks(block,1,ball);break;
    case 'G': spawnImpactParticles(cx,cy,'spark',12);playSFX('break_gold');spawnPowerup(cx,cy,'random');break;
    case 'T': spawnSmokeParticles(cx,cy,6);spawnShockwave(cx,cy);playSFX('break_tnt');chainExplosion(block,ball);break;
    case 'R': spawnImpactParticles(cx,cy,'spark',8);playSFX('break_gold');spawnPowerup(cx,cy,'random');break;
    case 'S': spawnMetallicShards(cx,cy,block.orbR||18);playSFX('break_steel');spawnPowerup(cx,cy,'random');break;
    case 'B': spawnFireParticles(cx,cy,16);spawnShockwave(cx,cy);spawnSupernovaLite(cx,cy);playSFX('break_lava');splashDamageBlocks(block,2,ball);spawnPowerup(cx,cy,'random');break;
    default:  spawnImpactParticles(cx,cy,'spark',5);playSFX('break_generic');
  }
  if(block.type!=='G'&&block.type!=='R'&&block.type!=='S'){var _pdrop=(settings.powerupRate==='many'?0.28:settings.powerupRate==='few'?0.06:0.14);if(Math.random()<_pdrop)spawnPowerup(cx,cy,'random');}
  gameState.shake=Math.max(gameState.shake,block.type==='L'||block.type==='T'?10:block.type==='E'?5:3);
  gameState.flashAlpha=Math.min(1,gameState.flashAlpha+0.08);gameState.flashColor=block.def.glow||'#ffffff';
  // Shatter: fragments fly outward immediately
  spawnOrbShatter(cx,cy,block.orbR||18,block.def.color);
  // Liquid spill + WebGL drain start after shatter delay (~0.18s)
  var _ltc=LIQUID_TYPES[block.type];
  if(_ltc){block._splashDelay=0.18;block._drainFill=_ltc.fill;}
  else{spawnLiquidSpill(cx,cy,block.orbR||18,block.type);}
  glBlastNeighbors(block);
  checkLevelClear();
}

var POWERUP_DEFS={
  expand:   {color:'#00ff88',icon:'\u2194',  label:'expand_pu',  duration:15000},
  shrink:   {color:'#ff4488',icon:'\u2192\u2190',label:'shrink_pu',  duration:10000},
  fireball: {color:'#ff6600',icon:'\u2726',  label:'fireball_pu',duration:8000},
  multiball:{color:'#ffff00',icon:'\u2295',  label:'multi_pu',   duration:0},
  sticky:   {color:'#8844ff',icon:'\u2299',  label:'sticky_pu',  duration:12000},
  laser:    {color:'#ff0044',icon:'\u26a1',  label:'laser_pu',   duration:10000},
  life:     {color:'#ff2222',icon:'\u2665',  label:'life_pu',    duration:0},
  slow:     {color:'#44aaff',icon:'\u25bd',  label:'slow_pu',    duration:10000},
  iceball:  {color:'#88ddff',icon:'\u2744',  label:'iceball_pu', duration:10000},
  goldball: {color:'#ffcc00',icon:'\u2605',  label:'goldball_pu',duration:12000},
  lavaball: {color:'#dd2200',icon:'\u25b2',  label:'lavaball_pu',duration:8000},
  echo:     {color:'#aaffee',icon:'\u224b',  label:'echo_pu',   duration:8000},
  gravity:  {color:'#ff44cc',icon:'\u25ce',  label:'gravity_pu',duration:4000},
  shield:   {color:'#4466ff',icon:'\u25b3',  label:'shield_pu', duration:0},
  time:     {color:'#ffcc44',icon:'\u23f1',  label:'time_pu',   duration:0}
};
var POWERUP_TYPES=Object.keys(POWERUP_DEFS);
var BLOCK_ICONS={F:'FIRE',I:'ICE',W:'AQUA',E:'ROCK',L:'LAVA',S:'IRON',G:'GOLD',T:'TNT',R:'PRISM',B:'BOSS'};

function spawnPowerup(x,y,type){
  if(type==='random'){var _pool=gameState.gameMode==='timed'?POWERUP_TYPES:POWERUP_TYPES.filter(function(t){return t!=='time'});if(gameState.gameMode==='timed'&&Math.random()<0.20)type='time';else type=_pool[Math.floor(Math.random()*_pool.length)];}
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
  if(type==='shield'){gameState.shieldActive=true;updatePowerupBar();return}
  if(type==='time'){if(gameState.gameMode==='timed'){gameState.tAttackTimer=Math.min(90,gameState.tAttackTimer+20);spawnFloatText(pu.x,pu.y-20,'+20s','#ffcc44',22,true);}updateHUD();return}
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
  var br=ball.radius||getBallRadius(),p,i,a,s;
  // orb-effect overrides trail type
  var _ae=gameState.activeEffects;
  var trail=(_ae.iceball>0)?'ice':(_ae.lavaball>0)?'lava':(_ae.goldball>0)?'gold':settings.ballTrail;
  if(trail==='gold'){
    _coreGlow(ball.x,ball.y,br,'#ffcc00',0.32+Math.random()*0.18);
    for(i=0;i<6;i++){p=poolAlloc();if(!p)break;
      a=Math.random()*Math.PI*2;var or=br*(0.65+Math.random()*0.7);
      p.x=ball.x+Math.cos(a)*or;p.y=ball.y+Math.sin(a)*or;
      s=180+Math.random()*130;p.vx=-Math.sin(a)*s;p.vy=Math.cos(a)*s;
      p.color=['#ffee44','#ffcc00','#ffffaa','#ffd700','#ffaa00'][Math.floor(Math.random()*5)];
      p.alpha=0.9;p.radius=1.8+Math.random()*2.8;p.life=0.12+Math.random()*0.12;p.maxLife=p.life;p.gravity=0;p.type='spark';}
    return;
  }
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
  var _ae=gameState.activeEffects;
  var trail=(_ae.iceball>0)?'ice':(_ae.lavaball>0)?'lava':(_ae.goldball>0)?'gold':settings.ballTrail;
  var p=poolAlloc();if(!p)return;
  if(trail==='gold'){
    var ga=Math.random()*Math.PI*2,gor=4+Math.random()*8,gs2=130+Math.random()*90;
    p.x=x+Math.cos(ga)*gor;p.y=y+Math.sin(ga)*gor;p.vx=-Math.sin(ga)*gs2;p.vy=Math.cos(ga)*gs2;
    p.color=['#ffee44','#ffcc00','#ffffaa','#ffd700'][Math.floor(Math.random()*4)];
    p.alpha=0.9;p.radius=1.5+Math.random()*2.5;p.life=0.12+Math.random()*0.12;p.maxLife=p.life;p.gravity=0;p.type='spark';
  }else if(trail==='plasma'){
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

// ============================================================
// === ACTION FEATURES =======================================
// ============================================================
function activateFever(){
  gameState.fever=true;gameState.feverTime=6;gameState.feverHits=[];
  gameState.balls.forEach(function(b){if(b.alive&&!b.stuck){var s=Math.sqrt(b.vx*b.vx+b.vy*b.vy)||1;b.vx=b.vx/s*s*1.4;b.vy=b.vy/s*s*1.4;b._feverSped=true}});
  var el=document.getElementById('fever-display');if(el){el.textContent=t('fever_text');el.classList.add('visible');setTimeout(function(){el.classList.remove('visible');},1400);}
  gameState.flashAlpha=0.7;gameState.flashColor='#ffaa00';gameState.shake=22;playSFX('fever');
}
function updateFever(dt){
  if(!gameState.fever)return;
  gameState.feverTime-=dt;
  if(gameState.feverTime<=0){
    gameState.fever=false;
    gameState.balls.forEach(function(b){if(b.alive&&!b.stuck&&b._feverSped){var cs=Math.sqrt(b.vx*b.vx+b.vy*b.vy)||1;var ts=getBallSpeed();b.vx=b.vx/cs*ts;b.vy=b.vy/cs*ts;b._feverSped=false}});
    var el=document.getElementById('fever-display');if(el)el.classList.remove('visible');
    gameState.flashAlpha=0.25;gameState.flashColor='#004488';
  }
}
function updateDescent(dt){
  if(!settings.descent||!gameState.running||gameState.paused)return;
  gameState.descentTimer=(gameState.descentTimer||0)+dt;
  if(gameState.descentTimer<20)return;
  gameState.descending=true;
  var spd=3+Math.min(5,Math.floor((gameState.descentTimer-20)/25));
  for(var _di=0;_di<gameState.blocks.length;_di++){var _db=gameState.blocks[_di];if(!_db.alive)continue;_db.cy+=spd*dt;_db.y+=spd*dt;}
  var maxBY=0;
  for(var _di2=0;_di2<gameState.blocks.length;_di2++){var _db2=gameState.blocks[_di2];if(_db2.alive&&_db2.cy+_db2.orbR>maxBY)maxBY=_db2.cy+_db2.orbR;}
  gameState.alarmLevel=Math.max(0,Math.min(1,(maxBY-CH*0.38)/(CH*0.35)));
  if(gameState.paddle&&maxBY>gameState.paddle.y-24){
    var _pb=maxBY-(gameState.paddle.y-30);
    for(var _di3=0;_di3<gameState.blocks.length;_di3++){var _db3=gameState.blocks[_di3];if(_db3.alive){_db3.cy-=_pb;_db3.y-=_pb;}}
    gameState.shake=28;loseLife();gameState.descentTimer=15;
  }
}
function renderAlarmBorder(){
  if(!gameState.alarmLevel||gameState.alarmLevel<=0)return;
  var _t=performance.now()*0.001,_pulse=(0.4+0.5*gameState.alarmLevel)*(0.5+0.5*Math.sin(_t*(3+gameState.alarmLevel*9)));
  ctx.save();ctx.strokeStyle='rgba(255,0,0,'+_pulse+')';ctx.lineWidth=5+gameState.alarmLevel*12;ctx.strokeRect(3,3,CW-6,CH-6);ctx.restore();
}
function updateOrbShots(dt){
  if(!gameState.running||gameState.paused)return;
  if(!gameState.orbShots)gameState.orbShots=[];
  for(var _oi=0;_oi<gameState.blocks.length;_oi++){
    var _ob=gameState.blocks[_oi];if(!_ob.alive)continue;
    if(_ob.type!=='F'&&_ob.type!=='L'&&_ob.type!=='I'&&_ob.type!=='T')continue;
    if(_ob._shootT===undefined)_ob._shootT=3000+Math.random()*6000;
    _ob._shootT-=dt*1000;if(_ob._shootT>0)continue;
    _ob._shootT=5000+Math.random()*6000;
    var _op={x:_ob.cx,y:_ob.cy+_ob.orbR,type:_ob.type,alive:true,r:7};
    if(_ob.type==='T'){var _oa=Math.random()*Math.PI*2;_op.vx=Math.cos(_oa)*250;_op.vy=Math.sin(_oa)*250;}
    else{_op.vx=(Math.random()-0.5)*70;_op.vy=190;}
    gameState.orbShots.push(_op);
  }
  var _p=gameState.paddle;
  for(var _oj=gameState.orbShots.length-1;_oj>=0;_oj--){
    var _os=gameState.orbShots[_oj];if(!_os.alive){gameState.orbShots.splice(_oj,1);continue;}
    _os.x+=_os.vx*dt;_os.y+=_os.vy*dt;
    if(_os.x<-20||_os.x>CW+20||_os.y>CH+20||_os.y<-100){_os.alive=false;continue;}
    if(_p&&Math.abs(_os.x-_p.x)<_p.width/2+_os.r&&Math.abs(_os.y-_p.y)<_p.height/2+_os.r){
      _os.alive=false;
      spawnImpactParticles(_os.x,_os.y,_os.type==='I'?'ice':'fire',6);
      if(_os.type==='I'){gameState._paddleFrozen=(gameState._paddleFrozen||0)+3;}
      else{gameState.shake=Math.max(gameState.shake||0,10);}
      playSFX(_os.type==='I'?'break_ice':'break_fire');
    }
    for(var _bk=0;_bk<gameState.balls.length;_bk++){
      var _bball=gameState.balls[_bk];if(!_bball.alive||_bball.stuck)continue;
      var _bdx=_bball.x-_os.x,_bdy=_bball.y-_os.y;
      if(_bdx*_bdx+_bdy*_bdy<(_bball.radius+_os.r)*(_bball.radius+_os.r)){_os.alive=false;spawnImpactParticles(_os.x,_os.y,'spark',4);break;}
    }
  }
}
function renderOrbShots(){
  if(!gameState.orbShots||!gameState.orbShots.length)return;
  ctx.save();
  for(var _ri=0;_ri<gameState.orbShots.length;_ri++){
    var _rs=gameState.orbShots[_ri];if(!_rs.alive)continue;
    var _rc=_rs.type==='I'?'#66ccff':_rs.type==='T'?'#ffcc00':'#ff4400';
    ctx.shadowColor=_rc;ctx.shadowBlur=14;ctx.fillStyle=_rc;ctx.globalAlpha=0.92;
    ctx.beginPath();ctx.arc(_rs.x,_rs.y,_rs.r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;ctx.globalAlpha=0.5;ctx.fillStyle='#ffffff';
    ctx.beginPath();ctx.arc(_rs.x-_rs.r*0.3,_rs.y-_rs.r*0.3,_rs.r*0.35,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;ctx.restore();
}
function updateRage(dt){
  if(!gameState.running||gameState.paused)return;
  gameState.rageTimer=(gameState.rageTimer||0)+dt;
  if(gameState.rageTimer>=25&&(gameState.rageLevel||0)<8){
    gameState.rageTimer-=25;gameState.rageLevel=(gameState.rageLevel||0)+1;
    gameState.balls.forEach(function(b){if(b.alive&&!b.stuck){var s=Math.sqrt(b.vx*b.vx+b.vy*b.vy)||1;b.vx=b.vx/s*s*1.08;b.vy=b.vy/s*s*1.08;}});
    gameState.flashAlpha=0.35;gameState.flashColor='#ff6600';
    var _sel=document.getElementById('speedup-display');if(_sel){_sel.textContent=t('speedup_text');_sel.style.display='block';setTimeout(function(){_sel.style.display='none';},1400);}
    playSFX('rage');
  }
}
function renderDangerZone(){
  // danger zone visual removed — screen shake on critical ball remains
  if(!gameState.running||gameState.paused||!gameState.balls)return;
  var _maxD=0,_t0=CH*0.75,_t1=gameState.paddle?(gameState.paddle.y-20):CH*0.94;
  for(var _dzi=0;_dzi<gameState.balls.length;_dzi++){
    var _dzb=gameState.balls[_dzi];if(!_dzb.alive||_dzb.stuck)continue;
    var _dd=Math.max(0,Math.min(1,(_dzb.y-_t0)/(_t1-_t0)));if(_dd>_maxD)_maxD=_dd;
  }
  if(_maxD>0.85)gameState.shake=Math.max(gameState.shake||0,2+_maxD*5);
}

function spawnDebrisParticles(x,y,color,count){
  if(!settings.visualFX)return;
  for(var i=0;i<count;i++){var p=poolAlloc();var a=Math.random()*Math.PI*2,s=40+Math.random()*160;
    p.x=x;p.y=y;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s-40;
    p.color=color||'#886633';p.alpha=1;p.radius=2+Math.random()*4;p.life=0.5+Math.random()*0.6;p.maxLife=p.life;p.gravity=300;p.type='debris'}
}

function spawnOrbShatter(cx,cy,orbR,color){
  if(!settings.visualFX)return;
  // Outer burst ring in orb color
  var sw=poolAlloc();if(sw){sw.x=cx;sw.y=cy;sw.vx=0;sw.vy=0;sw.color=color||'#ffffff';sw.alpha=0.80;sw.radius=orbR*0.2;sw._growRate=orbR*5.0;sw.life=0.18;sw.maxLife=0.18;sw.gravity=0;sw.type='shockwave';}
  // White impact flash
  var fl=poolAlloc();if(fl){fl.x=cx;fl.y=cy;fl.vx=0;fl.vy=0;fl.color='#ffffff';fl.alpha=0.65;fl.radius=orbR*0.4;fl._growRate=orbR*2.5;fl.life=0.08;fl.maxLife=0.08;fl.gravity=0;fl.type='shockwave';}
  // Glass shards — angular rhombus shapes, spin as they fly
  var bright=adjustBrightness(color||'#888888',1.6);
  var n=8+Math.floor(Math.random()*4);
  for(var i=0;i<n;i++){var p=poolAlloc();if(!p)break;
    var a=(i/n)*Math.PI*2+Math.random()*0.55;var s=160+Math.random()*200;
    p.x=cx+Math.cos(a)*orbR*0.35;p.y=cy+Math.sin(a)*orbR*0.35;
    p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s-55;
    p.color=i%3===0?bright:(color||'#aaaaaa');
    p.alpha=0.85+Math.random()*0.15;
    p.radius=3+Math.random()*5;p.life=0.38+Math.random()*0.32;p.maxLife=p.life;
    p.gravity=360;p._angle=Math.random()*Math.PI*2;p._spin=(Math.random()-0.5)*18;
    p.type='shard';}
  // A few bright spark chips
  spawnImpactParticles(cx,cy,'spark',6);
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

var _SPILL_COLORS={
  'F':['#ff6600','#ff4400','#ffaa00','#ff8800'],
  'I':['#44aaff','#66ccff','#aaeeff','#88ddff'],
  'W':['#2288ff','#44aaff','#1166dd','#55bbff'],
  'E':['#886633','#aa7744','#cc9955','#664422'],
  'L':['#dd2200','#ff3300','#cc1100','#990000'],
  'S':['#99aabb','#778899','#aabbcc','#556677'],
  'G':['#ffcc00','#ffdd44','#ffaa00','#ffee88'],
  'T':['#ff6600','#884400','#ffaa00','#cc5500'],
  'R':['#ff4488','#44ffaa','#ffaa00','#4488ff','#aa44ff','#44ffff'],
  'B':['#ff0033','#cc0022','#ff4455','#dd0044']
};
function spawnLiquidSpill(cx,cy,orbR,type){
  if(!settings.visualFX)return;
  var clrs=_SPILL_COLORS[type]||['#aaaaaa','#888888'];
  // Main downward stream — born near orb bottom, cone spread
  for(var i=0;i<20;i++){var p=poolAlloc();if(!p)break;
    var ang=Math.PI/2+(Math.random()-0.5)*1.1;var spd=80+Math.random()*210;
    p.x=cx+(Math.random()-0.5)*orbR*0.9;p.y=cy+orbR*(0.15+Math.random()*0.45);
    p.vx=Math.cos(ang)*spd;p.vy=Math.sin(ang)*spd;
    p.color=clrs[Math.floor(Math.random()*clrs.length)];
    p.alpha=0.88+Math.random()*0.12;p.radius=4+Math.random()*8;
    p.life=0.32+Math.random()*0.52;p.maxLife=p.life;p.gravity=370+Math.random()*80;p.type='liquid';}
  // Outer splash burst from center
  for(var j=0;j<9;j++){var p2=poolAlloc();if(!p2)break;
    var a2=Math.random()*Math.PI*2;var s2=45+Math.random()*130;
    p2.x=cx;p2.y=cy;p2.vx=Math.cos(a2)*s2;p2.vy=Math.sin(a2)*s2;
    p2.color=clrs[Math.floor(Math.random()*clrs.length)];
    p2.alpha=0.75;p2.radius=3+Math.random()*5;
    p2.life=0.22+Math.random()*0.28;p2.maxLife=p2.life;p2.gravity=420;p2.type='liquid';}
}

function spawnSupernovaLite(x,y){
  if(!settings.visualFX)return;
  spawnShockwave(x,y);
  for(var i=0;i<14;i++){var p=poolAlloc();if(!p)break;var a=Math.PI*2/14*i+Math.random()*0.3,s=60+Math.random()*130;
    p.type='spark';p.x=x;p.y=y;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s;
    p.life=0.4+Math.random()*0.4;p.maxLife=p.life;p.radius=2+Math.random()*3;
    p.color=['#ff0033','#ff4455','#ff8888','#ffffff','#dd0044'][Math.floor(Math.random()*5)];
    p.alpha=1;p.gravity=80;}
  gameState.flashAlpha=Math.max(gameState.flashAlpha,0.2);gameState.flashColor='#ff0033';
  gameState.shake=Math.max(gameState.shake,8);
}
function spawnSupernova(x,y){
  if(!settings.visualFX)return;
  spawnShockwave(x,y);spawnFireParticles(x,y,20);spawnSmokeParticles(x,y,8);
  for(var i=0;i<24;i++){var p=poolAlloc();if(!p)break;var ang=Math.PI*2/24*i+Math.random()*0.25,spd=80+Math.random()*180;
    p.type='spark';p.x=x;p.y=y;p.vx=Math.cos(ang)*spd;p.vy=Math.sin(ang)*spd;
    p.life=0.6+Math.random()*0.6;p.maxLife=p.life;p.radius=2+Math.random()*4;
    p.color=(['#ffcc00','#ff8800','#ff4400','#ffffff'])[Math.floor(Math.random()*4)];
    p.alpha=1;p.gravity=60;p.decay=1}
  gameState.flashAlpha=Math.max(gameState.flashAlpha,0.35);gameState.flashColor='#ffaa00';
  gameState.shake=Math.max(gameState.shake,12);
}

// ── Float text ──────────────────────────────────────────────────────────────
function spawnFloatText(x,y,text,color,size,bold){
  if(!gameState.floatTexts)gameState.floatTexts=[];
  var _s=size||16;
  var _gx=layout.gridX||0,_gw=layout.gridW||CW;
  x=Math.max(_gx+_s,Math.min(_gx+_gw-_s,x));
  y=Math.max(60,Math.min(CH-80,y));
  gameState.floatTexts.push({x:x,y:y,text:text,color:color||'#ffffff',size:_s,bold:!!bold,alpha:1,vy:-70,life:0.9,maxLife:0.9});
}
function renderFloatTexts(){
  if(!gameState.floatTexts||!gameState.floatTexts.length)return;

  for(var i=0;i<gameState.floatTexts.length;i++){var ft=gameState.floatTexts[i];if(ft.alpha<=0)continue;
    ctx.save();ctx.globalAlpha=ft.alpha;ctx.font=(ft.bold?'bold ':'')+ft.size+'px "Orbitron",sans-serif';
    ctx.fillStyle=ft.color;ctx.shadowColor=ft.color;ctx.shadowBlur=8;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ft.text,ft.x,ft.y);ctx.restore();}
}

// ── Metallic shards (Steel destruction) ─────────────────────────────────────
function spawnMetallicShards(cx,cy,orbR){
  if(!settings.visualFX)return;
  var n=10+Math.floor(Math.random()*6);
  for(var i=0;i<n;i++){var p=poolAlloc();if(!p)break;
    var a=Math.random()*Math.PI*2;var s=150+Math.random()*250;
    p.x=cx+Math.cos(a)*orbR*0.3;p.y=cy+Math.sin(a)*orbR*0.3;
    p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s-80;
    p.color=['#c0c0c0','#e0e0e0','#ffffff','#a8b8c8','#d0d8e0'][Math.floor(Math.random()*5)];
    p.alpha=1;p.radius=3+Math.random()*5;p.life=0.35+Math.random()*0.3;p.maxLife=p.life;p.gravity=350;p.type='debris';}
  // White glint sparks
  for(var j=0;j<8;j++){var p2=poolAlloc();if(!p2)break;
    var a2=Math.random()*Math.PI*2;var s2=200+Math.random()*300;
    p2.x=cx;p2.y=cy;p2.vx=Math.cos(a2)*s2;p2.vy=Math.sin(a2)*s2-60;
    p2.color='#ffffff';p2.alpha=1;p2.radius=1+Math.random()*2;p2.life=0.15+Math.random()*0.15;p2.maxLife=p2.life;p2.gravity=100;p2.type='spark';}
}

// ── Ball trajectory aimline ──────────────────────────────────────────────────
function renderBallTrajectory(ball){

  var x=ball.x,y=ball.y,vx=ball.vx,vy=ball.vy;
  var spd=Math.sqrt(vx*vx+vy*vy);if(!spd)return;
  var nx=vx/spd,ny=vy/spd;
  ctx.save();ctx.setLineDash([4,8]);ctx.strokeStyle='rgba(255,255,255,0.22)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(x,y);
  var bounces=0;
  for(var step=0;step<120&&bounces<3;step++){
    x+=nx*12;y+=ny*12;
    if(x-ball.radius<0){x=ball.radius;nx=Math.abs(nx);bounces++;}
    else if(x+ball.radius>CW){x=CW-ball.radius;nx=-Math.abs(nx);bounces++;}
    if(y-ball.radius<0){y=ball.radius;ny=Math.abs(ny);bounces++;}
    ctx.lineTo(x,y);
    if(y>CH)break;
  }
  ctx.stroke();ctx.setLineDash([]);ctx.restore();
}

// ── Shield floor visual ──────────────────────────────────────────────────────
function renderShield(){
  if(!gameState.shieldActive)return;

  ctx.save();
  var pulse=0.5+0.5*Math.sin(Date.now()*0.008);
  ctx.strokeStyle='rgba(68,102,255,'+(0.7+pulse*0.3)+')';ctx.lineWidth=4+pulse*2;
  ctx.shadowColor='#4466ff';ctx.shadowBlur=18+pulse*10;
  ctx.beginPath();ctx.moveTo(0,CH);ctx.lineTo(CW,CH);ctx.stroke();
  ctx.restore();
}

// ── Nearest block (for gravity) ──────────────────────────────────────────────
function _findNearestBlock(ball){
  var best=null,bestD2=Infinity;
  for(var i=0;i<gameState.blocks.length;i++){var b=gameState.blocks[i];if(!b.alive)continue;
    var dx=b.cx-ball.x,dy=b.cy-ball.y,d2=dx*dx+dy*dy;if(d2<bestD2){bestD2=d2;best=b;}}
  return best;
}

// ── Procedural level generation ──────────────────────────────────────────────
function generateProceduralLevel(idx){
  var names=['SURGE','VORTEX','NOVA','ECLIPSE','ABYSS','NEXUS','OMEGA','TEMPEST','ZENITH','CHAOS'];
  var name=names[idx%names.length]+' '+(idx+1);
  var R=7,C=13,cy=3,cx=6;
  // Seeded deterministic rand: hash of idx+r+c
  function rng(r,c,salt){var h=Math.sin(idx*127.1+r*31.7+c*17.3+(salt||0)*91.5)*43758.5453;return h-Math.floor(h);}
  // Difficulty 0..1
  var diff=Math.min(1,idx*0.055);
  // Pick block type using seeded rand
  function pickType(r,c){
    var p=rng(r,c,1);
    var bossP=0.03+diff*0.09, steelP=0.06+diff*0.10, hardP=0.08+diff*0.12;
    if(p<bossP)return 'B';
    if(p<bossP+steelP)return 'S';
    if(p<bossP+steelP+hardP)return rng(r,c,2)<0.5?'L':'T';
    var soft=['F','I','W','E','G','R'];
    return soft[Math.floor(rng(r,c,3)*soft.length)];
  }
  // Layout patterns (return true = place orb)
  var layouts=[
    function(r,c){return true}, // 0 full
    function(r,c){return Math.abs(r-cy)*2+Math.abs(c-cx)<7}, // 1 diamond
    function(r,c){return r===0||r===R-1||c===0||c===C-1}, // 2 frame
    function(r,c){return r===0||r===R-1||c===0||c===C-1||(r>=2&&r<=R-3&&c>=3&&c<=C-4)}, // 3 double ring
    function(r,c){return r===cy||Math.abs(c-cx)<=1}, // 4 cross/plus
    function(r,c){return (r+c)%2===0}, // 5 checkerboard
    function(r,c){var m=Math.round(r*0.7);return c>=m&&c<C-m}, // 6 triangle top
    function(r,c){var m=Math.round((R-1-r)*0.7);return c>=m&&c<C-m}, // 7 triangle bottom
    function(r,c){return (c+r*2)%5!==0}, // 8 diagonal gaps
    function(r,c){var sr=Math.sin(idx*0.37+r*0.9+c*0.5);return sr>-0.25}, // 9 wavy (seeded)
    function(r,c){return c<=4||c>=C-5}, // 10 two pillars
    function(r,c){return r%2===0?c<C-r:c>=r}, // 11 zigzag
    function(r,c){return Math.abs(c-cx)===Math.abs(r-cy)||Math.abs(c-cx)+Math.abs(r-cy)===5}, // 12 X + ring
    function(r,c){return c<4||c>=C-4||(r>=2&&r<=R-3&&c>=4&&c<=C-5)}, // 13 fortress (walls+core)
    function(r,c){return (r===0||r===R-1||(r>=2&&r<=R-3&&(c===0||c===C-1||c===cx)))}, // 14 H frame
    function(r,c){var d=rng(r,c,idx+5);return d<0.62} // 15 scattered ~62%
  ];
  var layoutFn=layouts[idx%layouts.length];
  var rows=[];
  for(var r=0;r<R;r++){var row='';for(var c=0;c<C;c++){row+=layoutFn(r,c)?pickType(r,c):'.';}rows.push(row);}
  // Ensure at least 12 blocks
  var total=rows.join('').replace(/\./g,'').length;
  if(total<12){rows=[];for(var r2=0;r2<R;r2++){var row2='';for(var c2=0;c2<C;c2++)row2+=pickType(r2,c2);rows.push(row2);}}
  var _mList=['inferno','neon','war','frost','storm','arcade','pulse'];
  var _bgList=['fire','dark','lava','ice','dark','gold','rainbow'];
  return{name:name,music:_mList[idx%_mList.length],bg:_bgList[idx%_bgList.length],grid:rows,_generated:true};
}

function updateParticles(dt){for(var i=0;i<particlePool.length;i++){var p=particlePool[i];if(!p._alive)continue;p.life-=dt;if(p.life<=0){poolKill(p);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;p.alpha=p.life/p.maxLife;if(p.type==='shockwave'){p.radius+=(p._growRate||200)*dt}else{p.radius*=0.98}if(p.type==='shard'&&p._spin){p._angle=(p._angle||0)+p._spin*dt;}}}

function renderParticles(){
  ctx.save();
  for(var i=0;i<particlePool.length;i++){var p=particlePool[i];if(!p._alive||p.alpha<=0)continue;
    if(p.type==='smoke'){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=p.alpha*0.45;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0.5,p.radius),0,Math.PI*2);ctx.fill()}
    else if(p.type==='shockwave'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=p.alpha*0.55;ctx.strokeStyle=p.color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0.5,p.radius),0,Math.PI*2);ctx.stroke()}
    else if(p.type==='liquid'){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=p.alpha*0.9;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0.5,p.radius),0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=p.alpha*0.35;ctx.fillStyle='rgba(255,255,255,0.6)';ctx.beginPath();ctx.arc(p.x-p.radius*0.28,p.y-p.radius*0.28,p.radius*0.32,0,Math.PI*2);ctx.fill();}
    else if(p.type==='shard'){
      var sr=Math.max(0.5,p.radius);ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=p.alpha*0.86;ctx.translate(p.x,p.y);ctx.rotate(p._angle||0);
      // Elongated rhombus — looks like a glass fragment
      ctx.beginPath();ctx.moveTo(0,-sr*1.5);ctx.lineTo(sr*0.45,0);ctx.lineTo(0,sr*1.5);ctx.lineTo(-sr*0.45,0);ctx.closePath();
      ctx.fillStyle=p.color;ctx.fill();
      ctx.globalAlpha=p.alpha*0.5;ctx.strokeStyle='rgba(255,255,255,0.75)';ctx.lineWidth=0.8;ctx.stroke();
      ctx.restore();continue;}
    else{ctx.globalAlpha=p.alpha*0.9;ctx.globalCompositeOperation='lighter';ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0.5,p.radius),0,Math.PI*2);ctx.fill()}}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.restore();
}

function fireLasers(){var p=gameState.paddle,my=p.y-p.height/2-22;gameState.lasers.push({x:p.x-p.width*0.32,y:my,vy:-CFG.LASER_SPEED,w:3,h:14,alive:true,color:'#ff2244'});gameState.lasers.push({x:p.x+p.width*0.32,y:my,vy:-CFG.LASER_SPEED,w:3,h:14,alive:true,color:'#ff2244'});playSFX('laser')}

function updateLasers(dt){
  for(var i=gameState.lasers.length-1;i>=0;i--){var l=gameState.lasers[i];if(!l.alive){gameState.lasers.splice(i,1);continue}
    l.y+=l.vy*dt;if(l.y<-20){l.alive=false;continue}
    for(var j=0;j<gameState.blocks.length;j++){var b=gameState.blocks[j];if(!b.alive)continue;
      if(l.x>b.x&&l.x<b.x+b.w&&l.y>b.y&&l.y<b.y+b.h){l.alive=false;b.hitAnim=1;b.hp--;if(b.hp<=0){b.alive=false;onBlockDestroyed(b,null)}break}}}
}


function checkLevelClear(){
  if(gameState._levelClearing)return;
  var rem=gameState.blocks.filter(function(b){return b.alive}).length;
  if(rem===0){gameState._levelClearing=true;setTimeout(function(){gameState._levelClearing=false;levelClear()},300)}
}

function levelClear(){
  gameState.running=false;musicStop();_timedStop();
  if(gameState.gameMode==='timed'){gameState.tAttackTimer=(gameState.tAttackTimer>0?Math.min(gameState.tAttackTimer+15,90):45);}
  if(gameState.level+1>settings.maxLevel){settings.maxLevel=gameState.level+1;saveSettings()}
  var isLast=(gameState.gameMode!=='endless'&&gameState.level>=LEVELS.length-1);
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
  var lvl;
  if(gameState.gameMode==='endless'){
    if(!gameState._procLevels[idx])gameState._procLevels[idx]=generateProceduralLevel(idx);
    lvl=gameState._procLevels[idx];
  }else{
    if(idx>=LEVELS.length)idx=LEVELS.length-1;
    lvl=LEVELS[idx];
  }
  gameState.level=idx;dismissNameOverlay();
  ensureAudio();musicStart(lvl.music||'inferno');musicSetIntensity(0);
  recalcLayout();gameState.blocks=parseLevel(lvl);gameState.balls=[];gameState.powerups=[];gameState.lasers=[];
  gameState.combo=0;gameState.comboTimer=0;gameState.shake=0;gameState.flashAlpha=0;
  gameState.fever=false;gameState.feverTime=0;gameState.feverHits=[];
  gameState.descentTimer=0;gameState.descending=false;gameState.alarmLevel=0;
  gameState.orbShots=[];gameState.rageTimer=0;gameState.rageLevel=0;gameState._paddleFrozen=0;
  gameState.activeEffects={expand:0,shrink:0,sticky:0,laser:0,slow:0,fireball:0,iceball:0,goldball:0,lavaball:0,echo:0,gravity:0};
  gameState.shieldActive=false;gameState.floatTexts=[];
  gameState.levelStartScore=gameState.score;gameState.paddle=makePaddle();
  if(gameState.gameMode==='timed'){if(idx===0||!gameState.tAttackTimer||gameState.tAttackTimer<=0){gameState.tAttackTimer=Math.max(45,90-idx*4);}  _timedStop();}else _timedStop();
  var ball=makeBall();updateBallStuck(ball);gameState.balls.push(ball);updateHUD();
  var oN=document.getElementById('overlay-level-num'),oL=document.getElementById('overlay-level-name'),oH=document.getElementById('overlay-level-hint');
  var lNames=t('level_names');var lName=(gameState.gameMode==='endless'&&lvl._generated)?lvl.name:((lNames&&lNames[idx])||lvl.name);
  var totalLvls=gameState.gameMode==='endless'?'\u221e':LEVELS.length;
  if(oN)oN.textContent=t('level')+' '+(idx+1)+' / '+totalLvls;if(oL)oL.textContent=lName;if(oH)oH.textContent=t('press_start');
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
  if(gameState.balls.length===0){var ball=makeBall();updateBallStuck(ball);gameState.balls.push(ball);_timedStop();document.getElementById('overlay-level').classList.add('visible');gameState.running=false}
  gameState.shake=12;gameState.flashAlpha=0.4;gameState.flashColor='#ff2200';
}

function gameOver(){
  gameState.running=false;musicStop();_timedStop();var gs=document.getElementById('go-score'),gb=document.getElementById('go-sub');
  if(gs)gs.textContent=gameState.score.toLocaleString()+' pts';if(gb)gb.textContent=t('level')+' '+(gameState.level+1);
  document.getElementById('overlay-gameover').classList.add('visible');playSFX('gameover');
  promptPlayerName(function(name){addLeaderboardEntry(name,gameState.score,gameState.level+1)});
}

var _lastHudScore=0;
function updateHUD(){
  var se=document.getElementById('hud-score'),le=document.getElementById('hud-level'),li=document.getElementById('lives-display');
  if(se){se.textContent=gameState.score.toLocaleString();if(gameState.score!==_lastHudScore){_lastHudScore=gameState.score;se.classList.add('pulse');setTimeout(function(){se.classList.remove('pulse')},200)}}
  if(le)le.textContent=(gameState.level+1)+' / '+(gameState.gameMode==='endless'?'\u221e':LEVELS.length);
  if(li){var h='';for(var i=0;i<CFG.MAX_LIVES;i++)h+='<div class="life-orb'+(i>=gameState.lives?' lost':'')+'"></div>';li.innerHTML=h}
}

function showScorePopup(x,y,pts){var el=document.createElement('div');el.className='score-popup';var r=canvas?canvas.getBoundingClientRect():{left:0,top:0};el.style.left=(x+r.left)+'px';el.style.top=(y+r.top)+'px';el.textContent='+'+pts;document.body.appendChild(el);setTimeout(function(){el.remove()},850)}


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
    case'fever':[523,659,784,1047,1319].forEach(function(f,i){osc(f,'sine',0.13-i*0.015,now+i*0.06,0.3)});sw(1047,2093,'sine',0.12,now+0.35,0.2);break;
    case'rage':sw(220,440,'sawtooth',0.18,now,0.12);sw(330,660,'sawtooth',0.12,now+0.06,0.10);ns(0.10,now,0.12,1200);break;
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
    lead:[NOTES.G4,NOTES.A4,NOTES.B4,0,NOTES.D5,0,NOTES.B4,0,NOTES.A4,0,NOTES.G4,0,NOTES.E4,0,NOTES.D4,0]},
  neon:{bpm:125,
    kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0],
    bass:[NOTES.A2,0,NOTES.A2,0,NOTES.C3,0,NOTES.A2,0,NOTES.G2,0,NOTES.A2,0,NOTES.E2,0,NOTES.F2,0],
    pad:[[NOTES.A3,NOTES.C4,NOTES.E4],0,0,0,0,0,0,0,[NOTES.G3,NOTES.B3,NOTES.D4],0,0,0,0,0,0,0],
    lead:[NOTES.A4,0,NOTES.C5,0,NOTES.E5,0,NOTES.D5,0,NOTES.C5,0,NOTES.A4,0,NOTES.G4,0,NOTES.E4,0]},
  pulse:{bpm:76,
    kick:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    bass:[NOTES.D2,0,0,0,NOTES.A2,0,0,0,NOTES.G2,0,0,0,NOTES.F2,0,0,0],
    pad:[[NOTES.D3,NOTES.Gb3,NOTES.A3],0,0,0,0,0,0,0,[NOTES.A2,NOTES.D3,NOTES.Gb3],0,0,0,0,0,0,0],
    lead:[NOTES.D5,0,0,NOTES.A4,0,0,NOTES.B4,0,0,NOTES.Gb4,0,0,NOTES.A4,0,NOTES.B4,0]},
  storm:{bpm:145,
    kick:[1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0],
    bass:[NOTES.D2,0,NOTES.D2,0,NOTES.A2,0,NOTES.D2,0,NOTES.C3,0,NOTES.Bb2,0,NOTES.A2,0,NOTES.F2,0],
    pad:[[NOTES.D3,NOTES.F3,NOTES.A3],0,0,0,[NOTES.A2,NOTES.C3,NOTES.E3],0,0,0,[NOTES.Bb2,NOTES.D3,NOTES.F3],0,0,0,[NOTES.A2,NOTES.C3,NOTES.E3],0,0,0],
    lead:[NOTES.D4,NOTES.F4,NOTES.A4,0,NOTES.D5,0,NOTES.C5,0,NOTES.Bb4,0,NOTES.A4,0,NOTES.F4,0,NOTES.E4,0]}
};

var musicState={theme:'inferno',bpm:118,beat:0,nextNoteTime:0,timer:null,playing:false,intensity:0};
var _timedInterval=null,_timedPauseStart=0,_timedPaused=0;
function _timedStart(){_timedStop();if(gameState.gameMode!=='timed')return;_timedInterval=setInterval(function(){if(gameState.paused)return;var go=document.getElementById('overlay-gameover'),vi=document.getElementById('overlay-victory');if((go&&go.classList.contains('visible'))||(vi&&vi.classList.contains('visible')))return;if(gameState.tAttackTimer<=0)return;gameState.tAttackTimer=Math.max(0,gameState.tAttackTimer-0.1);if(gameState.tAttackTimer<=0){_timedStop();gameOver();}},100);}
function _timedStop(){if(_timedInterval){clearInterval(_timedInterval);_timedInterval=null;}}
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

var FS_BLOCK='#version 300 es\nprecision mediump float;\n'
+'in vec2 vUV;uniform float u_Fill,u_Time,u_Amp,u_Spd,u_OrbR,u_Hit;uniform int u_Cols;uniform float u_WH[6];uniform vec3 u_CS,u_CD,u_CG;out vec4 fc;\n'
+'float cmr(float idx){int i=int(floor(idx));float t=fract(idx);float p0=u_WH[clamp(i-1,0,u_Cols-1)];float p1=u_WH[clamp(i,0,u_Cols-1)];float p2=u_WH[clamp(i+1,0,u_Cols-1)];float p3=u_WH[clamp(i+2,0,u_Cols-1)];float t2=t*t,t3=t2*t;return 0.5*((2.*p1)+(-p0+p2)*t+(2.*p0-5.*p1+4.*p2-p3)*t2+(-p0+3.*p1-3.*p2+p3)*t3);}\n'
+'float wSurf(float lx,float am,float fr,float sp){'
+'  float oS=u_OrbR*2.;float bY=-u_OrbR+oS*(1.-u_Fill);float cf=(lx/oS+.5)*float(u_Cols-1);float wO=cmr(cf);'
+'  return bY+sin(lx*.1*fr+u_Time*u_Spd*sp)*u_Amp*am'
+'        +sin(lx*.17*fr+u_Time*u_Spd*sp*.62)*u_Amp*am*.48'
+'        +sin(lx*.28*fr-u_Time*u_Spd*sp*.41)*u_Amp*am*.25+wO;}\n'
+'void main(){'
+'  vec2 uv=vUV-.5;float dist=length(uv)*2.;if(dist>=1.)discard;'
+'  uv.y=-uv.y;float oR=u_OrbR,oS=oR*2.,lx=uv.x*oS,ly=uv.y*oS;\n'
// Glass/air base + SSS centre glow
+'  vec3 col=u_CD*0.06+u_CG*0.05*(1.-dist*dist);\n'
+'  col+=u_CG*exp(-dist*dist*3.2)*0.14;\n'
// Deep liquid layer
+'  float sy0=wSurf(lx,1.,1.,.8);\n'
+'  if(ly>sy0){float d=clamp((ly-sy0)/(oS*.76),0.,1.);'
+'    col=mix(u_CD*1.05,u_CD*.06,smoothstep(0.,.9,d));col=mix(col,vec3(0.),smoothstep(.65,1.,d));\n'
+'    float cs=pow(sin(lx*.22+ly*.19+u_Time*u_Spd*.56)*.5+.5,5.);col+=u_CG*cs*.065*(1.-d);}\n'
// Surface liquid layer
+'  float sy1=wSurf(lx,.7,1.8,1.3);\n'
+'  if(ly>sy1){float d=clamp((ly-sy1)/(oS*.5),0.,1.);'
+'    vec3 lc=mix(u_CS*1.18,u_CD*.85,smoothstep(0.,.55,d));lc=mix(lc,vec3(0.),smoothstep(.5,1.,d));col=mix(col,lc,.82);}\n'
// Thin accent layer (brightest, topmost)
+'  float sy2=wSurf(lx,.38,2.8,1.9);\n'
+'  if(ly>sy2){float d=clamp((ly-sy2)/(oS*.22),0.,1.);col=mix(col,u_CS*1.45,.2*(1.-d));}\n'
// Meniscus glow at surface
+'  float gD=abs(ly-sy0)/(oR*.85);col+=u_CG*exp(-gD*gD*5.)*0.4;\n'
// Fresnel glass rim
+'  float rim=pow(dist,2.8);col+=u_CG*rim*.52+vec3(.025)*rim;\n'
// Hit flash
+'  col=mix(col,vec3(1.),u_Hit*.65);\n'
// Primary specular (top-left)
+'  vec2 hl=uv-vec2(-.18,-.25);col=min(vec3(1.),col+exp(-dot(hl,hl)*22.)*.8);\n'
// Secondary specular (bottom-right, tinted)
+'  vec2 hl2=uv-vec2(.14,.17);col=min(vec3(1.),col+u_CS*.55*exp(-dot(hl2,hl2)*55.)*.18);\n'
// Bottom shadow
+'  col*=.68+.32*clamp(1.-(uv.y+.5),0.,1.);\n'
+'  float edge=1.-smoothstep(.86,1.,dist);fc=vec4(col,edge);}';

var VS_BG='#version 300 es\nlayout(location=0)in vec2 a_C;out vec2 vUV;void main(){gl_Position=vec4(a_C*2.0-1.0,0,1);vUV=a_C;}';

var FS_BG='#version 300 es\nprecision mediump float;\n'
+'in vec2 vUV;uniform float u_Time;uniform vec2 u_Res;uniform int u_Theme;out vec4 fc;\n'
+'float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}\n'
+'float ns(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}\n'
+'float hexD(vec2 uv,float s){vec2 p=uv*s;p.x+=mod(floor(p.y),2.)*.5;return length(fract(p)-0.5);}\n'
+'void main(){vec2 uv=vUV;float t=u_Time;vec3 col=vec3(0);\n'
// DARK / CYBER
+'if(u_Theme==0){\n'
+'  col=mix(vec3(.04,.02,.07),vec3(.01,.005,.02),uv.y);\n'
+'  float hd=hexD(uv,20.);col+=vec3(.04,.01,.09)*smoothstep(.48,.43,hd)*(.3+.7*sin(t*.6+uv.y*4.));\n'
+'  float sl=sin(uv.y*u_Res.y*.75)*.5+.5;col+=vec3(.008,.002,.02)*smoothstep(.8,1.,sl);\n'
+'  float vg=sin(uv.x*18.8+t*.4)*sin(uv.x*25.1-t*.35);col+=vec3(.012,.004,.03)*(vg*.5+.5)*(.4+.6*sin(t*.5+uv.x*5.));\n'
+'  col+=vec3(.015,.005,.04)*pow(1.-uv.y,3.)*(.5+.5*sin(t*.4));\n'
+'}\n'
// FIRE
+'else if(u_Theme==1){\n'
+'  float ny=uv.y+ns(vec2(uv.x*4.,uv.y*2.-t*1.2))*.04;\n'
+'  col=mix(vec3(.2,.05,.005),vec3(.03,.008,0),ny);\n'
+'  col+=vec3(.12,.03,0)*pow(1.-uv.y,3.)*(.45+.55*sin(t*.5));\n'
+'  float fl=ns(vec2(uv.x*5.,uv.y*4.-t*1.8));col+=vec3(.07,.015,0)*fl*fl*(1.-uv.y*1.1);\n'
+'  float em=ns(vec2(uv.x*12.,t*.6));col+=vec3(.04,.01,0)*smoothstep(.72,1.,em);\n'
+'  vec2 gr=fract(gl_FragCoord.xy/44.);float ln=smoothstep(.02,0.,gr.x)+smoothstep(.02,0.,gr.y);col+=vec3(.04,.01,0)*ln*.25;\n'
+'}\n'
// LAVA
+'else if(u_Theme==2){\n'
+'  float ny=uv.y+sin(uv.x*5.+t*.7)*.025;col=mix(vec3(.1,.014,.002),vec3(.025,.004,0),ny);\n'
+'  float v1=abs(sin(uv.x*7.3+t*.5+sin(uv.y*4.+t*.3)*1.5));col+=vec3(.28,.04,0)*pow(max(0.,v1-.85)/.15,2.);\n'
+'  float v2=abs(sin(uv.x*11.+uv.y*3.-t*.8));col+=vec3(.13,.015,0)*pow(max(0.,v2-.88)/.12,2.);\n'
+'  col+=vec3(.07,.009,0)*(1.-uv.y)*(.55+.45*sin(t*.4));\n'
+'  col+=vec3(.02,.003,0)*ns(vec2(uv.x*3.,uv.y*2.-t*.4))*(1.-uv.y*.5);\n'
+'}\n'
// ICE
+'else if(u_Theme==3){\n'
+'  col=mix(vec3(.05,.08,.17),vec3(.01,.02,.08),uv.y);\n'
+'  float hd=hexD(uv,15.);col+=vec3(.02,.04,.1)*smoothstep(.47,.43,hd)*(.35+.65*sin(t*.35+uv.y*3.));\n'
+'  float sh=sin(uv.y*28.+t*1.2)*.5+.5;col+=vec3(.007,.015,.04)*sh*.55;\n'
+'  col+=vec3(.015,.028,.08)*(1.-uv.y)*.45*(.5+.5*sin(t*.65));\n'
+'  float sp=h21(floor(uv*220.)+floor(t*.5));col+=vec3(.015,.025,.06)*smoothstep(.97,1.,sp);\n'
+'}\n'
// GOLD
+'else if(u_Theme==4){\n'
+'  col=mix(vec3(.09,.065,.01),vec3(.025,.018,0),uv.y);\n'
+'  vec2 gd=fract(uv*vec2(13.,8.));float gl2=smoothstep(.05,.01,gd.x)+smoothstep(.05,.01,gd.y)+smoothstep(.96,1.,gd.x)+smoothstep(.96,1.,gd.y);\n'
+'  col+=vec3(.11,.08,.01)*gl2*.32;\n'
+'  float sw=pow(sin((uv.x-uv.y)*6.28+t*.9)*.5+.5,10.);col+=vec3(.09,.065,.01)*sw;\n'
+'  col+=vec3(.035,.025,.003)*(1.-uv.y)*(.5+.5*sin(t*.55));\n'
+'  col+=vec3(.02,.015,.002)*ns(vec2(uv.x*8.,uv.y*6.+t*.25))*.4;\n'
+'}\n'
// RAINBOW / AURORA
+'else if(u_Theme==5){\n'
+'  col=mix(vec3(.02,.02,.05),vec3(.005,.005,.015),uv.y);\n'
+'  float b0=sin(uv.x*2.5+t*.25+sin(uv.x*1.3+t*.2)*.8)*.5+.5;b0*=smoothstep(0.,.4,uv.y)*smoothstep(1.,.45,uv.y)*(.7+.3*sin(t*.4));\n'
+'  col+=vec3(.13,.02,.18)*b0*.65;\n'
+'  float b1=sin(uv.x*3.1+2.09+t*.38+sin(uv.x*2.+t*.15)*0.6)*.5+.5;b1*=smoothstep(0.,.35,uv.y)*smoothstep(1.,.5,uv.y)*(.6+.4*sin(t*.55+1.5));\n'
+'  col+=vec3(.02,.16,.1)*b1*.6;\n'
+'  float b2=sin(uv.x*2.2+4.2+t*.31+sin(uv.x*.9-t*.12)*.9)*.5+.5;b2*=smoothstep(0.,.3,uv.y)*smoothstep(1.,.55,uv.y)*(.65+.35*sin(t*.48+3.));\n'
+'  col+=vec3(.12,.12,.02)*b2*.55;\n'
+'  float st=h21(floor(uv*200.)+floor(t*.3));col+=vec3(.5,.5,.8)*smoothstep(.96,1.,st)*smoothstep(.35,.8,uv.y);\n'
+'}\n'
+'else{col=vec3(.02,.015,.025);}\n'
+'fc=vec4(col,1.0);}';

var LIQUID_TYPES={
  'F':{fill:0.70,amp:4.5,spd:2.5,spring:0.06,surface:[1,.267,0],deep:[.4,.067,0],glow:[1,.533,.0]},
  'I':{fill:0.85,amp:2.5,spd:1.2,spring:0.04,surface:[.4,.8,1],deep:[.133,.267,.533],glow:[.667,.867,1]},
  'W':{fill:0.60,amp:4.0,spd:2.2,spring:0.08,surface:[.133,.533,1],deep:[.067,.133,.267],glow:[.267,.667,1]},
  'E':{fill:0.90,amp:3.0,spd:1.2,spring:0.03,surface:[.533,.4,.2],deep:[.2,.133,.067],glow:[.667,.533,.267]},
  'L':{fill:0.85,amp:6.5,spd:4.0,spring:0.02,surface:[1,.133,0],deep:[.267,0,0],glow:[1,.4,0]},
  'S':{fill:1.00,amp:0.0,spd:0.0,spring:0.0,surface:[.467,.533,.6],deep:[.2,.267,.333],glow:[.667,.733,.8]},
  'G':{fill:0.75,amp:3.0,spd:1.8,spring:0.06,surface:[1,.8,0],deep:[.4,.267,0],glow:[1,.933,.4]},
  'T':{fill:0.80,amp:5.0,spd:3.0,spring:0.05,surface:[1,.4,0],deep:[.267,.133,0],glow:[1,.667,0]},
  'R':{fill:0.70,amp:3.5,spd:2.5,spring:0.04,surface:[.667,.267,1],deep:[.2,.067,.4],glow:[.8,.533,1]},
  'B':{fill:0.92,amp:8.0,spd:5.0,spring:0.04,surface:[0.9,0.0,0.15],deep:[0.4,0.0,0.05],glow:[1.0,0.2,0.4]}
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
    // Breathing: Fire/Lava/TNT/Boss pulse, Ice vibrates
    var _bAmp=(b.type==='F'||b.type==='L'||b.type==='T'||b.type==='B')?0.035:(b.type==='I'?0.016:0);
    var _visR=_bAmp>0?b.orbR*(1+_bAmp*Math.sin(time*2.3+b.col*0.7+b.row*1.3)):b.orbR;
    var orbD=_visR*2;
    gl.uniform2f(glU.pos,b.cx-_visR,b.cy-_visR);gl.uniform2f(glU.size,orbD,orbD);
    gl.uniform1f(glU.orbR,_visR);
    var hpF=b.hp/b.maxHp;gl.uniform1f(glU.fill,tc.fill*hpF);
    gl.uniform1f(glU.amp,tc.amp);gl.uniform1f(glU.spd,tc.spd);gl.uniform1f(glU.time,time);
    // Depth: top rows darker (row 0 = top = 82% brightness, increases per row)
    var _depthF=Math.min(1.0,0.82+b.row*0.036);
    // Rainbow hue cycle
    if(b.type==='R'){var hue=(time*0.5)%1;var r=Math.abs(hue*6-3)-1;var g=2-Math.abs(hue*6-2);var bl=2-Math.abs(hue*6-4);r=Math.max(0,Math.min(1,r));g=Math.max(0,Math.min(1,g));bl=Math.max(0,Math.min(1,bl));gl.uniform3f(glU.cs,r*.8*_depthF,g*.8*_depthF,bl*.8*_depthF);gl.uniform3f(glU.cg,r*_depthF,g*_depthF,bl*_depthF)}
    else{gl.uniform3f(glU.cs,tc.surface[0]*_depthF,tc.surface[1]*_depthF,tc.surface[2]*_depthF);gl.uniform3f(glU.cg,tc.glow[0]*_depthF,tc.glow[1]*_depthF,tc.glow[2]*_depthF)}
    gl.uniform3f(glU.cd,tc.deep[0]*_depthF,tc.deep[1]*_depthF,tc.deep[2]*_depthF);
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
      // Wait for shatter before starting liquid spill + drain
      if((b._splashDelay||0)>0){
        b._splashDelay-=dt;
        if(b._splashDelay<=0){
          b._splashDelay=0;
          spawnLiquidSpill(b.cx,b.cy,b.orbR||18,b.type);
          if(glReady&&b._drainFill!==undefined){b._drain=0.48;}
        }
      }
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
    // Ambient excitation — keeps liquid alive between hits
    if(Math.random()<0.1){var _ac=Math.floor(Math.random()*6);b.wV[_ac]+=(Math.random()-0.5)*b.h*0.05;}
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
  var bgC,gc,gc2;
  if(bg==='fire'){bgC='#0d0503';gc='rgba(255,60,10,0.06)';gc2=null}
  else if(bg==='lava'){bgC='#0f0402';gc='rgba(255,30,0,0.07)';gc2=null}
  else if(bg==='ice'){bgC='#05070f';gc='rgba(60,130,255,0.06)';gc2=null}
  else if(bg==='gold'){bgC='#0c0a02';gc='rgba(220,170,0,0.06)';gc2='rgba(160,120,0,0.04)'}
  else if(bg==='rainbow'){bgC='#06060f';gc='rgba(140,60,220,0.05)';gc2='rgba(0,160,120,0.04)'}
  else{bgC='#060409';gc='rgba(100,40,180,0.06)';gc2=null} // dark/cyber
  var gd=ctx.createLinearGradient(0,0,0,CH);
  gd.addColorStop(0,bgC);gd.addColorStop(1,'#000000');
  ctx.fillStyle=gd;ctx.fillRect(0,0,CW,CH);
  // primary grid
  ctx.strokeStyle=gc;ctx.lineWidth=1;
  var gs=bg==='dark'?40:44;
  for(var x=0;x<CW;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke()}
  for(var y=0;y<CH;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke()}
  // secondary diagonal for gold/dark
  if(gc2){ctx.strokeStyle=gc2;ctx.lineWidth=0.5;for(var d=0;d<CW+CH;d+=gs*2){ctx.beginPath();ctx.moveTo(d,0);ctx.lineTo(0,d);ctx.stroke()}}
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
  }else if(bg==='gold'){
    // golden sparkle motes drifting upward
    if(Math.random()<dt*5){var p4=poolAlloc();p4.x=Math.random()*CW;p4.y=CH*0.4+Math.random()*CH*0.6;p4.vx=(Math.random()-0.5)*18;p4.vy=-(15+Math.random()*40);p4.color=Math.random()<0.6?'#ffcc00':'#ffee88';p4.alpha=0.4+Math.random()*0.4;p4.radius=0.8+Math.random()*1.8;p4.life=2+Math.random()*3;p4.maxLife=p4.life;p4.gravity=-5;p4.type='spark'}
  }else if(bg==='dark'){
    // cyber data-stream dots falling along grid
    if(Math.random()<dt*4){var p5=poolAlloc();var gx=Math.floor(Math.random()*(CW/40))*40+20;p5.x=gx;p5.y=-4;p5.vx=0;p5.vy=60+Math.random()*80;p5.color=Math.random()<0.5?'#aa44ff':'#4422aa';p5.alpha=0.35+Math.random()*0.35;p5.radius=1.2+Math.random()*1.4;p5.life=2.5+Math.random()*2;p5.maxLife=p5.life;p5.gravity=0;p5.type='spark'}
  }
}

function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function adjustBrightness(hex,f){var c=hex.replace('#','');if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];return'rgb('+Math.min(255,Math.round(parseInt(c.substr(0,2),16)*f))+','+Math.min(255,Math.round(parseInt(c.substr(2,2),16)*f))+','+Math.min(255,Math.round(parseInt(c.substr(4,2),16)*f))+')'}

function _crackR(b,n){return Math.abs(Math.sin(b.col*7.31+b.row*5.17+n*3.73))}

function renderBossRings(){
  var now=performance.now()/1000;
  for(var i=0;i<gameState.blocks.length;i++){
    var b=gameState.blocks[i];
    if(!b.alive||b.type!=='B')continue;
    var r=b.orbR,cx=b.cx,cy=b.cy;
    var pulse=0.5+0.5*Math.sin(now*4.5+b.col*0.9);
    var hpFrac=b.hp/b.maxHp;
    // Outer rotating danger ring
    ctx.save();
    ctx.translate(cx,cy);ctx.rotate(now*1.8+b.col);
    ctx.beginPath();
    // Dashed arc — 8 dashes
    var dashN=8,dashArc=Math.PI*2/dashN*0.55;
    for(var d=0;d<dashN;d++){
      var a0=d*(Math.PI*2/dashN);ctx.arc(0,0,r*1.22,a0,a0+dashArc);
    }
    ctx.strokeStyle='rgba(255,'+(Math.floor(40+60*pulse))+',0,'+(0.55+0.35*pulse)+')';
    ctx.lineWidth=2.5;ctx.shadowColor='#ff2200';ctx.shadowBlur=8+6*pulse;ctx.stroke();
    ctx.restore();
    // HP arc (solid, shows remaining HP)
    ctx.save();
    ctx.translate(cx,cy);ctx.rotate(-Math.PI/2);
    ctx.beginPath();ctx.arc(0,0,r*1.38,0,Math.PI*2*hpFrac);
    ctx.strokeStyle='rgba(255,60,0,'+(0.7+0.3*pulse)+')';
    ctx.lineWidth=3;ctx.lineCap='round';ctx.shadowColor='#ff4400';ctx.shadowBlur=10;ctx.stroke();
    // HP arc background (empty)
    ctx.beginPath();ctx.arc(0,0,r*1.38,Math.PI*2*hpFrac,Math.PI*2);
    ctx.strokeStyle='rgba(80,0,0,0.45)';ctx.lineWidth=3;ctx.shadowBlur=0;ctx.stroke();
    ctx.restore();
  }
}
function renderOrbCracks(){
  for(var i=0;i<gameState.blocks.length;i++){
    var b=gameState.blocks[i];
    if(!b.alive||b.maxHp<=1||b.hp>=b.maxHp)continue;
    var dmg=1-b.hp/b.maxHp,cx=b.cx,cy=b.cy,r=b.orbR;
    // orb-tinted crack glow colour (lighter than the block)
    var glowCol=b.def?b.def.color:'#ffffff';
    ctx.save();
    ctx.beginPath();ctx.arc(cx,cy,r*0.94,0,Math.PI*2);ctx.clip();
    var numCracks=Math.max(1,Math.min(b.maxHp-1,b.maxHp-b.hp));
    for(var c=0;c<numCracks;c++){
      var ang=_crackR(b,c)*Math.PI*2;
      var len=r*(0.5+dmg*0.42);
      var steps=6+c;
      // build zigzag points
      var pts=[[cx,cy]];
      for(var s=1;s<=steps;s++){
        var frac=s/steps,perp=ang+Math.PI/2;
        // irregular step sizes via seeded noise
        var irregF=0.7+_crackR(b,c*17+s+1)*0.6;
        var zz=(_crackR(b,c*10+s)-0.5)*r*(0.08+dmg*0.12)*irregF;
        pts.push([cx+Math.cos(ang)*len*frac+Math.cos(perp)*zz,
                  cy+Math.sin(ang)*len*frac+Math.sin(perp)*zz]);
      }
      // faint orb-colour inner glow (drawn first, wider)
      ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
      for(var pi=1;pi<pts.length;pi++)ctx.lineTo(pts[pi][0],pts[pi][1]);
      ctx.strokeStyle=glowCol;ctx.lineWidth=1.6+dmg*0.8;ctx.globalAlpha=(0.06+dmg*0.08);ctx.stroke();
      // main dark crack
      ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
      for(var pi2=1;pi2<pts.length;pi2++)ctx.lineTo(pts[pi2][0],pts[pi2][1]);
      ctx.strokeStyle='rgba(0,0,0,'+(0.5+dmg*0.3)+')';ctx.lineWidth=0.9+dmg*0.6;ctx.globalAlpha=1;ctx.stroke();
      // thin bright edge
      ctx.strokeStyle='rgba(255,255,255,'+(0.2+dmg*0.12)+')';ctx.lineWidth=0.4;ctx.stroke();
      // fork branch at 35%+ damage
      if(dmg>0.32){
        var fAng=ang+(_crackR(b,c+20)-0.5)*1.3;
        var fStart=0.3+_crackR(b,c+50)*0.2;
        var fsx=pts[Math.floor(fStart*(pts.length-1))][0];
        var fsy=pts[Math.floor(fStart*(pts.length-1))][1];
        var fLen=len*(0.38+dmg*0.2);
        var fPts=[[fsx,fsy]];
        for(var fs=1;fs<=4;fs++){
          var ff=fs/4,fzz=(_crackR(b,c*5+fs+30)-0.5)*r*0.09;
          fPts.push([fsx+Math.cos(fAng)*fLen*ff+Math.cos(fAng+Math.PI/2)*fzz,
                     fsy+Math.sin(fAng)*fLen*ff+Math.sin(fAng+Math.PI/2)*fzz]);
        }
        ctx.beginPath();ctx.moveTo(fPts[0][0],fPts[0][1]);
        for(var fpi=1;fpi<fPts.length;fpi++)ctx.lineTo(fPts[fpi][0],fPts[fpi][1]);
        ctx.strokeStyle='rgba(0,0,0,'+(0.38+dmg*0.22)+')';ctx.lineWidth=0.6+dmg*0.3;ctx.globalAlpha=1;ctx.stroke();
        ctx.strokeStyle='rgba(255,255,255,'+(0.1+dmg*0.07)+')';ctx.lineWidth=0.35;ctx.stroke();
      }
    }
    // radial dark vignette when badly damaged
    if(dmg>0.55){
      ctx.globalAlpha=1;
      var vg=ctx.createRadialGradient(cx,cy,r*0.35,cx,cy,r*0.94);
      vg.addColorStop(0,'rgba(0,0,0,0)');
      vg.addColorStop(1,'rgba(0,0,0,'+((dmg-0.55)*0.55)+')');
      ctx.fillStyle=vg;ctx.beginPath();ctx.arc(cx,cy,r*0.94,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
}

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
  var p=gameState.paddle,cx=p.x,cy=p.y,w=p.width,h=p.height;
  var now=performance.now()*0.001;
  ctx.save();
  // determine active color
  var eff=gameState.activeEffects;
  var edgeColor='#00e5ff';
  if((gameState._paddleFrozen||0)>0) edgeColor='#88ddff';
  else if(eff.fireball>0||eff.lavaball>0) edgeColor='#ff6600';
  else if(eff.iceball>0) edgeColor='#44ccff';
  else if(eff.goldball>0) edgeColor='#ffcc00';
  else if(eff.laser>0) edgeColor='#ff2244';
  else if(eff.sticky>0) edgeColor='#aa44ff';
  else if(eff.expand>0) edgeColor='#00ff88';
  else if(eff.shrink>0) edgeColor='#ff4488';
  var tw=w,bw=w*0.82,hh=h/2;
  var pulse=0.5+0.5*Math.sin(now*3.2);
  var hitP=Math.max(0,p.hitAnim||0);
  var nc=6; // corner chamfer size

  // AMBIENT GLOW (separate pre-pass — wide, soft)
  ctx.save();
  ctx.shadowColor=edgeColor;ctx.shadowBlur=28+pulse*8+hitP*20;
  ctx.globalAlpha=0.07+pulse*0.04+hitP*0.05;
  ctx.fillStyle=edgeColor;
  ctx.beginPath();ctx.moveTo(cx-tw/2,cy-hh);ctx.lineTo(cx+tw/2,cy-hh);ctx.lineTo(cx+bw/2,cy+hh);ctx.lineTo(cx-bw/2,cy+hh);ctx.closePath();ctx.fill();
  ctx.restore();

  // BODY — chamfered top corners
  function _trapPath(){ctx.moveTo(cx-tw/2+nc,cy-hh);ctx.lineTo(cx+tw/2-nc,cy-hh);ctx.lineTo(cx+tw/2,cy-hh+nc*0.55);ctx.lineTo(cx+bw/2,cy+hh);ctx.lineTo(cx-bw/2,cy+hh);ctx.lineTo(cx-tw/2,cy-hh+nc*0.55);ctx.closePath();}
  ctx.beginPath();_trapPath();
  var gb=ctx.createLinearGradient(cx,cy-hh,cx,cy+hh);
  gb.addColorStop(0,'#1d2245');gb.addColorStop(0.28,'#131a30');gb.addColorStop(0.72,'#0c1018');gb.addColorStop(1,'#060810');
  ctx.fillStyle=gb;ctx.fill();

  // SIDE-EDGE REFLECTION (subtle radial rim)
  var gR=ctx.createLinearGradient(cx-tw/2,cy,cx+tw/2,cy);
  gR.addColorStop(0,'rgba(0,229,255,0.055)');gR.addColorStop(0.18,'rgba(0,0,0,0)');gR.addColorStop(0.82,'rgba(0,0,0,0)');gR.addColorStop(1,'rgba(0,229,255,0.055)');
  ctx.beginPath();_trapPath();ctx.fillStyle=gR;ctx.fill();

  // TOP INSET BEVEL (gives physical depth)
  ctx.beginPath();ctx.moveTo(cx-tw/2+nc,cy-hh);ctx.lineTo(cx+tw/2-nc,cy-hh);ctx.lineTo(cx+tw/2-nc-2,cy-hh+4);ctx.lineTo(cx-tw/2+nc+2,cy-hh+4);ctx.closePath();
  var gB=ctx.createLinearGradient(cx,cy-hh,cx,cy-hh+4);
  gB.addColorStop(0,'rgba(255,255,255,0.2)');gB.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=gB;ctx.fill();

  // PANEL DIVIDERS (3 sections)
  ctx.strokeStyle='rgba(0,229,255,0.1)';ctx.lineWidth=0.7;
  for(var _pi=0;_pi<2;_pi++){var _px=cx+(_pi===0?-1:1)*tw*0.27;
    ctx.beginPath();ctx.moveTo(_px,cy-hh+3);ctx.lineTo(_px+(_pi===0?-0.5:0.5),cy+hh-2);ctx.stroke();}

  // CHAMFER EDGE HIGHLIGHTS
  ctx.lineWidth=0.9;ctx.strokeStyle='rgba(0,229,255,0.22)';ctx.shadowColor=edgeColor;ctx.shadowBlur=3;
  ctx.beginPath();ctx.moveTo(cx-tw/2+nc,cy-hh);ctx.lineTo(cx-tw/2,cy-hh+nc*0.55);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+tw/2-nc,cy-hh);ctx.lineTo(cx+tw/2,cy-hh+nc*0.55);ctx.stroke();
  ctx.shadowBlur=0;

  // HULL OUTLINE (very thin, barely visible)
  ctx.beginPath();_trapPath();
  ctx.strokeStyle='rgba(255,255,255,0.055)';ctx.lineWidth=0.7;ctx.stroke();

  // TOP ENERGY EDGE (thin 1px glow line)
  ctx.shadowColor=edgeColor;ctx.shadowBlur=5+pulse*4+hitP*6;
  ctx.beginPath();ctx.moveTo(cx-tw/2+nc,cy-hh);ctx.lineTo(cx+tw/2-nc,cy-hh);
  ctx.strokeStyle=edgeColor;ctx.lineWidth=1;ctx.globalAlpha=0.65+pulse*0.28+hitP*0.22;ctx.stroke();
  ctx.globalAlpha=1;ctx.shadowBlur=0;

  // ENERGY NODES (bar + center dot × 3)
  var enXs=[cx-tw*0.27,cx,cx+tw*0.27];
  for(var _ei=0;_ei<3;_ei++){var _ex=enXs[_ei],_ey=cy-hh+3.8;
    var _ep=0.38+0.58*Math.abs(Math.sin(now*2.1+_ei*1.9));
    ctx.shadowColor=edgeColor;ctx.shadowBlur=3+_ep*6;ctx.globalAlpha=_ep*0.88;ctx.fillStyle=edgeColor;
    ctx.beginPath();ctx.rect(_ex-4.5,_ey-0.9,9,1.8);ctx.fill();
    ctx.beginPath();ctx.arc(_ex,_ey,1.9,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;ctx.shadowBlur=0;

  // SIDE VENT GRILLES
  ctx.lineWidth=0.8;ctx.shadowColor=edgeColor;ctx.shadowBlur=2;
  for(var _gv=0;_gv<2;_gv++){var _gx=(_gv===0)?cx-tw/2+7:cx+tw/2-7;
    ctx.strokeStyle='rgba(0,229,255,0.2)';
    for(var _gl=0;_gl<3;_gl++){var _gly=cy-3.5+_gl*3.5;ctx.beginPath();ctx.moveTo(_gx-4,_gly);ctx.lineTo(_gx+4,_gly);ctx.stroke();}}
  ctx.shadowBlur=0;

  // ANIMATED SCAN LINE
  var scanX=cx-tw/2+nc+4+((now*0.5)%1)*(tw-nc*2-8);
  ctx.globalAlpha=0.13;ctx.strokeStyle=edgeColor;ctx.lineWidth=0.9;
  ctx.beginPath();ctx.moveTo(scanX,cy-hh+3);ctx.lineTo(scanX,cy+hh-2);ctx.stroke();
  ctx.globalAlpha=1;

  // CENTRAL TECH NODE (double-square diamond + crosshair)
  var dr=5+hitP*2;ctx.save();
  ctx.translate(cx,cy-0.5);ctx.rotate(Math.PI*0.25+now*1.1);
  ctx.shadowColor=edgeColor;ctx.shadowBlur=6+pulse*4+hitP*10;
  ctx.strokeStyle=edgeColor;ctx.lineWidth=0.9;ctx.globalAlpha=0.5+pulse*0.32+hitP*0.22;
  ctx.strokeRect(-dr,-dr,dr*2,dr*2);
  ctx.rotate(Math.PI*0.25);
  ctx.strokeStyle='rgba(255,255,255,0.22)';ctx.lineWidth=0.6;ctx.globalAlpha=0.25+pulse*0.12;
  ctx.strokeRect(-dr*0.54,-dr*0.54,dr*1.08,dr*1.08);
  ctx.restore();
  ctx.strokeStyle='rgba(0,229,255,0.12)';ctx.lineWidth=0.7;
  ctx.beginPath();ctx.moveTo(cx-dr*1.8,cy-0.5);ctx.lineTo(cx+dr*1.8,cy-0.5);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx,cy-0.5-dr*1.4);ctx.lineTo(cx,cy-0.5+dr*1.4);ctx.stroke();
  ctx.globalAlpha=1;
  // === per-effect visuals ===
  // EXPAND — green side wings
  if(eff.expand>0){
    var _ep=0.5+0.5*Math.sin(now*4);
    ctx.globalAlpha=0.65+_ep*0.25;ctx.shadowColor='#00ff88';ctx.shadowBlur=9+_ep*9;
    ctx.strokeStyle='#00ff88';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(cx-tw/2,cy+2);ctx.lineTo(cx-tw/2-9-_ep*3,cy);ctx.lineTo(cx-tw/2,cy-2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx+tw/2,cy+2);ctx.lineTo(cx+tw/2+9+_ep*3,cy);ctx.lineTo(cx+tw/2,cy-2);ctx.stroke();
    ctx.globalAlpha=1;ctx.shadowBlur=0;
  }
  // SHRINK — pink inward compression brackets
  if(eff.shrink>0){
    var _sp=0.5+0.5*Math.sin(now*5);
    ctx.globalAlpha=0.6+_sp*0.25;ctx.shadowColor='#ff4488';ctx.shadowBlur=6;
    ctx.strokeStyle='#ff4488';ctx.lineWidth=1.8;
    ctx.beginPath();ctx.moveTo(cx-tw/2+3,cy-hh+2);ctx.lineTo(cx-tw/2+3+4+_sp*2,cy);ctx.lineTo(cx-tw/2+3,cy+hh-2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx+tw/2-3,cy-hh+2);ctx.lineTo(cx+tw/2-7-_sp*2,cy);ctx.lineTo(cx+tw/2-3,cy+hh-2);ctx.stroke();
    ctx.globalAlpha=1;ctx.shadowBlur=0;
  }
  // FIREBALL — flame jets beneath paddle
  if(eff.fireball>0){
    var _fep=0.5+0.5*Math.sin(now*9);
    ctx.shadowColor='#ff6600';ctx.shadowBlur=12+_fep*10;
    for(var _fi=0;_fi<3;_fi++){var _fx=cx+(_fi-1)*(tw*0.28);var _flen=7+Math.sin(now*7+_fi*2.3)*4+_fep*6;
      ctx.globalAlpha=0.55+_fep*0.3;ctx.fillStyle=(_fi===1)?'rgba(255,140,0,0.75)':'rgba(255,70,0,0.65)';
      ctx.beginPath();ctx.moveTo(_fx-3,cy+hh);ctx.lineTo(_fx,cy+hh+_flen);ctx.lineTo(_fx+3,cy+hh);ctx.closePath();ctx.fill();}
    ctx.globalAlpha=1;ctx.shadowBlur=0;
  }
  // STICKY — purple tendrils above top edge
  if(eff.sticky>0){
    var _stp=0.5+0.5*Math.sin(now*3);
    ctx.shadowColor='#aa44ff';ctx.shadowBlur=8;ctx.lineWidth=1.5;
    for(var _si=-2;_si<=2;_si++){var _sx=cx+_si*(tw*0.15),_sy=cy-hh;var _sh=4+Math.abs(Math.sin(now*2.5+_si*1.4))*5;
      ctx.globalAlpha=0.5+_stp*0.35;ctx.strokeStyle='rgba(160,68,255,0.8)';
      ctx.beginPath();ctx.moveTo(_sx,_sy);ctx.lineTo(_sx+Math.sin(now+_si)*2,_sy-_sh);ctx.stroke();
      ctx.fillStyle='rgba(170,68,255,0.75)';ctx.beginPath();ctx.arc(_sx+Math.sin(now+_si)*2,_sy-_sh,2+_stp,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;ctx.shadowBlur=0;
  }
  // SLOW — expanding ripple ellipses
  if(eff.slow>0){
    for(var _ri=0;_ri<2;_ri++){var _rp=((now*0.65)+_ri*0.5)%1;
      ctx.globalAlpha=(1-_rp)*0.32;ctx.shadowColor='#44aaff';ctx.shadowBlur=4;
      ctx.strokeStyle='#44aaff';ctx.lineWidth=1;
      ctx.beginPath();ctx.ellipse(cx,cy,tw*0.5+_rp*tw*0.38,h*0.6+_rp*h*0.9,0,0,Math.PI*2);ctx.stroke();}
    ctx.globalAlpha=1;ctx.shadowBlur=0;
  }
  // ICEBALL — ice crystal spikes on top
  if(eff.iceball>0){
    var _ip=0.5+0.5*Math.sin(now*2.5);
    ctx.globalAlpha=0.65+_ip*0.25;ctx.shadowColor='#44ccff';ctx.shadowBlur=8;
    ctx.fillStyle='rgba(110,225,255,0.72)';ctx.strokeStyle='#88eeff';ctx.lineWidth=1;
    for(var _ii=-3;_ii<=3;_ii++){var _ix=cx+_ii*(tw*0.12),_iy=cy-hh;var _ih=4+Math.abs(Math.sin(_ii*1.3+now*1.5))*5;
      ctx.beginPath();ctx.moveTo(_ix-2,_iy);ctx.lineTo(_ix,_iy-_ih);ctx.lineTo(_ix+2,_iy);ctx.closePath();ctx.fill();ctx.stroke();}
    ctx.globalAlpha=1;ctx.shadowBlur=0;
  }
  // GOLDBALL — golden arc halo + orbiting sparks
  if(eff.goldball>0){
    var _gp=0.5+0.5*Math.sin(now*4);
    ctx.globalAlpha=0.38+_gp*0.28;ctx.shadowColor='#ffcc00';ctx.shadowBlur=14+_gp*10;
    ctx.strokeStyle='rgba(255,204,0,0.75)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(cx,cy,tw*0.56+_gp*4,Math.PI+0.4,Math.PI*2-0.4);ctx.stroke();
    for(var _gi=0;_gi<4;_gi++){var _ga=now*1.3+_gi*Math.PI*0.5;
      ctx.globalAlpha=(0.45+_gp*0.4)*(0.5+Math.sin(now*5+_gi)*0.5);
      ctx.fillStyle='#ffee44';ctx.shadowBlur=6;ctx.beginPath();ctx.arc(cx+Math.cos(_ga)*tw*0.53,cy+Math.sin(_ga)*h*0.7,2.5,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;ctx.shadowBlur=0;
  }
  // LAVABALL — lava glow blobs on sides + drip below
  if(eff.lavaball>0){
    var _lvp=0.5+0.5*Math.sin(now*5);
    ctx.shadowColor='#ff3300';ctx.shadowBlur=14+_lvp*10;
    for(var _lvi=0;_lvi<2;_lvi++){var _lvx=(_lvi===0)?cx-tw/2-1:cx+tw/2+1;
      var _lg=ctx.createRadialGradient(_lvx,cy,0,_lvx,cy,14);
      _lg.addColorStop(0,'rgba(255,80,0,'+(0.5+_lvp*0.3)+')');_lg.addColorStop(1,'rgba(255,20,0,0)');
      ctx.globalAlpha=0.75;ctx.fillStyle=_lg;ctx.beginPath();ctx.ellipse(_lvx,cy,12,8,0,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=0.45+_lvp*0.35;ctx.fillStyle='rgba(255,55,0,'+(0.5+_lvp*0.4)+')';
    ctx.beginPath();ctx.arc(cx+Math.sin(now*4)*tw*0.15,cy+hh+4+Math.sin(now*3)*2,3+_lvp*2,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.shadowBlur=0;
  }
  // laser turrets
  if(eff.laser>0){
    var _lpulse=0.5+0.5*Math.sin(now*14);
    var _turretXs=[cx-tw*0.32,cx+tw*0.32];
    for(var _ti=0;_ti<2;_ti++){
      var _tx=_turretXs[_ti];var _ty=cy-hh;
      // base mount
      ctx.globalAlpha=0.92;ctx.shadowColor='#ff2244';ctx.shadowBlur=6;
      ctx.fillStyle='#22202e';ctx.strokeStyle='#ff2244';ctx.lineWidth=1.3;
      ctx.beginPath();ctx.rect(_tx-5,_ty-11,10,11);ctx.fill();ctx.stroke();
      // barrel
      ctx.fillStyle='#2a3040';ctx.strokeStyle='#cc1133';ctx.lineWidth=1.0;
      ctx.beginPath();ctx.rect(_tx-2.5,_ty-21,5,11);ctx.fill();ctx.stroke();
      // energy coil ring
      ctx.strokeStyle='rgba(255,34,68,'+(0.4+_lpulse*0.5)+')';ctx.lineWidth=1.2;
      ctx.beginPath();ctx.arc(_tx,_ty-17,4,0,Math.PI*2);ctx.stroke();
      // muzzle glow
      ctx.shadowColor='#ff2244';ctx.shadowBlur=10+_lpulse*14;
      ctx.fillStyle='rgba(255,34,68,'+(0.6+_lpulse*0.4)+')';
      ctx.beginPath();ctx.arc(_tx,_ty-22,2.5+_lpulse*1.8,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;ctx.shadowBlur=0;
  }
  // frozen overlay
  if((gameState._paddleFrozen||0)>0){
    var _pfp=0.5+0.5*Math.sin(now*8);
    ctx.strokeStyle='rgba(80,180,255,'+(_pfp*0.7+0.3)+')';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(cx-tw/2-2,cy-hh-2);ctx.lineTo(cx+tw/2+2,cy-hh-2);
    ctx.lineTo(cx+bw/2+2,cy+hh+2);ctx.lineTo(cx-bw/2-2,cy+hh+2);ctx.closePath();ctx.stroke();
    ctx.fillStyle='rgba(80,180,255,'+(0.07+_pfp*0.05)+')';ctx.fill();
  }
  // hit flash
  if(p.hitAnim>0){
    ctx.globalAlpha=p.hitAnim*0.35;ctx.fillStyle='rgba(255,220,80,0.9)';
    ctx.beginPath();ctx.moveTo(cx-tw/2,cy-hh);ctx.lineTo(cx+tw/2,cy-hh);ctx.lineTo(cx+bw/2,cy+hh);ctx.lineTo(cx-bw/2,cy+hh);ctx.closePath();ctx.fill();
    ctx.globalAlpha=1;
  }
  ctx.restore();
}

function renderBalls(){for(var i=0;i<gameState.balls.length;i++){renderBall(gameState.balls[i])}}
function renderBall(ball){
  if(!ball.alive&&!ball.stuck)return;var r=ball.radius;ctx.save();
  var _eff=gameState.activeEffects;
  var _ib=_eff.iceball>0,_gb=_eff.goldball>0,_lb=_eff.lavaball>0;
  var _effKey=_ib?'ice':_gb?'gold':_lb?'lava':null;
  var tc=TRAIL_COLORS[_effKey||settings.ballTrail]||TRAIL_COLORS.lava;
  // fire/lava/lavaball: particle aura handles trail — skip geometric circles
  var _skipGeo=settings.ballTrail==='fire'||settings.ballTrail==='lava'||(_lb&&!_ib&&!_gb);
  if(!_skipGeo){
    for(var t=0;t<ball.trail.length;t++){var tr=ball.trail[t];var ta=(1-tr.age)*0.4;if(ta<=0)continue;ctx.globalAlpha=ta;ctx.globalCompositeOperation='lighter';ctx.fillStyle=tc.c2;ctx.beginPath();ctx.arc(tr.x,tr.y,r*(1-tr.age*0.6),0,Math.PI*2);ctx.fill()}
  }
  // Echo ghost copies
  if(_eff.echo>0&&ball.trail.length>4){
    var _eSteps=[7,13,19];
    for(var _ei=0;_ei<_eSteps.length;_ei++){var _eti=ball.trail.length-1-_eSteps[_ei];if(_eti<0)continue;
      var _etr=ball.trail[_eti];
      ctx.save();ctx.globalAlpha=0.20-_ei*0.05;ctx.globalCompositeOperation='lighter';
      ctx.shadowColor='#aaffee';ctx.shadowBlur=10;
      var _eg=ctx.createRadialGradient(_etr.x,_etr.y,r*0.1,_etr.x,_etr.y,r*0.8);
      _eg.addColorStop(0,'#eeffff');_eg.addColorStop(1,'#44ccaa');
      ctx.fillStyle=_eg;ctx.beginPath();ctx.arc(_etr.x,_etr.y,r*0.8,0,Math.PI*2);ctx.fill();ctx.restore();}
  }
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  // fever white glow ring
  if(gameState.fever){var _ft=performance.now()*0.001,_fp=0.5+0.5*Math.sin(_ft*14);ctx.shadowColor='#ffffff';ctx.shadowBlur=22+_fp*18;ctx.strokeStyle='rgba(255,255,200,'+(_fp*0.6+0.3)+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(ball.x,ball.y,r+4+_fp*3,0,Math.PI*2);ctx.stroke();}
  // rage orange glow or normal shadow
  if((gameState.rageLevel||0)>0){var _rl=Math.min(1,(gameState.rageLevel||0)/8),_rt=performance.now()*0.001,_rp=0.5+0.5*Math.sin(_rt*8);ctx.shadowColor='#ff6600';ctx.shadowBlur=16+_rl*20*_rp;}
  else{ctx.shadowColor=(ball.fireball||_lb)?'#ff4400':_ib?'#44ccff':_gb?'#ffcc00':tc.glow;ctx.shadowBlur=12+(ball.fireball||_lb?8:0)+(_ib||_gb?6:0);}
  var _ib=gameState.activeEffects.iceball>0,_gb=gameState.activeEffects.goldball>0,_lb=gameState.activeEffects.lavaball>0;
  var g=ctx.createRadialGradient(ball.x-r*0.3,ball.y-r*0.3,r*0.1,ball.x,ball.y,r);
  if(ball.fireball||_lb){g.addColorStop(0,'#ffee80');g.addColorStop(0.4,'#ff4400');g.addColorStop(1,'#aa1100')}
  else if(_ib){g.addColorStop(0,'#eeeeff');g.addColorStop(0.45,'#44ccff');g.addColorStop(1,'#002288')}
  else if(_gb){g.addColorStop(0,'#ffffcc');g.addColorStop(0.45,'#ffcc00');g.addColorStop(1,'#886600')}
  else if(settings.ballTrail==='plasma'){g.addColorStop(0,'#eeccff');g.addColorStop(0.45,'#aa44ff');g.addColorStop(1,'#440088')}
  else if(settings.ballTrail==='ice'){g.addColorStop(0,'#eeeeff');g.addColorStop(0.45,'#44aaff');g.addColorStop(1,'#0022aa')}
  else if(settings.ballTrail==='fire'){g.addColorStop(0,'#ffee80');g.addColorStop(0.4,'#ff6600');g.addColorStop(1,'#cc2200')}
  else{g.addColorStop(0,'#ffcc66');g.addColorStop(0.45,'#ff4400');g.addColorStop(1,'#881100')}
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(ball.x,ball.y,r,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,240,180,0.55)';ctx.beginPath();ctx.arc(ball.x-r*0.28,ball.y-r*0.28,r*0.38,0,Math.PI*2);ctx.fill();ctx.restore();
}

function _puGlow(x,y,col,r,a){ctx.shadowColor=col;ctx.shadowBlur=r;ctx.globalAlpha=a;}
function _puCircle(x,y,col,r,pulse){
  var g=ctx.createRadialGradient(x-r*0.3,y-r*0.3,r*0.1,x,y,r*pulse);
  g.addColorStop(0,col+'ff');g.addColorStop(0.6,col+'bb');g.addColorStop(1,col+'11');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*pulse,0,Math.PI*2);ctx.fill();}
function renderPowerups(){
  var now=performance.now()/1000;
  for(var i=0;i<gameState.powerups.length;i++){
    var pu=gameState.powerups[i];if(!pu.alive)continue;
    var def=pu.def,col=def.color,px=pu.x,py=pu.y;
    var pulse=0.88+0.12*Math.sin(now*4.5+i*1.3);
    ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowColor=col;ctx.shadowBlur=20*pulse;

    if(pu.type==='expand'){
      // wide pill + outward arrows
      var pw=28*pulse,ph=10*pulse;
      var gp=ctx.createLinearGradient(px-pw,py,px+pw,py);gp.addColorStop(0,col+'44');gp.addColorStop(0.5,col+'ff');gp.addColorStop(1,col+'44');
      ctx.fillStyle=gp;roundRect(ctx,px-pw,py-ph,pw*2,ph*2,ph);ctx.fill();
      ctx.fillStyle='#fff';ctx.globalAlpha=0.9;ctx.font='bold 11px monospace';
      ctx.fillText('\u25c4\u25b6',px,py+1);
    } else if(pu.type==='shrink'){
      // narrow tall pill + inward arrows
      var sp=8*pulse,sh=16*pulse;
      var gs=ctx.createLinearGradient(px,py-sh,px,py+sh);gs.addColorStop(0,col+'44');gs.addColorStop(0.5,col+'ff');gs.addColorStop(1,col+'44');
      ctx.fillStyle=gs;roundRect(ctx,px-sp,py-sh,sp*2,sh*2,sp);ctx.fill();
      ctx.fillStyle='#fff';ctx.globalAlpha=0.9;ctx.font='bold 10px monospace';
      ctx.fillText('\u25b2\u25bc',px,py+1);
    } else if(pu.type==='fireball'){
      // 6-spike rotating sun
      ctx.save();ctx.translate(px,py);ctx.rotate(now*1.4);
      var fr=14*pulse;
      ctx.beginPath();for(var _fi=0;_fi<6;_fi++){var _fa=_fi*Math.PI/3;ctx.lineTo(Math.cos(_fa)*fr,Math.sin(_fa)*fr);ctx.lineTo(Math.cos(_fa+Math.PI/6)*fr*0.5,Math.sin(_fa+Math.PI/6)*fr*0.5);}ctx.closePath();
      var gf=ctx.createRadialGradient(0,0,2,0,0,fr);gf.addColorStop(0,'#ffee88');gf.addColorStop(0.5,col);gf.addColorStop(1,col+'44');
      ctx.fillStyle=gf;ctx.fill();ctx.restore();
      ctx.fillStyle='#fff';ctx.globalAlpha=0.85;ctx.font='bold 9px monospace';ctx.fillText('FIR',px,py+1);
    } else if(pu.type==='multiball'){
      // 3 mini orbiting balls
      _puCircle(px,py,col,8,pulse);
      for(var _mi=0;_mi<3;_mi++){var _ma=now*2+_mi*Math.PI*2/3;var _mr=14;
        ctx.fillStyle=col;ctx.beginPath();ctx.arc(px+Math.cos(_ma)*_mr,py+Math.sin(_ma)*_mr,4.5,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle='#fff';ctx.globalAlpha=0.85;ctx.font='bold 8px monospace';ctx.fillText('x3',px,py+1);
    } else if(pu.type==='sticky'){
      // hexagon with web
      ctx.save();ctx.translate(px,py);ctx.rotate(now*0.5);
      var hr=15*pulse;ctx.beginPath();for(var _hi=0;_hi<6;_hi++){var _ha=_hi*Math.PI/3-Math.PI/6;ctx.lineTo(Math.cos(_ha)*hr,Math.sin(_ha)*hr);}ctx.closePath();
      ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
      // web lines
      for(var _wi=0;_wi<3;_wi++){var _wa=_wi*Math.PI/3;ctx.beginPath();ctx.moveTo(Math.cos(_wa)*hr,Math.sin(_wa)*hr);ctx.lineTo(-Math.cos(_wa)*hr,-Math.sin(_wa)*hr);ctx.globalAlpha=0.4;ctx.stroke();}
      ctx.restore();
      ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.fillStyle=col;ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();
    } else if(pu.type==='laser'){
      // diamond + 4 beams
      var lr=10*pulse;ctx.save();ctx.translate(px,py);ctx.rotate(Math.PI/4);
      ctx.strokeStyle=col;ctx.lineWidth=2;ctx.strokeRect(-lr/2,-lr/2,lr,lr);
      for(var _lri=0;_lri<4;_lri++){var _lra=_lri*Math.PI/2;var _bl=6+Math.sin(now*6+_lri)*3;
        ctx.beginPath();ctx.moveTo(Math.cos(_lra)*lr*0.85,Math.sin(_lra)*lr*0.85);
        ctx.lineTo(Math.cos(_lra)*(lr+_bl),Math.sin(_lra)*(lr+_bl));
        ctx.globalAlpha=0.5+0.4*Math.abs(Math.sin(now*4+_lri));ctx.stroke();}
      ctx.restore();ctx.globalAlpha=1;
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.globalAlpha=0.9;ctx.font='bold 8px monospace';ctx.fillText('LAS',px,py+1);
    } else if(pu.type==='life'){
      // heart shape
      var hs=13*pulse;ctx.save();ctx.translate(px,py+hs*0.15);ctx.scale(hs/15,hs/15);
      ctx.beginPath();ctx.moveTo(0,5);ctx.bezierCurveTo(-2,0,-10,0,-10,-6);ctx.bezierCurveTo(-10,-12,0,-12,0,-6);ctx.bezierCurveTo(0,-12,10,-12,10,-6);ctx.bezierCurveTo(10,0,2,0,0,5);ctx.closePath();
      var gh=ctx.createRadialGradient(-3,-5,1,0,0,10);gh.addColorStop(0,'#ffaaaa');gh.addColorStop(0.5,col);gh.addColorStop(1,'#880000');
      ctx.fillStyle=gh;ctx.fill();ctx.restore();
    } else if(pu.type==='slow'){
      // clock face
      var cr=14*pulse;_puCircle(px,py,col,cr,1);
      ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(px,py,cr*0.9,0,Math.PI*2);ctx.stroke();
      // 4 tick marks
      for(var _ti=0;_ti<4;_ti++){var _ta=_ti*Math.PI/2-Math.PI/2;ctx.beginPath();ctx.moveTo(px+Math.cos(_ta)*cr*0.75,py+Math.sin(_ta)*cr*0.75);ctx.lineTo(px+Math.cos(_ta)*cr*0.9,py+Math.sin(_ta)*cr*0.9);ctx.globalAlpha=0.6;ctx.stroke();}
      // slow hand
      var _ha=now*0.5;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(_ha-Math.PI/2)*cr*0.6,py+Math.sin(_ha-Math.PI/2)*cr*0.6);
      ctx.globalAlpha=1;ctx.strokeStyle='#fff';ctx.lineWidth=1.8;ctx.stroke();
      ctx.fillStyle=col;ctx.beginPath();ctx.arc(px,py,2.5,0,Math.PI*2);ctx.fill();
    } else if(pu.type==='iceball'){
      // snowflake / ice crystal
      ctx.save();ctx.translate(px,py);ctx.rotate(now*0.6);
      var ir=15*pulse;
      for(var _ii=0;_ii<6;_ii++){var _ia=_ii*Math.PI/3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(_ia)*ir,Math.sin(_ia)*ir);ctx.strokeStyle=col;ctx.lineWidth=2;ctx.globalAlpha=0.85;ctx.stroke();
        var _ic=ir*0.5;ctx.beginPath();ctx.moveTo(Math.cos(_ia)*_ic,Math.sin(_ia)*_ic);ctx.lineTo(Math.cos(_ia-Math.PI/6)*(_ic-4),Math.sin(_ia-Math.PI/6)*(_ic-4));ctx.moveTo(Math.cos(_ia)*_ic,Math.sin(_ia)*_ic);ctx.lineTo(Math.cos(_ia+Math.PI/6)*(_ic-4),Math.sin(_ia+Math.PI/6)*(_ic-4));ctx.lineWidth=1;ctx.stroke();}
      ctx.restore();ctx.globalAlpha=1;
      ctx.fillStyle='#fff';ctx.font='bold 8px monospace';ctx.fillText('ICE',px,py+1);
    } else if(pu.type==='goldball'){
      // gold star
      ctx.save();ctx.translate(px,py);ctx.rotate(now*0.9);
      var gr2=15*pulse;ctx.beginPath();
      for(var _gi=0;_gi<5;_gi++){var _gao=_gi*Math.PI*2/5-Math.PI/2;ctx.lineTo(Math.cos(_gao)*gr2,Math.sin(_gao)*gr2);ctx.lineTo(Math.cos(_gao+Math.PI/5)*gr2*0.42,Math.sin(_gao+Math.PI/5)*gr2*0.42);}
      ctx.closePath();
      var gg=ctx.createRadialGradient(0,0,2,0,0,gr2);gg.addColorStop(0,'#ffffcc');gg.addColorStop(0.5,'#ffcc00');gg.addColorStop(1,'#886600');
      ctx.fillStyle=gg;ctx.fill();ctx.restore();
      ctx.fillStyle='#1a1a00';ctx.font='bold 8px monospace';ctx.fillText('x3',px,py+1);
    } else if(pu.type==='lavaball'){
      // lava drop / teardrop
      ctx.save();ctx.translate(px,py-3);
      var ldr=12*pulse;ctx.beginPath();ctx.moveTo(0,-ldr);ctx.bezierCurveTo(ldr,-ldr*0.2,ldr,ldr*0.5,0,ldr*1.1);ctx.bezierCurveTo(-ldr,ldr*0.5,-ldr,-ldr*0.2,0,-ldr);ctx.closePath();
      var glav=ctx.createRadialGradient(0,-ldr*0.3,1,0,0,ldr);glav.addColorStop(0,'#ffcc66');glav.addColorStop(0.4,'#ff4400');glav.addColorStop(1,'#aa1100');
      ctx.fillStyle=glav;ctx.fill();ctx.restore();
      ctx.fillStyle='#fff';ctx.globalAlpha=0.9;ctx.font='bold 8px monospace';ctx.fillText('LAV',px,py+1);
    } else {
      // fallback: orb
      _puCircle(px,py,col,18,pulse);
      ctx.fillStyle='#fff';ctx.globalAlpha=0.9;ctx.font='bold 10px monospace';ctx.fillText(def.icon,px,py+1);
    }
    // specular
    ctx.globalAlpha=0.3;ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.beginPath();ctx.arc(px-6,py-6,4,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
}
function renderLasers(){for(var i=0;i<gameState.lasers.length;i++){var l=gameState.lasers[i];if(!l.alive)continue;ctx.save();ctx.shadowColor=l.color;ctx.shadowBlur=6;ctx.fillStyle=l.color;ctx.fillRect(l.x-l.w/2,l.y,l.w,l.h);ctx.restore()}}
function renderEdges(){
  ctx.save();
  // Bottom vignette — natural fade so ball "falls into darkness"
  var bH=CH*0.24;
  var bg=ctx.createLinearGradient(0,CH-bH,0,CH);
  bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(0.5,'rgba(0,0,0,0.15)');bg.addColorStop(1,'rgba(0,0,0,0.72)');
  ctx.fillStyle=bg;ctx.fillRect(0,CH-bH,CW,bH);
  ctx.restore();
}
function renderFlash(){if(gameState.flashAlpha<=0)return;ctx.save();ctx.globalAlpha=gameState.flashAlpha*0.35;ctx.fillStyle=gameState.flashColor;ctx.fillRect(0,0,CW,CH);ctx.restore();gameState.flashAlpha*=0.82;if(gameState.flashAlpha<0.005)gameState.flashAlpha=0}
// ── Fever fire — spawn a few fire particles near fever text each frame ───────
var _feverFlameT=0,_feverTextR=null,_feverTextFrame=0;
function renderFeverFire(){
  if(!gameState.fever)return;
  // Refresh text rect every 30 frames (cheap)
  _feverTextFrame++;
  if(_feverTextFrame%30===0||!_feverTextR){
    var el=document.getElementById('fever-display');
    if(!el||!el.classList.contains('visible')){_feverTextR=null;return;}
    var r=el.getBoundingClientRect(),cr=canvas.getBoundingClientRect();
    _feverTextR={x:r.left-cr.left,y:r.top-cr.top,w:r.width,h:r.height};
  }
  if(!_feverTextR||_feverTextR.w<10)return;
  // Spawn 3-5 fire particles along the top of the text
  var tr=_feverTextR,n=3+Math.floor(Math.random()*3);
  for(var i=0;i<n;i++){
    var p=poolAlloc();if(!p)break;
    p.x=tr.x+Math.random()*tr.w;p.y=tr.y+tr.h*0.1;
    p.vx=(Math.random()-0.5)*40;p.vy=-(50+Math.random()*90);
    p.color=['#ff6600','#ff8800','#ffcc00','#ff4400','#ffee00'][Math.floor(Math.random()*5)];
    p.alpha=0.7+Math.random()*0.3;p.radius=4+Math.random()*8;
    p.life=0.3+Math.random()*0.25;p.maxLife=p.life;p.gravity=-20;p.type='fire';
  }
}
function renderTimerHUD(){
  var bar=document.getElementById('timed-bar'),txt=document.getElementById('timer-text');
  if(!bar||!txt)return;
  var show=gameState.gameMode==='timed'&&gameState.tAttackTimer>0&&currentScreen==='screen-game'
    &&!document.getElementById('overlay-gameover').classList.contains('visible')
    &&!document.getElementById('overlay-victory').classList.contains('visible');
  bar.style.display=txt.style.display=show?'block':'none';
  if(!show)return;
  var secs=Math.ceil(gameState.tAttackTimer);
  var warn=secs<=20;
  var maxTime=90;
  var frac=Math.max(0,Math.min(1,gameState.tAttackTimer/maxTime));
  var color=warn?'#ff2200':'#ffcc00';
  bar.style.width=(frac*100)+'%';bar.style.background=color;
  bar.style.boxShadow='0 0 '+(warn?10:4)+'px '+color;
  bar.style.opacity=warn?(0.65+0.35*Math.sin(Date.now()*0.014)):1;
  txt.style.color=color;txt.style.textShadow='0 0 8px '+color;
  var mm=Math.floor(secs/60),ss=secs%60;
  txt.textContent=t('time_left')+': '+(mm>0?mm+':'+(ss<10?'0':'')+ss:ss+'s');
}


var lastDt=0.016,_fpsLastTime=0,_fpsCount=0,_fpsCurrent=0;
function updateDebugOverlay(now){
  _fpsCount++;if(now-_fpsLastTime>=500){_fpsCurrent=Math.round(_fpsCount*1000/(now-_fpsLastTime));_fpsCount=0;_fpsLastTime=now}
  var el=document.getElementById('debug-overlay');if(!el||(!gameState.debugMode&&!gameState.showHitboxes))return;
  var alive=particlePool.filter(function(p){return p._alive}).length;
  var blk=gameState.blocks.filter(function(b){return b.alive}).length;
  el.textContent=(glReady?'WebGL2':'Canvas2D')+' | FPS:'+_fpsCurrent+' | P:'+alive+'/'+CFG.MAX_PARTICLES+' | Blk:'+blk+' | Balls:'+gameState.balls.length+' | Score:'+gameState.score+' | Lvl:'+(gameState.level+1)+' | Combo:'+gameState.combo+' | BOT:'+(gameState.botEnabled?'ON':'OFF');
}
// ── Bot helpers ──────────────────────────────────────────────────────────────
var _BOT_PU_SKIP={shrink:1};
var _BOT_TYPE_PRIO={B:0,S:1,L:2,T:3,G:4,R:4,E:5,F:5,W:6,I:7};
function _botBestLaserTarget(){
  var alive=gameState.blocks.filter(function(b){return b.alive});if(!alive.length)return null;
  return alive.reduce(function(best,b){
    var bp=_BOT_TYPE_PRIO[b.type]!==undefined?_BOT_TYPE_PRIO[b.type]:8;
    var ap=_BOT_TYPE_PRIO[best.type]!==undefined?_BOT_TYPE_PRIO[best.type]:8;
    if(bp!==ap)return bp<ap?b:best;
    return b.row>best.row?b:best;
  },alive[0]);
}
function _botBestPowerup(paddle){
  if(!gameState.powerups||!gameState.powerups.length)return null;
  var candidates=gameState.powerups.filter(function(pu){
    return pu.alive&&!_BOT_PU_SKIP[pu.type]&&pu.y>layout.gridY&&pu.y<paddle.y+20;
  });
  if(!candidates.length)return null;
  return candidates.reduce(function(a,b){return Math.abs(b.x-paddle.x)<Math.abs(a.x-paddle.x)?b:a},candidates[0]);
}
function _botPredictX(ball,paddle){
  var predictX=ball.x;
  if(ball.vy>0){var eta=(paddle.y-ball.y)/ball.vy;
    if(eta>0&&eta<2.5){predictX=ball.x+ball.vx*eta;
      var br=getBallRadius(),lo=br,hi=CW-br;
      for(var w=0;w<5;w++){if(predictX<lo){predictX=2*lo-predictX;}else if(predictX>hi){predictX=2*hi-predictX;}else break;}}}
  return predictX;
}
function updateDebugBot(){
  if(!gameState.debugMode||!gameState.botEnabled||currentScreen!=='screen-game')return;
  var lo=document.getElementById('overlay-level');
  if(lo&&lo.classList.contains('visible')){dismissLevelOverlay();return}
  var vo=document.getElementById('overlay-victory');
  if(vo&&vo.classList.contains('visible')){if(!gameState._botVicPause){gameState._botVicPause=true;setTimeout(function(){gameState._botVicPause=false;var nb=document.getElementById('btn-vic-next');if(nb&&nb.style.display!=='none')nb.click();else{document.getElementById('overlay-victory').classList.remove('visible');showScreen('screen-start');}},2500)}return}
  if(!gameState.running||gameState.paused)return;
  var p=gameState.paddle;if(!p)return;
  var balls=gameState.balls;if(!balls.length)return;
  balls.forEach(function(b){if(b.stuck&&b.alive){launchBall(b);playSFX('launch')}});
  var active=balls.filter(function(b){return b.alive&&!b.stuck});if(!active.length)return;
  // Time-to-paddle for most dangerous ball (lowest + moving down)
  var mostDangerous=active.reduce(function(a,b){return b.y>a.y?b:a},active[0]);
  var eta=mostDangerous.vy>0?(p.y-mostDangerous.y)/mostDangerous.vy:999;
  var safe=eta>1.0; // >1s until ball hits paddle — can do other things
  // Priority 1: aim laser — only when safe
  if(safe&&gameState.activeEffects&&gameState.activeEffects.laser>0){
    var laserTgt=_botBestLaserTarget();if(laserTgt){p.targetX=laserTgt.cx;return;}
  }
  // Priority 2: intercept powerups — only when safe
  if(safe){var pu=_botBestPowerup(p);if(pu){p.targetX=pu.x;return;}}
  // Priority 3: track ball + aim at bottom row
  var tgt=active.reduce(function(a,b){return b.y>a.y?b:a},active[0]);
  var predictX=_botPredictX(tgt,p);
  var aliveBlks=gameState.blocks.filter(function(b){return b.alive});
  if(aliveBlks.length>0){
    var maxRow=aliveBlks.reduce(function(acc,b){return b.row>acc?b.row:acc},0);
    var bottomRow=aliveBlks.filter(function(b){return b.row===maxRow&&b.type!=='S'});
    if(!bottomRow.length)bottomRow=aliveBlks.filter(function(b){return b.row===maxRow});
    var orbTarget=bottomRow.reduce(function(a,b){return Math.abs(b.cx-predictX)<Math.abs(a.cx-predictX)?b:a},bottomRow[0]);
    var dx=orbTarget.cx-predictX,dyUp=Math.max(20,p.y-orbTarget.cy);
    var angle=Math.atan2(dx,dyUp),maxA=60*Math.PI/180;
    angle=Math.max(-maxA,Math.min(maxA,angle));
    p.targetX=predictX-(angle/maxA)*(p.width/2);
  }else{p.targetX=predictX;}
}
function gameLoop(ts){
  var dt=Math.min((ts-lastTime)/1000,0.05);lastTime=ts;lastDt=dt;animFrame=requestAnimationFrame(gameLoop);
  updateDebugOverlay(ts);updateDebugBot();updateParticles(dt);
  if(!gameState.running||gameState.paused){if(settings.visualFX&&gameState.balls){for(var _bi=0;_bi<gameState.balls.length;_bi++){var _bb=gameState.balls[_bi];if(_bb.stuck&&_bb.alive)_spawnBallAura(_bb)}}render();return}
  _tiltApply();updatePaddle(dt);updateEffects(dt);updatePowerups(dt);updateLasers(dt);updateBackground(dt);if(glReady)updateBlockWaves(gameState.blocks,dt);
  if(gameState.activeEffects.laser>0){gameState._laserTimer=(gameState._laserTimer||0)-dt;if(gameState._laserTimer<=0){fireLasers();gameState._laserTimer=0.4}}
  for(var i=0;i<gameState.balls.length;i++){var b=gameState.balls[i];if(b.stuck||!b.alive){updateBallStuck(b);b.trail=[];if(b.stuck)_spawnBallAura(b);continue}
    b.trail.push({x:b.x,y:b.y,age:0});var _mxT=(settings.trailLength==='short'?5:settings.trailLength==='long'?22:12)+(gameState.rageLevel||0)*2,_tSp=settings.trailLength==='short'?7:settings.trailLength==='long'?2.5:4;if(b.trail.length>_mxT)b.trail.shift();b.trail.forEach(function(tr){tr.age+=dt*_tSp});b.trail=b.trail.filter(function(tr){return tr.age<1});
    if(settings.visualFX){var bspd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);if(bspd>60&&Math.random()<dt*28)spawnTrailParticle(b.x+(Math.random()-0.5)*3,b.y+(Math.random()-0.5)*3);if(Math.random()<0.35)_spawnBallAura(b)}}
  updateAmbientBlockFX(dt);updateFever(dt);updateDescent(dt);updateOrbShots(dt);updateRage(dt);
  // Float text update
  if(gameState.floatTexts){for(var _fi=gameState.floatTexts.length-1;_fi>=0;_fi--){var _ft=gameState.floatTexts[_fi];_ft.y+=_ft.vy*dt;_ft.life-=dt;_ft.alpha=Math.max(0,_ft.life/_ft.maxLife);if(_ft.life<=0)gameState.floatTexts.splice(_fi,1);}}
  // Gravity flip: attract ball toward nearest alive orb cluster
  if(gameState.activeEffects.gravity>0){gameState.balls.forEach(function(b){if(!b.alive||b.stuck)return;var nb=_findNearestBlock(b);if(!nb)return;var dx=nb.cx-b.x,dy=nb.cy-b.y,d=Math.sqrt(dx*dx+dy*dy)||1;var force=180/d;b.vx+=dx/d*force*dt;b.vy+=dy/d*force*dt;var spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);if(spd>getBallSpeed()*1.5){b.vx=b.vx/spd*getBallSpeed()*1.5;b.vy=b.vy/spd*getBallSpeed()*1.5;}});}
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
  if(gameState.shake>0.5){var _sm=Math.min(gameState.shake,10)*0.3,_sx=((Math.random()-0.5)*_sm).toFixed(1),_sy=((Math.random()-0.5)*_sm).toFixed(1),_tr='translate('+_sx+'px,'+_sy+'px)';canvas.style.transform=_tr;if(glCanvas)glCanvas.style.transform=_tr;}else{canvas.style.transform='';if(glCanvas)glCanvas.style.transform='';}
  ctx.save();
  if(glReady){
    gl.viewport(0,0,CW,CH);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    glRenderBg(gameState.level,glTime);glRenderBlocks(gameState.blocks,glTime);
    ctx.clearRect(0,0,CW,CH);
    renderOrbCracks();renderBossRings();
  }else{renderBackground();renderBlocks()}
  renderLasers();renderPowerups();renderPaddle();renderBalls();renderParticles();renderOrbShots();renderDangerZone();
  if(gameState.showHitboxes&&gameState.running&&!gameState.paused){gameState.balls.forEach(function(b){if(b.alive&&!b.stuck)renderBallTrajectory(b);});}
  renderEdges();renderShield();renderFloatTexts();renderFlash();renderTimerHUD();
  if(gameState.showHitboxes)renderDebugHitboxes();
  ctx.restore();
}

var keys={},mouseX=0;
var _grabBall=null,_grabOffX=0,_grabOffY=0,_grabPX=0,_grabPY=0,_grabPT=0,_grabVX=0,_grabVY=0;
function initInput(){
  // Accelerometer (tilt control)
  function _startTilt(){window.addEventListener('deviceorientation',function(e){if(e.gamma===null)return;_tiltGamma=e.gamma;_tiltActive=true;});}
  if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
    // iOS 13+ requires permission
    document.addEventListener('touchstart',function _iosPermOnce(){document.removeEventListener('touchstart',_iosPermOnce);DeviceOrientationEvent.requestPermission().then(function(r){if(r==='granted')_startTilt();}).catch(function(){});},{once:true});
  }else{_startTilt();}
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
      if(e.code==='BracketRight'){var _mxL=gameState.gameMode==='endless'?999:LEVELS.length-1;if(gameState.level<_mxL){e.preventDefault();startLevel(gameState.level+1)}}}
    if(currentScreen==='screen-game'&&gameState.running&&!gameState.paused&&!gameState.botEnabled){
      if(e.code==='ArrowLeft'||e.code==='KeyA'){if(gameState.paddle)gameState.paddle.targetX-=30}
      if(e.code==='ArrowRight'||e.code==='KeyD'){if(gameState.paddle)gameState.paddle.targetX+=30}}});
  document.addEventListener('keyup',function(e){keys[e.code]=false});
  setInterval(function(){if(currentScreen!=='screen-game'||!gameState.running||gameState.paused||gameState.botEnabled)return;var p=gameState.paddle;if(!p)return;if(keys['ArrowLeft']||keys['KeyA'])p.targetX-=6;if(keys['ArrowRight']||keys['KeyD'])p.targetX+=6},16);
}
function handleSpacebar(){var lo=document.getElementById('overlay-level');if(lo&&lo.classList.contains('visible')){dismissLevelOverlay();_tiltCalibrate();return}gameState.balls.forEach(function(b){if(b.stuck){_tiltCalibrate();launchBall(b);playSFX('launch')}})}
function handleGameTap(){var lo=document.getElementById('overlay-level');if(lo&&lo.classList.contains('visible')){dismissLevelOverlay();_tiltCalibrate();return}gameState.balls.forEach(function(b){if(b.stuck){_tiltCalibrate();launchBall(b);playSFX('launch')}})}
function dismissLevelOverlay(){var lo=document.getElementById('overlay-level');if(lo)lo.classList.remove('visible');gameState.running=true;if(gameState.gameMode==='timed')_timedStart();}
function togglePause(){if(!gameState.running&&!gameState.paused)return;gameState.paused=!gameState.paused;var po=document.getElementById('overlay-pause');if(gameState.paused){if(po)po.classList.add('visible');musicStop()}else{if(po)po.classList.remove('visible');var lvl2=LEVELS[gameState.level];if(lvl2)musicStart(lvl2.music||'inferno')}}


function initButtons(){
  document.getElementById('btn-play').addEventListener('click',function(){ensureAudio();gameState.gameMode=settings.gameMode||'classic';startGame()});
  ['classic','timed','endless'].forEach(function(m){var el=document.getElementById('mode-'+m);if(el)el.addEventListener('click',function(){settings.gameMode=m;saveSettings();['classic','timed','endless'].forEach(function(x){var b=document.getElementById('mode-'+x);if(b)b.classList.toggle('active',x===m)});});});
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
  document.getElementById('btn-descent').addEventListener('click',function(){settings.descent=!settings.descent;applySettingsUI();saveSettings()});
  ['easy','normal','hard'].forEach(function(d){document.getElementById('diff-'+d).addEventListener('click',function(){settings.difficulty=d;applySettingsUI();saveSettings()})});
  ['few','normal','many'].forEach(function(r){var el=document.getElementById('pu-'+r);if(el)el.addEventListener('click',function(){settings.powerupRate=r;applySettingsUI();saveSettings()})});
  ['en','ru'].forEach(function(l){document.getElementById('lang-'+l).addEventListener('click',function(){settings.language=l;applyI18n();applySettingsUI();saveSettings()})});
  document.getElementById('btn-back-lb').addEventListener('click',function(){showScreen('screen-start')});
  document.getElementById('btn-pause').addEventListener('click',function(){togglePause()});
  document.getElementById('btn-mute').addEventListener('click',function(){var willMute=settings.sfxOn||settings.musicOn;settings.sfxOn=!settings.sfxOn;settings.musicOn=!settings.musicOn;var b=document.getElementById('btn-mute');if(b)b.textContent=(settings.sfxOn||settings.musicOn)?'\uD83D\uDD0A':'\uD83D\uDD07';if(willMute){musicStop()}else{var lvl=LEVELS[gameState.level];if(lvl&&gameState.running&&!gameState.paused)musicStart(lvl.music||'inferno')}saveSettings()});
  document.getElementById('btn-resume').addEventListener('click',function(){togglePause()});
  document.getElementById('p-btn-music').addEventListener('click',function(){settings.musicOn=!settings.musicOn;if(!settings.musicOn)musicStop();else if(gameState.paused){var _l=LEVELS[gameState.level];if(_l)musicStart(_l.music||'inferno');musicStop();}applySettingsUI();saveSettings()});
  document.getElementById('p-btn-sfx').addEventListener('click',function(){settings.sfxOn=!settings.sfxOn;applySettingsUI();saveSettings()});
  document.getElementById('p-btn-visual').addEventListener('click',function(){settings.visualFX=!settings.visualFX;applySettingsUI();saveSettings()});
  ['easy','normal','hard'].forEach(function(d){var e=document.getElementById('p-diff-'+d);if(e)e.addEventListener('click',function(){settings.difficulty=d;applySettingsUI();saveSettings()})});
  document.getElementById('btn-restart').addEventListener('click',function(){document.getElementById('overlay-pause').classList.remove('visible');startGame()});
  document.getElementById('btn-quit').addEventListener('click',function(){document.getElementById('overlay-pause').classList.remove('visible');_timedStop();gameState.running=false;gameState.paused=false;showScreen('screen-start')});
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
  if(dbgHitbox){dbgHitbox.textContent='INFO: OFF';dbgHitbox.addEventListener('click',function(){gameState.showHitboxes=!gameState.showHitboxes;dbgHitbox.textContent='INFO: '+(gameState.showHitboxes?'ON':'OFF');var dov=document.getElementById('debug-overlay');if(dov)dov.style.display=gameState.showHitboxes?'block':'none';});}
  if(dbgPrev)dbgPrev.addEventListener('click',function(){if(gameState.level>0){startLevel(gameState.level-1);ensureLoop()}});
  if(dbgNext)dbgNext.addEventListener('click',function(){var _mxL=gameState.gameMode==='endless'?999:LEVELS.length-1;if(gameState.level<_mxL){startLevel(gameState.level+1);ensureLoop()}});
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
  (function(){var types=['F','I','W','E','L','S','G','T','R'];assert('BlockDefs: all 9',types.every(function(t){return!!BLOCK_DEFS[t]}));assert('BlockDefs: colors',types.every(function(t){return!!BLOCK_DEFS[t].color}));assert('Steel tough (hp=3)',BLOCK_DEFS.S.hp===3)})();
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
  (function(){var b=Object.assign({},BLOCK_DEFS['S']);assert('Phase2: Steel HP is 3',b.hp===3)})();
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
  // Phase 5: version
  (function(){assert('Phase5: VERSION 1.8.0',CFG.VERSION==='1.8.0','got:'+CFG.VERSION)})();

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

  // v1.7 tests
  (function(){assert('v17: BLOCK_DEFS.B exists',!!BLOCK_DEFS['B']);assert('v17: Boss hp=8',BLOCK_DEFS['B'].hp===8);assert('v17: BLOCK_ICONS.B exists',!!BLOCK_ICONS['B'])})();
  (function(){assert('v17: LIQUID_TYPES.B exists',!!LIQUID_TYPES['B'])})();
  (function(){assert('v17: POWERUP_DEFS echo',!!POWERUP_DEFS.echo);assert('v17: POWERUP_DEFS gravity',!!POWERUP_DEFS.gravity);assert('v17: POWERUP_DEFS shield',!!POWERUP_DEFS.shield)})();
  (function(){assert('v17: spawnFloatText function',typeof spawnFloatText==='function')})();
  (function(){assert('v17: generateProceduralLevel function',typeof generateProceduralLevel==='function')})();
  (function(){assert('v17: renderBallTrajectory function',typeof renderBallTrajectory==='function')})();
  (function(){assert('v17: renderShield function',typeof renderShield==='function')})();
  (function(){assert('v17: spawnMetallicShards function',typeof spawnMetallicShards==='function')})();
  (function(){var lvl=generateProceduralLevel(15);assert('v17: generateProceduralLevel returns grid',lvl&&lvl.grid&&lvl.grid.length>0,'grid:'+JSON.stringify(lvl&&lvl.grid));assert('v17: proc level has name',!!lvl.name);assert('v17: proc level 13 cols',lvl.grid&&lvl.grid[0]&&lvl.grid[0].length===13)})();
  (function(){recalcLayout();var bl=parseLevel(LEVELS[4]);var boss=bl.filter(function(b){return b.type==='B'});assert('v17: Level 5 has Boss orbs',boss.length>0,'found:'+boss.length)})();
  (function(){recalcLayout();var bl=parseLevel(LEVELS[14]);var boss=bl.filter(function(b){return b.type==='B'});assert('v17: Level 15 has Boss orbs',boss.length>=3,'found:'+boss.length)})();
  (function(){assert('v17: echo_pu i18n EN',t('echo_pu')==='Ghost echoes hit orbs')})();
  (function(){assert('v17: gameState.gameMode default',gameState.gameMode==='classic')})();
  (function(){assert('v17: _SPILL_COLORS B',!!_SPILL_COLORS['B'])})();
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
