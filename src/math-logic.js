export const MATH_ROUNDS=10;
export const mathSkills={
 garden:['Add and subtract within 20','Add and subtract within 100','Add and subtract within 1,000','Add and subtract within 10,000'],
 picnic:['Equal groups and fair sharing','Groups of 2, 5, and 10','Multiplication and division facts','One-digit × two-digit and exact division'],
 place:['Tens and ones','Hundreds, tens, and ones','Thousands and expanded form','Place value through hundred thousands'],
 fractions:['Halves and quarters with pictures','Halves, thirds, and quarters','Fraction models and equivalent fractions','Fraction models, equivalence, and comparison']
};
const int=(min,max,random)=>min+Math.floor(random()*(max-min+1));
const pick=(items,random)=>items[int(0,items.length-1,random)];
function shuffle(items,random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=int(0,i,random);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function numberOptions(answer,random=Math.random){const distractors=shuffle([1,-1,2,-2,5,-5,10,-10],random).map(d=>answer+d).filter(n=>n>=0);return shuffle([answer,...new Set(distractors)].slice(0,4),random);}
export const placeNames=['ones','tens','hundreds','thousands','ten thousands','hundred thousands'];
export function placeDigits(value,count){return String(value).padStart(count,'0').split('').map(Number);}
export function digitsValue(digits){return digits.reduce((total,digit)=>total*10+digit,0);}
export function expandedNumber(value){return String(value).split('').map((digit,i,a)=>Number(digit)*10**(a.length-i-1)).filter(Boolean).map(n=>n.toLocaleString('en-US')).join(' + ');}
export function compareFractions(a,b,c,d){return a*d===c*b?'=':a*d<c*b?'<':'>';}
export function makeMathQuestion(kind,grade,round=0,random=Math.random){
 if(!Number.isInteger(grade)||grade<1||grade>4)throw new Error('Choose grade 1, 2, 3, or 4.');
 if(kind==='garden'){
  const max=[20,100,1000,10000][grade-1],subtract=round%2===1;const a=int(2,max-1,random),b=subtract?int(1,a,random):int(1,max-a,random);const answer=subtract?a-b:a+b;const operation=subtract?'−':'+';
  return {type:'choice',answer,options:numberOptions(answer,random),prompt:round%3===2?`Ruby has ${a.toLocaleString('en-US')} sunseeds. ${subtract?`She gives away ${b.toLocaleString('en-US')}.`:`Bea brings ${b.toLocaleString('en-US')} more.`} How many sunseeds does Ruby have now?`:`How many sunseeds ${subtract?'are left':'altogether'}?`,equation:`${a.toLocaleString('en-US')} ${operation} ${b.toLocaleString('en-US')} = ?`,data:{a,b,subtract},hint:grade===1?subtract?'Start with the first group and take away the second number. Count what is left.':'Put the two groups together and count them.':subtract?'Subtract ones first, then tens and higher places. If a column is too small, trade one of the next place for ten.':'Add ones first, then tens and higher places. Trade ten in one place for one in the next.',explanation:`${a.toLocaleString('en-US')} ${operation} ${b.toLocaleString('en-US')} = ${answer.toLocaleString('en-US')}. ${subtract?'That is how many sunseeds remain.':'That is the total in both groups.'}`};
 }
 if(kind==='picnic'){
  const groups=grade===1?int(2,4,random):grade===2?pick([2,5,10],random):int(2,grade===3?10:9,random),each=int(1,grade===1?5:grade===4?24:10,random),total=groups*each,share=round%2===1,answer=share?each:total;
  return {type:'choice',answer,options:numberOptions(answer,random),prompt:share?`${total} berries are shared equally between ${groups} picnic baskets. How many berries go in each basket?`:`There are ${groups} baskets with ${each} berries in each. How many berries are there altogether?`,equation:grade>=2?`${share?`${total} ÷ ${groups}`:`${groups} × ${each}`} = ?`:null,data:{groups,each,total,share},hint:share?'Give one berry to each basket, then repeat until all the berries have a home.':'Count each basket’s berries, or add the same number once for every basket.',explanation:share?`${total} shared equally between ${groups} baskets is ${each} in each basket. ${groups} groups of ${each} make ${total}.`:`${groups} groups of ${each} make ${total}. ${Array(groups).fill(each).join(' + ')} = ${total}.`};
 }
 if(kind==='place'){
  const count=[2,3,4,6][grade-1],answer=int(10**(count-1),10**count-1,random);const digits=placeDigits(answer,count);
  return {type:'build',answer,prompt:`Build ${answer.toLocaleString('en-US')} in the place-value boxes.`,data:{count,digits},hint:`${answer.toLocaleString('en-US')} = ${expandedNumber(answer)}. Put each digit in its own place.`,explanation:`You built ${answer.toLocaleString('en-US')}! ${expandedNumber(answer)} = ${answer.toLocaleString('en-US')}.`};
 }
 if(kind==='fractions'){
  if(grade>=3&&round%3===1){
   const b=pick([2,3,4,6],random),a=int(1,b-1,random),c=a*2,d=b*2,answer=`${c}/${d}`;
   const wrong=[`${c+1}/${d}`,`${c-1}/${d}`,`${c}/${d+1}`];
   return {type:'equivalent',answer,options:shuffle([answer,...wrong],random),prompt:`Which fraction is the same amount as ${a}/${b}?`,data:{a,b},hint:'Split each piece into two equal smaller pieces. Both the shaded count and the total piece count double.',explanation:`${a}/${b} = ${c}/${d}. Each piece became two smaller pieces, so the shaded amount stayed the same.`};
  }
  if(grade===4&&round%3===2){
   const b=pick([3,4,5,6],random),a=int(1,b-2,random),d=b*2,comparison=Math.floor(round/3)%3,c=a*2+(comparison===0?1:comparison===1?-1:0),answer=compareFractions(a,b,c,d);
   return {type:'compare',answer,options:['<','=','>'],prompt:'Compare the shaded amounts in two trays of the same size.',equation:`${a}/${b}  ?  ${c}/${d}`,data:{a,b,c,d},hint:'Both trays are the same size. Look at how much of each tray is shaded, not just how many pieces are shaded.',explanation:`${a}/${b} ${answer} ${c}/${d}. In ${b*d} equal pieces, the shaded amounts would be ${a*d} and ${c*b}.`};
  }
  const b=pick(grade===1?[2,4]:grade===2?[2,3,4]:grade===3?[2,3,4,6,8]:[3,4,5,6,8,10,12],random),a=grade===1?1:int(1,b-1,random);
  return {type:'shade',answer:a,prompt:grade===1?`Decorate ${b===2?'one half':'one quarter'} of the tray.`:`Decorate ${a}/${b} of the tray.`,data:{a,b},hint:`This whole tray has ${b} equal pieces. Decorate ${a} ${a===1?'piece':'pieces'}.`,explanation:`${a} of ${b} equal pieces are decorated: ${a}/${b} of one whole tray.`};
 }
 throw new Error('Unknown math game.');
}
export function checkMathAnswer(question,value){
 if(question.type==='build')return Array.isArray(value)&&value.length===question.data.count&&value.every(d=>Number.isInteger(d)&&d>=0&&d<=9)&&digitsValue(value)===question.answer;
 if(question.type==='shade')return Array.isArray(value)&&value.length===question.data.b&&value.every(v=>typeof v==='boolean')&&value.filter(Boolean).length===question.answer;
 return question.options.includes(value)&&value===question.answer;
}
