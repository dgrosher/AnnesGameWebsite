import test from 'node:test';import assert from 'node:assert/strict';
import {newBunny,stepBunny,nextBunnyStage} from '../src/bunny-logic.js';
const idle={left:false,right:false,jump:false};
function grounded(s){s.player.y=290;s.player.vy=0;s.player.grounded=true;}
test('bunny lands, jumps, and collides with overhead platforms',()=>{
 const s=newBunny();for(let i=0;i<30;i++)stepBunny(s,idle,1/60);assert.equal(s.player.y,290);assert.equal(s.player.grounded,true);stepBunny(s,{...idle,jump:true},1/60);assert.ok(s.player.vy<0);assert.ok(s.player.y<290);
 s.player.x=300;grounded(s);stepBunny(s,{...idle,jump:true},.03);for(let i=0;i<10;i++)stepBunny(s,idle,.03);assert.ok(s.player.y>=288);
});
test('carrots power Ruby up, increase jumping power, and absorb one bump',()=>{
 const s=newBunny();s.player.x=180;grounded(s);stepBunny(s,idle,.01);assert.equal(s.powered,true);assert.equal(s.carrotsFound,1);assert.equal(s.score,100);
 const plain=newBunny();grounded(plain);stepBunny(plain,{...idle,jump:true},.01);stepBunny(s,{...idle,jump:true},.01);assert.ok(s.player.vy<plain.player.vy);
 s.invulnerable=0;s.player.x=475;grounded(s);stepBunny(s,idle,.01);assert.equal(s.powered,false);assert.equal(s.lives,3);assert.ok(s.invulnerable>0);
 s.invulnerable=0;s.player.x=475;grounded(s);stepBunny(s,idle,.01);assert.equal(s.lives,2);
});
test('landing on a snail settles it and bounces Ruby upward',()=>{
 const s=newBunny();s.invulnerable=0;s.player.x=475;s.player.y=260;s.player.vy=200;stepBunny(s,idle,.03);assert.equal(s.enemies[0].settled,true);assert.ok(s.player.vy<0);assert.equal(s.score,50);assert.equal(s.lives,3);
});
test('checkpoint survives falls and final life ends the adventure',()=>{
 const s=newBunny();s.player.x=1150;grounded(s);stepBunny(s,idle,.01);assert.equal(s.checkpoint,1120);s.player.y=480;stepBunny(s,idle,.01);assert.equal(s.lives,2);assert.equal(s.player.x,1120);s.lives=1;s.player.y=480;stepBunny(s,idle,.01);assert.equal(s.over,true);const time=s.time;stepBunny(s,idle,1);assert.equal(s.time,time);
});
test('all three gardens have reachable gaps without needing a carrot',()=>{
 const s=newBunny();
 for(let stage=1;stage<=3;stage++){
  s.enemies=[];s.carrots=[];let frames=0;
  while(!s.cleared&&!s.over&&frames++<1800){const p=s.player;const ground=s.solids.find(t=>t.ground&&p.x+p.w>t.x&&p.x<t.x+t.w);const nearEdge=ground&&ground.x+ground.w-(p.x+p.w)<27;stepBunny(s,{...idle,right:true,jump:p.grounded&&nearEdge},1/60);}
  assert.equal(s.cleared,true,`garden ${stage} reachable`);assert.equal(s.lives,3,`garden ${stage} without falls`);if(stage<3)nextBunnyStage(s);
 }
 assert.equal(s.won,true);assert.equal(s.level,3);
});
test('stage completion waits for Next garden and the third cottage wins',()=>{
 const s=newBunny();for(let stage=1;stage<=3;stage++){s.player.x=2502;grounded(s);stepBunny(s,idle,.01);assert.equal(s.cleared,true);const time=s.time;stepBunny(s,{...idle,right:true},1);assert.equal(s.time,time);if(stage<3){assert.equal(s.won,false);nextBunnyStage(s);assert.equal(s.level,stage+1);assert.equal(s.checkpoint,50);}}
 assert.equal(s.won,true);nextBunnyStage(s);assert.equal(s.level,3);
});
test('a complete adventure with snails, carrots and ponds can reach the final picnic',()=>{
 const s=newBunny();for(let stage=1;stage<=3;stage++){
  let frames=0;while(!s.cleared&&!s.over&&frames++<1800){const p=s.player;const ground=s.solids.find(t=>t.ground&&p.x+p.w>t.x&&p.x<t.x+t.w);const edge=ground&&ground.x+ground.w-(p.x+p.w)<27;const snail=s.enemies.some(e=>!e.settled&&e.x>p.x&&e.x-p.x<95&&Math.abs(e.y-p.y)<50);stepBunny(s,{right:true,left:false,jump:p.grounded&&(edge||snail)},1/60);}
  assert.equal(s.cleared,true);assert.equal(s.over,false);if(stage<3)nextBunnyStage(s);
 }assert.equal(s.won,true);assert.ok(s.lives>0);assert.ok(s.carrotsFound>0);
});
