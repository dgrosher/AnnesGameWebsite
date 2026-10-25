import test from 'node:test';import assert from 'node:assert/strict';
import {makeMathQuestion,checkMathAnswer,mathSkills,placeDigits,digitsValue,compareFractions} from '../src/math-logic.js';
test('each grade offers ten valid challenges with four unique numerical choices',()=>{
 for(let grade=1;grade<=4;grade++)for(const kind of ['garden','picnic'])for(let round=0;round<10;round++)for(let run=0;run<30;run++){
  const q=makeMathQuestion(kind,grade,round);assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.equal(q.options.filter(value=>checkMathAnswer(q,value)).length,1);assert.ok(q.options.every(n=>Number.isInteger(n)&&n>=0));
  if(kind==='garden'){const {a,b,subtract}=q.data;assert.equal(q.answer,subtract?a-b:a+b);assert.ok(q.answer<=[20,100,1000,10000][grade-1]);assert.ok(q.answer>=0);}
  else{const {groups,each,total,share}=q.data;assert.equal(total,groups*each);assert.equal(q.answer,share?total/groups:total);if(grade===1)assert.ok(total<=20);}
 }
});
test('place builders scale by grade and reject malformed digits',()=>{
 for(let grade=1;grade<=4;grade++)for(let run=0;run<50;run++){
  const q=makeMathQuestion('place',grade);assert.equal(String(q.answer).length,[2,3,4,6][grade-1]);assert.equal(digitsValue(q.data.digits),q.answer);assert.equal(checkMathAnswer(q,q.data.digits),true);assert.equal(checkMathAnswer(q,[-1,...q.data.digits.slice(1)]),false);assert.equal(checkMathAnswer(q,[...q.data.digits,0]),false);
 }
 assert.deepEqual(placeDigits(42,3),[0,4,2]);assert.equal(digitsValue([3,0,5]),305);
});
test('fraction shading validates equal-part counts and early grades use simple parts',()=>{
 for(let grade=1;grade<=4;grade++)for(let round=0;round<10;round++)for(let run=0;run<30;run++){
  const q=makeMathQuestion('fractions',grade,round);if(q.type!=='shade')continue;assert.ok(q.data.a>0&&q.data.a<q.data.b);const correct=Array.from({length:q.data.b},(_,i)=>i<q.data.a);assert.equal(checkMathAnswer(q,correct),true);assert.equal(checkMathAnswer(q,Array(q.data.b).fill(false)),false);assert.equal(checkMathAnswer(q,Array(q.data.b).fill(1)),false);
  if(grade===1){assert.equal(q.answer,1);assert.ok([2,4].includes(q.data.b));}if(grade===2)assert.ok([2,3,4].includes(q.data.b));
 }
});
test('equivalence choices have exactly one mathematically equivalent answer',()=>{
 for(const grade of [3,4])for(let run=0;run<200;run++){
  const q=makeMathQuestion('fractions',grade,1);const {a,b}=q.data;const equivalent=q.options.filter(value=>{const [n,d]=value.split('/').map(Number);return a*d===b*n;});assert.deepEqual(equivalent,[q.answer]);assert.equal(checkMathAnswer(q,q.answer),true);assert.equal(new Set(q.options).size,4);
 }
});
test('grade four comparisons practice less than, greater than, and equal amounts',()=>{
 const answers=[];for(const round of [2,5,8])for(let run=0;run<20;run++){const q=makeMathQuestion('fractions',4,round);const {a,b,c,d}=q.data;assert.equal(q.answer,compareFractions(a,b,c,d));assert.equal(checkMathAnswer(q,q.answer),true);assert.ok(a<b&&c<d);assert.ok(d<=12);answers.push(q.answer);}assert.deepEqual(new Set(answers),new Set(['<','>','=']));
});
test('question generation handles deterministic boundary randomness and invalid grades',()=>{
 for(const random of [()=>0,()=>.99999])for(const kind of Object.keys(mathSkills))for(let grade=1;grade<=4;grade++)for(let round=0;round<10;round++){const q=makeMathQuestion(kind,grade,round,random);assert.ok(q.prompt);assert.ok(q.hint);assert.ok(q.explanation);}
 assert.throws(()=>makeMathQuestion('garden',0));assert.throws(()=>makeMathQuestion('garden',5));
});
