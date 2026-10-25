const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const rallyHazards=[{at:.18,lane:-24},{at:.47,lane:22},{at:.76,lane:0}];
export function rallyPoint(progress,lane=0){const angle=progress*Math.PI*2-Math.PI/2;return {x:300+(218+lane)*Math.cos(angle),y:210+(125+lane*.55)*Math.sin(angle),angle};}
export function newRally(){return {progress:0,lane:0,speed:0,boost:100,time:0,countdown:3,bump:0,seeds:0,picked:new Set(),rivals:[{progress:-.025,lane:-24,speed:111},{progress:-.05,lane:24,speed:103},{progress:-.075,lane:0,speed:96}],over:false,rank:null};}
export function stepRally(s,input,dt){
 if(s.over)return;if(s.countdown>0){s.countdown=Math.max(0,s.countdown-dt);return;}s.time+=dt;s.bump=Math.max(0,s.bump-dt);
 s.lane=clamp(s.lane+(Number(input.right)-Number(input.left))*65*dt,-34,34);
 s.speed=clamp(s.speed+(input.go?100:-26)*dt-(input.brake?210*dt:0),0,128);
 const boosting=input.boost&&s.boost>0&&s.speed>20;const travel=s.speed+(boosting?62:0);s.boost=clamp(s.boost+(boosting?-38:13)*dt,0,100);s.progress+=travel*dt/1090;
 for(const rival of s.rivals)rival.progress=Math.min(3,rival.progress+rival.speed*dt/1090);
 const lap=Math.floor(s.progress),position=s.progress%1;
 const near=(a,b)=>Math.min(Math.abs(a-b),1-Math.abs(a-b))<.014;
 if(!s.bump){
  const mud=rallyHazards.some(h=>near(position,h.at)&&Math.abs(s.lane-h.lane)<16);
  const collision=s.rivals.some(r=>Math.abs(r.progress-s.progress)<.014&&Math.abs(r.lane-s.lane)<15);
  if(mud||collision){s.speed*=.55;s.bump=.7;}
 }
 for(let i=0;i<4;i++){const at=.08+i*.25,key=`${lap}-${i}`;if(near(position,at)&&Math.abs(s.lane)<17&&!s.picked.has(key)){s.picked.add(key);s.boost=Math.min(100,s.boost+22);s.seeds++;}}
 if(s.progress>=3){s.progress=3;s.over=true;s.rank=1+s.rivals.filter(r=>r.progress>=3).length;}
}
export const clashPlatforms=[{x:95,y:330,w:410},{x:125,y:230,w:120},{x:355,y:230,w:120},{x:255,y:145,w:90}];
function fighter(x,facing){return {x,y:150,vx:0,vy:0,facing,damage:0,lives:3,shield:100,protect:1.5,stun:0,cooldown:0,attack:0,grounded:false,jumps:2,guard:false};}
export function newClash(){return {fighters:[fighter(210,1),fighter(390,-1)],time:0,aiJump:0,over:false,winner:null,hits:0};}
function controls(f,input,dt){
 f.guard=!!input.guard&&f.shield>5&&f.stun===0;f.shield=clamp(f.shield+(f.guard?-45:24)*dt,0,100);
 if(f.stun===0){const direction=Number(input.right)-Number(input.left);if(direction){f.facing=direction;f.vx=clamp(f.vx+direction*950*dt,-210,210);}else f.vx*=Math.pow(.01,dt);
  if(input.jump&&f.jumps>0&&!f.guard){f.vy=f.jumps===2?-385:-335;f.jumps--;f.grounded=false;}
  if(input.attack&&f.cooldown===0&&!f.guard){f.attack=.17;f.cooldown=.48;return true;}
 }return false;
}
function moveFighter(f,dt){
 const bottom=f.y+18;f.vy=Math.min(620,f.vy+790*dt);f.x+=f.vx*dt;f.y+=f.vy*dt;f.grounded=false;
 for(const platform of clashPlatforms)if(f.vy>=0&&bottom<=platform.y+.5&&f.y+18>=platform.y&&f.x+13>platform.x&&f.x-13<platform.x+platform.w){f.y=platform.y-18;f.vy=0;f.grounded=true;f.jumps=2;}
}
export function stepClash(s,input,dt){
 if(s.over)return;s.time+=dt;s.aiJump=Math.max(0,s.aiJump-dt);const [player,cpu]=s.fighters;
 for(const f of s.fighters){f.protect=Math.max(0,f.protect-dt);f.stun=Math.max(0,f.stun-dt);f.cooldown=Math.max(0,f.cooldown-dt);f.attack=Math.max(0,f.attack-dt);}
 const dx=player.x-cpu.x;const ai={left:dx<-32,right:dx>32,attack:Math.abs(dx)<62&&Math.abs(player.y-cpu.y)<45,guard:Math.abs(dx)<65&&player.attack>0&&Math.sin(s.time*2)>.2,jump:false};
 if((player.y<cpu.y-45||cpu.y>330)&&cpu.jumps>0&&s.aiJump===0){ai.jump=true;s.aiJump=.7;}
 if(cpu.x<105&&dx<0){ai.left=false;ai.right=true;}if(cpu.x>495&&dx>0){ai.right=false;ai.left=true;}
 const attacks=[controls(player,input,dt),controls(cpu,ai,dt)];
 for(let i=0;i<2;i++)if(attacks[i]){const a=s.fighters[i],b=s.fighters[1-i];if(b.protect===0&&Math.abs(a.x-b.x)<65&&Math.abs(a.y-b.y)<45&&(b.x-a.x)*a.facing>=-8){
  if(b.guard&&b.shield>=20){b.shield-=20;b.vx=a.facing*60;}else{b.damage+=14;b.vx=a.facing*(190+b.damage*5);b.vy=-(190+b.damage*2);b.stun=.4;b.protect=.28;s.hits++;}
 }}
 for(let i=0;i<2;i++){const f=s.fighters[i];moveFighter(f,dt);if(f.x<-65||f.x>665||f.y>490||f.y<-120){f.lives--;if(!f.lives){s.over=true;s.winner=i===0?'Computer':'You';}else{const lives=f.lives;s.fighters[i]=fighter(i===0?210:390,i===0?1:-1);s.fighters[i].lives=lives;}}}
 if(s.fighters.every(f=>f.lives===0)){s.over=true;s.winner='Tie';}
}
