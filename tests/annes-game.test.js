import test from 'node:test';
import assert from 'node:assert/strict';
import {DRAW_TWO,makeAnneDeck,newAnneGame,canPlayAnne,anneMove} from '../src/annes-game.js';
const state=(overrides={})=>({deck:[1,2,3,4],hands:[[2,5,DRAW_TWO],[3,4]],discard:[2],required:2,turn:0,winner:null,message:'',...overrides});
test('Anne deck has four of each number, six wilds, and deals five each',()=>{
 const deck=makeAnneDeck();assert.equal(deck.length,30);for(let n=1;n<=6;n++)assert.equal(deck.filter(c=>c===n).length,4);assert.equal(deck.filter(c=>c===DRAW_TWO).length,6);
 const s=newAnneGame();assert.deepEqual(s.hands.map(h=>h.length),[5,5]);assert.equal(s.deck.length,20);assert.equal(s.required,null);assert.equal(s.discard.length,0);
});
test('matching, free leads and wilds; rejects wrong numbers and invalid actions',()=>{
 for(let n=1;n<=6;n++){assert.ok(canPlayAnne(n,null));assert.ok(canPlayAnne(n,n));assert.ok(canPlayAnne(DRAW_TWO,n));assert.equal(canPlayAnne(n,n===6?1:n+1),false);}
 const s=state();assert.equal(anneMove(s,{type:'play',index:1}),s);assert.equal(anneMove(s,{type:'play',index:-1}),s);assert.equal(anneMove(s,{type:'draw'}),s);
 const next=anneMove(s,{type:'play',index:0});assert.equal(next.required,2);assert.equal(next.turn,1);assert.deepEqual(s.hands[0],[2,5,DRAW_TWO]);
});
test('unable to match draws once, ends turn and frees next player',()=>{
 const s=state({hands:[[5],[3,4]]});const next=anneMove(s,{type:'draw'});assert.deepEqual(next.hands[0],[5,4]);assert.equal(next.turn,1);assert.equal(next.required,null);
 assert.equal(anneMove(next,{type:'play',index:0}).required,3);
});
test('Draw 2 is wild and skips opponent with no stacking',()=>{
 const next=anneMove(state(),{type:'play',index:2});assert.equal(next.hands[1].length,4);assert.equal(next.turn,0);assert.equal(next.required,null);assert.equal(next.discard.at(-1),DRAW_TWO);
 assert.equal(anneMove(next,{type:'play',index:1}).required,5);
});
test('last number or wild wins immediately and game stops accepting moves',()=>{
 for(const card of [2,DRAW_TWO]){const next=anneMove(state({hands:[[card],[3,4]]}),{type:'play',index:0});assert.equal(next.winner,0);assert.equal(next.hands[0].length,0);assert.equal(anneMove(next,{type:'draw'}),next);}
});
test('recycles used cards while keeping top card; handles exhausted pile',()=>{
 const next=anneMove(state({deck:[],hands:[[5],[4]],discard:[1,3,2]}),{type:'draw'});assert.equal(next.hands[0].length,2);assert.deepEqual(next.discard,[2]);assert.equal(next.deck.length,1);
 const empty=anneMove(state({deck:[],hands:[[5],[4]],discard:[2]}),{type:'draw'});assert.equal(empty.turn,1);assert.equal(empty.required,null);
});
test('complete computer-style rounds conserve the 30-card deck and produce winners',()=>{
 for(let round=0;round<30;round++){
  let s=newAnneGame();let moves=0;
  while(s.winner===null&&moves++<10000){const index=s.hands[s.turn].findIndex(c=>canPlayAnne(c,s.required));s=anneMove(s,index<0?{type:'draw'}:{type:'play',index});assert.equal(s.deck.length+s.discard.length+s.hands[0].length+s.hands[1].length,30);}
  assert.notEqual(s.winner,null);assert.equal(s.hands[s.winner].length,0);
 }
});
