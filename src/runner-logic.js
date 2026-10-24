export const RUNNER_GROUND=246;
export function newRunner(){return {y:RUNNER_GROUND,vy:0,duck:false,speed:250,distance:0,score:0,time:0,spawn:1.35,obstacles:[],over:false};}
export function runnerBox(s){return {x:83,y:s.y-(s.duck?22:46)+4,w:s.duck?40:30,h:s.duck?18:42};}
export function stepRunner(s,input,dt,random=Math.random){
 if(s.over)return;s.time+=dt;s.speed=Math.min(430,250+s.distance*.012);s.duck=!!input.duck&&s.y>=RUNNER_GROUND;
 if(input.jump&&s.y>=RUNNER_GROUND&&!s.duck)s.vy=-570;
 s.vy+=(input.duck&&s.y<RUNNER_GROUND?2400:1500)*dt;s.y+=s.vy*dt;if(s.y>=RUNNER_GROUND){s.y=RUNNER_GROUND;s.vy=0;}s.duck=!!input.duck&&s.y>=RUNNER_GROUND;
 s.distance+=s.speed*dt;s.score=Math.floor(s.distance/10);s.spawn-=dt;
 if(s.spawn<=0){
  const bird=s.score>=80&&random()<.35;const width=bird?34:22+Math.floor(random()*20),height=bird?22:34+Math.floor(random()*22);
  s.obstacles.push({type:bird?'bird':'cactus',x:620,y:bird?RUNNER_GROUND-(random()<.7?52:96):RUNNER_GROUND-height,w:width,h:height});
  s.spawn=1.05+random()*.65;
 }
 const p=runnerBox(s);
 for(const obstacle of s.obstacles){obstacle.x-=s.speed*dt;const margin=obstacle.type==='bird'?4:3;const b={x:obstacle.x+margin,y:obstacle.y+margin,w:obstacle.w-margin*2,h:obstacle.h-margin*2};if(p.x<b.x+b.w&&p.x+p.w>b.x&&p.y<b.y+b.h&&p.y+p.h>b.y)s.over=true;}
 s.obstacles=s.obstacles.filter(obstacle=>obstacle.x+obstacle.w>-5);
}
