export const FOX_LIMIT=8;
export const FOX_FEATURES=['hat','scarf','glasses'];
const names=['Hazel','Rowan','Poppy','Jasper','Clover','Felix','Maple','Bramble','Sunny','Juniper','Rusty','Willow'];
export const foxSuspects=[];
for(const hat of ['cap','beanie'])for(const scarf of ['blue','green','purple'])for(const glasses of [false,true])foxSuspects.push({id:foxSuspects.length,name:names[foxSuspects.length],hat,scarf,glasses});
export function newFoxGame(players=2,random=Math.random){
 return {players:Math.max(1,Math.min(4,Math.floor(players)||2)),turn:1,culprit:Math.floor(random()*foxSuspects.length),revealed:[],clues:[],fox:0,goal:'clue',dice:[null,null,null],rolls:0,phase:'choose',picks:0,outcome:null,message:'The picnic pie has vanished! Choose a mission, then roll your three dice.'};
}
export function foxEliminated(state,id){return state.clues.some(clue=>foxSuspects[id][clue.feature]!==clue.value);}
export function foxMove(previous,action,random=Math.random){
 if(previous.outcome)return previous;
 const s={...previous,dice:[...previous.dice],revealed:[...previous.revealed],clues:[...previous.clues]};
 if(action.type==='goal'&&s.phase==='choose'&&['clue','search'].includes(action.goal)){
  if(action.goal==='clue'&&s.clues.length===3||action.goal==='search'&&s.revealed.length===12)return previous;
  s.goal=action.goal;return s;
 }
 if(action.type==='roll'&&['choose','rolling'].includes(s.phase)){
  if((s.goal==='clue'&&s.clues.length===3)||(s.goal==='search'&&s.revealed.length===12))return previous;
  s.rolls++;s.dice=s.dice.map(d=>d===s.goal?d:random()<.5?'clue':'search');
  if(s.dice.every(d=>d===s.goal)){
   if(s.goal==='clue'){
    const remaining=FOX_FEATURES.filter(feature=>!s.clues.some(c=>c.feature===feature));const feature=remaining[Math.floor(random()*remaining.length)];
    s.clues.push({feature,value:foxSuspects[s.culprit][feature]});s.phase='resolved';s.message='A fresh clue! The notebook has ruled out foxes who don’t match.';
   }else{s.phase='reveal';s.picks=Math.min(2,12-s.revealed.length);s.message=`Search successful! Turn over ${s.picks} hidden suspect cards.`;}
  }else if(s.rolls===3){s.fox++;s.phase='resolved';s.message='The dice didn’t match this time, and the fox moved one step closer to the exit.';if(s.fox>=FOX_LIMIT){s.outcome='escaped';s.message=`The fox escaped! It was ${foxSuspects[s.culprit].name} with the picnic pie.`;}}
  else{s.phase='rolling';s.message='Matching dice are kept automatically; roll the others again!';}
  return s;
 }
 if(action.type==='reveal'&&s.phase==='reveal'&&Number.isInteger(action.id)&&action.id>=0&&action.id<12&&!s.revealed.includes(action.id)){
  s.revealed.push(action.id);s.picks--;if(!s.picks){s.phase='resolved';s.message='Suspects revealed! Compare them with your clues, or pass to the next detective.';}return s;
 }
 if(action.type==='next'&&s.phase==='resolved'){
  s.turn++;s.rolls=0;s.dice=[null,null,null];s.phase='choose';s.goal=s.clues.length<3?'clue':'search';s.message='Talk it over together: look for a clue, search for suspects, or make an accusation.';return s;
 }
 if(action.type==='accuse'&&s.revealed.includes(action.id)&&!foxEliminated(s,action.id)){
  s.outcome=action.id===s.culprit?'won':'wrong';s.message=s.outcome==='won'?`You solved it together! ${foxSuspects[s.culprit].name} admits taking the pie and agrees to share.`:`That fox was innocent! The real pie thief was ${foxSuspects[s.culprit].name}. Try a new mystery together.`;return s;
 }
 return previous;
}
