import test from 'node:test';
import assert from 'node:assert/strict';
import {isSet,findSet,makeSetDeck,makeUnoDeck,canPlayUno,storyNodes} from '../src/more-logic.js';
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
test('story choices all exist and all four endings are reachable',()=>{
 const visited=new Set();function walk(id){if(visited.has(id))return;visited.add(id);assert.ok(storyNodes[id]);for(const [,next] of storyNodes[id].choices||[])walk(next);}walk('gate');
 assert.equal(visited.size,Object.keys(storyNodes).length);assert.equal([...visited].filter(id=>storyNodes[id].ending).length,4);
});
