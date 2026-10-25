import test from 'node:test';import assert from 'node:assert/strict';
import {makeMathQuestion,checkMathAnswer,mathSkills,placeDigits,digitsValue,compareFractions,buildMathValue,gcd} from '../src/math-logic.js';
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
 for(const random of [()=>0,()=>.99999])for(const kind of Object.keys(mathSkills))for(let grade=1;grade<=5;grade++)for(let round=0;round<10;round++){const q=makeMathQuestion(kind,grade,round,random);assert.ok(q.prompt);assert.ok(q.hint);assert.ok(q.explanation);}
 assert.throws(()=>makeMathQuestion('garden',0));assert.throws(()=>makeMathQuestion('garden',6));
});

test('grade-five decimal arithmetic uses exact hundredth answers and distinct options',()=>{
 for(let round=0;round<10;round++)for(let run=0;run<100;run++){const q=makeMathQuestion('garden',5,round);assert.equal(Math.round(q.answer*100),q.data.subtract?q.data.aCents-q.data.bCents:q.data.aCents+q.data.bCents);assert.equal(new Set(q.options).size,4);assert.equal(q.options.filter(v=>checkMathAnswer(q,v)).length,1);}
});
test('grade-five place value includes tenths, hundredths and thousandths',()=>{
 for(let run=0;run<100;run++){const q=makeMathQuestion('place',5);assert.deepEqual(q.data.unitNames.slice(3),['tenths','hundredths','thousandths']);assert.equal(checkMathAnswer(q,q.data.digits),true);assert.equal(buildMathValue(q,q.data.digits),q.answer);const wrong=[...q.data.digits];wrong[5]=(wrong[5]+1)%10;assert.equal(checkMathAnswer(q,wrong),false);}
});
test('grade-five multiplication and division use two-digit factors',()=>{
 for(let round=0;round<10;round++){const q=makeMathQuestion('picnic',5,round);assert.ok(q.data.groups>=11&&q.data.each>=11);assert.equal(q.answer,q.data.share?q.data.total/q.data.groups:q.data.groups*q.data.each);}
});
function fractionValue(value){const [n,d=1]=String(value).split('/').map(Number);return n/d;}
test('unlike-denominator fraction calculations have exactly one simplified correct answer',()=>{
 for(let round=0;round<10;round++)for(let run=0;run<100;run++){const q=makeMathQuestion('fractions',5,round);const {a,b,c,d,subtract}=q.data;assert.notEqual(b,d);const expected=a/b+(subtract?-c/d:c/d);assert.ok(Math.abs(fractionValue(q.answer)-expected)<1e-10);assert.equal(new Set(q.options).size,4);assert.equal(q.options.filter(v=>Math.abs(fractionValue(v)-expected)<1e-10).length,1);const [n,den=1]=q.answer.split('/').map(Number);assert.equal(gcd(n,den),1);}
});
test('patterns follow the shown rules and include exactly one missing-term answer',()=>{
 for(let grade=1;grade<=5;grade++)for(let round=0;round<10;round++)for(let run=0;run<30;run++){
  const q=makeMathQuestion('patterns',grade,round);const {values,hole,rule,step,step2,motif}=q.data;assert.equal(q.answer,values[hole]);assert.equal(new Set(q.options).size,4);for(let i=1;i<values.length;i++){if(rule==='shapes')assert.equal(values[i],motif[i%motif.length]);else if(rule==='multiply')assert.equal(values[i],values[i-1]*step);else if(rule==='alternating')assert.equal(values[i]-values[i-1],i%2?step:step2);else if(rule==='growing')assert.equal(values[i]-values[i-1],step+i-1);else assert.ok(Math.abs(values[i]-values[i-1]-step)<1e-10);}
 }
});
test('probability answers agree with counts, ratios, percentages and expected frequencies',()=>{
 for(let grade=1;grade<=5;grade++)for(let round=0;round<10;round++)for(let run=0;run<40;run++){
  const q=makeMathQuestion('probability',grade,round),d=q.data;assert.equal(new Set(q.options).size,q.options.length);assert.equal(q.options.filter(v=>checkMathAnswer(q,v)).length,1);
  if(grade===4){const [a,b]=d.ponds;assert.equal(q.answer,a.red*b.total===b.red*a.total?'Both equally likely':a.red*b.total>b.red*a.total?'Pond A':'Pond B');}
  else if(grade===5&&round%2)assert.equal(q.answer,d.trials*d.red/d.total);
  else if(grade===5)assert.equal(q.answer,`${d.red*100/d.total}%`);
  else if(grade===3)assert.ok(Math.abs(fractionValue(q.answer)-d.red/d.total)<1e-10);
  else if(grade===1)assert.equal(q.answer,d.red===0?'Impossible':d.red===d.total?'Certain':'Possible, but not certain');
  else assert.equal(q.answer,d.red===0?'Impossible':d.red===d.total?'Certain':d.red*2===d.total?'Equally likely':d.red*2<d.total?'Unlikely':'Likely');
 }
});
test('every algebra answer makes the original equation true',()=>{
 for(let grade=1;grade<=5;grade++)for(let round=0;round<10;round++)for(let run=0;run<50;run++){
  const q=makeMathQuestion('algebra',grade,round),{x,a,b,target,rule}=q.data;let left;
  if(rule==='missing-add')left=x+a;else if(rule==='missing-subtract')left=target-x;else if(rule==='missing-factor')left=a*x;else if(rule==='missing-divisor')left=target/x;else if(rule==='parentheses')left=a*(x+b);else left=a*x+(rule==='two-step-subtract'?-b:b);
  assert.equal(left,['missing-subtract','missing-divisor'].includes(rule)?a:target);assert.equal(q.answer,x);assert.equal(q.options.filter(v=>checkMathAnswer(q,v)).length,1);
 }
});
