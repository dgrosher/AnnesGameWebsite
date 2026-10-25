import {shuffle} from './more-logic.js';
export const DRAW_TWO = '+2';
export function makeAnneDeck() {
  const cards = Array(6).fill(DRAW_TWO);
  for(let number=1;number<=6;number++) for(let copy=0;copy<4;copy++) cards.push(number);
  return shuffle(cards);
}
export function newAnneGame() {
  const deck=makeAnneDeck();
  return {deck,hands:[deck.splice(0,5),deck.splice(0,5)],discard:[],required:null,turn:0,winner:null,message:'You go first! Play any card.'};
}
export function canPlayAnne(card,required) {return card===DRAW_TWO || required===null || card===required;}
function draw(state,who,count) {
  let drawn=0;
  for(let i=0;i<count;i++) {
    if(!state.deck.length && state.discard.length>1) {
      const top=state.discard.pop();state.deck=shuffle(state.discard);state.discard=[top];
    }
    if(!state.deck.length) break;
    state.hands[who].push(state.deck.pop());drawn++;
  }
  return drawn;
}
export function anneMove(previous,action) {
  if(previous.winner!==null) return previous;
  const state={...previous,deck:[...previous.deck],hands:previous.hands.map(h=>[...h]),discard:[...previous.discard]};
  const who=state.turn, other=1-who, hand=state.hands[who];
  const name=who===0?'You':'Computer';
  if(action.type==='draw') {
    if(hand.some(card=>canPlayAnne(card,state.required))) return previous;
    const count=draw(state,who,1);state.required=null;state.turn=other;
    state.message=`${name} ${count?'drew a card':'could not draw (deck empty)'}. ${other===0?'You can':'Computer can'} play any card.`;
    return state;
  }
  if(action.type!=='play'||!Number.isInteger(action.index)||action.index<0||action.index>=hand.length||!canPlayAnne(hand[action.index],state.required)) return previous;
  const [card]=hand.splice(action.index,1);state.discard.push(card);
  state.message=`${name} played ${card===DRAW_TWO?'Draw 2':card}.`;
  if(!hand.length) {state.winner=who;state.message=who===0?'You win! Anne would be proud ✨':'Computer wins this round. Let’s play again!';return state;}
  if(card===DRAW_TWO) {
    const count=draw(state,other,2);state.required=null;
    state.message+=` ${other===0?'You draw':'Computer draws'} ${count} and miss a turn. ${who===0?'Play':'Computer can play'} any card.`;
  } else {state.required=card;state.turn=other;}
  return state;
}
