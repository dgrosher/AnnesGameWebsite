export const alphabetAnimals=[
 ['A','Alligator'],['B','Bear'],['C','Cat'],['D','Dog'],['E','Elephant'],['F','Frog'],['G','Giraffe'],['H','Hedgehog'],['I','Iguana'],['J','Jellyfish'],['K','Koala'],['L','Lion'],['M','Monkey'],['N','Narwhal'],['O','Owl'],['P','Penguin'],['Q','Quail'],['R','Rabbit'],['S','Snake'],['T','Turtle'],['U','Umbrellabird'],['V','Vulture'],['W','Walrus'],['X','X-ray tetra'],['Y','Yak'],['Z','Zebra']
].map(([letter,name])=>({letter,name}));
export function animalFor(letter){return alphabetAnimals.find(a=>a.letter===letter);}
export function makeFishDeck(random=Math.random){const deck=alphabetAnimals.flatMap(a=>[a.letter,a.letter]);for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}
function collect(s,who){for(const {letter}of alphabetAnimals)if(s.hands[who].filter(c=>c===letter).length===2){s.hands[who]=s.hands[who].filter(c=>c!==letter);s.pairs[who].push(letter);}}
function refill(s,who){while(!s.hands[who].length&&s.deck.length){s.hands[who].push(...s.deck.splice(0,Math.min(5,s.deck.length)));collect(s,who);}}
function finish(s){if(s.pairs[0].length+s.pairs[1].length===26){s.phase='over';s.winner=s.pairs[0].length===s.pairs[1].length?'tie':s.pairs[0].length>s.pairs[1].length?0:1;s.message=s.winner==='tie'?'A tie! You found the whole animal alphabet together.':`${s.winner===0?'You win':'Computer wins'}! All 26 animal pairs are in the album.`;}}
export function newGoFish(random=Math.random){const deck=makeFishDeck(random);const s={deck,hands:[deck.splice(0,7),deck.splice(0,7)],pairs:[[],[]],turn:0,phase:'ask',requested:null,lastAsked:[null,null],winner:null,lesson:'A',message:'Pick an animal in your hand, then ask the computer for its match!'};collect(s,0);collect(s,1);refill(s,0);refill(s,1);return s;}
export function fishMove(previous,action){
 if(previous.phase==='over')return previous;
 const s={...previous,deck:[...previous.deck],hands:previous.hands.map(h=>[...h]),pairs:previous.pairs.map(p=>[...p]),lastAsked:[...previous.lastAsked]};const who=s.turn,other=1-who;const name=who===0?'You':'Computer';
 if(action.type==='ask'&&s.phase==='ask'&&s.hands[who].includes(action.letter)){
  const letter=action.letter;const animal=animalFor(letter);s.lesson=letter;s.lastAsked[who]=letter;s.requested=letter;
  if(s.hands[other].includes(letter)){
   s.hands[other]=s.hands[other].filter(c=>c!==letter);s.hands[who].push(letter);collect(s,who);refill(s,who);refill(s,other);s.requested=null;
   s.message=`${name} asked for ${letter} — ${animal.name} and found a pair! ${who===0?'Ask':'Computer asks'} again.`;
  }else{s.phase='fish';s.message=`${name} asked for ${letter} — ${animal.name}. No match: go fish!`;}
 }else if(action.type==='fish'&&s.phase==='fish'){
  const card=s.deck.shift();const match=card===s.requested;if(card){s.hands[who].push(card);collect(s,who);}
  if(match){s.message=`${name} fished the matching ${card} — ${animalFor(card).name}! Another turn.`;s.lesson=card;}
  else{s.turn=other;s.message=card?`${name} drew a card. ${other===0?'Your':'Computer’s'} turn!`:`The pond is empty. ${other===0?'Your':'Computer’s'} turn!`;if(who===0&&card)s.lesson=card;}
  s.requested=null;s.phase='ask';refill(s,who);refill(s,other);
 }else return previous;
 finish(s);return s;
}
export function computerFishChoice(s,random=Math.random){const hand=s.hands[1];return hand.includes(s.lastAsked[0])?s.lastAsked[0]:hand[Math.floor(random()*hand.length)];}
