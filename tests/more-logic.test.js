import test from 'node:test';
import assert from 'node:assert/strict';
import {isSet,findSet,makeSetDeck,makeUnoDeck,canPlayUno,unoColorAfterPlay,storyNodes} from '../src/more-logic.js';
test('Set deck is unique and complete; every board trio obeys all four features',()=>{
 const deck=makeSetDeck();assert.equal(deck.length,81);assert.equal(new Set(deck.map(c=>JSON.stringify(c))).size,81);
 const valid=[{color:0,shape:1,count:0,fill:2},{color:1,shape:1,count:1,fill:2},{color:2,shape:1,count:2,fill:2}];
 assert.equal(isSet(valid),true);assert.equal(isSet([...valid.slice(0,2),{...valid[2],color:0}]),false);assert.deepEqual(findSet(valid),[0,1,2]);assert.equal(findSet(valid.slice(0,2)),null);
 assert.ok(findSet(deck));
});
test('UNO deck and color, value, wild and draw-four restrictions',()=>{
 const deck=makeUnoDeck();assert.equal(deck.length,108);assert.equal(deck.filter(c=>c.color==='wild').length,8);
 const top={color:'red',value:'7'};
 assert.equal(canPlayUno({color:'blue',value:'7'},top,'red'),true);
 assert.equal(canPlayUno({color:'red',value:'9'},top,'blue'),false);
 assert.equal(canPlayUno({color:'wild',value:'Wild'},top,'blue'),true);
 assert.equal(canPlayUno({color:'wild',value:'+4'},top,'red',[{color:'red',value:'2'}]),false);
 assert.equal(canPlayUno({color:'wild',value:'+4'},top,'red',[{color:'blue',value:'2'}]),true);
});
test('regular UNO cards keep their own color regardless of computer preference',()=>{
 for(const color of ['red','blue','green','yellow']) {
  for(const value of ['0','7','Skip','Reverse','+2']) {
   const top={color,value};
   const active=unoColorAfterPlay(top,color==='red'?'blue':'red');
   assert.equal(active,color);
   assert.equal(canPlayUno({color,value:'9'},top,active),true);
   for(const other of ['red','blue','green','yellow'].filter(c=>c!==color)) {
    assert.equal(canPlayUno({color:other,value:'9'},top,active),false);
    assert.equal(canPlayUno({color:other,value},top,active),true);
   }
  }
 }
});
test('wild color lasts until a regular card is played',()=>{
 for(const value of ['Wild','+4']) {
  const wild={color:'wild',value};
  let active=unoColorAfterPlay(wild,'blue');
  assert.equal(canPlayUno({color:'blue',value:'3'},wild,active),true);
  assert.equal(canPlayUno({color:'red',value:'3'},wild,active),false);
  const blue={color:'blue',value:'3'};active=unoColorAfterPlay(blue,'red');
  assert.equal(active,'blue');
  const red={color:'red',value:'3'};
  assert.equal(canPlayUno(red,blue,active),true);
  active=unoColorAfterPlay(red);
  assert.equal(canPlayUno({color:'red',value:'8'},red,active),true);
  assert.equal(canPlayUno({color:'blue',value:'8'},red,active),false);
  assert.throws(()=>unoColorAfterPlay(wild),/valid color/);
 }
});
test('story choices all exist and all four endings are reachable',()=>{
 const visited=new Set();function walk(id){if(visited.has(id))return;visited.add(id);assert.ok(storyNodes[id]);for(const [,next] of storyNodes[id].choices||[])walk(next);}walk('gate');
 assert.equal(visited.size,Object.keys(storyNodes).length);assert.equal([...visited].filter(id=>storyNodes[id].ending).length,4);
});
