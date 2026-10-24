import {newCloudwing,stepCloudwing,newGarden,stepGarden} from './grandpa-logic.js';
export function mountGrandpaGame(container,status,kind){
 const flying=kind==='cloudwing';const state=flying?newCloudwing():newGarden();const canvas=document.createElement('canvas');canvas.width=600;canvas.height=420;canvas.tabIndex=0;canvas.className='arcade-canvas';canvas.setAttribute('aria-label',flying?'Cloudwing Couriers flying game. Left and right move; hold Space to flap.':'Root and Rumble digging game. Arrow keys dig; hold Space to sprinkle in the direction you face.');const ctx=canvas.getContext('2d');
 const intro=document.createElement('p');intro.className='original-story';intro.textContent=flying?'Pip the sky-post pilot rides a moonwing moth to recover letters stolen by mischievous cloud sprites. Meet a sprite from above, catch its floating letter, and bring kindness back to the sky!':'Mina Mole’s moonflower garden is full of grumblebugs! Dig new paths and sprinkle three gentle bursts of dew to turn each grumblebug into a blooming flower.';
 const input={left:false,right:false,up:false,down:false,action:false};const held=new Set();let running=false,started=false,disposed=false,frame,last=0,previousStatus='';
 const toggle=document.createElement('button');toggle.className='start-snake';toggle.textContent='Start game';
 const controls=document.createElement('div');controls.className='original-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Touch game controls');
 const map={left:['ArrowLeft','a','A','left'],right:['ArrowRight','d','D','right'],up:['ArrowUp','w','W','up'],down:['ArrowDown','s','S','down'],action:[' ','action']};
 function sync(){for(const [key,values]of Object.entries(map))input[key]=values.some(v=>held.has(v));}
 function reset(){held.clear();sync();}
 function pause(){running=false;reset();toggle.textContent=state.over?'Play again':started?'Resume game':'Start game';draw();}
 function start(){if(state.over)return;running=true;started=true;toggle.textContent='Pause game';canvas.focus({preventScroll:true});}
 toggle.addEventListener('click',()=>{if(state.over){container.dispatchEvent(new CustomEvent('original-restart'));return;}running?pause():start();});
 for(const [label,key]of flying?[['←','left'],['Flap','action'],['→','right']]:[['↑','up'],['←','left'],['Sprinkle','action'],['→','right'],['↓','down']]){
  const b=document.createElement('button');b.className=`small-button direction-${key}`;b.textContent=label;b.setAttribute('aria-label',key==='action'?flying?'Flap wings':'Sprinkle dew':`Move ${key}`);
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held.add(key);sync();});const release=()=>{held.delete(key);sync();};for(const event of ['pointerup','pointercancel','lostpointercapture','blur'])b.addEventListener(event,release);
  b.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();held.add(key);sync();}});b.addEventListener('keyup',release);controls.append(b);
 }
 if(!flying)controls.classList.add('garden-controls');
 const keys=new Set(Object.values(map).flat().filter(k=>k.length===1||k.startsWith('Arrow')));
 function keydown(e){if(e.key.toLowerCase()==='p'&&!e.repeat){e.preventDefault();running?pause():start();return;}if(keys.has(e.key)&&!['BUTTON','A'].includes(document.activeElement.tagName)){e.preventDefault();held.add(e.key);sync();}}
 function keyup(e){held.delete(e.key);sync();}
 function visibility(){if(document.hidden)pause();}
 function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
 function drawClouds(){
  ctx.fillStyle='#dcebe6';ctx.fillRect(0,0,600,420);ellipse(525,62,33,33,'#f0d58a');
  for(let i=0;i<5;i++){const x=(i*157+state.time*5)%740-70;ellipse(x,90+i%2*65,55,14,'#f4f6e9');ellipse(x+12,80+i%2*65,28,20,'#f4f6e9');}
  ctx.fillStyle='#6d8b87';ctx.fillRect(0,407,600,13);ctx.fillStyle='#85989b';for(let x=0;x<600;x+=30){ctx.beginPath();ctx.moveTo(x,420);ctx.lineTo(x+15,399);ctx.lineTo(x+30,420);ctx.fill();}
  for(const [x,y,w]of [[35,290,150],[245,345,110],[420,255,145]]){ellipse(x+w/2,y+10,w/2,17,'#bdcdb3');ellipse(x+w/2,y,w/2+4,11,'#f7f7e7');}
  state.enemies.forEach(e=>{ellipse(e.x,e.y,19,14,'#a38db4');ellipse(e.x-14,e.y-8,11,10,'#b5a4c4');ellipse(e.x+14,e.y-8,11,10,'#b5a4c4');ellipse(e.x-6,e.y-2,2.5,3,'#4b4e65');ellipse(e.x+6,e.y-2,2.5,3,'#4b4e65');ctx.strokeStyle='#685777';ctx.beginPath();ctx.arc(e.x,e.y+1,7,0,Math.PI);ctx.stroke();});
  for(const letter of state.letters){ctx.fillStyle='#fff3ce';ctx.fillRect(letter.x-12,letter.y-8,24,17);ctx.strokeStyle='#c29760';ctx.strokeRect(letter.x-12,letter.y-8,24,17);ctx.beginPath();ctx.moveTo(letter.x-12,letter.y-8);ctx.lineTo(letter.x,letter.y+1);ctx.lineTo(letter.x+12,letter.y-8);ctx.stroke();}
  const p=state.player;ctx.globalAlpha=state.shield>0?.65:1;{const wing=Math.sin(state.time*23)*8;ellipse(p.x-17,p.y-2,19,10+wing/2,'#dba777');ellipse(p.x+17,p.y-2,19,10-wing/2,'#e7bd8b');ellipse(p.x,p.y,12,16,'#667b67');ellipse(p.x,p.y-15,8,8,'#f1d1a5');ctx.fillStyle='#a5744e';ctx.fillRect(p.x-10,p.y-22,20,5);ctx.fillStyle='#435545';ctx.fillRect(p.x+3,p.y-17,2,3);ctx.fillStyle='#bd7755';ctx.fillRect(p.x-7,p.y-7,14,7);}ctx.globalAlpha=1;
 }
 function drawGarden(){
  ctx.fillStyle='#ae7d57';ctx.fillRect(0,0,600,420);
  for(let y=1;y<14;y++)for(let x=0;x<20;x++){if(state.dug.has(`${x},${y}`)){ctx.fillStyle='#e4c99c';ctx.fillRect(x*30,y*30,30,30);}else{ctx.fillStyle=(x+y)%2?'#b8875e':'#b28058';ctx.fillRect(x*30,y*30,30,30);ctx.fillStyle='#d3aa7b';ctx.fillRect(x*30+8,y*30+10,3,2);ctx.fillRect(x*30+20,y*30+22,2,2);}}
  ctx.fillStyle='#9bb57d';ctx.fillRect(0,0,600,30);for(let x=8;x<600;x+=27){ctx.strokeStyle='#6c925a';ctx.beginPath();ctx.moveTo(x,27);ctx.lineTo(x-3,16);ctx.lineTo(x+3,23);ctx.stroke();}
  for(const f of state.flowers){const x=f.x*30+15,y=f.y*30+15;for(let i=0;i<5;i++)ellipse(x+Math.cos(i*1.256)*8,y+Math.sin(i*1.256)*8,6,6,'#e9adad');ellipse(x,y,4,4,'#f5db82');}
  state.bugs.forEach(b=>{const x=b.x*30+15,y=b.y*30+15,r=10+b.puff*3;ellipse(x,y,r,r*.8,b.puff?'#a2b67b':'#a08aaf');ellipse(x-4,y-2,2,2,'#4c4d4a');ellipse(x+4,y-2,2,2,'#4c4d4a');ctx.strokeStyle='#637551';ctx.beginPath();ctx.moveTo(x-4,y-r+2);ctx.lineTo(x-7,y-r-4);ctx.moveTo(x+4,y-r+2);ctx.lineTo(x+7,y-r-4);ctx.stroke();});
  const p=state.player,x=p.x*30+15,y=p.y*30+15;ctx.globalAlpha=state.shield>0?.65:1;{ellipse(x,y,12,12,'#846552');ellipse(x,y+4,8,6,'#e7c5a0');ctx.fillStyle='#d8ad54';ctx.fillRect(x-12,y-9,24,5);ellipse(x,y-9,9,6,'#e8bf6b');ellipse(x-4,y,1.5,2,'#323f39');ellipse(x+4,y,1.5,2,'#323f39');ellipse(x,y+4,3,2,'#b67c76');}ctx.globalAlpha=1;
  if(state.spray>0)for(let i=1;i<=3;i++){const tx=p.x+p.dx*i,ty=p.y+p.dy*i;if(!state.dug.has(`${tx},${ty}`))break;ellipse(tx*30+11,ty*30+12,3,4,'#8abcc8');ellipse(tx*30+20,ty*30+20,2,3,'#b8dce1');}
 }
 function draw(){
  flying?drawClouds():drawGarden();if(!running||state.over){ctx.fillStyle='#273f39d9';ctx.fillRect(0,145,600,125);ctx.fillStyle='#fff2d2';ctx.textAlign='center';ctx.font='600 26px sans-serif';ctx.fillText(state.over?'Time for a fresh adventure':started?'Taking a little break':flying?'The sky post needs you!':'Let’s grow a little kindness',300,194);ctx.font='16px sans-serif';ctx.fillText(state.over?'Choose Play again':started?'Choose Resume game':'Choose Start game',300,229);}
  const value=`Score: ${state.score} · Hearts: ${state.lives} · ${flying?'Route':'Garden'} ${state.wave}${flying?` · Mail ${state.delivered}/${state.target}`:` · Bugs ${state.bugs.length}`}${state.over?' · Game over':!running?started?' · Paused':' · Ready':''}`;if(value!==previousStatus){status.textContent=value;previousStatus=value;}
 }
 const help=document.createElement('p');help.className='snake-help';help.textContent=flying?'Move: ← → or A / D · Hold Space or Flap to fly · Touch sprites from above, then collect the letters · Avoid the storm below.':'Dig: arrows or WASD · Face a bug and hold Space or Sprinkle for three bursts · Dew travels up to three dug squares · Avoid grumblebugs!';
 const pauseHelp=document.createElement('p');pauseHelp.className='snake-help';pauseHelp.textContent='P pauses or resumes. Switching tabs pauses automatically. Hold touch buttons to play.';
 function tick(time){if(disposed)return;const dt=Math.min((time-(last||time))/1000,.033);last=time;if(running&&!state.over){(flying?stepCloudwing:stepGarden)(state,input,dt);if(state.over){running=false;reset();toggle.textContent='Play again';}}draw();frame=requestAnimationFrame(tick);}
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',pause);container.append(intro,canvas,toggle,controls,help,pauseHelp);draw();frame=requestAnimationFrame(tick);
 return ()=>{disposed=true;cancelAnimationFrame(frame);reset();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',pause);};
}
