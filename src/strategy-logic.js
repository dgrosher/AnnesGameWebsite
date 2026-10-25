export const CONNECT_ROWS=6,CONNECT_COLS=7;
export function newGardenFour(difficulty='medium'){return {board:Array.from({length:6},()=>Array(7).fill(0)),turn:1,winner:null,line:[],last:null,difficulty};}
export function gardenFourWinner(board){for(let r=0;r<6;r++)for(let c=0;c<7;c++)if(board[r][c])for(const [dr,dc]of [[0,1],[1,0],[1,1],[1,-1]]){const line=Array.from({length:4},(_,i)=>[r+dr*i,c+dc*i]);if(line.every(([y,x])=>y>=0&&y<6&&x>=0&&x<7&&board[y][x]===board[r][c]))return {winner:board[r][c],line};}return null;}
export function gardenFourMove(state,column){if(state.winner!==null||!Number.isInteger(column)||column<0||column>6||state.board[0][column])return state;const board=state.board.map(row=>[...row]);let row=5;while(board[row][column])row--;board[row][column]=state.turn;const found=gardenFourWinner(board),draw=board[0].every(Boolean);return {...state,board,turn:3-state.turn,last:[row,column],winner:found?.winner??(draw?0:null),line:found?.line||[]};}
const ordered=[3,2,4,1,5,0,6];
function evaluate(board){let score=0;for(let r=0;r<6;r++)score+=board[r][3]===2?4:board[r][3]===1?-4:0;for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const [dr,dc]of [[0,1],[1,0],[1,1],[1,-1]]){const cells=Array.from({length:4},(_,i)=>[r+dr*i,c+dc*i]);if(!cells.every(([y,x])=>y>=0&&y<6&&x>=0&&x<7))continue;const values=cells.map(([y,x])=>board[y][x]),cpu=values.filter(v=>v===2).length,human=values.filter(v=>v===1).length;if(!human)score+=[0,1,7,70,100000][cpu];if(!cpu)score-=[0,1,8,85,100000][human];}return score;}
export function chooseGardenFour(state,random=Math.random){
 const legal=ordered.filter(c=>!state.board[0][c]);if(!legal.length||state.winner!==null)return null;
 if(state.difficulty==='easy')return legal[Math.floor(random()*legal.length)];
 for(const who of [2,1])for(const c of legal)if(gardenFourMove({...state,turn:who},c).winner===who)return c;
 if(state.difficulty==='medium')return legal[0];
 function search(s,depth,alpha,beta){if(s.winner===2)return 100000+depth;if(s.winner===1)return -100000-depth;if(s.winner===0)return 0;if(!depth)return evaluate(s.board);const maximize=s.turn===2;let value=maximize?-Infinity:Infinity;for(const c of ordered)if(!s.board[0][c]){const score=search(gardenFourMove(s,c),depth-1,alpha,beta);value=maximize?Math.max(value,score):Math.min(value,score);if(maximize)alpha=Math.max(alpha,value);else beta=Math.min(beta,value);if(beta<=alpha)break;}return value;}
 let best=legal[0],score=-Infinity;for(const c of legal){const value=search(gardenFourMove({...state,turn:2},c),4,-Infinity,Infinity);if(value>score){score=value;best=c;}}return best;
}
