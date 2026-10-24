import {newBunny,stepBunny,nextBunnyStage,BUNNY_STAGES} from './bunny-logic.js';
export function mountBunny(container,status){
 const s=newBunny();let running=false,started=false,disposed=false,frame,last=0,queuedJump=false,previous='';const held=new Set();
 const intro=document.createElement('p');intro.className='original-story';intro.textContent='Ruby Bunny is bringing sunshine to the Carrot Picnic! Explore three scrolling gardens, gather golden sunseeds, and munch carrots to become Super Ruby. A carrot’s power protects you from one snail bump and gives your jumps a little extra spring.';
 const canvas=document.createElement('canvas');canvas.width=600;canvas.height=420;canvas.tabIndex=0;canvas.className='arcade-canvas';canvas.setAttribute('aria-label','Ruby’s Carrot Quest platform adventure. Left and right move; Space or Up jumps. Collect carrots and reach the cottage in each of three gardens.');const ctx=canvas.getContext('2d');
 const toggle=document.createElement('button');toggle.className='start-snake';toggle.textContent='Start adventure';
 const notice=document.createElement('p');notice.className='garden-complete';notice.setAttribute('role','status');notice.hidden=true;
 const controls=document.createElement('div');controls.className='bunny-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Adventure touch controls');
 function reset(){held.clear();queuedJump=false;}
 function pause(){running=false;reset();toggle.textContent=s.won||s.over?'Play again':s.cleared?'Next garden →':started?'Resume adventure':'Start adventure';draw();}
 function start(){if(s.over||s.cleared)return;running=true;started=true;toggle.textContent='Pause adventure';canvas.focus({preventScroll:true});draw();}
 toggle.addEventListener('click',()=>{if(s.over||s.won){container.dispatchEvent(new CustomEvent('bunny-restart'));return;}if(s.cleared){nextBunnyStage(s);reset();start();}else running?pause():start();});
 for(const [label,key]of [['←','left'],['Jump','jump'],['→','right']]){
  const b=document.createElement('button');b.className='small-button';b.textContent=label;b.setAttribute('aria-label',key==='jump'?'Bunny jump':`Bunny move ${key}`);
  function press(){if(key==='jump')queuedJump=true;else held.add(key);}
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);press();});for(const event of ['pointerup','pointercancel','lostpointercapture','blur'])b.addEventListener(event,()=>held.delete(key));
  b.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)press();}});b.addEventListener('keyup',()=>held.delete(key));b.addEventListener('click',e=>{if(e.detail===0&&key==='jump')queuedJump=true;});controls.append(b);
 }
 const leftKeys=['ArrowLeft','a','A','left'],rightKeys=['ArrowRight','d','D','right'],jumpKeys=[' ','ArrowUp','w','W'];
 function keydown(e){if(e.key.toLowerCase()==='p'&&!e.repeat){e.preventDefault();running?pause():start();return;}if(['BUTTON','A'].includes(document.activeElement.tagName))return;if(leftKeys.includes(e.key)||rightKeys.includes(e.key)){e.preventDefault();held.add(e.key);}if(jumpKeys.includes(e.key)){e.preventDefault();if(!e.repeat)queuedJump=true;}}
 function keyup(e){held.delete(e.key);}
 function visibility(){if(document.hidden)pause();}
 function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
 function carrot(x,y){ctx.fillStyle='#dc955e';ctx.beginPath();ctx.moveTo(x-8,y-12);ctx.lineTo(x+8,y-12);ctx.lineTo(x,y+14);ctx.closePath();ctx.fill();ctx.strokeStyle='#729761';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-12);ctx.lineTo(x-5,y-22);ctx.moveTo(x,y-12);ctx.lineTo(x+5,y-21);ctx.moveTo(x,y-12);ctx.lineTo(x,y-24);ctx.stroke();}
 function draw(){
  const moon=s.level===3;ctx.fillStyle=moon?'#596b82':s.level===2?'#dfebd9':'#d5e8df';ctx.fillRect(0,0,600,420);ellipse(515,65,29,29,moon?'#eee6bc':'#f2d486');
  for(let i=0;i<7;i++){const x=((i*155-s.camera*.22)%850+850)%850-90;ellipse(x,90+i%2*35,46,12,moon?'#8998a8':'#f4f4e3');ellipse(x+13,82+i%2*35,25,18,moon?'#8998a8':'#f4f4e3');}
  for(let i=0;i<6;i++){const x=i*145-s.camera*.13%145;ellipse(x,340,115,100,moon?'#718578':'#b0c69a');}
  ctx.save();ctx.translate(-s.camera,0);
  for(let i=0;i<12;i++){const x=i*240+110;ctx.fillStyle='#a5875c';ctx.fillRect(x,240,11,90);ellipse(x+5,225,35,42,moon?'#6c8c79':'#8eae79');if(s.level===2){for(const [dx,dy]of [[-12,-5],[12,10],[0,-23]])ellipse(x+5+dx,225+dy,5,5,'#cf8b6e');}}
  ctx.fillStyle=moon?'#829eaa':'#9bc5ca';ctx.fillRect(0,395,2640,25);
  for(const solid of s.solids){ctx.fillStyle=solid.ground?'#bd9971':'#d2be92';ctx.fillRect(solid.x,solid.y,solid.w,solid.h);ctx.fillStyle=moon?'#a7bd98':'#9ebc7a';ctx.fillRect(solid.x,solid.y,solid.w,9);ctx.fillStyle='#d9b98a';for(let x=solid.x+12;x<solid.x+solid.w;x+=32)ctx.fillRect(x,solid.y+22,6,3);}
  for(const sun of s.suns)if(!sun.taken){const x=sun.x+8,y=sun.y+8;ellipse(x,y,8,8,'#efcd74');ctx.fillStyle='#b6974e';ctx.fillRect(x-1,y-4,2,8);}
  for(const c of s.carrots)if(!c.taken)carrot(c.x+11,c.y+14);
  ctx.strokeStyle='#9b805a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(1140,330);ctx.lineTo(1140,267);ctx.stroke();ctx.fillStyle=s.checkpoint===1120?'#dfaa6d':'#e6dcc0';ctx.beginPath();ctx.moveTo(1142,269);ctx.lineTo(1172,278);ctx.lineTo(1142,289);ctx.fill();
  for(const e of s.enemies){ellipse(e.x+16,e.y+20,19,7,e.settled?'#b9b599':'#a0ad80');ellipse(e.x+13,e.y+10,12,12,e.settled?'#c1b694':'#b89881');ctx.strokeStyle='#826e59';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x+13,e.y+10,6,0,Math.PI*1.7);ctx.stroke();if(!e.settled){ctx.strokeStyle='#6b805c';ctx.beginPath();ctx.moveTo(e.x+27,e.y+18);ctx.lineTo(e.x+29,e.y+6);ctx.stroke();ellipse(e.x+29,e.y+6,2,2,'#456143');}}
  ctx.fillStyle='#e0be91';ctx.fillRect(2470,254,125,76);ctx.fillStyle='#b57868';ctx.beginPath();ctx.moveTo(2457,257);ctx.lineTo(2532,204);ctx.lineTo(2608,257);ctx.closePath();ctx.fill();ctx.fillStyle='#789e88';ctx.fillRect(2503,288,30,42);ctx.fillStyle='#d4e4d2';ctx.fillRect(2551,274,25,24);ctx.fillStyle='#f8edc9';ctx.fillRect(2478,263,74,18);ctx.fillStyle='#856d4f';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('CARROT PICNIC',2515,276);
  const p=s.player;ctx.save();ctx.translate(p.x+p.w/2,p.y+p.h);ctx.scale(p.facing,1);if(s.invulnerable>0)ctx.globalAlpha=.65;const scale=s.powered?1.14:1;ctx.scale(scale,scale);const stride=p.grounded?Math.sin(s.time*19)*3:0;ellipse(-6,-3,7,4,'#e5cdb0');ellipse(7,-3+stride*.3,7,4,'#e5cdb0');ellipse(0,-17,13,15,s.powered?'#e5b776':'#e5d7c2');ellipse(1,-34,12,11,'#f0e3cd');ellipse(-5,-48,4,13,'#f0e3cd');ellipse(7,-48,4,13,'#f0e3cd');ellipse(-5,-49,1.8,9,'#d9b5ac');ellipse(7,-49,1.8,9,'#d9b5ac');ellipse(7,-36,2,2.5,'#4e6250');ellipse(12,-31,2.5,2,'#c89086');ellipse(-13,-15,5,5,'#f4ead6');ctx.fillStyle=s.powered?'#c98454':'#7fa18c';ctx.fillRect(-9,-25,19,5);ctx.restore();ctx.restore();
  notice.hidden=!s.cleared;const noticeText=s.won?'You made it! Ruby brought sunshine to all three gardens. The Carrot Picnic can begin!':`You reached the ${BUNNY_STAGES[s.level-1]} cottage! Choose Next garden to continue.`;if(notice.textContent!==noticeText)notice.textContent=noticeText;
  if((!running||s.over)&&!s.cleared){ctx.fillStyle='#314f43e0';ctx.fillRect(0,145,600,120);ctx.fillStyle='#fff2d2';ctx.textAlign='center';ctx.font='600 26px sans-serif';ctx.fillText(s.over?'Ready for another hop?':started?'A little picnic break':'A bunny-sized adventure awaits',300,191);ctx.font='15px sans-serif';ctx.fillText(s.over?'Choose Play again':started?'Choose Resume adventure':'Choose Start adventure',300,229);}
  const value=`Garden ${s.level}/3 · Lives ${s.lives} · Score ${s.score} · ${s.powered?'Carrot-powered!':'Ruby Bunny'}${s.checkpoint===1120?' · Checkpoint ✓':''}${s.won?' · You win!':s.cleared?' · Garden complete':s.over?' · Game over':!running?started?' · Paused':' · Ready':''}`;if(value!==previous){status.textContent=value;previous=value;}
 }
 const help=document.createElement('p');help.className='snake-help';help.textContent='Move: ← → or A / D · Jump: Space / ↑ / W · Carrots power you up and protect against one bump. Hop on snails from above, jump ponds, and reach each picnic cottage. The flag saves your checkpoint.';
 const pauseHelp=document.createElement('p');pauseHelp.className='snake-help';pauseHelp.textContent='P pauses or resumes. Hold a direction and tap Jump on touch screens. Switching tabs pauses automatically.';
 function tick(time){if(disposed)return;const dt=Math.min((time-(last||time))/1000,.033);last=time;if(running&&!s.over&&!s.cleared){stepBunny(s,{left:leftKeys.some(k=>held.has(k)),right:rightKeys.some(k=>held.has(k)),jump:queuedJump},dt);queuedJump=false;if(s.over||s.cleared){running=false;reset();toggle.textContent=s.won||s.over?'Play again':'Next garden →';}}draw();frame=requestAnimationFrame(tick);}
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',pause);container.append(intro,canvas,notice,toggle,controls,help,pauseHelp);draw();frame=requestAnimationFrame(tick);
 return ()=>{disposed=true;cancelAnimationFrame(frame);reset();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',pause);};
}
