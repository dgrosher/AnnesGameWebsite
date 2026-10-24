const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function newCloudwing(){const s={player:{x:300,y:180,vx:0,vy:0},enemies:[],letters:[],score:0,lives:3,wave:0,delivered:0,time:0,flap:0,shield:1,over:false};cloudWave(s);return s;}
function cloudWave(s){s.wave++;s.enemies=Array.from({length:Math.min(2+s.wave,7)},(_,i)=>({x:70+i*78,y:70+i%3*65,vx:i%2?65:-65,vy:0,phase:i*2}));s.letters=[];s.target=s.enemies.length;s.delivered=0;}
function cloudHurt(s){s.lives--;s.shield=2;s.player={x:300,y:150,vx:0,vy:0};if(!s.lives)s.over=true;}
export function stepCloudwing(s,input,dt){
 if(s.over)return;s.time+=dt;s.shield=Math.max(0,s.shield-dt);s.flap=Math.max(0,s.flap-dt);const p=s.player;
 p.vx=clamp(p.vx+(Number(input.right)-Number(input.left))*480*dt,-175,175);if(!input.left&&!input.right)p.vx*=Math.pow(.08,dt);
 if(input.action&&s.flap===0){p.vy=-205;s.flap=.18;}p.vy=clamp(p.vy+360*dt,-250,260);const oldY=p.y;p.x=(p.x+p.vx*dt+600)%600;p.y+=p.vy*dt;
 if(p.y<24){p.y=24;p.vy=20;}
 for(const shelf of [{x:35,y:290,w:150},{x:245,y:345,w:110},{x:420,y:255,w:145}])if(p.vy>=0&&oldY+16<=shelf.y&&p.y+16>=shelf.y&&p.x>shelf.x-8&&p.x<shelf.x+shelf.w+8){p.y=shelf.y-16;p.vy=0;}
 if(p.y>407){if(!s.shield)cloudHurt(s);else{p.y=380;p.vy=-130;}}
 for(const e of s.enemies){e.x=(e.x+e.vx*dt+600)%600;e.y+=Math.sin(s.time*1.7+e.phase)*40*dt;e.y=clamp(e.y,48,310);
  if(Math.abs(e.x-s.player.x)<31&&Math.abs(e.y-s.player.y)<28&&!e.caught){
   if(s.player.y<e.y-5){e.caught=true;s.letters.push({x:e.x,y:e.y});s.player.vy=-150;s.score+=25;}
   else if(!s.shield){cloudHurt(s);}
  }
 }
 s.enemies=s.enemies.filter(e=>!e.caught);
 s.letters=s.letters.filter(letter=>{if(Math.hypot(letter.x-s.player.x,letter.y-s.player.y)<35){s.delivered++;s.score+=75;return false;}return true;});
 if(!s.over&&s.delivered===s.target)cloudWave(s);
}
export const GARDEN_COLS=20,GARDEN_ROWS=14;
const cellKey=(x,y)=>`${x},${y}`;
function gardenWave(s){s.wave++;s.dug=new Set();s.player={x:10,y:1,dx:0,dy:1};for(let y=1;y<13;y++)s.dug.add(cellKey(10,y));for(const y of [4,8,11])for(let x=2;x<18;x++)s.dug.add(cellKey(x,y));s.bugs=Array.from({length:Math.min(3+s.wave,8)},(_,i)=>({x:i%2?16-Math.floor(i/6)*2:3+Math.floor(i/6)*2,y:[4,8,11][i%3],puff:0,fade:0,move:.5+i*.1}));s.flowers=[];s.move=0;s.water=0;s.spray=0;s.shield=2;s.cleared=false;}
export function newGarden(){const s={player:null,dug:new Set(),bugs:[],flowers:[],wave:0,score:0,lives:3,move:0,water:0,shield:0,spray:0,over:false};gardenWave(s);return s;}
export function advanceGarden(s){if(s.cleared&&!s.over)gardenWave(s);}
export function stepGarden(s,input,dt){
 if(s.over||s.cleared)return;s.shield=Math.max(0,s.shield-dt);s.move=Math.max(0,s.move-dt);s.water=Math.max(0,s.water-dt);s.spray=Math.max(0,s.spray-dt);
 const p=s.player;const direction=input.left?[-1,0]:input.right?[1,0]:input.up?[0,-1]:input.down?[0,1]:null;
 if(direction){[p.dx,p.dy]=direction;if(s.move===0){p.x=clamp(p.x+p.dx,0,19);p.y=clamp(p.y+p.dy,1,13);s.dug.add(cellKey(p.x,p.y));s.move=.13;}}
 if(input.action&&s.water===0){s.water=.28;s.spray=.18;for(const bug of s.bugs){const dx=bug.x-p.x,dy=bug.y-p.y;const distance=dx*p.dx+dy*p.dy;const aligned=p.dx?dy===0:dx===0;let clear=true;for(let i=1;i<=distance;i++)if(!s.dug.has(cellKey(p.x+p.dx*i,p.y+p.dy*i)))clear=false;if(aligned&&distance>=0&&distance<=3&&clear){bug.puff++;bug.fade=1.6;}}}
 for(const bug of s.bugs){
  if(bug.puff>=3){s.flowers.push({x:bug.x,y:bug.y});s.score+=100;continue;}
  bug.fade=Math.max(0,bug.fade-dt);
  if(!bug.fade){bug.move-=dt;if(bug.move<=0){bug.move=Math.max(.23,.6-s.wave*.025);const options=[[0,1],[0,-1],[1,0],[-1,0]].map(([dx,dy])=>({x:bug.x+dx,y:bug.y+dy})).filter(pos=>s.dug.has(cellKey(pos.x,pos.y)));options.sort((a,b)=>Math.abs(a.x-p.x)+Math.abs(a.y-p.y)-Math.abs(b.x-p.x)-Math.abs(b.y-p.y));if(options.length){bug.x=options[0].x;bug.y=options[0].y;}}}
  if(bug.x===p.x&&bug.y===p.y&&!s.shield&&!bug.fade){s.lives--;s.shield=2;s.player={x:10,y:1,dx:0,dy:1};if(!s.lives)s.over=true;}
 }
 s.bugs=s.bugs.filter(b=>b.puff<3);if(!s.over&&!s.bugs.length)s.cleared=true;
}
