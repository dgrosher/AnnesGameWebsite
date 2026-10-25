import {newJigsaw,placeJigsaw,piecePath} from './jigsaw-logic.js';
const gardenUrl=new URL('../assets/amis-garden.svg',import.meta.url).href;
let instance=0;
export function mountJigsaw(container,status){
 const uid=++instance;let state=newJigsaw();let page=0,edgesOnly=false,preview=false,zoom=false,message='Choose a piece, then tap its home on the board—or drag it there!';let drag=null,ghost=null,skipClick=false,disposed=false;
 function pieceSvg(id,key){const col=id%10,row=Math.floor(id/10);const clip=`puzzle-${uid}-${key}-${id}`;return `<svg viewBox="-12 -12 84 84" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><clipPath id="${clip}"><path d="${piecePath(id)}"/></clipPath></defs><image href="${gardenUrl}" x="${-col*60}" y="${-row*60}" width="600" height="300" clip-path="url(#${clip})"/><path d="${piecePath(id)}" fill="none" stroke="#6f74557a" stroke-width=".8"/></svg>`;}
 function cancelDrag(){ghost?.remove();ghost=null;drag=null;}
 function place(slot){const next=placeJigsaw(state,slot);if(next===state){message='Not quite this spot. Your piece is still selected—try another!';}else{state=next;message=state.placed.length===50?'You did it, Ami! All 50 pieces make one beautiful garden.':'A perfect fit! Choose your next piece.';}render();}
 function pointermove(e){if(!drag||e.pointerId!==drag.pointer)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<7&&!ghost)return;if(!ghost){ghost=document.createElement('div');ghost.className='jigsaw-drag';ghost.innerHTML=pieceSvg(drag.id,'drag');document.body.append(ghost);}ghost.style.left=`${e.clientX}px`;ghost.style.top=`${e.clientY}px`;e.preventDefault();}
 function pointerup(e){if(!drag||e.pointerId!==drag.pointer)return;const moved=!!ghost,id=drag.id;cancelDrag();if(!moved)return;skipClick=true;setTimeout(()=>{skipClick=false;},0);state={...state,selected:id};const board=container.querySelector('.jigsaw-board');const rect=board.getBoundingClientRect();if(e.clientX>=rect.left&&e.clientX<rect.right&&e.clientY>=rect.top&&e.clientY<rect.bottom){const col=Math.floor((e.clientX-rect.left)/rect.width*10),row=Math.floor((e.clientY-rect.top)/rect.height*5);place(row*10+col);}else{message='Piece selected. Tap its spot on the board to place it.';render();}}
 function button(text,handler,disabled=false){const b=document.createElement('button');b.className='small-button';b.textContent=text;b.disabled=disabled;b.addEventListener('click',handler);return b;}
 function render(){
  if(disposed)return;container.replaceChildren();status.textContent=`${state.placed.length} / 50 pieces placed${state.placed.length===50?' · Complete!':''}`;
  const tools=document.createElement('div');tools.className='jigsaw-tools';tools.append(button(preview?'Hide picture':'Show picture',()=>{preview=!preview;render();}),button(zoom?'Fit board':'Enlarge board',()=>{zoom=!zoom;render();}));
  const filter=button(edgesOnly?'Show all pieces':'Edge pieces only',()=>{edgesOnly=!edgesOnly;page=0;render();});filter.setAttribute('aria-pressed',edgesOnly);tools.append(filter);container.append(tools);
  if(preview){const image=document.createElement('img');image.src=gardenUrl;image.alt='The completed garden: colorful flower beds, an apple tree, a cottage, butterflies, a pond, and a watering can.';image.className='jigsaw-preview';container.append(image);}
  const scroll=document.createElement('div');scroll.className='jigsaw-scroll';scroll.setAttribute('aria-label','Puzzle board. Scroll sideways when enlarged.');scroll.tabIndex=0;
  const board=document.createElement('div');board.className=`jigsaw-board${zoom?' enlarged':''}`;board.setAttribute('role','group');board.setAttribute('aria-label','50-piece garden puzzle board, 10 columns and 5 rows');
  for(let slot=0;slot<50;slot++){
   const b=document.createElement('button');b.className='jigsaw-slot';const done=state.placed.includes(slot);b.setAttribute('aria-label',`Row ${Math.floor(slot/10)+1}, column ${slot%10+1}${done?', piece placed':''}`);b.disabled=done;b.addEventListener('click',()=>{if(state.selected===null){message='Pick a piece from the tray first.';render();}else place(slot);});
   if(done){b.classList.add('placed');b.innerHTML=pieceSvg(slot,'board');}board.append(b);
  }scroll.append(board);container.append(scroll);
  const note=document.createElement('p');note.className='jigsaw-note';note.setAttribute('role','status');note.textContent=message;container.append(note);
  if(state.placed.length===50){const celebration=document.createElement('div');celebration.className='jigsaw-finished';celebration.textContent='✿ A garden grown with patience, one piece at a time. ✿';container.append(celebration);return;}
  const heading=document.createElement('h3');heading.className='jigsaw-tray-heading';heading.textContent=state.selected===null?'Your puzzle pieces':`Piece ${state.selected+1} selected · find its place`;
  const remaining=state.order.filter(id=>!state.placed.includes(id)&&(!edgesOnly||id<10||id>=40||id%10===0||id%10===9));const pages=Math.max(1,Math.ceil(remaining.length/10));page=Math.min(page,pages-1);
  const tray=document.createElement('div');tray.className='jigsaw-tray';tray.setAttribute('role','group');tray.setAttribute('aria-label','Puzzle piece tray');remaining.slice(page*10,page*10+10).forEach(id=>{
   const b=document.createElement('button');b.className=`jigsaw-piece${state.selected===id?' selected':''}`;b.setAttribute('aria-label',`Select piece ${id+1}`);b.setAttribute('aria-pressed',state.selected===id);b.innerHTML=pieceSvg(id,'tray');
   b.addEventListener('click',event=>{if(skipClick)return;state={...state,selected:id};message='Piece selected! Tap a spot on the board or drag the piece.';render();if(event.detail===0)container.querySelector('.jigsaw-slot:not(:disabled)')?.focus({preventScroll:true});});
   b.addEventListener('pointerdown',e=>{if(e.button!==0)return;b.setPointerCapture(e.pointerId);drag={id,pointer:e.pointerId,x:e.clientX,y:e.clientY};});tray.append(b);
  });container.append(heading,tray);
  if(!remaining.length){const empty=document.createElement('p');empty.className='jigsaw-note';empty.textContent='All edge pieces are placed! Choose “Show all pieces” for the middle.';container.append(empty);}
  const nav=document.createElement('div');nav.className='jigsaw-pagination';const info=document.createElement('span');info.textContent=`Tray ${page+1} / ${pages}`;nav.append(button('← Pieces',()=>{page--;render();},page===0),info,button('More pieces →',()=>{page++;render();},page===pages-1));container.append(nav);
  const help=document.createElement('p');help.className='snake-help';help.textContent='No timer, no rush. Pieces are already the right way up. Tap a piece, then a board square; you can also drag. Keyboard: Tab to a piece, press Enter, then choose a board square. Enlarge the board for bigger spaces.';container.append(help);
 }
 function pointercancel(){cancelDrag();}
 document.addEventListener('pointermove',pointermove,{passive:false});document.addEventListener('pointerup',pointerup);document.addEventListener('pointercancel',pointercancel);render();
 return ()=>{disposed=true;cancelDrag();document.removeEventListener('pointermove',pointermove);document.removeEventListener('pointerup',pointerup);document.removeEventListener('pointercancel',pointercancel);};
}
