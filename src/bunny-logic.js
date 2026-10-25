const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const BUNNY_STAGES=['Daisy Meadow','Apple Orchard','Moonflower Hill','Bramble Bridge','Twilight Tunnels','Stormlit Summit'];
export function newBunny(){const s={level:1,lives:3,score:0,powered:false,carrotsFound:0,sunsFound:0,checkpoint:50,camera:0,invulnerable:0,coyote:0,jumpBuffer:0,cleared:false,won:false,over:false,time:0};buildStage(s);return s;}
function buildStage(s){
 const layouts=[[[0,600],[690,640],[1420,620],[2120,520]],[[0,550],[650,650],[1395,630],[2130,510]],[[0,520],[625,675],[1410,615],[2130,510]],[[0,510],[625,650],[1395,610],[2125,515]],[[0,495],[615,650],[1390,600],[2115,525]],[[0,480],[605,645],[1380,595],[2105,535]]];
 s.solids=layouts[s.level-1].map(([x,w])=>({x,y:330,w,h:100,ground:true}));
 s.solids.push({x:270,y:270,w:100,h:18},{x:385,y:220,w:95,h:18},{x:775,y:270,w:120,h:18},{x:1550,y:270,w:130,h:18},{x:1745,y:215,w:100,h:18},{x:2240,y:270,w:110,h:18});
 s.carrots=[{x:185,y:293,w:22,h:30},{x:1000,y:293,w:22,h:30},{x:1830,y:293,w:22,h:30}];
 s.suns=[...[120,250,450,760,1040,1190,1510,1910,2210,2410].map(x=>({x,y:298,w:16,h:16})),...[300,340,410,450,805,850,1580,1630,1770,1805,2270,2310].map((x,i)=>({x,y:i<2?240:i<4?190:i<6?240:i<8?240:i<10?185:240,w:16,h:16}))];
 s.enemies=[{x:475,min:435,max:515},{x:1030,min:970,max:1080},{x:1910,min:1870,max:1970},{x:2450,min:2420,max:2480}].map((enemy,i)=>({...enemy,y:304,w:30,h:26,vx:(i%2?1:-1)*(35+s.level*12),settled:false,mode:'walk'}));
 if(s.level>=4)s.enemies.push(...[{x:1180,min:1145,max:1220},{x:1740,min:1700,max:1790}].map((e,i)=>({...e,y:304,w:30,h:26,vx:(i?1:-1)*(45+s.level*10),settled:false,mode:'walk'})));
 s.player={x:50,y:280,w:28,h:40,vx:0,vy:0,grounded:false,facing:1};s.checkpoint=50;s.camera=0;s.invulnerable=1;s.coyote=0;s.jumpBuffer=0;s.cleared=false;
}
export function nextBunnyStage(s){if(s.cleared&&!s.won&&!s.over){s.level++;s.lives=Math.min(3,s.lives+1);buildStage(s);}}
function hurt(s,pit=false){
 if(s.invulnerable>0&&!pit)return;
 if(s.powered&&!pit){s.powered=false;s.invulnerable=1.6;s.player.vy=-180;return;}
 s.lives--;s.powered=false;if(s.lives<=0){s.over=true;return;}
 s.player={x:s.checkpoint,y:280,w:28,h:40,vx:0,vy:0,grounded:false,facing:1};s.invulnerable=1.6;s.coyote=0;s.jumpBuffer=0;
}
export function stepBunny(s,input,dt){
 if(s.over||s.cleared||s.won)return;s.time+=dt;s.invulnerable=Math.max(0,s.invulnerable-dt);s.jumpBuffer=Math.max(0,s.jumpBuffer-dt);const p=s.player;
 if(input.jump)s.jumpBuffer=.13;
 s.coyote=p.grounded?.1:Math.max(0,s.coyote-dt);
 const direction=Number(input.right)-Number(input.left);if(direction){p.vx=direction*205;p.facing=direction;}else p.vx*=Math.pow(.0001,dt);
 if(s.jumpBuffer>0&&s.coyote>0){p.vy=s.powered?-510:-455;p.grounded=false;s.coyote=0;s.jumpBuffer=0;}
 p.x=clamp(p.x+p.vx*dt,0,2612);
 for(const solid of s.solids)if(overlap(p,solid)){if(p.vx>0)p.x=solid.x-p.w;else if(p.vx<0)p.x=solid.x+solid.w;p.vx=0;}
 const oldY=p.y;p.vy=Math.min(700,p.vy+1350*dt);p.y+=p.vy*dt;p.grounded=false;
 for(const solid of s.solids)if(overlap(p,solid)){
  if(p.vy>=0&&oldY+p.h<=solid.y+1){p.y=solid.y-p.h;p.vy=0;p.grounded=true;}
  else if(p.vy<0&&oldY>=solid.y+solid.h-1){p.y=solid.y+solid.h;p.vy=0;}
 }
 for(const carrot of s.carrots)if(!carrot.taken&&overlap(p,carrot)){carrot.taken=true;s.carrotsFound++;s.score+=100;s.powered=true;}
 for(const sun of s.suns)if(!sun.taken&&overlap(p,sun)){sun.taken=true;s.sunsFound++;s.score+=10;}
 for(const enemy of s.enemies){
  enemy.mode??=enemy.settled?'shell':'walk';enemy.kickShield=Math.max(0,(enemy.kickShield||0)-dt);
  if(enemy.mode==='gone')continue;
  if(enemy.mode==='walk'){enemy.x+=enemy.vx*dt;if(enemy.x<enemy.min){enemy.x=enemy.min;enemy.vx=Math.abs(enemy.vx);}if(enemy.x>enemy.max){enemy.x=enemy.max;enemy.vx=-Math.abs(enemy.vx);}}
  if(enemy.mode==='sliding'){
   enemy.x+=enemy.vx*dt;
   for(const solid of s.solids)if(!solid.ground&&overlap(enemy,solid)){enemy.vx*=-1;enemy.x+=Math.sign(enemy.vx)*8;break;}
   if(enemy.x<-80||enemy.x>2720){enemy.mode='gone';continue;}
   for(const other of s.enemies)if(other!==enemy&&other.mode!=='gone'&&other.mode!=='sliding'&&overlap(enemy,other)){other.mode='gone';other.settled=true;s.score+=100;}
  }
  const box=enemy.mode==='walk'?enemy:{...enemy,y:314,h:16};
  if(overlap(p,box)){
   if(p.vy>0&&oldY+p.h<=box.y+12){enemy.mode='shell';enemy.settled=true;enemy.vx=0;enemy.y=314;enemy.h=16;enemy.kickShield=.2;s.score+=50;p.vy=-310;}
   else if(enemy.mode==='shell'&&enemy.kickShield===0){enemy.mode='sliding';enemy.vx=(p.x+p.w/2<enemy.x+enemy.w/2?1:-1)*360;enemy.kickShield=.28;s.score+=10;}
   else if(enemy.mode!=='shell'&&enemy.kickShield===0)hurt(s);
  }
 }
 if(p.y>470)hurt(s,true);
 if(s.player.x>=1120&&s.player.y<350)s.checkpoint=1120;
 if(!s.over&&s.player.x>=2500&&s.player.y<335){s.cleared=true;s.score+=250;if(s.level===BUNNY_STAGES.length)s.won=true;}
 s.camera=clamp(s.player.x-180,0,2040);
}
