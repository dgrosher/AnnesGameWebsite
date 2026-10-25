import {FOX_LIMIT,foxSuspects,newFoxGame,foxEliminated,foxMove,foxClueText,foxCluesRemaining} from './fox-logic.js';
export function foxPortrait(fox){
 const hat=fox.hat==='cap'?'<path d="M38 44Q60 8 82 44Z" fill="#d7a45e"/><path d="M55 44H96" stroke="#89693c" stroke-width="8" stroke-linecap="round"/>':'<path d="M37 43Q36 15 60 15T83 43Z" fill="#b089b5"/><rect x="34" y="36" width="52" height="12" rx="5" fill="#8d6d9a"/><circle cx="60" cy="12" r="7" fill="#d0b9d5"/>';
 const scarf={blue:'#759cb8',green:'#7b9c6a',purple:'#a58ab1'}[fox.scarf];
 return `<svg viewBox="0 0 120 128" aria-hidden="true"><rect width="120" height="128" rx="13" fill="#f4eddd"/><path d="M27 66L17 17 49 47M72 47L103 17 94 68" fill="#ce8b58" stroke="#a66c48" stroke-width="2"/><path d="M23 55Q60 22 97 55L89 87 60 111 31 87Z" fill="#dba16d"/><path d="M25 65Q43 65 60 91Q77 65 95 65L88 87 60 108 32 87Z" fill="#fff4d9"/>${hat}<circle cx="43" cy="65" r="3" fill="#3b4c40"/><circle cx="77" cy="65" r="3" fill="#3b4c40"/>${fox.glasses?'<g fill="none" stroke="#58635a" stroke-width="3"><circle cx="43" cy="65" r="12"/><circle cx="77" cy="65" r="12"/><path d="M55 65H65"/></g>':''}<path d="M52 86Q60 80 68 86L60 94Z" fill="#4c5143"/><path d="M48 111Q60 117 76 109" stroke="${scarf}" stroke-width="14" fill="none"/><path d="M72 112L83 128" stroke="${scarf}" stroke-width="12"/></svg>`;
}
function describe(fox){return `${fox.hat}, ${fox.scarf} scarf, ${fox.glasses?'glasses':'no glasses'}`;}

export function mountFoxGame(container,status){
 let s=null;let pending=null;let rollView=null;let disposed=false;let spinTimer=null,settleTimer=null,resultTimer=null;let flip=0;
 function clearRollTimers(){clearInterval(spinTimer);clearTimeout(settleTimer);clearTimeout(resultTimer);}
 function roll(){
  if(disposed||rollView)return;
  const next=foxMove(s,{type:'roll'});if(next===s)return;
  pending=null;rollView={stage:'rolling',next,locked:s.dice.map(d=>d===s.goal)};flip=0;render();
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)spinTimer=setInterval(()=>{flip++;container.querySelectorAll('.fox-die.rolling .fox-die-symbol').forEach((symbol,i)=>{symbol.textContent=(flip+i)%2?'⌕':'♟';});},110);
  settleTimer=setTimeout(()=>{
   if(disposed)return;clearInterval(spinTimer);rollView.stage='result';render();
   resultTimer=setTimeout(()=>{
    if(disposed)return;s=rollView.next;rollView=null;render();
    container.querySelector('.fox-mission button:not(:disabled), .fox-hidden:not(:disabled), .fox-suspect button:not(:disabled)')?.focus({preventScroll:true});
   },2600);
  },800);
 }
 function button(text,handler,disabled=false){const b=document.createElement('button');b.className='small-button';b.textContent=text;b.disabled=disabled||!!rollView;b.addEventListener('click',handler);return b;}
 function move(action){if(disposed||rollView)return;if(action.type==='roll'){roll();return;}s=foxMove(s,action);pending=null;render();}
 function render(){
  container.replaceChildren();
  if(!s){status.textContent='A mystery for the whole team';const intro=document.createElement('div');intro.className='fox-intro';intro.innerHTML='<span class="fox-intro-icon" aria-hidden="true">⌕</span><h2>Who took the picnic pie?</h2><p>Gather clues, meet the suspects, and solve the mystery together before the fox escapes!</p><p>Play solo or pass one screen between up to four detectives.</p>';
   const label=document.createElement('label');label.className='fox-player-label';label.textContent='Detectives on your team ';const select=document.createElement('select');select.setAttribute('aria-label','Number of detectives');for(let n=1;n<=4;n++){const option=document.createElement('option');option.value=n;option.textContent=n===1?'1 · Solo detective':`${n} detectives`;select.append(option);}select.value='2';label.append(select);intro.append(label,button('Start the mystery',()=>{s=newFoxGame(Number(select.value));render();}));container.append(intro);return;
  }
  status.textContent=s.outcome?s.outcome==='won'?'The whole team wins!':'Mystery complete':`Detective ${(s.turn-1)%s.players+1} · Turn ${s.turn}`;
  const track=document.createElement('div');track.className='fox-track';track.setAttribute('aria-label',`Fox escape progress: ${s.fox} of ${FOX_LIMIT} steps`);const trackLabel=document.createElement('p');trackLabel.textContent=`Fox’s escape · ${s.fox} / ${FOX_LIMIT} steps`;track.append(trackLabel);const steps=document.createElement('div');steps.className='fox-steps';for(let i=0;i<=FOX_LIMIT;i++){const step=document.createElement('span');step.className=i<=s.fox?'visited':'';step.textContent=i===s.fox?'●':i===FOX_LIMIT?'Exit':String(i);steps.append(step);}track.append(steps);
  const note=document.createElement('p');note.className='fox-message';note.setAttribute('role','status');note.textContent=rollView?rollView.stage==='rolling'?'Rolling… matching dice stay safely locked.':'The dice have landed! Take a look before we continue.':s.message;
  const notebook=document.createElement('div');notebook.className='fox-notebook';const title=document.createElement('h3');title.textContent=`Shared clue notebook · ${s.clues.length}/${s.clueDeck.length}`;notebook.append(title);if(!s.clues.length){const p=document.createElement('p');p.textContent='No clues yet. Look for hats, scarf colors, and glasses.';notebook.append(p);}s.clues.forEach(clue=>{const p=document.createElement('p');p.textContent=`✓ ${foxClueText(clue)}`;notebook.append(p);});
  container.append(track,note,notebook);
  if(!s.outcome||s.rolls>0){
   const tray=document.createElement('div');tray.className='fox-roll-panel';tray.setAttribute('aria-label','Dice tray');
   const dice=document.createElement('div');dice.className='fox-dice';dice.setAttribute('aria-busy',rollView?.stage==='rolling'?'true':'false');
   const shown=rollView?rollView.next.dice:s.dice;
   shown.forEach((d,i)=>{
    const spinning=rollView?.stage==='rolling'&&!rollView.locked[i];const locked=rollView?.stage==='rolling'?rollView.locked[i]:d===s.goal;
    const die=document.createElement('span');die.className=`fox-die${locked?' kept':''}${spinning?' rolling':''}`;
    die.setAttribute('role','img');die.setAttribute('aria-label',`Die ${i+1}: ${spinning?'rolling':d||'not rolled'}${locked?', kept':''}`);
    const symbol=document.createElement('span');symbol.className='fox-die-symbol';symbol.textContent=spinning?'⌕':d==='clue'?'⌕':d==='search'?'♟':'?';symbol.setAttribute('aria-hidden','true');
    const caption=document.createElement('small');caption.textContent=spinning?'Rolling':d==='clue'?'Clue':d==='search'?'Suspect':'Ready';
    die.append(symbol,caption);dice.append(die);
   });
   const result=document.createElement('p');result.className='fox-roll-result';result.setAttribute('role','status');
   const matching=shown.filter(d=>d===s.goal).length;
   result.textContent=rollView?.stage==='rolling'?'Rolling the unlocked dice…':(rollView||s.rolls)?`${matching} of 3 ${s.goal==='clue'?'clue':'suspect'} symbols${matching===3?' — mission complete!':(rollView?rollView.next.rolls:s.rolls)===3?' — the fox will move.':' — keep these and try again.'}${rollView?' Continuing in a moment…':''}`:'Clue: ⌕ · Suspect: ♟ · Matching dice stay locked.';
   tray.append(dice,result);container.append(tray);
  }
  if(!s.outcome){
   const mission=document.createElement('div');mission.className='fox-mission';const label=document.createElement('p');label.textContent=rollView?`Mission: ${s.goal==='clue'?'find a clue':'reveal suspects'}`:s.phase==='choose'?'Pick your mission before rolling:':s.phase==='reveal'?`Choose ${s.picks} more hidden suspect${s.picks===1?'':'s'} below.`:s.phase==='resolved'?'Discuss the clues together, then pass the turn.':`Mission: ${s.goal==='clue'?'find a clue':'reveal suspects'}`;mission.append(label);
   if(s.phase==='choose'&&!rollView)for(const [goal,text,disabled]of [['clue','Find a clue',foxCluesRemaining(s).length===0],['search','Reveal two suspects',s.revealed.length===12]]){const b=button(text,()=>move({type:'goal',goal}),disabled);b.setAttribute('aria-pressed',s.goal===goal);mission.append(b);}
   if(['choose','rolling'].includes(s.phase)){
    mission.append(button(rollView?rollView.stage==='rolling'?'Rolling…':'Showing result…':s.rolls?'Roll unmatched dice':'Roll the dice',()=>move({type:'roll'})));
    const rolls=document.createElement('p');rolls.textContent=`${3-(rollView?rollView.next.rolls:s.rolls)} rolls left · Get three ${s.goal==='clue'?'clue':'suspect'} symbols. Matching dice stay locked.`;mission.append(rolls);
   }
   if(s.phase==='resolved')mission.append(button('Next detective →',()=>move({type:'next'})));
   container.append(mission);
  }
  const heading=document.createElement('h3');heading.className='fox-suspect-heading';heading.textContent=`Suspects · ${s.revealed.length} / 12 revealed`;container.append(heading);
  const grid=document.createElement('div');grid.className='fox-suspects';foxSuspects.forEach(fox=>{
   const revealed=s.revealed.includes(fox.id)||!!s.outcome;const eliminated=revealed&&foxEliminated(s,fox.id);const card=document.createElement('div');card.className=`fox-suspect${eliminated?' eliminated':''}${s.outcome&&s.culprit===fox.id?' culprit':''}`;
   if(revealed){const portrait=document.createElement('div');portrait.innerHTML=foxPortrait(fox);portrait.setAttribute('role','img');portrait.setAttribute('aria-label',`${fox.name}: ${describe(fox)}`);const name=document.createElement('h4');name.textContent=fox.name;const description=document.createElement('p');description.textContent=describe(fox);card.append(portrait,name,description);
    if(s.outcome){const result=document.createElement('span');result.textContent=fox.id===s.culprit?'The pie thief':eliminated?'Ruled out':'Innocent';card.append(result);}
    else if(eliminated){const ruled=document.createElement('span');ruled.textContent='✓ Ruled out';card.append(ruled);}
    else card.append(button(`Accuse ${fox.name}`,()=>{pending=fox.id;render();}));
   }else{const b=button('?',()=>move({type:'reveal',id:fox.id}),s.phase!=='reveal');b.className='fox-hidden';b.setAttribute('aria-label',`Reveal hidden suspect ${fox.id+1}`);card.append(b);}
   grid.append(card);
  });container.append(grid);
  if(pending!==null&&!s.outcome){const confirm=document.createElement('div');confirm.className='fox-confirm';confirm.setAttribute('role','group');confirm.setAttribute('aria-label','Confirm team accusation');const text=document.createElement('p');text.textContent=`Does the whole team agree it’s ${foxSuspects[pending].name}? A wrong accusation ends the mystery.`;confirm.append(text,button('Yes, make our accusation',()=>move({type:'accuse',id:pending})),button('Keep investigating',()=>{pending=null;render();}));container.append(confirm);confirm.querySelector('button').focus({preventScroll:true});confirm.scrollIntoView({block:'nearest',behavior:'smooth'});}
  if(s.outcome)container.append(button('Play another mystery',()=>{s=null;pending=null;render();}));
  const rules=document.createElement('details');rules.className='uno-rules';rules.innerHTML='<summary>How to play together</summary><p>One team shares this screen and all the clues. Before each turn, choose to find a clue or reveal two suspects. Roll three dice up to three times; matching symbols stay locked. Three matching symbols complete your mission. Otherwise, the fox moves one step. After eight steps, the fox escapes and the team loses. Clues say what the thief wears AND does not wear. A negative clue rules out foxes wearing that item. Some mysteries have four clues: two scarf colors can be ruled out to identify the third. Clues automatically rule out suspects who contradict the evidence. Search to reveal hidden suspects, then discuss the evidence. You can accuse any revealed suspect who has not been ruled out, but a wrong accusation loses the game. Find the right fox and everyone wins! This is an original game with its own characters and rules, inspired by cooperative deduction games.</p>';container.append(rules);
 }
 render();return ()=>{disposed=true;clearRollTimers();rollView=null;};
}
