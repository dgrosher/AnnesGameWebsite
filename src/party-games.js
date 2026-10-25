import {newRally,stepRally,rallyPoint,rallyHazards,newClash,stepClash,clashPlatforms} from './party-logic.js';
const racers=[{name:'Finn',kind:'frog',color:'#7fa66e'},{name:'Ruby',kind:'rabbit',color:'#e1c1ab'},{name:'Mina',kind:'mole',color:'#b29278'},{name:'Bea',kind:'bear',color:'#b98a60'}];
export function mountPartyGame(container,status,kind){
 const racing=kind==='rally';const state=racing?newRally():newClash();let character=0,running=false,started=false,disposed=false,frame,last=0,previous='',queuedJump=false,queuedAttack=false,jumpHeld=false;
 const input={left:false,right:false,go:false,brake:false,boost:false,jump:false,attack:false,guard:false};const held=new Set();
 const intro=document.createElement('p');intro.className='original-story';intro.textContent=racing?'The garden fair needs its sunseeds! Race Finn, Ruby, Mina, and Bea around the meadow circuit for three laps, scoop up golden seeds, and save your boost for the finish. Your kart follows the bends; steer across the track to dodge mud and racers.':'The Sky Picnic has a friendly new contest: send your rival tumbling off the cloud platforms with playful wind gusts! Double-jump back to safety, guard against gusts, and be the last friend with a life remaining.';
 const choose=document.createElement('div');choose.className='party-characters';choose.setAttribute('role','group');choose.setAttribute('aria-label',racing?'Choose your racer':'Choose your fighter');
 const canvas=document.createElement('canvas');canvas.width=600;canvas.height=420;canvas.tabIndex=0;canvas.className='arcade-canvas';canvas.setAttribute('aria-label',racing?'Sunseed Rally racecourse. Up accelerates, left and right steer, Space boosts, Down brakes.':'Cloudtop Clash arena. Left/right move, Up jumps, Space attacks, Down guards.');const ctx=canvas.getContext('2d');
 const toggle=document.createElement('button');toggle.className='start-snake';toggle.textContent='Start game';
 const controls=document.createElement('div');controls.className='party-controls';
 const maps=racing?{left:['ArrowLeft','a','A','left'],right:['ArrowRight','d','D','right'],go:['ArrowUp','w','W','go'],brake:['ArrowDown','s','S','brake'],boost:[' ','boost']}:{left:['ArrowLeft','a','A','left'],right:['ArrowRight','d','D','right'],jump:['ArrowUp','w','W','jump'],attack:[' ','attack'],guard:['ArrowDown','s','S','guard']};
 function sync(){for(const [action,keys]of Object.entries(maps))input[action]=keys.some(k=>held.has(k));}
 function press(key){held.add(key);sync();if(!racing&&input.jump&&!jumpHeld)queuedJump=true;if(!racing&&input.attack)queuedAttack=true;jumpHeld=input.jump;}
 function release(key){held.delete(key);sync();jumpHeld=input.jump;}
 function reset(){held.clear();sync();queuedJump=false;queuedAttack=false;jumpHeld=false;}
 function pause(){running=false;reset();toggle.textContent=state.over?'Play again':started?'Resume game':'Start game';draw();}
 function start(){if(state.over)return;started=true;running=true;toggle.textContent='Pause game';choose.querySelectorAll('button').forEach(b=>b.disabled=true);canvas.focus({preventScroll:true});draw();}
 toggle.addEventListener('click',()=>{if(state.over){container.dispatchEvent(new CustomEvent('party-restart'));return;}running?pause():start();});
 racers.forEach((racer,i)=>{const b=document.createElement('button');b.className='small-button';b.textContent=racer.name;b.setAttribute('aria-pressed',i===character);b.addEventListener('click',()=>{character=i;choose.querySelectorAll('button').forEach((button,j)=>button.setAttribute('aria-pressed',i===j));draw();});choose.append(b);});
 for(const [label,action]of racing?[['←','left'],['Go','go'],['Boost','boost'],['Brake','brake'],['→','right']]:[['←','left'],['Jump','jump'],['Gust','attack'],['Guard','guard'],['→','right']]){
  const b=document.createElement('button');b.className='small-button';b.textContent=label;b.setAttribute('aria-label',`Game control: ${label}`);
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);press(action);});for(const event of ['pointerup','pointercancel','lostpointercapture','blur'])b.addEventListener(event,()=>release(action));
  b.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)press(action);}});b.addEventListener('keyup',()=>release(action));controls.append(b);
 }
 const keys=new Set(Object.values(maps).flat().filter(key=>key.length===1||key.startsWith('Arrow')));
 function keydown(e){if(e.key.toLowerCase()==='p'&&!e.repeat){e.preventDefault();running?pause():start();return;}if(keys.has(e.key)&&!['BUTTON','A'].includes(document.activeElement.tagName)){e.preventDefault();if(!e.repeat)press(e.key);}}
 function keyup(e){release(e.key);}
 function visibility(){if(document.hidden)pause();}
 function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
 function face(x,y,scale,racer){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);if(racer.kind==='rabbit'){ellipse(-7,-15,4,12,racer.color);ellipse(7,-15,4,12,racer.color);}if(racer.kind==='frog'){ellipse(-8,-8,6,6,racer.color);ellipse(8,-8,6,6,racer.color);}if(racer.kind==='bear'){ellipse(-11,-10,6,6,racer.color);ellipse(11,-10,6,6,racer.color);}if(racer.kind==='mole'){ellipse(-10,-5,5,5,racer.color);ellipse(10,-5,5,5,racer.color);}ellipse(0,0,14,12,racer.color);ellipse(-5,-2,2,2,'#344f3d');ellipse(5,-2,2,2,'#344f3d');ctx.strokeStyle='#59694b';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,2,5,0,Math.PI);ctx.stroke();ctx.restore();}
 function kart(progress,lane,racer,you){const p=rallyPoint(progress,lane);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle='#4c5d50';ctx.fillRect(-13,-17,8,10);ctx.fillRect(5,-17,8,10);ctx.fillRect(-13,7,8,10);ctx.fillRect(5,7,8,10);ctx.fillStyle=racer.color;ctx.fillRect(-11,-12,22,24);ctx.fillStyle='#f6ebca';ctx.fillRect(-8,-9,16,5);ctx.restore();face(p.x,p.y, .65,racer);if(you){ctx.fillStyle='#3d654a';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('YOU',p.x,p.y-22);}}
 function drawRace(){
  ctx.fillStyle='#b7ce9b';ctx.fillRect(0,0,600,420);ellipse(300,210,270,167,'#91ad79');ellipse(300,210,259,159,'#e1c999');ellipse(300,210,176,79,'#9db77d');
  ctx.strokeStyle='#efe4bb';ctx.lineWidth=2;ctx.setLineDash([9,10]);ctx.beginPath();ctx.ellipse(300,210,218,125,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  for(let x=8;x<600;x+=33){ellipse(x,17+(x%3)*7,4,4,'#e9c886');ellipse(x,390+(x%2)*8,4,4,'#ead4bb');}
  ctx.fillStyle='#667d63';ctx.font='600 18px sans-serif';ctx.textAlign='center';ctx.fillText('SUNSEED MEADOW',300,208);ctx.font='12px sans-serif';ctx.fillText('Three laps · one sunny finish',300,231);
  for(const h of rallyHazards){const p=rallyPoint(h.at,h.lane);ellipse(p.x,p.y,17,11,'#a78e68');ellipse(p.x+6,p.y-2,8,5,'#c2a77f');}
  for(let i=0;i<4;i++){const key=`${Math.floor(state.progress)}-${i}`;if(!state.picked.has(key)){const p=rallyPoint(.08+i*.25,0);ellipse(p.x,p.y,7,9,'#f3d77a');ctx.strokeStyle='#b99548';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x,p.y-5);ctx.lineTo(p.x,p.y+5);ctx.stroke();}}
  for(let row=0;row<5;row++)for(let col=0;col<2;col++){ctx.fillStyle=(row+col)%2?'#f7efda':'#637366';ctx.fillRect(294+col*6,47+row*8,6,8);}
  state.rivals.forEach((r,i)=>kart(r.progress,r.lane,racers[(character+i+1)%racers.length],false));kart(state.progress,state.lane,racers[character],true);
  ctx.fillStyle='#f7f1d8';ctx.fillRect(18,18,110,22);ctx.fillStyle='#83a26b';ctx.fillRect(21,21,state.boost*1.04,16);ctx.fillStyle='#3d5e45';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText(`BOOST ${Math.round(state.boost)}%`,73,33);
  if(running&&state.countdown>0)banner(String(Math.ceil(state.countdown)),'Get ready for the garden grand prix!');
 }
 function drawClash(){
  ctx.fillStyle='#d7e6df';ctx.fillRect(0,0,600,420);ellipse(510,62,33,33,'#f0d482');for(let i=0;i<5;i++){ellipse(i*145+20,65+(i%2)*50,52,13,'#f3f5e8');ellipse(i*145+37,57+(i%2)*50,26,20,'#f3f5e8');}
  ctx.fillStyle='#abc1aa';ctx.beginPath();ctx.moveTo(0,420);ctx.lineTo(75,360);ctx.lineTo(175,420);ctx.lineTo(350,350);ctx.lineTo(600,420);ctx.fill();
  for(const platform of clashPlatforms){ellipse(platform.x+platform.w/2,platform.y+6,platform.w/2,13,'#9eb591');ctx.fillStyle='#eaf0d7';ctx.fillRect(platform.x,platform.y,platform.w,8);}
  state.fighters.forEach((f,i)=>{const racer=i===0?racers[character]:{name:'Zephyr',kind:'rabbit',color:'#b09abb'};ctx.globalAlpha=f.protect>0?.65:1;ellipse(f.x,f.y+6,12,15,i===0?'#799963':'#88789c');face(f.x,f.y-10,1,racer);ctx.globalAlpha=1;
   if(f.guard){ctx.strokeStyle='#8ab9c6';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y-4,28,0,Math.PI*2);ctx.stroke();}
   if(f.attack>0){ctx.strokeStyle='#f8f5d5';ctx.lineWidth=4;for(let n=0;n<3;n++){ctx.beginPath();ctx.moveTo(f.x+f.facing*18,f.y-10+n*9);ctx.quadraticCurveTo(f.x+f.facing*45,f.y-22+n*9,f.x+f.facing*60,f.y-8+n*9);ctx.stroke();}}
   ctx.fillStyle=i===0?'#436b48':'#7b6586';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(i===0?'YOU':'ZEPHYR',f.x,f.y-43);
  });
  for(let i=0;i<2;i++){const f=state.fighters[i],x=i===0?18:400;ctx.fillStyle=i===0?'#eff2db':'#eee5f0';ctx.fillRect(x,14,182,57);ctx.fillStyle=i===0?'#476647':'#786587';ctx.font='600 17px sans-serif';ctx.textAlign='left';ctx.fillText(`${i===0?racers[character].name:'Zephyr'} · ${f.damage}%`,x+10,37);ctx.font='12px sans-serif';ctx.fillText(`${f.lives} lives · Guard ${Math.round(f.shield)}%`,x+10,58);}
 }
 function banner(title,subtitle){ctx.fillStyle='#29463edb';ctx.fillRect(0,150,600,120);ctx.fillStyle='#fff2cf';ctx.textAlign='center';ctx.font='600 27px sans-serif';ctx.fillText(title,300,195);ctx.font='15px sans-serif';ctx.fillText(subtitle,300,229);}
 function draw(){
  racing?drawRace():drawClash();if(!running||state.over)banner(state.over?racing?`Finished in place ${state.rank}!`:state.winner==='Tie'?'A friendly draw!':`${state.winner} win${state.winner==='You'?'':'s'}!`:started?'Paused':racing?'Ready, set, grow!':'A friendly clash in the clouds',state.over?'Choose Play again for a fresh round':started?'Choose Resume game':'Choose a friend, then Start game');
  const rank=racing?1+state.rivals.filter(r=>r.progress>state.progress).length:0;
  const text=racing?`Lap ${Math.min(3,Math.floor(state.progress)+1)}/3 · Place ${state.over?state.rank:rank}/4 · Seeds ${state.seeds} · ${state.time.toFixed(1)}s${state.over?' · Finished!':''}`:`You: ${state.fighters[0].lives} lives · Zephyr: ${state.fighters[1].lives} lives${state.over?' · Match complete!':''}`;
  const value=text+(!running&&!state.over?(started?' · Paused':' · Ready'):'');if(value!==previous){status.textContent=value;previous=value;}
 }
 const help=document.createElement('p');help.className='snake-help';help.textContent=racing?'Go: ↑ / W · Steer: ← → / A D · Boost: Space · Brake: ↓ / S · Collect sunseeds to recharge boost.':'Move: ← → / A D · Jump: ↑ / W (press again for a double jump) · Gust: Space · Guard: ↓ / S. Higher damage means bigger knockback!';
 const pauseHelp=document.createElement('p');pauseHelp.className='snake-help';pauseHelp.textContent='P pauses or resumes. Touch buttons can be held together. Switching tabs pauses automatically.';
 function tick(time){if(disposed)return;const dt=Math.min((time-(last||time))/1000,.033);last=time;if(running&&!state.over){
  if(racing)stepRally(state,input,dt);else{const jump=queuedJump,attack=input.attack||queuedAttack;queuedJump=false;if(state.fighters[0].cooldown<=dt)queuedAttack=false;stepClash(state,{...input,jump,attack},dt);}
  if(state.over){running=false;reset();toggle.textContent='Play again';}
 }draw();frame=requestAnimationFrame(tick);}
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',pause);container.append(intro,choose,canvas,toggle,controls,help,pauseHelp);draw();frame=requestAnimationFrame(tick);
 return ()=>{disposed=true;cancelAnimationFrame(frame);reset();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',pause);};
}
