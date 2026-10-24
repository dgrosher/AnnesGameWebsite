export function createAnalytics(config,env=globalThis){
 const noop={page(){},game(){},restart(){}};
 const host=env.location?.hostname||'';
 if(!config?.enabled||!config.websiteId||!config.scriptUrl||!host||['localhost','127.0.0.1','[::1]'].includes(host)||env.navigator?.doNotTrack==='1'||env.navigator?.globalPrivacyControl===true)return noop;
 let scriptUrl;
 try{scriptUrl=new URL(config.scriptUrl);if(scriptUrl.protocol!=='https:'||scriptUrl.username||scriptUrl.password)return noop;}catch{return noop;}
 const queue=[];let loaded=false,failed=false;let current={path:env.location.pathname,title:'Anne’s Arcade'};
 const base=env.location.pathname.replace(/\/index\.html$/,'/').replace(/\/$/,'');
 function referrer(){try{const url=new URL(env.document.referrer);return url.origin+url.pathname;}catch{return '';}}
 function send(item){
  try{env.umami.track(props=>({...props,url:item.path,title:item.title,referrer:referrer(),...(item.event?{name:item.event,data:item.data}:{})}));}catch{/* Analytics must never stop a game. */}
 }
 function record(item){if(failed)return;if(loaded&&typeof env.umami?.track==='function')send(item);else{if(queue.length===50)queue.shift();queue.push(item);}}
 const script=env.document.createElement('script');script.src=scriptUrl.href;script.defer=true;
 script.setAttribute('data-website-id',config.websiteId);script.setAttribute('data-auto-track','false');script.setAttribute('data-do-not-track','true');
 script.addEventListener('load',()=>{if(typeof env.umami?.track!=='function'){failed=true;queue.length=0;return;}loaded=true;queue.splice(0).forEach(send);});
 script.addEventListener('error',()=>{failed=true;queue.length=0;});
 try{env.document.head.append(script);}catch{return noop;}
 function page(path,title){current={path:`${base}/${path}`.replace(/\/$/,'/'),title};record({...current});}
 return {
  page,
  game(id,title){page(`games/${encodeURIComponent(id)}`,title);record({...current,event:'game_open',data:{game_id:id,game_name:title}});},
  restart(id,title){record({...current,event:'game_restart',data:{game_id:id,game_name:title}});}
 };
}
