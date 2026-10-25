import {WIDTH,HEIGHT,newInvaders,stepInvaders,newPong,stepPong} from './arcade-logic.js';
export function mountArcade(container,status,kind){
 const invaders=kind==='invaders';const state=invaders?newInvaders():newPong();
 const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;canvas.className='arcade-canvas';canvas.tabIndex=0;canvas.setAttribute('aria-label',invaders?'Space Invaders. Arrow keys or A and D move; Space fires.':'Pong. Up and down arrows or W and S move your paddle; you can also drag on the court.');
 const ctx=canvas.getContext('2d');const input={left:false,right:false,fire:false,up:false,down:false};const pressed=new Set();
 let running=false,started=false,disposed=false,frame,last=0,lastStatus='';
 const toggle=document.createElement('button');toggle.className='start-snake';toggle.textContent='Start game';
 const controls=document.createElement('div');controls.className=`arcade-controls${invaders?'':' pong-controls'}`;controls.setAttribute('role','group');controls.setAttribute('aria-label','Touch game controls');
 const help=document.createElement('p');help.className='snake-help';help.textContent=invaders?'Move: ← → or A / D · Fire: Space · Hold touch buttons to move and fire.':'Move: ↑ ↓ or W / S · Or drag on the court · First to 7 wins.';
 const pauseNote=document.createElement('p');pauseNote.className='snake-help';pauseNote.textContent='P pauses or resumes. Games pause when you switch tabs.';
 function syncInput(){const maps=invaders?{left:['ArrowLeft','a','A','left'],right:['ArrowRight','d','D','right'],fire:[' ','fire']}:{up:['ArrowUp','w','W','up'],down:['ArrowDown','s','S','down']};for(const [action,keys]of Object.entries(maps))input[action]=keys.some(k=>pressed.has(k));}
 function resetInput(){pressed.clear();syncInput();delete input.target;}
 function pause(){running=false;resetInput();toggle.textContent=state.over?'Play again':started?'Resume game':'Start game';draw();}
 function start(){if(state.over)return;running=true;started=true;toggle.textContent='Pause game';canvas.focus({preventScroll:true});draw();}
 toggle.addEventListener('click',()=>{if(state.over){container.dispatchEvent(new CustomEvent('arcade-restart'));return;}running?pause():start();});
 for(const [label,action]of invaders?[['←','left'],['Fire','fire'],['→','right']]:[['↑ Up','up'],['↓ Down','down']]){
  const b=document.createElement('button');b.className='small-button';b.textContent=label;b.setAttribute('aria-label',action==='fire'?'Fire':`Move ${action}`);
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);pressed.add(action);syncInput();});
  const release=()=>{pressed.delete(action);syncInput();};b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
  b.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();pressed.add(action);syncInput();}});b.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')release();});b.addEventListener('blur',release);controls.append(b);
 }
 const keyMap=new Set(invaders?['ArrowLeft','ArrowRight','a','A','d','D',' ']:['ArrowUp','ArrowDown','w','W','s','S']);
 function keydown(e){if(e.key.toLowerCase()==='p'&&!e.repeat){e.preventDefault();running?pause():start();return;}if(!keyMap.has(e.key)||['BUTTON','A'].includes(document.activeElement.tagName))return;e.preventDefault();pressed.add(e.key);syncInput();}
 function keyup(e){pressed.delete(e.key);syncInput();}
 let dragging=false;
 function point(e){const rect=canvas.getBoundingClientRect();input.target=(e.clientY-rect.top)/rect.height*HEIGHT;}
 function pointerdown(e){canvas.focus({preventScroll:true});if(invaders)return;dragging=true;canvas.setPointerCapture(e.pointerId);point(e);}
 function pointermove(e){if(dragging&&!invaders)point(e);}
 function pointerup(){dragging=false;delete input.target;}
 canvas.addEventListener('pointerdown',pointerdown);canvas.addEventListener('pointermove',pointermove);canvas.addEventListener('pointerup',pointerup);canvas.addEventListener('pointercancel',pointerup);
 function visibility(){if(document.hidden)pause();}
 function blur(){pause();}
 function draw(){
  ctx.fillStyle='#182d2b';ctx.fillRect(0,0,WIDTH,HEIGHT);
  if(invaders){
   ctx.fillStyle='#76928a';for(let i=0;i<45;i++)ctx.fillRect((i*97+35)%600,(i*53+20)%420,2,2);
   const pixels=['00100100','00011000','00111100','01111110','11011011','11111111','10100101','00100100'];
   state.aliens.forEach(a=>{ctx.fillStyle=['#edb879','#dfb1b7','#bcb4dc','#b1ce96'][a.row];pixels.forEach((row,y)=>[...row].forEach((bit,x)=>{if(bit==='1')ctx.fillRect(a.x+x*3.5,a.y+y*2.75,3.5,2.75);}));});
   if(state.invulnerable===0||Math.floor(state.invulnerable*12)%2){ctx.fillStyle='#c9dfad';ctx.fillRect(state.ship-18,384,36,12);ctx.fillRect(state.ship-11,378,22,8);ctx.fillRect(state.ship-3,372,6,10);}
   ctx.fillStyle='#f2d684';state.shots.forEach(b=>ctx.fillRect(b.x,b.y,b.w,b.h));ctx.fillStyle='#e7a08b';state.enemyShots.forEach(b=>ctx.fillRect(b.x,b.y,b.w,b.h));
   ctx.strokeStyle='#456854';ctx.beginPath();ctx.moveTo(0,406);ctx.lineTo(600,406);ctx.stroke();
  }else{
   ctx.strokeStyle='#54756c';ctx.setLineDash([8,12]);ctx.beginPath();ctx.moveTo(300,0);ctx.lineTo(300,420);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle='#cfdfb4';ctx.fillRect(20,state.player-42,10,84);ctx.fillStyle='#eab987';ctx.fillRect(570,state.cpu-42,10,84);ctx.fillStyle='#fff1c6';ctx.beginPath();ctx.arc(state.ball.x,state.ball.y,7,0,Math.PI*2);ctx.fill();
   ctx.font='600 50px sans-serif';ctx.textAlign='center';ctx.fillStyle='#cfdfb4';ctx.fillText(state.playerScore,245,65);ctx.fillStyle='#eab987';ctx.fillText(state.cpuScore,355,65);
  }
  if(!running||state.over){ctx.fillStyle='#142b2bcc';ctx.fillRect(0,145,600,125);ctx.fillStyle='#fff1d1';ctx.font='600 27px sans-serif';ctx.textAlign='center';ctx.fillText(state.over?(invaders?'Game over':`${state.winner} win${state.winner==='You'?'':'s'}!`):started?'Paused':invaders?'Ready to defend the galaxy?':'A little friendly competition',300,195);ctx.font='16px sans-serif';ctx.fillText(state.over?'Choose Play again for another round':started?'Choose Resume game when you’re ready':'Choose Start game to play',300,230);}
  const text=invaders?`Score: ${state.score} · Lives: ${state.lives} · Wave: ${state.wave}${state.over?' · Game over':''}`:`You ${state.playerScore} — ${state.cpuScore} Computer · ${state.over?`${state.winner} wins!`:'First to 7'}`;
  const value=`${text}${!running&&!state.over?started?' · Paused':' · Ready':''}`;if(value!==lastStatus){status.textContent=value;lastStatus=value;}
 }
 function tick(time){if(disposed)return;const dt=Math.min((time-(last||time))/1000,.033);last=time;if(running&&!state.over){(invaders?stepInvaders:stepPong)(state,input,dt);if(state.over){running=false;resetInput();toggle.textContent='Play again';}}draw();frame=requestAnimationFrame(tick);}
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',blur);
 container.append(canvas,toggle,controls,help,pauseNote);draw();frame=requestAnimationFrame(tick);
 return ()=>{disposed=true;cancelAnimationFrame(frame);resetInput();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur);};
}
