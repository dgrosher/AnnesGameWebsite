import test from 'node:test';
import assert from 'node:assert/strict';
import {newInvaders,stepInvaders,newPong,stepPong} from '../src/arcade-logic.js';
const quiet={left:false,right:false,fire:false,up:false,down:false};
test('invaders ship respects bounds and shooting has a cooldown',()=>{
 const s=newInvaders();for(let i=0;i<100;i++)stepInvaders(s,{...quiet,left:true,fire:true},.01,()=>0);
 assert.equal(s.ship,20);assert.ok(s.shots.length>0);assert.ok(s.shots.length<6);
 for(let i=0;i<200;i++)stepInvaders(s,{...quiet,right:true},.01,()=>0);assert.equal(s.ship,580);
});
test('shots destroy aliens and award points; clearing the fleet starts a new wave',()=>{
 const s=newInvaders();s.aliens=[{x:100,y:100,w:28,h:22,row:0}];s.shots=[{x:110,y:106,w:4,h:12}];stepInvaders(s,quiet,.001,()=>0);
 assert.equal(s.score,40);assert.equal(s.wave,2);assert.equal(s.aliens.length,32);assert.equal(s.enemyShots.length,0);
});
test('enemy fire removes lives with temporary protection; invasion and zero lives end game',()=>{
 const s=newInvaders();s.enemyShots=[{x:300,y:380,w:5,h:12},{x:300,y:380,w:5,h:12}];stepInvaders(s,quiet,.001,()=>0);assert.equal(s.lives,2);
 s.invulnerable=0;s.lives=1;s.enemyShots=[{x:300,y:380,w:5,h:12}];stepInvaders(s,quiet,.001,()=>0);assert.equal(s.over,true);
 const t=newInvaders();t.aliens[0].y=360;stepInvaders(t,quiet,.001);assert.equal(t.over,true);
});
test('pong paddle and wall collisions bounce in the correct direction',()=>{
 const s=newPong();s.serve=0;s.ball={x:40,y:210,vx:-245,vy:0};stepPong(s,quiet,.03);assert.ok(s.ball.vx>0);
 s.ball={x:560,y:s.cpu,vx:245,vy:0};stepPong(s,quiet,.03);assert.ok(s.ball.vx<0);
 s.ball={x:300,y:8,vx:245,vy:-110};stepPong(s,quiet,.03);assert.ok(s.ball.vy>0);
 stepPong(s,{target:-100},.01);assert.equal(s.player,42);stepPong(s,{target:1000},.01);assert.equal(s.player,378);
});
test('pong awards points, resets for serve and ends at seven',()=>{
 const s=newPong();s.serve=0;s.ball={x:609,y:25,vx:245,vy:0};stepPong(s,quiet,.03);assert.equal(s.playerScore,1);assert.equal(s.ball.x,300);assert.equal(s.serve,1);
 s.playerScore=6;s.serve=0;s.ball={x:609,y:25,vx:245,vy:0};stepPong(s,quiet,.03);assert.equal(s.over,true);assert.equal(s.winner,'You');
 const before=s.playerScore;stepPong(s,quiet,1);assert.equal(s.playerScore,before);
 const c=newPong();c.cpuScore=6;c.serve=0;c.ball={x:-9,y:25,vx:-245,vy:0};stepPong(c,quiet,.03);assert.equal(c.winner,'Computer');
});
