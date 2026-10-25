import test from 'node:test';import assert from 'node:assert/strict';
import {alphabetAnimals,makeFishDeck,newGoFish,fishMove,computerFishChoice} from '../src/gofish-logic.js';
import {animalPicture} from '../src/animal-art.js';
const fixture=(changes={})=>({deck:['C','D'],hands:[['A','B'],['A','E']],pairs:[[],[]],turn:0,phase:'ask',requested:null,lastAsked:[null,null],winner:null,lesson:'A',message:'',...changes});
test('animal alphabet has 26 distinct illustrated matches and two cards per letter',()=>{
 const deck=makeFishDeck();assert.equal(alphabetAnimals.length,26);assert.equal(deck.length,52);assert.equal(new Set(alphabetAnimals.map(a=>a.letter)).size,26);
 const illustrations=new Set();for(const animal of alphabetAnimals){assert.equal(animal.name[0],animal.letter);assert.equal(deck.filter(c=>c===animal.letter).length,2);illustrations.add(animalPicture(animal.letter));}assert.equal(illustrations.size,26);
});
test('successful request collects a pair and preserves the turn without mutating prior state',()=>{
 const s=fixture();const next=fishMove(s,{type:'ask',letter:'A'});assert.deepEqual(next.pairs[0],['A']);assert.deepEqual(next.hands[0],['B']);assert.deepEqual(next.hands[1],['E']);assert.equal(next.turn,0);assert.equal(next.phase,'ask');assert.deepEqual(s.hands[0],['A','B']);assert.equal(fishMove(s,{type:'ask',letter:'Z'}),s);
});
test('go fish is required after a miss; a matching catch earns another turn',()=>{
 let s=fixture({deck:['A','C'],hands:[['A','B'],['E']]});assert.equal(fishMove(s,{type:'fish'}),s);s=fishMove(s,{type:'ask',letter:'A'});assert.equal(s.phase,'fish');assert.equal(fishMove(s,{type:'ask',letter:'B'}),s);s=fishMove(s,{type:'fish'});assert.equal(s.turn,0);assert.deepEqual(s.pairs[0],['A']);
 s=fixture({deck:['C'],hands:[['A','B'],['E']]});s=fishMove(fishMove(s,{type:'ask',letter:'A'}),{type:'fish'});assert.equal(s.turn,1);assert.equal(s.lesson,'C');assert.ok(s.hands[0].includes('C'));
});
test('empty hands refill, drawn incidental pairs collect, and an empty pond passes the turn',()=>{
 let s=fixture({deck:['B','C','D','E','F','G'],hands:[['A'],['A','H']]});s=fishMove(s,{type:'ask',letter:'A'});assert.equal(s.hands[0].length,5);assert.equal(s.deck.length,1);
 s=fixture({deck:['B'],hands:[['A','B'],['E']]});s=fishMove(fishMove(s,{type:'ask',letter:'A'}),{type:'fish'});assert.deepEqual(s.pairs[0],['B']);assert.equal(s.turn,1);
 s=fixture({deck:[],hands:[['A'],['B']]});s=fishMove(fishMove(s,{type:'ask',letter:'A'}),{type:'fish'});assert.equal(s.turn,1);
});
test('all pairs collected ends the game and compares the pair totals',()=>{
 const others=alphabetAnimals.map(a=>a.letter).filter(l=>l!=='A');const s=fixture({deck:[],hands:[['A'],['A']],pairs:[others.slice(0,13),others.slice(13)]});const next=fishMove(s,{type:'ask',letter:'A'});assert.equal(next.phase,'over');assert.equal(next.winner,0);assert.equal(fishMove(next,{type:'fish'}),next);
});
test('complete games conserve all 52 cards and finish with all 26 different pairs',()=>{
 for(let game=0;game<50;game++){
  let s=newGoFish();let moves=0;
  while(s.phase!=='over'&&moves++<3000){const letter=s.turn===1?computerFishChoice(s):s.hands[0][Math.floor(Math.random()*s.hands[0].length)];s=fishMove(s,s.phase==='fish'?{type:'fish'}:{type:'ask',letter});
   assert.equal(s.deck.length+s.hands[0].length+s.hands[1].length+2*(s.pairs[0].length+s.pairs[1].length),52);
  }
  assert.equal(s.phase,'over');assert.equal(new Set(s.pairs.flat()).size,26);assert.equal(s.hands.flat().length,0);assert.equal(s.deck.length,0);
 }
});
