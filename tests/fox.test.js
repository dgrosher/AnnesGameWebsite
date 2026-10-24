import test from 'node:test';import assert from 'node:assert/strict';
import {foxSuspects,newFoxGame,foxEliminated,foxMove,FOX_LIMIT} from '../src/fox-logic.js';
test('fox mystery has twelve unique suspects and supports one to four detectives',()=>{
 assert.equal(foxSuspects.length,12);assert.equal(new Set(foxSuspects.map(f=>`${f.hat}/${f.scarf}/${f.glasses}`)).size,12);
 for(let n=1;n<=4;n++)assert.equal(newFoxGame(n).players,n);
});
test('matching dice stay locked across rerolls and failure advances the fox once',()=>{
 let s=newFoxGame(2,()=>0);let values=[0,1,1];s=foxMove(s,{type:'roll'},()=>values.shift());assert.deepEqual(s.dice,['clue','search','search']);assert.equal(s.phase,'rolling');
 const previous=s;values=[0,1];s=foxMove(s,{type:'roll'},()=>values.shift());assert.deepEqual(s.dice,['clue','clue','search']);assert.deepEqual(previous.dice,['clue','search','search']);
 s=foxMove(s,{type:'roll'},()=>1);assert.equal(s.fox,1);assert.equal(s.phase,'resolved');assert.equal(foxMove(s,{type:'roll'}),s);
 const next=foxMove(s,{type:'next'});assert.equal(next.turn,2);assert.equal(next.rolls,0);assert.deepEqual(next.dice,[null,null,null]);
});
test('clues never contradict culprit and three clues uniquely identify every suspect',()=>{
 for(let id=0;id<12;id++){
  let s=newFoxGame(4,()=>(id+.1)/12);
  for(let i=0;i<3;i++){s=foxMove(s,{type:'roll'},()=>0);assert.equal(s.clues.length,i+1);assert.equal(foxEliminated(s,id),false);if(i<2)s=foxMove(s,{type:'next'});}
  assert.deepEqual(foxSuspects.filter(f=>!foxEliminated(s,f.id)).map(f=>f.id),[id]);
  s=foxMove(s,{type:'next'});assert.equal(s.goal,'search');assert.equal(foxMove(s,{type:'goal',goal:'clue'}),s);
 }
});
test('search reveals exactly two distinct cards and a correct accusation wins',()=>{
 let s=newFoxGame(2,()=>0);s=foxMove(s,{type:'goal',goal:'search'});s=foxMove(s,{type:'roll'},()=>1);assert.equal(s.phase,'reveal');
 assert.equal(foxMove(s,{type:'reveal',id:12}),s);s=foxMove(s,{type:'reveal',id:0});assert.equal(s.picks,1);assert.equal(foxMove(s,{type:'reveal',id:0}),s);
 s=foxMove(s,{type:'reveal',id:1});assert.equal(s.phase,'resolved');assert.equal(s.revealed.length,2);assert.equal(foxMove(s,{type:'reveal',id:2}),s);
 const won=foxMove(s,{type:'accuse',id:0});assert.equal(won.outcome,'won');assert.equal(foxMove(won,{type:'next'}),won);
 assert.equal(foxMove(s,{type:'accuse',id:1}).outcome,'wrong');assert.equal(foxMove(s,{type:'accuse',id:2}),s);
});
test('eight failed turns make the fox escape',()=>{
 let s=newFoxGame(2,()=>0);
 for(let turn=0;turn<FOX_LIMIT;turn++){for(let roll=0;roll<3;roll++)s=foxMove(s,{type:'roll'},()=>1);if(turn<FOX_LIMIT-1)s=foxMove(s,{type:'next'});}
 assert.equal(s.fox,FOX_LIMIT);assert.equal(s.outcome,'escaped');
});
