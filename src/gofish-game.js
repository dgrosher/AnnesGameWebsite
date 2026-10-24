import {alphabetAnimals,animalFor,newGoFish,fishMove,computerFishChoice} from './gofish-logic.js';
import {animalPicture} from './animal-art.js';
import {createNarrationPlayer,chooseNarrator,loadNarrationPreferences} from './narration.js';
export function mountGoFish(container,status){
 let state=newGoFish(),selected=null,timer=null,disposed=false,speechMessage='';
 const supported=!!globalThis.speechSynthesis&&typeof globalThis.SpeechSynthesisUtterance==='function';
 const narrator=supported?createNarrationPlayer({synth:globalThis.speechSynthesis,Utterance:globalThis.SpeechSynthesisUtterance}):null;
 function button(label,handler,disabled=false){const b=document.createElement('button');b.className='small-button';b.textContent=label;b.disabled=disabled;b.addEventListener('click',handler);return b;}
 function schedule(){clearTimeout(timer);if(!disposed&&state.turn===1&&state.phase!=='over')timer=setTimeout(()=>move(state.phase==='fish'?{type:'fish'}:{type:'ask',letter:computerFishChoice(state)}),1800);}
 function move(action){if(disposed)return;const next=fishMove(state,action);if(next===state)return;state=next;selected=null;render();schedule();}
 function learn(letter){state={...state,lesson:letter};speechMessage='';narrator?.stop();render();}
 function read(){const animal=animalFor(state.lesson);const preferences=loadNarrationPreferences();speechMessage='Starting the animal voice…';render();narrator.play(`The letter ${animal.letter}. ${animal.letter} is for ${animal.name}.`,{voice:chooseNarrator(speechSynthesis.getVoices(),preferences.voice),rate:preferences.rate,onStart:()=>{if(!disposed){speechMessage='Listen to the letter and animal name.';render();}},onEnd:()=>{if(!disposed){speechMessage='';render();}},onError:()=>{if(!disposed){speechMessage='The voice could not start; you can still read the letter and animal name together.';render();}}});}
 function render(){
  container.replaceChildren();if(selected&&!state.hands[0].includes(selected))selected=null;
  const matched=state.pairs[0].length+state.pairs[1].length;status.textContent=state.phase==='over'?'Alphabet complete!':state.turn===0?'Your turn':'Computer’s turn';
  const scores=document.createElement('div');scores.className='fish-scores';for(const text of [`You: ${state.pairs[0].length} pairs`,`Computer: ${state.pairs[1].length} pairs`,`Pond: ${state.deck.length} cards`]){const span=document.createElement('span');span.textContent=text;scores.append(span);}
  const opponent=document.createElement('p');opponent.className='fish-opponent';opponent.textContent=`Computer’s hand: ${state.hands[1].length} cards · ${matched} / 26 animal pairs matched`;
  const message=document.createElement('p');message.className='fish-message';message.setAttribute('role','status');message.textContent=state.message;
  const lesson=animalFor(state.lesson);const lessonCard=document.createElement('div');lessonCard.className='fish-lesson';const portrait=document.createElement('div');portrait.className='fish-lesson-art';portrait.innerHTML=animalPicture(lesson.letter);portrait.setAttribute('role','img');portrait.setAttribute('aria-label',lesson.name);
  const copy=document.createElement('div');const letter=document.createElement('strong');letter.textContent=`${lesson.letter} ${lesson.letter.toLowerCase()}`;const name=document.createElement('p');name.textContent=`${lesson.letter} is for ${lesson.name}`;copy.append(letter,name);if(supported)copy.append(button('Hear the letter & animal',read));lessonCard.append(portrait,copy);
  container.append(scores,opponent,message,lessonCard);if(speechMessage){const p=document.createElement('p');p.className='speech-note';p.setAttribute('role','status');p.textContent=speechMessage;container.append(p);}
  if(state.phase!=='over'){
   const heading=document.createElement('h3');heading.className='fish-hand-heading';heading.textContent='Your animal cards';container.append(heading);
   const hand=document.createElement('div');hand.className='fish-hand';[...state.hands[0]].sort().forEach(rank=>{
    const animal=animalFor(rank);const card=document.createElement('button');card.className=`fish-card${rank===selected?' selected':''}`;card.setAttribute('aria-label',`Select ${rank} for ${animal.name}`);card.setAttribute('aria-pressed',rank===selected);
    const letters=document.createElement('strong');letters.textContent=`${rank} ${rank.toLowerCase()}`;const art=document.createElement('div');art.innerHTML=animalPicture(rank);art.setAttribute('aria-hidden','true');const label=document.createElement('span');label.textContent=animal.name;card.append(letters,art,label);card.addEventListener('click',()=>{selected=rank;learn(rank);});hand.append(card);
   });container.append(hand);
   const actions=document.createElement('div');actions.className='fish-actions';
   if(state.turn===0&&state.phase==='fish')actions.append(button('Go fish! Draw a card',()=>move({type:'fish'})));
   else if(state.turn===0)actions.append(button(selected?`Ask for ${selected} — ${animalFor(selected).name}`:'Choose a card to ask for its match',()=>move({type:'ask',letter:selected}),!selected));
   else{const thinking=document.createElement('p');thinking.textContent=state.phase==='fish'?'The computer is going fishing…':'The computer is choosing an animal to ask for…';actions.append(thinking);}container.append(actions);
  }else{const end=document.createElement('div');end.className='fish-finish';end.textContent=state.message;container.append(end);}
  const album=document.createElement('details');album.className='fish-album';const summary=document.createElement('summary');summary.textContent=`Animal alphabet album · ${matched} / 26 pairs${state.phase==='over'?' · complete!':''}`;album.open=state.phase==='over';const grid=document.createElement('div');grid.className='fish-album-grid';alphabetAnimals.forEach(animal=>{
   const who=state.pairs[0].includes(animal.letter)?0:state.pairs[1].includes(animal.letter)?1:null;const entry=document.createElement('button');entry.className=`fish-album-entry${who===null?' unmatched':''}`;entry.setAttribute('aria-label',`${animal.letter} for ${animal.name}: ${who===null?'not matched yet':who===0?'your pair':'computer’s pair'}`);entry.innerHTML=animalPicture(animal.letter);const text=document.createElement('span');text.textContent=`${animal.letter} · ${animal.name}`;const owner=document.createElement('small');owner.textContent=who===null?'Not matched yet':who===0?'Your pair ✓':'Computer’s pair ✓';entry.append(text,owner);entry.addEventListener('click',()=>{learn(animal.letter);container.querySelector('.fish-lesson').scrollIntoView({block:'nearest',behavior:'smooth'});});grid.append(entry);
  });album.append(summary,grid);container.append(album);
  const rules=document.createElement('details');rules.className='uno-rules';rules.innerHTML='<summary>How to play Go Fish</summary><p>There are 52 cards: two animals for each of the 26 letters. Each player starts with seven cards, and matching pairs go into the alphabet album automatically. Choose an animal in your hand and ask the computer for its match. If it has one, you make a pair and ask again! Otherwise, choose Go fish to draw a card. If you draw the animal you asked for, take another turn; otherwise it’s the other player’s turn. Empty hands refill with up to five cards while cards remain in the pond. When all 26 pairs are matched, the player with the most pairs wins. You can explore the alphabet album or hear any animal’s name without using a turn.</p>';container.append(rules);
 }
 render();return ()=>{disposed=true;clearTimeout(timer);narrator?.stop();};
}
