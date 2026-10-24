export const PUZZLE_COLS=10,PUZZLE_ROWS=5,PIECE_SIZE=60;
const seam=(col,row)=>((col*7+row*11)%3===0?1:-1);
export function pieceEdges(id){const col=id%10,row=Math.floor(id/10);return {top:row===0?0:-seam(col,row-1),right:col===9?0:seam(col+20,row),bottom:row===4?0:seam(col,row),left:col===0?0:-seam(col+19,row)};}
export function piecePath(id){
 const e=pieceEdges(id);let path='M0 0';
 function edge(sign,side){const convert=(x,y)=>side===0?[x,y]:side===1?[60-y,x]:side===2?[60-x,60-y]:[y,60-x];const p=(x,y)=>convert(x,y).join(' ');
  if(!sign){path+=`L${p(60,0)}`;return;}
  path+=`L${p(21,0)}C${p(27,0)} ${p(22,-11*sign)} ${p(30,-11*sign)}C${p(38,-11*sign)} ${p(33,0)} ${p(39,0)}L${p(60,0)}`;
 }
 [e.top,e.right,e.bottom,e.left].forEach(edge);return path+'Z';
}
export function newJigsaw(random=Math.random){const order=Array.from({length:50},(_,id)=>id);for(let i=49;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}return {order,placed:[],selected:null};}
export function placeJigsaw(state,slot){if(state.selected===null||state.selected!==slot||state.placed.includes(slot))return state;return {...state,placed:[...state.placed,slot],selected:null};}
