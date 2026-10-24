import test from 'node:test';import assert from 'node:assert/strict';
import {newRunner,stepRunner,runnerBox,RUNNER_GROUND} from '../src/runner-logic.js';
const idle={jump:false,duck:false};
test('runner jumps and returns to the ground without an extra midair jump',()=>{
 const s=newRunner();s.spawn=100;stepRunner(s,{jump:true},1/60);assert.ok(s.y<RUNNER_GROUND);assert.ok(s.vy<0);const velocity=s.vy;stepRunner(s,{jump:true},1/60);assert.ok(s.vy>velocity);
 for(let i=0;i<70;i++)stepRunner(s,idle,1/60);assert.equal(s.y,RUNNER_GROUND);assert.equal(s.vy,0);
});
test('cactus collision ends the run, while a well-timed jump clears it',()=>{
 const s=newRunner();s.spawn=100;s.obstacles=[{type:'cactus',x:85,y:200,w:28,h:46}];stepRunner(s,idle,.001);assert.equal(s.over,true);
 const t=newRunner();t.spawn=100;stepRunner(t,{jump:true},1/60);for(let i=0;i<9;i++)stepRunner(t,idle,1/60);t.obstacles=[{type:'cactus',x:85,y:200,w:28,h:46}];stepRunner(t,idle,.001);assert.equal(t.over,false);
});
test('ducking avoids low birds; standing is safe beneath high birds',()=>{
 const bird={type:'bird',x:85,y:194,w:34,h:22};const s=newRunner();s.obstacles=[{...bird}];stepRunner(s,idle,.001);assert.equal(s.over,true);
 const t=newRunner();t.obstacles=[{...bird}];stepRunner(t,{duck:true},.001);assert.equal(t.over,false);assert.equal(t.duck,true);assert.ok(runnerBox(t).h<runnerBox(newRunner()).h);
 const u=newRunner();u.obstacles=[{...bird,y:150}];stepRunner(u,idle,.001);assert.equal(u.over,false);
});
test('score and speed increase, obstacles spawn with spaced intervals, and offscreen ones leave',()=>{
 const s=newRunner();s.spawn=0;stepRunner(s,idle,.01,()=>0);assert.equal(s.obstacles[0].type,'cactus');assert.ok(s.spawn>=1.05);
 s.distance=10000;s.obstacles=[];s.spawn=100;stepRunner(s,idle,.03);assert.ok(s.speed>250&&s.speed<=430);assert.ok(s.score>=1000);
 s.obstacles=[{type:'cactus',x:-100,y:210,w:20,h:36}];stepRunner(s,idle,.03);assert.equal(s.obstacles.length,0);
});
test('birds arrive after the introductory stretch and game-over state stays frozen',()=>{
 const s=newRunner();s.distance=1000;s.spawn=0;stepRunner(s,idle,.01,()=>0);assert.equal(s.obstacles[0].type,'bird');assert.equal(s.obstacles[0].y,194);
 s.over=true;const before=JSON.stringify(s);stepRunner(s,{jump:true,duck:true},1);assert.equal(JSON.stringify(s),before);
});
