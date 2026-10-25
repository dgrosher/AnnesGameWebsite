export const MATH_ROUNDS=10;
export const mathSkills={
 garden:['Add and subtract within 20','Add and subtract within 100','Add and subtract within 1,000','Add and subtract within 10,000','Add and subtract decimals to hundredths'],
 picnic:['Equal groups and fair sharing','Groups of 2, 5, and 10','Multiplication and division facts','One-digit × two-digit and exact division','Two-digit multiplication and exact division'],
 place:['Tens and ones','Hundreds, tens, and ones','Thousands and expanded form','Place value through hundred thousands','Decimal place value through thousandths'],
 fractions:['Halves and quarters with pictures','Halves, thirds, and quarters','Fraction models and equivalent fractions','Fraction models, equivalence, and comparison','Add and subtract fractions with unlike denominators'],
 patterns:['Repeating shapes and counting patterns','Skip-counting and backward patterns','Multiplication patterns and missing terms','Alternating rules and growing sequences','Decimal patterns and growing differences'],
 probability:['Certain, possible, and impossible','Unlikely, equally likely, and likely','Probability as a fraction','Compare chances in different ponds','Percent chances and expected results'],
 algebra:['Missing numbers within 20','Missing addition and subtraction numbers','Missing multiplication and division numbers','Two-step mystery-number equations','Two-step equations with parentheses']
};
const int=(min,max,random)=>min+Math.floor(random()*(max-min+1));
const pick=(items,random)=>items[int(0,items.length-1,random)];
function shuffle(items,random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=int(0,i,random);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function numberOptions(answer,random=Math.random,step=1){const distractors=shuffle([1,-1,2,-2,5,-5,10,-10],random).map(d=>Number((answer+d*step).toFixed(2))).filter(n=>n>=0);return shuffle([answer,...new Set(distractors)].slice(0,4),random);}
export const placeNames=['ones','tens','hundreds','thousands','ten thousands','hundred thousands'];
export function placeDigits(value,count){return String(value).padStart(count,'0').split('').map(Number);}
export function digitsValue(digits){return digits.reduce((total,digit)=>total*10+digit,0);}
export function expandedNumber(value){return String(value).split('').map((digit,i,a)=>Number(digit)*10**(a.length-i-1)).filter(Boolean).map(n=>n.toLocaleString('en-US')).join(' + ');}
export function compareFractions(a,b,c,d){return a*d===c*b?'=':a*d<c*b?'<':'>';}
export function makeMathQuestion(kind,grade,round=0,random=Math.random){
 if(!Number.isInteger(grade)||grade<1||grade>5)throw new Error('Choose grade 1, 2, 3, 4, or 5.');
 if(kind==='garden'&&grade===5){
  const aCents=int(100,9000,random),subtract=round%2===1,bCents=int(1,subtract?aCents:10000-aCents,random),answerCents=subtract?aCents-bCents:aCents+bCents,a=aCents/100,b=bCents/100,answer=answerCents/100;
  return {type:'choice',answer,options:numberOptions(answer,random,.01),prompt:subtract?`Ruby has ${a.toFixed(2)} metres of ribbon and trims off ${b.toFixed(2)} metres. How much ribbon remains?`:`Ruby joins ${a.toFixed(2)} metres of ribbon to ${b.toFixed(2)} metres. How long is the ribbon now?`,equation:`${a.toFixed(2)} ${subtract?'−':'+'} ${b.toFixed(2)} = ?`,data:{a,b,aCents,bCents,answerCents,subtract,decimal:true},hint:'Line up the decimal points. Work with hundredths, then tenths, then whole-number places; regroup when needed.',explanation:`${a.toFixed(2)} ${subtract?'−':'+'} ${b.toFixed(2)} = ${answer.toFixed(2)} metres. ${answerCents} hundredths is ${answer.toFixed(2)}.`};
 }
 if(kind==='garden'){
  const max=[20,100,1000,10000][grade-1],subtract=round%2===1;const a=int(2,max-1,random),b=subtract?int(1,a,random):int(1,max-a,random);const answer=subtract?a-b:a+b;const operation=subtract?'−':'+';
  return {type:'choice',answer,options:numberOptions(answer,random),prompt:round%3===2?`Ruby has ${a.toLocaleString('en-US')} sunseeds. ${subtract?`She gives away ${b.toLocaleString('en-US')}.`:`Bea brings ${b.toLocaleString('en-US')} more.`} How many sunseeds does Ruby have now?`:`How many sunseeds ${subtract?'are left':'altogether'}?`,equation:`${a.toLocaleString('en-US')} ${operation} ${b.toLocaleString('en-US')} = ?`,data:{a,b,subtract},hint:grade===1?subtract?'Start with the first group and take away the second number. Count what is left.':'Put the two groups together and count them.':subtract?'Subtract ones first, then tens and higher places. If a column is too small, trade one of the next place for ten.':'Add ones first, then tens and higher places. Trade ten in one place for one in the next.',explanation:`${a.toLocaleString('en-US')} ${operation} ${b.toLocaleString('en-US')} = ${answer.toLocaleString('en-US')}. ${subtract?'That is how many sunseeds remain.':'That is the total in both groups.'}`};
 }
 if(kind==='picnic'){
  const groups=grade===5?int(11,25,random):grade===1?int(2,4,random):grade===2?pick([2,5,10],random):int(2,grade===3?10:9,random),each=grade===5?int(11,49,random):int(1,grade===1?5:grade===4?24:10,random),total=groups*each,share=round%2===1,answer=share?each:total;
  return {type:'choice',answer,options:numberOptions(answer,random),prompt:share?`${total} berries are shared equally between ${groups} picnic baskets. How many berries go in each basket?`:`There are ${groups} baskets with ${each} berries in each. How many berries are there altogether?`,equation:grade>=2?`${share?`${total} ÷ ${groups}`:`${groups} × ${each}`} = ?`:null,data:{groups,each,total,share},hint:grade===5?share?`Use multiplication to undo division: ${groups} × ? = ${total}. Break the total into easy multiples of ${groups}.`:`Break ${groups} and ${each} into tens and ones, multiply the parts, then add the partial products.`:share?'Give one berry to each basket, then repeat until all the berries have a home.':'Count each basket’s berries, or add the same number once for every basket.',explanation:share?`${total} shared equally between ${groups} baskets is ${each} in each basket. ${groups} groups of ${each} make ${total}.`:`${groups} groups of ${each} make ${total}. ${grade===5?`${groups} × ${each}`:Array(groups).fill(each).join(' + ')} = ${total}.`};
 }
 if(kind==='place'&&grade===5){
  const scaledAnswer=int(100000,999999,random),answer=scaledAnswer/1000,digits=placeDigits(scaledAnswer,6),weights=[100,10,1,.1,.01,.001],terms=digits.map((digit,i)=>Number((digit*weights[i]).toFixed(3))).filter(Boolean).join(' + ');
  return {type:'build',answer,prompt:`Build ${answer.toFixed(3)} in the decimal place-value boxes.`,data:{count:6,digits,scale:1000,scaledAnswer,unitNames:['hundreds','tens','ones','tenths','hundredths','thousandths'],weights},hint:`${answer.toFixed(3)} = ${terms}. The decimal point goes after the ones place.`,explanation:`You built ${answer.toFixed(3)}! ${terms} = ${answer.toFixed(3)}.`};
 }
 if(kind==='place'){
  const count=[2,3,4,6][grade-1],answer=int(10**(count-1),10**count-1,random);const digits=placeDigits(answer,count);
  return {type:'build',answer,prompt:`Build ${answer.toLocaleString('en-US')} in the place-value boxes.`,data:{count,digits},hint:`${answer.toLocaleString('en-US')} = ${expandedNumber(answer)}. Put each digit in its own place.`,explanation:`You built ${answer.toLocaleString('en-US')}! ${expandedNumber(answer)} = ${answer.toLocaleString('en-US')}.`};
 }
 if(kind==='fractions'&&grade===5){
  let b=pick([2,3,4,5,6,8,10,12],random),a=int(1,b-1,random),d=pick([2,3,4,5,6,8,10,12].filter(n=>n!==b),random),c=int(1,d-1,random);const subtract=round%2===1;if(subtract&&a*d<c*b){[a,c]=[c,a];[b,d]=[d,b];}
  const common=lcm(b,d),numerator=a*(common/b)+(subtract?-1:1)*c*(common/d),answer=simplifyFraction(numerator,common),candidates=[numerator+1,Math.max(0,numerator-1),numerator+2,numerator+3,numerator+common].map(n=>simplifyFraction(n,common));
  const wrong=[...new Set(candidates)].filter(v=>v!==answer);
  return {type:'fraction-sum',answer,options:shuffle([answer,...shuffle(wrong,random).slice(0,3)],random),prompt:`${subtract?'Subtract':'Add'} the fractions. Choose an answer in simplest form.`,equation:`${a}/${b} ${subtract?'−':'+'} ${c}/${d} = ?`,data:{a,b,c,d,subtract,common,numerator},hint:`Use ${common} equal pieces: ${a}/${b} = ${a*(common/b)}/${common} and ${c}/${d} = ${c*(common/d)}/${common}. ${subtract?'Subtract':'Add'} the numerators, then simplify.`,explanation:`${a*(common/b)}/${common} ${subtract?'−':'+'} ${c*(common/d)}/${common} = ${numerator}/${common} = ${answer}.`};
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
 if(kind==='patterns'){
  const hole=grade<=2?5:round%2?3:5;let values,rule,step=0,step2=0;
  if(grade===1&&round%2===0){const motif=pick([['●','★'],['▲','▲','■'],['♥','●','★']],random);values=Array.from({length:6},(_,i)=>motif[i%motif.length]);rule='shapes';const answer=values[hole];return {type:'choice',answer,options:shuffle([answer,...['●','★','▲','■','♥'].filter(v=>v!==answer)].slice(0,4),random),prompt:'Which shape belongs on the empty stepping stone?',data:{visual:'pattern',values,hole,rule,motif},hint:`The repeating group is ${motif.join(' ')}. Start that group again each time.`,explanation:`The group ${motif.join(' ')} repeats, so the missing shape is ${answer}.`};}
  let start=int(1,grade===1?5:20,random);
  if(grade>=3&&grade<5&&round%3===1){rule='multiply';step=2;values=Array.from({length:6},(_,i)=>start*step**i);}
  else if(grade===4&&round%3===2){rule='alternating';step=int(2,5,random);step2=step+int(1,4,random);values=[start];for(let i=1;i<6;i++)values.push(values.at(-1)+(i%2?step:step2));}
  else if(grade===5&&round%3===1){rule='growing';step=int(1,4,random);values=[start];for(let i=1;i<6;i++)values.push(values.at(-1)+step+i-1);}
  else{rule='add';step=grade===5?pick([.25,.5,1.25],random):pick(grade===1?[1,2]:grade===2?[2,5,10]:[3,4,6,7],random);if(grade===5)start=int(1,12,random)/4;if(grade===2&&round%2){start+=step*6;step=-step;}values=Array.from({length:6},(_,i)=>Number((start+i*step).toFixed(2)));}
  const answer=values[hole],ruleText=rule==='multiply'?`Multiply by ${step} each time`:rule==='alternating'?`Alternate adding ${step} and ${step2}`:rule==='growing'?`Start by adding ${step}, then make each jump one bigger`:`${step<0?'Subtract':'Add'} ${Math.abs(step)} each time`;
  return {type:'choice',answer,options:numberOptions(answer,random,grade===5&&rule==='add'?.25:1),prompt:'What number belongs on the empty stepping stone?',data:{visual:'pattern',values,hole,rule,step,step2},hint:`${ruleText}. Look at the terms on both sides of the empty stone.`,explanation:`${ruleText}. The missing number is ${answer}.`};
 }
 if(kind==='probability'){
  if(grade===4){const totalA=pick([4,6,8],random),redA=int(1,totalA-1,random),totalB=round%3===0?totalA*2:pick([5,6,8,10],random),redB=round%3===0?redA*2:int(1,totalB-1,random),answer=redA*totalB===redB*totalA?'Both equally likely':redA*totalB>redB*totalA?'Pond A':'Pond B';
   return {type:'choice',answer,options:shuffle(['Pond A','Pond B','Both equally likely'],random),prompt:'Every fish is equally likely to be picked. Which pond gives a better chance of a red fish?',data:{visual:'chance',ponds:[{red:redA,total:totalA,name:'Pond A'},{red:redB,total:totalB,name:'Pond B'}]},hint:`Compare the fractions ${redA}/${totalA} and ${redB}/${totalB}. Count red fish compared with ALL fish, not just red fish alone.`,explanation:`Pond A has chance ${redA}/${totalA}; Pond B has chance ${redB}/${totalB}. ${answer==='Both equally likely'?'The fractions represent the same chance.':`${answer} has the greater fraction of red fish.`}`};}
  const total=grade<=2?pick([4,6,8],random):grade===5?pick(round%2?[4,5,10]:[10,20],random):pick([4,6,8,10],random),red=round%5===0?0:round%5===1?total:int(1,total-1,random);let answer,options,prompt,hint,explanation;const data={visual:'chance',red,total};
  if(grade===1){answer=red===0?'Impossible':red===total?'Certain':'Possible, but not certain';options=['Impossible','Possible, but not certain','Certain'];prompt='If one fish is picked without looking, getting a red fish is…';hint='No red fish means impossible. All red fish means certain. A mix means it could happen, but might not.';explanation=`${red} of the ${total} fish are red. Getting red is ${answer.toLowerCase()}.`;}
  else if(grade===2){answer=red===0?'Impossible':red===total?'Certain':red*2===total?'Equally likely':red*2<total?'Unlikely':'Likely';options=['Impossible','Unlikely','Equally likely','Likely','Certain'];prompt='How likely is it to pick a red fish without looking?';hint='Compare the red count with half of all the fish. Less than half is unlikely; more than half is likely.';explanation=`${red} of ${total} fish are red: ${answer.toLowerCase()}. Equally likely means red and blue have the same chance.`;}
  else if(grade===3){answer=simplifyFraction(red,total);const pool=Array.from({length:total+1},(_,i)=>simplifyFraction(i,total)).filter(v=>v!==answer);options=shuffle([answer,...shuffle(pool,random).slice(0,3)],random);prompt='What fraction gives the chance of picking a red fish?';hint=`Count red fish on top and all fish underneath: ${red}/${total}. Simplify if you can.`;explanation=`${red} red fish out of ${total} fish gives chance ${red}/${total} = ${answer}.`;}
  else if(round%2===0){answer=`${red*100/total}%`;options=shuffle([answer,...shuffle(Array.from({length:21},(_,i)=>`${i*5}%`).filter(v=>v!==answer),random).slice(0,3)],random);prompt='What percent is the chance of picking a red fish?';hint=`${red}/${total} is the red share. Rewrite it as a number out of 100.`;explanation=`${red}/${total} = ${answer}. That is the red share of the pond.`;}
  else{const factor=int(2,6,random),trials=total*factor;answer=red*factor;data.trials=trials;options=numberOptions(answer,random);prompt=`Pick ${trials} times, putting the fish back every time. About how many red picks would you expect?`;hint=`Multiply ${trials} by ${red}/${total}. Expected results are an estimate, not a guarantee.`;explanation=`${trials} × ${red}/${total} = ${answer} expected red picks. Real results can vary because each pick is random.`;}
  return {type:'choice',answer,options:shuffle(options,random),prompt,data,hint,explanation};
 }
 if(kind==='algebra'){
  const x=int(grade<=2?0:1,grade===1?10:grade===2?50:grade===3?10:grade===4?12:20,random);let a,b,target,rule,equation,hint;
  if(grade<=2){a=int(1,grade===1?10:50,random);target=x+a;rule=round%2?'missing-subtract':'missing-add';equation=round%2?`${target} − □ = ${a}`:`□ + ${a} = ${target}`;hint=round%2?`What number must you take from ${target} to leave ${a}?`:`Count on from ${a} to ${target}, or subtract ${a} from ${target}.`;}
  else if(grade===3){a=int(2,10,random);target=a*x;rule=round%2?'missing-divisor':'missing-factor';equation=round%2?`${target} ÷ □ = ${a}`:`${a} × □ = ${target}`;hint=`Use the related fact: ${target} ÷ ${a} gives the missing number.`;}
  else{a=int(2,grade===5?12:9,random);b=int(1,grade===5?10:20,random);rule=grade===5&&round%2===0?'parentheses':round%2?'two-step-subtract':'two-step-add';if(rule==='parentheses'){target=a*(x+b);equation=`${a} × (x + ${b}) = ${target}`;hint=`Divide ${target} by ${a}, then subtract ${b}. Do the reverse steps to find x.`;}else if(rule==='two-step-subtract'){target=a*x-b;if(target<0){b=1;target=a*x-b;}equation=`${a} × x − ${b} = ${target}`;hint=`Add ${b} to ${target}, then divide by ${a}.`;}else{target=a*x+b;equation=`${a} × x + ${b} = ${target}`;hint=`Subtract ${b} from ${target}, then divide by ${a}.`;}}
  return {type:'choice',answer:x,options:numberOptions(x,random),prompt:grade<=3?'Find the mystery number in the box.':'Find x, the mystery number that makes both sides equal.',equation,data:{visual:'algebra',x,a,b,target,rule},hint,explanation:`The mystery number is ${x}. ${equation.replace('□',String(x)).replace('x',String(x))} is true.`};
 }
 throw new Error('Unknown math game.');
}
export function checkMathAnswer(question,value){
 if(question.type==='build')return Array.isArray(value)&&value.length===question.data.count&&value.every(d=>Number.isInteger(d)&&d>=0&&d<=9)&&digitsValue(value)===(question.data.scaledAnswer??question.answer);
 if(question.type==='shade')return Array.isArray(value)&&value.length===question.data.b&&value.every(v=>typeof v==='boolean')&&value.filter(Boolean).length===question.answer;
 return question.options.includes(value)&&value===question.answer;
}

export function gcd(a,b){while(b){[a,b]=[b,a%b];}return Math.abs(a);}
export function lcm(a,b){return a/gcd(a,b)*b;}
export function simplifyFraction(n,d){const g=gcd(n,d);n/=g;d/=g;return d===1?String(n):`${n}/${d}`;}
export function buildMathValue(question,digits){return digitsValue(digits)/(question.data.scale||1);}
