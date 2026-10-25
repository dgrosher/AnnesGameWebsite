import test from 'node:test';
import assert from 'node:assert/strict';
import {shuffledPairs, snakeStep} from '../src/logic.js';
test('memory deck contains exactly eight pairs after shuffle', () => {
  const deck = shuffledPairs();assert.equal(deck.length,16);
  const counts = new Map();deck.forEach(c=>counts.set(c,(counts.get(c)||0)+1));
  assert.equal(counts.size,8);assert.ok([...counts.values()].every(n=>n===2));
});
test('snake grows on food and otherwise maintains length', () => {
  const snake = [{x:2,y:1},{x:1,y:1},{x:0,y:1}];
  const grown = snakeStep(snake,{x:1,y:0},{x:3,y:1});assert.equal(grown.ate,true);assert.equal(grown.snake.length,4);assert.equal(grown.dead,false);
  const moved = snakeStep(snake,{x:1,y:0},{x:10,y:10});assert.equal(moved.snake.length,3);assert.deepEqual(moved.snake[0],{x:3,y:1});
});
test('snake detects walls and its body, but can move into its departing tail', () => {
  assert.equal(snakeStep([{x:0,y:0}],{x:-1,y:0},{x:5,y:5}).dead,true);
  const snake = [{x:1,y:1},{x:1,y:2},{x:2,y:2},{x:2,y:1}];
  assert.equal(snakeStep(snake,{x:0,y:1},{x:5,y:5}).dead,true);
  assert.equal(snakeStep(snake,{x:1,y:0},{x:5,y:5}).dead,false);
});
