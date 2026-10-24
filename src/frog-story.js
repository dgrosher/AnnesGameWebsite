export const frogPages = [
  {text:'Finn the Frog dreamed of a treehouse beside the pond.', scene:'dream', alt:'Finn the green frog looks up at a big oak tree beside a blue pond.', find:[510,100]},
  {text:'His friends Ruby Rabbit and Bea Bear came to help him build it.', scene:'friends', alt:'Ruby Rabbit and Bea Bear join Finn beneath the tree with a basket of supplies.', find:[95,100]},
  {text:'Together, they drew a plan with a window, a ladder, and a little red roof.', scene:'plan', alt:'The three friends study a drawing of a treehouse with a window, ladder, and red roof.', find:[530,200]},
  {text:'Bea measured the boards while Ruby held them steady for Finn.', scene:'build', alt:'Bea measures a plank while Ruby and Finn work together on the ground.', find:[120,75]},
  {text:'Soon their cozy treehouse was ready, with a sturdy ladder and a sunny window.', scene:'house', alt:'The finished wooden treehouse sits in the oak tree with a red roof and a ladder.', find:[530,65]},
  {text:'To celebrate, Finn ate three crunchy tacos with his friends.', scene:'tacos', alt:'Finn, Ruby, and Bea enjoy three tacos on a picnic blanket beneath their treehouse.', find:[90,180]},
  {text:'After lunch, Finn climbed up to hang a welcome sign on the treehouse.', scene:'sign', alt:'Finn stands in the treehouse doorway holding a welcome sign as his friends watch below.', find:[525,260]},
  {text:'But Finn lost his balance and fell from the treehouse onto the grass.', scene:'fall', alt:'Finn has landed on the soft grass below the treehouse, surprised and holding his arm; there is no blood.', find:[95,70]},
  {text:'His arm hurt, so Ruby stayed beside him while Bea called a grown-up for help.', scene:'help', alt:'Ruby comforts Finn on the grass while Bea uses a phone to call for help.', find:[530,100]},
  {text:'At the clinic, Doctor Owl took an X-ray and found that Finn had broken his arm.', scene:'doctor', alt:'Doctor Owl shows Finn and his friends a simple arm X-ray in a cheerful clinic.', find:[75,70]},
  {text:'Doctor Owl gently put a bright blue cast on Finn’s arm to help it heal.', scene:'cast', alt:'Finn smiles at his new blue arm cast while Doctor Owl explains how to rest.', find:[530,75]},
  {text:'Ruby signed the cast with a heart, and Bea added a star and his name.', scene:'signcast', alt:'Ruby and Bea decorate Finn’s blue cast with a pink heart, a gold star, and their names.', find:[80,180]},
  {text:'While Finn rested, his friends brought him books, games, and one more tasty taco.', scene:'rest', alt:'Finn rests on a cushion with his blue cast while his friends bring a book and a taco.', find:[535,100]},
  {text:'When his arm healed, Finn and his friends added a railing and enjoyed their treehouse together.', scene:'ending', alt:'With his arm healed, Finn joins Ruby and Bea in their treehouse behind a new wooden railing.', find:[100,80]}
];
const face=(x,y,kind='frog',cast=false)=>{
 const color={frog:'#79ab62',rabbit:'#f2e5d0',bear:'#b98155',owl:'#b0a38b'}[kind];
 const ears=kind==='rabbit'?`<ellipse cx="${x-18}" cy="${y-66}" rx="10" ry="30" fill="${color}"/><ellipse cx="${x+18}" cy="${y-66}" rx="10" ry="30" fill="${color}"/>`:kind==='bear'?`<circle cx="${x-30}" cy="${y-31}" r="15" fill="${color}"/><circle cx="${x+30}" cy="${y-31}" r="15" fill="${color}"/>`:kind==='frog'?`<circle cx="${x-23}" cy="${y-29}" r="17" fill="${color}"/><circle cx="${x+23}" cy="${y-29}" r="17" fill="${color}"/>`:'';
 return `<g stroke="#405841" stroke-width="2.5" stroke-linecap="round">${ears}<ellipse cx="${x}" cy="${y+43}" rx="36" ry="43" fill="${color}"/><ellipse cx="${x}" cy="${y+48}" rx="23" ry="29" fill="#fff3ce" stroke="none"/><ellipse cx="${x}" cy="${y}" rx="41" ry="34" fill="${color}"/><circle cx="${x-15}" cy="${y-7}" r="4" fill="#324e3b" stroke="none"/><circle cx="${x+15}" cy="${y-7}" r="4" fill="#324e3b" stroke="none"/><path d="M${x-12} ${y+10} Q${x} ${y+21} ${x+12} ${y+10}" fill="none"/><path d="M${x-23} ${y+29}l-22 25M${x+23} ${y+29}l22 25"/>${cast?`<rect x="${x+10}" y="${y+30}" width="42" height="23" rx="8" fill="#78bada"/><path d="M${x+15} ${y+31}L${x-12} ${y+10}" stroke="#f5f0df" stroke-width="5"/>`:''}</g>`;
};
const taco=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-27 0Q0-45 27 0Z" fill="#75a459"/><path d="M-27 0Q0-35 27 0" stroke="#d96b48" stroke-width="7" fill="none"/><path d="M-29 0Q0 42 29 0Z" fill="#efc267" stroke="#b88a3e" stroke-width="2"/><path d="M-15 7l3 3m13 5 3 2m9-10 3 2" stroke="#cb9b49" stroke-width="3"/></g>`;
function tree(house=false,rail=false) {
 return `<path d="M330 330L335 130 295 95M340 190L395 130" fill="none" stroke="#a67d50" stroke-width="45"/><g fill="#86a66a"><circle cx="280" cy="80" r="70"/><circle cx="365" cy="65" r="78"/><circle cx="430" cy="100" r="64"/><circle cx="335" cy="125" r="70"/></g>${house?`<rect x="285" y="115" width="156" height="99" rx="5" fill="#deb778" stroke="#936c43" stroke-width="3"/><path d="M270 119L360 55 455 119Z" fill="#c96d54" stroke="#955a42" stroke-width="3"/><path d="M285 145H441M285 169H441M285 193H441" stroke="#c69b60" stroke-width="2"/><rect x="305" y="136" width="34" height="35" rx="4" fill="#d5e8e1" stroke="#936c43" stroke-width="3"/><rect x="366" y="144" width="40" height="70" rx="17" fill="#8f714d"/><path d="M358 216L330 330M386 216L358 330M353 238H380M347 262H374M341 286H368M335 310H362" fill="none" stroke="#9a754b" stroke-width="6"/>${rail?'<path d="M278 207H449M282 188H445M287 188V221M320 188V221M353 188V221M386 188V221M419 188V221M441 188V221" stroke="#795d3e" stroke-width="5"/>':''}`:''}`;
}
export function frogPicture(page) {
 const scene=page.scene;const clinic=['doctor','cast'].includes(scene);const hasHouse=['house','tacos','sign','fall','help','ending'].includes(scene);
 let art='';
 if(scene==='dream') art=face(160,243)+`<path d="M175 190Q180 130 230 135" fill="none" stroke="#fffdf2" stroke-width="8" stroke-dasharray="6 9"/><path d="M210 120L245 93 280 120V156H210Z" fill="#fffdf2"/><path d="M208 120L245 90 282 120" fill="none" stroke="#cc7b5e" stroke-width="5"/>`;
 if(scene==='friends') art=face(150,245)+face(265,245,'rabbit')+face(465,245,'bear')+'<rect x="45" y="282" width="65" height="35" rx="8" fill="#d7ae73"/>';
 if(scene==='plan'||scene==='build') art=face(105,235)+face(250,235,'rabbit')+face(490,235,'bear')+(scene==='plan'?'<rect x="155" y="245" width="260" height="85" rx="7" fill="#fff9e5" stroke="#b8a984" stroke-width="3"/><path d="M245 303V277L285 253 325 277V303ZM236 279L285 249 335 279M270 302V280H286V302M317 302V325M333 302V325M317 312H333" stroke="#6c8b93" stroke-width="3" fill="none"/>':'<rect x="160" y="281" width="275" height="20" rx="5" fill="#ddb778"/><path d="M175 280V300m20-20v10m20-10v20m20-20v10m20-10v20m20-20v10m20-10v20" stroke="#9b784a" stroke-width="2"/>');
 if(scene==='house') art=face(155,245)+face(485,245,'rabbit');
 if(scene==='tacos') art='<path d="M55 270H290L320 340H35Z" fill="#e9af99"/>'+face(100,210)+face(210,210,'rabbit')+face(495,245,'bear')+taco(80,295)+taco(165,295)+taco(250,295);
 if(scene==='sign') art=`<g transform="translate(270 30) scale(.55)">${face(200,205)}</g><rect x="328" y="180" width="105" height="27" rx="4" fill="#fff0c5" stroke="#96754f"/><text x="380" y="198" text-anchor="middle" font-size="12" fill="#72593c">WELCOME</text>`+face(130,250,'rabbit')+face(505,250,'bear');
 if(scene==='fall') art=face(185,255)+'<path d="M228 290l-13-15m15-5-8 4" stroke="#cf8a65" stroke-width="3"/><path d="M135 220l-8-10m-4 25-12-2" stroke="#c39b51" stroke-width="3"/>';
 if(scene==='help') art=face(175,250)+face(80,245,'rabbit')+face(490,245,'bear')+'<rect x="518" y="220" width="21" height="34" rx="4" fill="#556c67"/><rect x="522" y="224" width="13" height="23" rx="2" fill="#c5e4da"/>';
 if(scene==='doctor') art=face(180,245)+face(450,245,'owl')+'<rect x="267" y="93" width="95" height="132" rx="7" fill="#466375" stroke="#fffdf5" stroke-width="8"/><path d="M304 113L312 167 339 205M319 112L327 162 351 197" fill="none" stroke="#c3d9df" stroke-width="7"/><path d="M313 148l13 6-11 8" fill="none" stroke="#e8b78c" stroke-width="3"/>';
 if(scene==='cast') art=face(205,235,'frog',true)+face(425,235,'owl')+'<path d="M290 150q25-40 45 0q-23 30-45 0" fill="#d78e83"/>';
 if(scene==='signcast') art=face(125,235,'rabbit')+face(300,235,'frog',true)+face(470,235,'bear')+'<path d="M169 277L319 273M426 277L345 278" stroke="#b88052" stroke-width="6"/><rect x="225" y="300" width="150" height="30" rx="10" fill="#8fc6e2"/><text x="300" y="320" text-anchor="middle" font-size="16" fill="#6a507c">Ruby ♥  Bea ★</text>';
 if(scene==='rest') art='<rect x="140" y="253" width="185" height="73" rx="25" fill="#e5b889"/>'+face(225,230,'frog',true)+face(100,245,'rabbit')+face(450,245,'bear')+'<path d="M350 275Q375 265 400 280V325Q375 311 350 320ZM400 280Q425 265 448 275V320Q425 311 400 325Z" fill="#fdf4d8" stroke="#ac9765" stroke-width="2"/>'+taco(115,310);
 if(scene==='ending') art=`<g transform="translate(243 80) scale(.42)">${face(130,165,'rabbit')+face(265,165)+face(400,165,'bear')}</g><path d="M278 207H449M282 188H445M287 188V221M320 188V221M353 188V221M386 188V221M419 188V221M441 188V221" stroke="#795d3e" stroke-width="5"/>`;
 return `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="600" height="360" rx="18" fill="${clinic?'#e8e2d1':'#dcebe2'}"/>${clinic?'<rect x="55" y="40" width="105" height="105" rx="8" fill="#f8f4e4"/><path d="M105 61V123M74 92H136" stroke="#b3c6af" stroke-width="18"/>':'<circle cx="80" cy="65" r="30" fill="#f0d58c"/><path d="M0 275Q140 220 300 275T600 265V360H0Z" fill="#b7cd96"/><ellipse cx="450" cy="332" rx="125" ry="20" fill="#9ec5ca"/>'+tree(hasHouse,scene==='ending')}<path d="M0 341Q200 325 600 344V360H0Z" fill="${clinic?'#c5c6ad':'#a6bd84'}"/>${art}</svg>`;
}
export function mountFrogStory(container,status) {
 let index=0;let all=false;let active=false;let disposed=false;let token=0;let timer;let found=new Set();let collected=false;
 const synth=globalThis.speechSynthesis;const supported=!!synth&&typeof globalThis.SpeechSynthesisUtterance==='function';
 function stop(){token++;clearTimeout(timer);if(active)synth?.cancel();active=false;}
 function speak(){
  stop();if(!supported)return;const id=token;const utterance=new SpeechSynthesisUtterance(frogPages[index].text);utterance.lang='en-US';utterance.rate=.82;
  const voices=synth.getVoices();const voice=voices.find(v=>v.lang.startsWith('en')&&v.localService)||voices.find(v=>v.lang.startsWith('en'));if(voice)utterance.voice=voice;
  active=true;render();
  utterance.onend=()=>{if(disposed||id!==token)return;active=false;if(all&&index<frogPages.length-1)timer=setTimeout(()=>{if(disposed||id!==token)return;index++;render();speak();},900);else{all=false;render();}};
  utterance.onerror=event=>{if(disposed||id!==token)return;active=false;all=false;render();if(!['canceled','interrupted'].includes(event.error))container.querySelector('.speech-note').textContent='Your browser could not play the voice; you can still read and explore every picture.';};
  synth.speak(utterance);
 }
 function go(next){stop();all=false;index=next;render();container.querySelector('.frog-sentence').focus({preventScroll:true});}
 function render(){
  const page=frogPages[index];container.replaceChildren();status.textContent=`Page ${index+1} of ${frogPages.length} · ${found.size} fireflies found`;
  const figure=document.createElement('div');figure.className='frog-picture';
  const picture=document.createElement('div');picture.setAttribute('role','img');picture.setAttribute('aria-label',page.alt);picture.innerHTML=frogPicture(page);figure.append(picture);
  const fly=document.createElement('button');fly.className=`firefly ${found.has(index)?'caught':''}`;fly.style.left=`${page.find[0]/6}%`;fly.style.top=`${page.find[1]/3.6}%`;fly.textContent=found.has(index)?'★':'✧';fly.setAttribute('aria-label',found.has(index)?'Firefly found':'Find the glowing firefly');fly.disabled=found.has(index);fly.addEventListener('click',()=>{found.add(index);collected=true;render();});figure.append(fly);
  const sentence=document.createElement('p');sentence.className='frog-sentence';sentence.tabIndex=-1;sentence.textContent=page.text;
  const controls=document.createElement('div');controls.className='frog-controls';
  function button(label,handler,disabled=false){const b=document.createElement('button');b.className='small-button';b.textContent=label;b.disabled=disabled;b.addEventListener('click',handler);return b;}
  controls.append(button('← Back',()=>go(index-1),index===0),button(active?'Stop reading':'Read to me',()=>{if(active){stop();all=false;render();}else{all=false;speak();}},!supported),button(all?'Stop story':'Read whole story',()=>{if(all){all=false;stop();render();}else{all=true;speak();}},!supported),button(index===frogPages.length-1?'Read again ↻':'Next →',()=>go(index===frogPages.length-1?0:index+1)));
  const note=document.createElement('p');note.className='speech-note';note.textContent=supported?'Choose “Read to me” for this page, or “Read whole story” to turn pages automatically.':'Read-aloud isn’t available in this browser; every page is still here to read together.';
  const hunt=document.createElement('p');hunt.className='frog-hunt';hunt.setAttribute('role','status');hunt.textContent=found.size===frogPages.length?'You found every firefly! A whole sky of friendship stars.':collected&&found.has(index)?'You found this page’s firefly!':'Picture game: find and tap the little glowing firefly on each page.';collected=false;
  container.append(figure,sentence,controls,note,hunt);
  if(index===frogPages.length-1){const end=document.createElement('p');end.className='story-ending';end.textContent='The end · Good friends help us build, heal, and try again.';container.append(end);}
 }
 render();return ()=>{disposed=true;all=false;stop();};
}
