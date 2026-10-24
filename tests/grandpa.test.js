import test from 'node:test';import assert from 'node:assert/strict';
import {newCloudwing,stepCloudwing,newGarden,stepGarden} from '../src/grandpa-logic.js';
const idle={left:false,right:false,up:false,down:false,action:false};
test('moonwing flaps, wraps at sky edges, and lands on cloud platforms',()=>{
 const s=newCloudwing();s.player.vy=80;stepCloudwing(s,{...idle,action:true},.03);assert.ok(s.player.vy<0);
 s.player.x=599;s.player.vx=175;stepCloudwing(s,{...idle,right:true},.03);assert.ok(s.player.x<10);
 s.player={x:100,y:270,vx:0,vy:200};stepCloudwing(s,idle,.03);assert.equal(s.player.y,274);assert.equal(s.player.vy,0);
});
test('meeting sprites from above frees mail; collecting all mail advances the route',()=>{
 const s=newCloudwing();s.player={x:100,y:90,vx:0,vy:0};s.enemies=[{x:100,y:110,vx:0,phase:0}];s.target=2;
 stepCloudwing(s,idle,.001);assert.equal(s.enemies.length,0);assert.equal(s.score,100);assert.equal(s.delivered,1);
 s.letters=[{x:100,y:90}];stepCloudwing(s,idle,.001);assert.equal(s.wave,2);assert.equal(s.delivered,0);assert.equal(s.score,175);
});
test('lower collisions and storms cost a heart; protection prevents repeated damage',()=>{
 const s=newCloudwing();s.shield=0;s.player={x:100,y:120,vx:0,vy:0};s.enemies=[{x:100,y:110,vx:0,phase:0}];stepCloudwing(s,idle,.001);assert.equal(s.lives,2);assert.ok(s.shield>0);
 s.player={x:100,y:120,vx:0,vy:0};stepCloudwing(s,idle,.001);assert.equal(s.lives,2);
 s.lives=1;s.shield=0;s.player.y=410;stepCloudwing(s,idle,.001);assert.equal(s.over,true);
 const score=s.score;stepCloudwing(s,{...idle,action:true},1);assert.equal(s.score,score);
});
test('mole digs new tunnels and stays within garden boundaries',()=>{
 const s=newGarden();s.player={x:0,y:1,dx:0,dy:1};stepGarden(s,{...idle,left:true},.01);assert.equal(s.player.x,0);
 s.move=0;s.player={x:5,y:3,dx:0,dy:1};assert.equal(s.dug.has('6,3'),false);stepGarden(s,{...idle,right:true},.01);assert.ok(s.dug.has('6,3'));assert.equal(s.player.x,6);
});
test('three directional dew bursts turn a bug into a flower, with line-of-sight checks',()=>{
 const s=newGarden();s.player={x:10,y:4,dx:1,dy:0};s.bugs=[{x:12,y:4,puff:0,fade:0,move:10},{x:4,y:8,puff:0,fade:0,move:10}];
 for(let i=0;i<3;i++){s.water=0;stepGarden(s,{...idle,action:true},.01);}
 assert.equal(s.bugs.length,1);assert.equal(s.flowers.length,1);assert.equal(s.score,100);
 const t=newGarden();t.player={x:10,y:4,dx:1,dy:0};t.dug.delete('11,4');t.bugs=[{x:12,y:4,puff:0,fade:0,move:10}];stepGarden(t,{...idle,action:true},.01);assert.equal(t.bugs[0].puff,0);
 t.dug.add('11,4');t.bugs[0].x=14;t.water=0;stepGarden(t,{...idle,action:true},.01);assert.equal(t.bugs[0].puff,0);
});
test('garden collision costs hearts, and clearing bugs grows a new garden',()=>{
 const s=newGarden();s.shield=0;s.player={x:10,y:4,dx:1,dy:0};s.bugs=[{x:10,y:4,puff:0,fade:0,move:10}];stepGarden(s,idle,.01);assert.equal(s.lives,2);assert.equal(s.player.y,1);
 s.bugs[0].puff=3;stepGarden(s,idle,.01);assert.equal(s.wave,2);assert.equal(s.score,100);assert.equal(s.bugs.length,5);
 s.lives=1;s.shield=0;s.bugs=[{x:10,y:1,puff:0,fade:0,move:10}];stepGarden(s,idle,.01);assert.equal(s.over,true);
});
