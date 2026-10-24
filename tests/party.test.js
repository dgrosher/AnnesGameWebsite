import test from 'node:test';import assert from 'node:assert/strict';
import {newRally,stepRally,rallyPoint,rallyHazards,newClash,stepClash} from '../src/party-logic.js';
const idle={left:false,right:false,go:false,brake:false,boost:false,jump:false,attack:false,guard:false};
test('rally countdown waits, steering stays on track, boost drains and recharges',()=>{
 const s=newRally();stepRally(s,{...idle,go:true},1);assert.equal(s.progress,0);assert.equal(s.countdown,2);s.countdown=0;s.speed=100;s.rivals=[];
 stepRally(s,{...idle,go:true,boost:true},.03);assert.ok(s.boost<100);assert.ok(s.progress>0);const boost=s.boost;stepRally(s,{...idle,go:true},.03);assert.ok(s.boost>boost);
 for(let i=0;i<100;i++)stepRally(s,{...idle,right:true},.03);assert.equal(s.lane,34);assert.ok(Number.isFinite(rallyPoint(s.progress,s.lane).x));
});
test('mud slows karts and seeds recharge boost only once per lap',()=>{
 const s=newRally();s.countdown=0;s.rivals=[];s.progress=rallyHazards[0].at;s.lane=rallyHazards[0].lane;s.speed=120;stepRally(s,{...idle,go:true},.001);assert.ok(s.speed<70);
 s.progress=.08;s.lane=0;s.speed=0;s.boost=10;stepRally(s,idle,.001);assert.equal(s.seeds,1);assert.ok(s.boost>=32);stepRally(s,idle,.001);assert.equal(s.seeds,1);
});
test('a three-lap race finishes, assigns a place, and stops advancing',()=>{
 const s=newRally();for(let i=0;i<4000&&!s.over;i++)stepRally(s,{...idle,go:true,boost:true},1/60);assert.equal(s.over,true);assert.equal(s.progress,3);assert.ok(s.rank>=1&&s.rank<=4);const time=s.time;stepRally(s,{...idle,go:true},1);assert.equal(s.time,time);
 const last=newRally();last.countdown=0;last.progress=2.999;last.speed=128;last.rivals.forEach(r=>r.progress=3);stepRally(last,{...idle,go:true},.03);assert.equal(last.rank,4);
});
test('fighters double-jump but cannot jump a third time before landing',()=>{
 const s=newClash();stepClash(s,{...idle,jump:true},.016);assert.equal(s.fighters[0].jumps,1);assert.ok(s.fighters[0].vy<0);stepClash(s,idle,.016);stepClash(s,{...idle,jump:true},.016);assert.equal(s.fighters[0].jumps,0);const before=s.fighters[0].vy;stepClash(s,{...idle,jump:true},.016);assert.ok(s.fighters[0].vy>before);
});
test('gusts add damage and knockback; cooldown and spawn protection prevent repeated hits',()=>{
 const s=newClash();const [p,c]=s.fighters;p.x=260;p.y=300;c.x=300;c.y=300;c.protect=0;c.cooldown=1;stepClash(s,{...idle,attack:true},.016);assert.equal(c.damage,14);assert.ok(c.vx>0);assert.ok(c.vy<0);const hits=s.hits;stepClash(s,{...idle,attack:true},.016);assert.equal(s.hits,hits);
 const t=newClash();t.fighters[0].x=260;t.fighters[1].x=300;stepClash(t,{...idle,attack:true},.016);assert.equal(t.fighters[1].damage,0);
});
test('guard blocks a gust and uses shield energy',()=>{
 const s=newClash();const [p,c]=s.fighters;p.x=300;p.y=300;p.protect=0;c.x=340;c.y=300;c.protect=0;stepClash(s,{...idle,guard:true},.016);assert.equal(p.damage,0);assert.ok(p.shield<80);
});
test('ring-outs cost lives and respawn; final ring-out ends the match',()=>{
 const s=newClash();s.fighters[0].y=500;stepClash(s,idle,.016);assert.equal(s.fighters[0].lives,2);assert.equal(s.fighters[0].damage,0);assert.ok(s.fighters[0].protect>0);
 s.fighters[1].lives=1;s.fighters[1].x=700;stepClash(s,idle,.016);assert.equal(s.over,true);assert.equal(s.winner,'You');const time=s.time;stepClash(s,idle,1);assert.equal(s.time,time);
});
