import {mountArcade} from './arcade-games.js';
import {mountFrogStory} from './frog-story.js';
import {DRAW_TWO, newAnneGame, canPlayAnne, anneMove} from './annes-game.js';
import {isSet, findSet, makeSetDeck, makeUnoDeck, canPlayUno, unoColorAfterPlay, shuffle, storyNodes} from './more-logic.js';
import {shuffledPairs, snakeStep} from './logic.js';
const home = document.querySelector('#home');
const view = document.querySelector('#game-view');
const container = document.querySelector('#game-container');
const status = document.querySelector('#game-status');
let current = null;
let cleanup = () => {};
const games = {
  invaders: ['Space Invaders', 'A tiny ship, a big galaxy, and a whole lot of invaders.', startInvaders],
  pong: ['Pong', 'You versus the computer. First to seven takes the match!', startPong],
  frog: ['Finn’s Treehouse', 'A read-aloud picture story about tacos, teamwork, and friends who care.', startFrog],
  anne: ['Anne’s Game', 'Match the number, play a wild, and race to an empty hand!', startAnne],
  uno: ['UNO', 'A friendly two-player game against the computer.', startUno],
  set: ['Set Match', 'Find three cards: each feature must be all the same or all different.', startSet],
  story: ['The Secret Garden', 'Your choices lead the way. An original little adventure.', startStory],
  memory: ['Memory Match', 'Turn over two cards. Find all eight pairs!', startMemory],
  snake: ['Snake', 'A tiny snake with a big appetite. How far can you grow?', startSnake]
};
function openGame(name) {
  cleanup(); cleanup = () => {};
  current = name; home.hidden = true; view.hidden = false;
  document.querySelector('#game-title').textContent = games[name][0];
  document.querySelector('#game-description').textContent = games[name][1];
  container.replaceChildren(); games[name][2]();
  window.scrollTo({top: 0});
  document.querySelector('#back-button').focus({preventScroll: true});
}
document.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => openGame(button.dataset.game)));
function goHome() { cleanup(); cleanup = () => {}; current = null; home.hidden = false; view.hidden = true; }
document.querySelector('#back-button').addEventListener('click', () => { const previous = current; goHome(); document.querySelector(`[data-game="${previous}"]`).focus(); });
document.querySelector('.brand').addEventListener('click', goHome);
document.querySelector('#restart-button').addEventListener('click', () => {if (current) openGame(current);});
function startMemory() {
  const cards = shuffledPairs(); let selected = []; let moves = 0; let pairs = 0; let locked = false; let timeout;
  status.textContent = '0 moves · 0 / 8 pairs';
  const grid = document.createElement('div'); grid.className = 'memory-board';
  cards.forEach((symbol, i) => {
    const cell = document.createElement('button'); cell.className = 'memory-cell'; cell.textContent = '?'; cell.setAttribute('aria-label', `Card ${i + 1}, face down`);
    cell.addEventListener('click', () => {
      if (locked || cell.disabled || selected.some(c => c.cell === cell)) return;
      cell.textContent = symbol; cell.classList.add('flipped'); cell.setAttribute('aria-label', `Card ${i + 1}: ${symbol}`); selected.push({symbol, cell, index:i});
      if (selected.length < 2) return;
      moves++;
      if (selected[0].symbol === selected[1].symbol) {
        selected.forEach(c => {c.cell.disabled = true; c.cell.classList.add('matched');}); selected = []; pairs++;
      } else {
        locked = true;
        timeout = setTimeout(() => {selected.forEach(c => {c.cell.textContent = '?'; c.cell.classList.remove('flipped'); c.cell.setAttribute('aria-label', `Card ${c.index + 1}, face down`);}); selected = []; locked = false;}, 850);
      }
      status.textContent = pairs === 8 ? `All matched in ${moves} moves! Wonderful work ✨` : `${moves} moves · ${pairs} / 8 pairs`;
    }); grid.append(cell);
  }); container.append(grid); cleanup = () => clearTimeout(timeout);
}
function startSnake() {
  const canvas = document.createElement('canvas'); canvas.width = 400; canvas.height = 400; canvas.className = 'snake-board'; canvas.setAttribute('aria-label', 'Snake game board. Use arrow keys or the direction buttons to move.'); canvas.setAttribute('role','img');
  const ctx = canvas.getContext('2d');
  let snake = [{x:7,y:10},{x:6,y:10},{x:5,y:10}]; let direction = {x:1,y:0}; let queued = direction; let food = {x:14,y:10}; let score = 0; let timer; let running = false; let dead = false; let changed = false;
  status.textContent = 'Ready when you are · Score: 0';
  const start = document.createElement('button'); start.className = 'start-snake'; start.textContent = 'Start game';
  const help = document.createElement('p'); help.className = 'snake-help'; help.textContent = 'Arrow keys or WASD to steer · Space to pause · Buttons work on touch screens';
  function draw() {
    ctx.fillStyle = '#e4ecd9'; ctx.fillRect(0,0,400,400);
    ctx.fillStyle = '#d4dfc8'; for(let x=0;x<20;x++) for(let y=0;y<20;y++) {ctx.beginPath(); ctx.arc(x*20+10,y*20+10,1,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle = '#dc8051'; ctx.beginPath(); ctx.arc(food.x*20+10,food.y*20+10,7,0,Math.PI*2);ctx.fill();
    snake.forEach((p,i) => {ctx.fillStyle = i ? '#64885c' : '#315944';ctx.fillRect(p.x*20+1,p.y*20+1,18,18);});
    ctx.fillStyle = '#fcf3d9'; const h = snake[0]; ctx.fillRect(h.x*20+5,h.y*20+5,3,3);ctx.fillRect(h.x*20+12,h.y*20+5,3,3);
  }
  function stop(message) {clearInterval(timer); running = false; status.textContent = message; start.textContent = dead ? 'Play again' : 'Resume game';}
  function tick() {
    direction = queued; changed = false;
    const next = snakeStep(snake,direction,food);
    if(next.dead) {dead = true; stop(`Game over · Score: ${score}. Try another round!`); return;}
    snake = next.snake;
    if(next.ate) {
      score++;
      const empty = []; for(let x=0;x<20;x++) for(let y=0;y<20;y++) if(!snake.some(p=>p.x===x && p.y===y)) empty.push({x,y});
      if(!empty.length) {dead = true; draw(); stop(`You filled the board! Score: ${score} ✨`); return;}
      food = empty[Math.floor(Math.random()*empty.length)];
    }
    status.textContent = `Keep going! · Score: ${score}`; draw();
  }
  start.addEventListener('click', () => {
    if(dead) {openGame('snake'); container.querySelector('.start-snake').click(); return;}
    if(running) {stop(`Paused · Score: ${score}`); return;}
    running = true; start.textContent = 'Pause game'; status.textContent = `Keep going! · Score: ${score}`; timer = setInterval(tick,145);
  });
  function steer(x,y) {if(!running || changed || (x === -direction.x && y === -direction.y)) return; queued = {x,y}; changed = true;}
  const controls = document.createElement('div'); controls.className = 'snake-controls';
  [['↑',0,-1,'Up'],['←',-1,0,'Left'],['↓',0,1,'Down'],['→',1,0,'Right']].forEach(([label,x,y,name])=>{const b = document.createElement('button');b.textContent = label;b.setAttribute('aria-label',name);b.addEventListener('click',()=>steer(x,y));controls.append(b);});
  function key(event) {
    const directions = {ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
    if(directions[event.key]) {event.preventDefault();steer(...directions[event.key]);}
    else if(event.code === 'Space' && !['BUTTON','A'].includes(document.activeElement.tagName)) {event.preventDefault();start.click();}
  }
  function visibility() {if(document.hidden && running) stop(`Paused · Score: ${score}`);}
  document.addEventListener('keydown',key); document.addEventListener('visibilitychange',visibility);
  container.append(canvas,start,controls,help); draw();
  cleanup = () => {clearInterval(timer);document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);};
}

function startSet() {
  let deck=makeSetDeck(); let table=deck.splice(0,12); let selected=[]; let found=0; let hint=[]; let message='Choose three cards to make a set.';
  function render() {
    container.replaceChildren(); status.textContent=`${found} sets found · ${deck.length} cards in deck`;
    const rules=document.createElement('p');rules.className='rules-note';rules.textContent='Compare color, shape, number, and shading. For EACH feature, the three cards must be all alike or all different.';
    const board=document.createElement('div');board.className='set-board';
    table.forEach((card,i)=>{
      const button=document.createElement('button');button.className=`set-card ${selected.includes(i)?'selected':''} ${hint.includes(i)?'hint':''}`;button.setAttribute('aria-pressed',selected.includes(i));
      const colors=['#bb574d','#4c8057','#7664a9'];const names=['red','green','purple'];const shapes=['diamond','oval','squiggle'];const fills=['solid','outline','striped'];
      button.setAttribute('aria-label',`${card.count+1} ${names[card.color]} ${fills[card.fill]} ${shapes[card.shape]} shapes`);
      for(let j=0;j<=card.count;j++) {
        const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 40 64');svg.setAttribute('aria-hidden','true');
        const patternId=`stripe-${i}-${j}`;
        svg.innerHTML=`<defs><pattern id="${patternId}" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0V5" stroke="${colors[card.color]}" stroke-width="2"/></pattern></defs>`;
        const shape=document.createElementNS('http://www.w3.org/2000/svg','path');
        shape.setAttribute('d',['M20 5L36 32 20 59 4 32Z','M20 5C40 5 40 59 20 59C0 59 0 5 20 5Z','M8 6C38 -2 20 25 32 28C50 42 24 71 9 57C-8 42 22 30 8 23C0 20 0 10 8 6Z'][card.shape]);
        shape.setAttribute('fill',card.fill===0?colors[card.color]:card.fill===1?'none':`url(#${patternId})`);shape.setAttribute('stroke',colors[card.color]);shape.setAttribute('stroke-width','2.5');svg.append(shape);button.append(svg);
      }
      button.addEventListener('click',()=>{
        hint=[];if(selected.includes(i)) selected=selected.filter(n=>n!==i);else selected.push(i);
        if(selected.length===3) {
          if(isSet(selected.map(n=>table[n]))) {
            found++;message='That’s a set! Lovely spotting.';
            const indices=[...selected].sort((a,b)=>b-a);
            if(table.length<=12 && deck.length) indices.forEach(n=>table[n]=deck.pop());else indices.forEach(n=>table.splice(n,1));
            selected=[];
            if(!deck.length&&!findSet(table)) message='All available sets found! Start a new game to play again.';
          } else {message='Not quite! Check each feature. Try a different trio.';selected=[];}
        }
        render();
      });board.append(button);
    });
    const note=document.createElement('p');note.className='rules-note';note.setAttribute('role','status');note.textContent=message;
    const controls=document.createElement('div');controls.className='inline-controls';
    const hintButton=document.createElement('button');hintButton.className='small-button';hintButton.textContent='Show a hint';hintButton.addEventListener('click',()=>{const set=findSet(table);hint=set?[set[0]]:[];message=set?'The highlighted card is part of a set. Can you find its two friends?':'No sets on the table. Deal more cards.';render();});
    const deal=document.createElement('button');deal.className='small-button';deal.textContent='Deal 3 more';deal.disabled=!deck.length;deal.addEventListener('click',()=>{if(findSet(table)){message='There’s still a set here! Try a hint first.';}else{table.push(...deck.splice(0,3));selected=[];hint=[];message='Fresh cards! Look for a new connection.';}render();});
    controls.append(hintButton,deal);container.append(rules,board,note,controls);
  } render();
}
function startStory() {
  let node='gate';let history=[];
  function render() {
    const page=storyNodes[node];status.textContent=page.ending?'A happy little ending':`Chapter ${history.length+1}`;
    container.replaceChildren();const article=document.createElement('article');article.className='story-page';
    const art=document.createElement('div');art.className='story-page-art';art.textContent=page.ending?'✧ ☾ ✧':'♧ ✦ ♧';art.setAttribute('aria-hidden','true');
    const title=document.createElement('h2');title.textContent=page.title;title.tabIndex=-1;
    const paragraph=document.createElement('p');paragraph.textContent=page.text;article.append(art,title,paragraph);
    if(page.ending){const end=document.createElement('p');end.className='story-ending';end.textContent=page.ending;article.append(end);}
    const choices=document.createElement('div');choices.className='story-choices';
    (page.choices||[['Explore the garden again','gate']]).forEach(([label,target])=>{const b=document.createElement('button');b.className='story-choice';b.textContent=`${label} →`;b.addEventListener('click',()=>{if(target==='gate')history=[];else history.push(node);node=target;render();container.querySelector('h2').focus();});choices.append(b);});
    article.append(choices);
    if(history.length){const back=document.createElement('button');back.className='back-button';back.textContent='← Previous choice';back.addEventListener('click',()=>{node=history.pop();render();});article.append(back);}
    container.append(article);
  }render();
}
function startUno() {
  let deck=makeUnoDeck();let hands=[deck.splice(0,7),deck.splice(0,7)];let discard=[];let turn=0;let over=false;let timeout;let choosing=null;let called=false;let drawn=null;
  let first=deck.findIndex(c=>/^\d$/.test(c.value));discard.push(deck.splice(first,1)[0]);let color=discard[0].color;let message='Your turn. Match the color or the number.';
  function top(){return discard[discard.length-1];}
  function drawCard(){if(!deck.length&&discard.length>1){const last=discard.pop();deck=shuffle(discard);discard=[last];}return deck.pop();}
  function drawMany(who,count){for(let i=0;i<count;i++){const c=drawCard();if(c)hands[who].push(c);}}
  function cardButton(card,small=false){const b=document.createElement('button');b.className=`uno-card uno-${card.color}${small?' small-card':''}`;b.textContent=card.value;b.setAttribute('aria-label',`${card.color} ${card.value}`);return b;}
  function next(){render();if(turn===1&&!over)timeout=setTimeout(computer,1000);}
  function play(index,newColor){
    const who=turn;const card=hands[who][index];
    if(!card||!canPlayUno(card,top(),color,hands[who]))return;
    if(who===0&&card.color==='wild'&&!newColor){choosing=index;render();return;}
    color=unoColorAfterPlay(card,newColor);hands[who].splice(index,1);discard.push(card);choosing=null;drawn=null;
    if(who===0&&hands[0].length===1&&!called){drawMany(0,2);message='Oops! Call UNO before playing your second-to-last card. Draw two.';}
    else message=`${who===0?'You':'Computer'} played ${card.color==='wild'?newColor:card.color} ${card.value}.`;
    called=false;
    if(hands[who].length===0){over=true;message=who===0?'You win! What a colorful finish ✨':'Computer wins this round. Ready for a rematch?';render();return;}
    const other=1-who;
    if(card.value==='+2'||card.value==='+4'){drawMany(other,card.value==='+2'?2:4);message+=` ${other===0?'You draw':'Computer draws'} ${card.value.slice(1)} and miss a turn.`;}
    else if(card.value==='Skip'||card.value==='Reverse'){message+=' Next turn skipped. (Reverse acts as Skip with two players.)';}
    else turn=other;
    next();
  }
  function computer(){
    const hand=hands[1];let index=hand.findIndex(c=>canPlayUno(c,top(),color,hand));
    if(index<0){const c=drawCard();if(c){hand.push(c);if(canPlayUno(c,top(),color,hand))index=hand.length-1;}}
    if(index>=0){const colors=['red','blue','green','yellow'];const chosen=hand[index].color==='wild'?colors.sort((a,b)=>hand.filter(c=>c.color===b).length-hand.filter(c=>c.color===a).length)[0]:undefined;play(index,chosen);}
    else{turn=0;message='Computer draws and passes. Your turn!';next();}
  }
  function render(){
    container.replaceChildren();status.textContent=over?'Round complete':turn===0?'Your turn':'Computer’s turn';
    const opponent=document.createElement('div');opponent.className='uno-opponent';opponent.textContent=`Computer · ${hands[1].length} cards${hands[1].length===1?' · UNO!':''}`;
    const backs=document.createElement('div');backs.className='uno-backs';for(let i=0;i<Math.min(hands[1].length,12);i++){const back=document.createElement('span');back.textContent='a';backs.append(back);}opponent.append(backs);
    const center=document.createElement('div');center.className='uno-center';const pile=cardButton(top());pile.disabled=true;const active=document.createElement('div');active.className='active-color';active.textContent=`Current color: ${color}`;center.append(pile,active);
    const note=document.createElement('p');note.className='rules-note';note.setAttribute('role','status');note.textContent=message;
    const handLabel=document.createElement('h3');handLabel.textContent=`Your hand · ${hands[0].length} cards`;
    const hand=document.createElement('div');hand.className='uno-hand';hands[0].forEach((card,i)=>{const b=cardButton(card);b.disabled=over||turn!==0||choosing!==null||(drawn!==null&&drawn!==i)||!canPlayUno(card,top(),color,hands[0]);b.addEventListener('click',()=>play(i));hand.append(b);});
    const controls=document.createElement('div');controls.className='inline-controls';
    const draw=document.createElement('button');draw.className='small-button';draw.textContent=drawn===null?'Draw a card':'Keep card & pass';draw.disabled=over||turn!==0||choosing!==null;
    draw.addEventListener('click',()=>{if(drawn!==null){drawn=null;turn=1;message='You kept the card. Computer’s turn.';next();return;}const c=drawCard();if(c){hands[0].push(c);if(canPlayUno(c,top(),color,hands[0])){drawn=hands[0].length-1;message='You can play your new card, or keep it and pass.';render();return;}}turn=1;message='You draw and pass. Computer’s turn.';next();});
    const uno=document.createElement('button');uno.className='small-button';uno.textContent=called?'UNO called!':'Call UNO!';uno.disabled=over||turn!==0||hands[0].length!==2||called;uno.addEventListener('click',()=>{called=true;message='UNO called! Now play your card.';render();});controls.append(draw,uno);
    container.append(opponent,center,note,handLabel,hand,controls);
    if(choosing!==null){const picker=document.createElement('div');picker.className='color-picker';picker.setAttribute('role','group');picker.setAttribute('aria-label','Choose the wild card color');const label=document.createElement('p');label.textContent='Choose your color:';picker.append(label);for(const name of ['red','blue','green','yellow']){const b=document.createElement('button');b.className=`small-button uno-${name}`;b.textContent=name;b.addEventListener('click',()=>play(choosing,name));picker.append(b);}const cancel=document.createElement('button');cancel.className='small-button';cancel.textContent='Cancel';cancel.addEventListener('click',()=>{choosing=null;render();});picker.append(cancel);container.append(picker);}
    const rules=document.createElement('details');rules.className='uno-rules';const summary=document.createElement('summary');summary.textContent='How to play';const text=document.createElement('p');text.textContent='Match the active color or the top card’s value. Draw one if you cannot play; play that new card if it fits, or pass. Skip and Reverse give you another turn in this two-player game. +2 and +4 make the other player draw and miss a turn; no stacking. +4 is allowed only when you have no cards of the active color. Call UNO before playing down to one card, or draw two! The computer calls automatically. First empty hand wins. This casual version has no challenge rule or cumulative scoring.';rules.append(summary,text);container.append(rules);
  }
  render();cleanup=()=>clearTimeout(timeout);
}

function startAnne() {
  let state=newAnneGame();let timeout;
  function move(action) {state=anneMove(state,action);render();schedule();}
  function schedule() {
    clearTimeout(timeout);
    if(state.turn===1&&state.winner===null) timeout=setTimeout(()=>{
      const hand=state.hands[1];let index=hand.findIndex(card=>card!==DRAW_TWO&&canPlayAnne(card,state.required));
      if(index<0)index=hand.findIndex(card=>canPlayAnne(card,state.required));
      move(index<0?{type:'draw'}:{type:'play',index});
    },1100);
  }
  function render() {
    container.replaceChildren();status.textContent=state.winner!==null?'Round complete':state.turn===0?'Your turn':'Computer’s turn';
    const opponent=document.createElement('div');opponent.className='uno-opponent';opponent.textContent=`Computer · ${state.hands[1].length} cards`;
    const backs=document.createElement('div');backs.className='uno-backs';for(let i=0;i<Math.min(state.hands[1].length,15);i++){const b=document.createElement('span');b.textContent='a';backs.append(b);}opponent.append(backs);
    const table=document.createElement('div');table.className='uno-center';
    const last=state.discard.at(-1);const pile=document.createElement('div');pile.className='anne-card';pile.textContent=last===undefined?'✦':last;pile.setAttribute('aria-label',last===undefined?'No card played yet':`Last played: ${last===DRAW_TWO?'Draw 2':last}`);
    const requirement=document.createElement('p');requirement.className='active-color';requirement.textContent=state.required===null?'Play any card':`Match ${state.required} or play Draw 2`;
    table.append(pile,requirement);
    const note=document.createElement('p');note.className='rules-note';note.setAttribute('role','status');note.textContent=state.message;
    const label=document.createElement('h3');label.textContent=`Your hand · ${state.hands[0].length} cards`;
    const hand=document.createElement('div');hand.className='uno-hand';state.hands[0].forEach((card,index)=>{
      const b=document.createElement('button');b.className=`anne-card${card===DRAW_TWO?' anne-wild':''}`;b.textContent=card;b.setAttribute('aria-label',card===DRAW_TWO?'Play Draw 2':`Play ${card}`);
      b.disabled=state.winner!==null||state.turn!==0||!canPlayAnne(card,state.required);b.addEventListener('click',()=>move({type:'play',index}));hand.append(b);
    });
    const draw=document.createElement('button');draw.className='small-button';draw.textContent='No match? Draw a card';draw.disabled=state.winner!==null||state.turn!==0||state.hands[0].some(card=>canPlayAnne(card,state.required));draw.addEventListener('click',()=>move({type:'draw'}));
    const rules=document.createElement('details');rules.className='uno-rules';const summary=document.createElement('summary');summary.textContent='Anne’s rules';const text=document.createElement('p');text.textContent='The deck has four of each number 1–6 and six Draw 2 cards. Each player starts with five cards. The first player can play anything; after a number, the next player must match it or play a wild Draw 2. If you cannot play, draw one and end your turn. The next player can then play anything. Draw 2 is always playable: the next player draws two and misses their turn; you can then play anything. Draw 2 cards cannot be stacked. First empty hand wins immediately. Used cards are reshuffled when the draw pile runs out, keeping the top card on the table.';rules.append(summary,text);
    container.append(opponent,table,note,label,hand,draw,rules);
  }
  render();cleanup=()=>clearTimeout(timeout);
}

function startFrog() {cleanup=mountFrogStory(container,status);}

function startInvaders(){cleanup=mountArcade(container,status,'invaders');}
function startPong(){cleanup=mountArcade(container,status,'pong');}
container.addEventListener('arcade-restart',()=>{if(current==='invaders'||current==='pong')openGame(current);});
