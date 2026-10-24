import test from 'node:test';import assert from 'node:assert/strict';
import {newJigsaw,pieceEdges,piecePath,placeJigsaw,PUZZLE_COLS,PUZZLE_ROWS} from '../src/jigsaw-logic.js';
test('jigsaw has exactly 50 unique shuffled pieces',()=>{const s=newJigsaw(()=>.25);assert.equal(PUZZLE_COLS*PUZZLE_ROWS,50);assert.equal(s.order.length,50);assert.equal(new Set(s.order).size,50);assert.notDeepEqual(s.order,Array.from({length:50},(_,i)=>i));});
test('all shared tabs match the neighboring sockets and exterior borders are flat',()=>{
 for(let id=0;id<50;id++){const edges=pieceEdges(id),col=id%10,row=Math.floor(id/10);if(col<9)assert.equal(edges.right,-pieceEdges(id+1).left);else assert.equal(edges.right,0);if(row<4)assert.equal(edges.bottom,-pieceEdges(id+10).top);else assert.equal(edges.bottom,0);if(row===0)assert.equal(edges.top,0);if(col===0)assert.equal(edges.left,0);assert.match(piecePath(id),/^M0 0.*Z$/);}
});
test('wrong spots preserve selection and all 50 correct placements complete the garden',()=>{
 let s=newJigsaw();assert.equal(placeJigsaw(s,0),s);s={...s,selected:5};assert.equal(placeJigsaw(s,6),s);assert.equal(s.selected,5);
 for(let id=0;id<50;id++){s={...s,selected:id};const prior=s;s=placeJigsaw(s,id);assert.equal(prior.placed.length,id);assert.equal(s.selected,null);assert.equal(s.placed.length,id+1);assert.equal(placeJigsaw({...s,selected:id},id).placed.length,id+1);}
 assert.equal(new Set(s.placed).size,50);
});
