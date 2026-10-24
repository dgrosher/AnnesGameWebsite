export const WIDTH=600, HEIGHT=420;
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function newInvaders(){const state={ship:300,aliens:[],shots:[],enemyShots:[],direction:1,score:0,lives:3,wave:0,cooldown:0,enemyCooldown:1,invulnerable:0,over:false};nextWave(state);return state;}
function nextWave(s){s.wave++;s.aliens=[];for(let row=0;row<4;row++)for(let col=0;col<8;col++)s.aliens.push({x:65+col*55,y:45+row*37,w:28,h:22,row});s.shots=[];s.enemyShots=[];s.direction=1;s.enemyCooldown=1.2;}
export function stepInvaders(s,input,dt,random=Math.random){
 if(s.over)return;
 s.ship=clamp(s.ship+(Number(input.right)-Number(input.left))*300*dt,20,580);
 s.cooldown=Math.max(0,s.cooldown-dt);s.invulnerable=Math.max(0,s.invulnerable-dt);
 if(input.fire&&s.cooldown===0){s.shots.push({x:s.ship-2,y:374,w:4,h:12});s.cooldown=.24;}
 const speed=22+s.wave*7+(32-s.aliens.length)*1.1;
 if(s.aliens.some(a=>a.x+s.direction*speed*dt<10||a.x+a.w+s.direction*speed*dt>590)){s.direction*=-1;s.aliens.forEach(a=>a.y+=15);}
 s.aliens.forEach(a=>a.x+=s.direction*speed*dt);
 s.shots.forEach(b=>b.y-=440*dt);s.enemyShots.forEach(b=>b.y+=(155+s.wave*12)*dt);
 s.enemyCooldown-=dt;
 if(s.enemyCooldown<=0&&s.aliens.length){const alien=s.aliens[Math.floor(random()*s.aliens.length)];s.enemyShots.push({x:alien.x+12,y:alien.y+22,w:5,h:12});s.enemyCooldown=Math.max(.3,1.1-s.wave*.07);}
 for(const shot of s.shots){const index=s.aliens.findIndex(a=>overlaps(shot,a));if(index!==-1){s.score+=(4-s.aliens[index].row)*10;s.aliens.splice(index,1);shot.hit=true;}}
 s.shots=s.shots.filter(b=>b.y+b.h>0&&!b.hit);
 for(const shot of s.enemyShots){if(s.invulnerable===0&&overlaps(shot,{x:s.ship-18,y:374,w:36,h:22})){s.lives--;s.invulnerable=1.5;shot.hit=true;if(s.lives<=0)s.over=true;}}
 s.enemyShots=s.enemyShots.filter(b=>b.y<HEIGHT&&!b.hit);
 if(s.aliens.some(a=>a.y+a.h>=374))s.over=true;
 if(!s.over&&!s.aliens.length)nextWave(s);
}
export function newPong(){return {player:210,cpu:210,ball:{x:300,y:210,vx:245,vy:105},playerScore:0,cpuScore:0,serve:1,over:false,winner:null};}
export function stepPong(s,input,dt){
 if(s.over)return;
 s.player=clamp(input.target??s.player+(Number(input.down)-Number(input.up))*330*dt,42,378);
 s.cpu=clamp(s.cpu+clamp(s.ball.y-s.cpu,-205*dt,205*dt),42,378);
 if(s.serve>0){s.serve=Math.max(0,s.serve-dt);return;}
 const b=s.ball;const previous=b.x;b.x+=b.vx*dt;b.y+=b.vy*dt;
 if(b.y<7){b.y=14-b.y;b.vy=Math.abs(b.vy);}if(b.y>413){b.y=826-b.y;b.vy=-Math.abs(b.vy);}
 function bounce(y,right){const angle=clamp((b.y-y)/49,-1,1)*1.05;const speed=Math.min(460,Math.hypot(b.vx,b.vy)+18);b.vx=(right?1:-1)*speed*Math.cos(angle);b.vy=speed*Math.sin(angle);b.x=right?37:563;}
 if(b.vx<0&&previous>=37&&b.x<=37&&Math.abs(b.y-s.player)<49)bounce(s.player,true);
 if(b.vx>0&&previous<=563&&b.x>=563&&Math.abs(b.y-s.cpu)<49)bounce(s.cpu,false);
 if(b.x<-10||b.x>610){const playerWon=b.x>610;if(playerWon)s.playerScore++;else s.cpuScore++;
  if(s.playerScore===7||s.cpuScore===7){s.over=true;s.winner=playerWon?'You':'Computer';return;}
  s.ball={x:300,y:210,vx:playerWon?-245:245,vy:(s.playerScore+s.cpuScore)%2?110:-110};s.serve=1;
 }
}
