import test from 'node:test';import assert from 'node:assert/strict';
import {newGardenFour,gardenFourMove,gardenFourWinner,chooseGardenFour} from '../src/strategy-logic.js';
import {codeLevels,compileProgram,newCodeRobot,stepCodeRobot} from '../src/coding-logic.js';
import {makeMemoryDeck} from '../src/memory-game.js';
test('garden seeds drop, wins work in every direction, and full columns reject moves',()=>{
 let s=newGardenFour();for(let i=0;i<6;i++)s=gardenFourMove(s,0);assert.equal(gardenFourMove(s,0),s);
 for(const [dr,dc]of [[0,1],[1,0],[1,1],[1,-1]]){const board=Array.from({length:6},()=>Array(7).fill(0));for(let i=0;i<4;i++)board[i*dr][3+i*dc]=1;assert.equal(gardenFourWinner(board).winner,1);}
});
test('medium and hard AI win and block immediate threats',()=>{
 for(const difficulty of ['medium','hard'])for(const who of [1,2]){let s=newGardenFour(difficulty);s.board[5]=[who,who,who,0,0,0,0];s.turn=2;assert.equal(chooseGardenFour(s),3);}
 const s=newGardenFour('easy');s.turn=2;assert.ok(chooseGardenFour(s,()=>.5)>=0);
});
test('hard strategy returns a legal move without mutating the board',()=>{
 let s=newGardenFour('hard');for(const col of [3,2,3,4,1,4])s=gardenFourMove(s,col);s.turn=2;const before=JSON.stringify(s);const col=chooseGardenFour(s);assert.ok(col>=0&&col<7&&!s.board[0][col]);assert.equal(JSON.stringify(s),before);
});
test('all eight coding missions are solvable within their block budgets',()=>{
 for(const level of codeLevels){const commands=compileProgram(level.solution,level.budget);let state=newCodeRobot(level);for(const command of commands)state=stepCodeRobot(level,state,command.op);assert.equal(state.error,null,level.name);assert.equal(state.solved,true,level.name);assert.equal(state.collected.length,level.seeds.length);}
});
test('coding compiler validates loops, budgets, nesting, and expansion safely',()=>{
 assert.throws(()=>compileProgram(['repeat2','forward']),/Close/);assert.throws(()=>compileProgram(['end']),/needs/);assert.throws(()=>compileProgram(['repeat2','end']),/inside/);assert.throws(()=>compileProgram(['forward','forward'],1),/allows/);assert.throws(()=>compileProgram(['eval']),/not supported/);assert.throws(()=>compileProgram(['repeat5','repeat5','repeat5','forward','forward','end','end','end']),/160/);assert.throws(()=>compileProgram(['repeat2','repeat2','repeat2','repeat2','forward','end','end','end','end']),/nested/);
 assert.deepEqual(compileProgram(['repeat2','forward','right','end']).map(c=>c.op),['forward','right','forward','right']);
});
test('robot turns in place, stops at hedges and cannot win without every seed',()=>{
 const level=codeLevels[0];let s=newCodeRobot(level);s=stepCodeRobot(level,s,'left');assert.equal(s.x,0);assert.equal(s.direction,3);s=stepCodeRobot(level,s,'forward');assert.match(s.error,/hedge/);
 const square=codeLevels[5];assert.equal(newCodeRobot(square).solved,false);
});
test('memory boards contain exactly two of each picture up to 100 cards',()=>{
 for(const size of [4,6,8,10]){const deck=makeMemoryDeck(size);assert.equal(deck.length,size*size);const counts=new Map();deck.forEach(s=>counts.set(s,(counts.get(s)||0)+1));assert.equal(counts.size,size*size/2);assert.ok([...counts.values()].every(n=>n===2));}assert.throws(()=>makeMemoryDeck(7));
});
