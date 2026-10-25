import {analyticsConfig} from './analytics-config.js';
import {analyticsDisabledReason} from './analytics.js';
const results=document.querySelector('#check-results'),button=document.querySelector('#run-check');
document.querySelector('#check-website').textContent=analyticsConfig.websiteId||'Not configured';
document.querySelector('#check-script').textContent=analyticsConfig.scriptUrl||'Not configured';
document.querySelector('#check-host').textContent=location.hostname;
function report(text){const li=document.createElement('li');li.textContent=text;results.append(li);}
function timeout(promise,ms,message){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),ms);})]).finally(()=>clearTimeout(timer));}
button.addEventListener('click',async()=>{
 button.disabled=true;results.replaceChildren();let restore=()=>{},script;
 try{
  const reason=analyticsDisabledReason(analyticsConfig);if(reason){report(reason);return;}
  report('Configuration is enabled; this browser’s privacy settings allow the check.');
  const originalFetch=window.fetch;let receive;
  const observed=new Promise(resolve=>{receive=resolve;});
  window.fetch=async function(resource,options){
   let own=false;try{const body=JSON.parse(options?.body);own=body.type==='event'&&body.payload?.website===analyticsConfig.websiteId&&body.payload?.name==='analytics_check';}catch{}
   try{const response=await originalFetch.call(this,resource,options);if(own){let body=null;try{body=await response.clone().json();}catch{}receive({status:response.status,ok:response.ok,disabled:body?.disabled===true,ignored:body?.beep==='boop',message:typeof body?.message==='string'?body.message.slice(0,200):''});}return response;}
   catch(error){if(own)receive({networkError:true});throw error;}
  };
  const wrapped=window.fetch;restore=()=>{if(window.fetch===wrapped)window.fetch=originalFetch;};
  if(!window.umami?.track){
   script=document.createElement('script');script.src=analyticsConfig.scriptUrl;script.setAttribute('data-website-id',analyticsConfig.websiteId);script.setAttribute('data-auto-track','false');script.setAttribute('data-do-not-track','true');
   const loaded=new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=()=>reject(new Error('The Umami script could not load. Check browser extensions, network filtering, and access to cloud.umami.is.'));});document.head.append(script);
   await timeout(loaded,10000,'The Umami script did not finish loading within 10 seconds. Check network filtering and browser extensions.');
  }
  if(!window.umami?.track)throw new Error('The script loaded but its tracking API is unavailable. Check the browser console for script errors.');
  report('Umami’s tracking script loaded successfully. Sending a test event…');
  const path=location.pathname;
  Promise.resolve(window.umami.track(payload=>({...payload,url:path,title:'Analytics check',referrer:'',name:'analytics_check',data:{source:'owner_diagnostics'}}))).catch(()=>receive({networkError:true}));
  const response=await timeout(observed,10000,'The tracker loaded, but no test request reached the network. Check browser privacy settings, the umami.disabled local setting, and the browser console.');
  if(response.networkError)throw new Error('The tracker loaded, but its collection request failed. A network filter, DNS filter, browser extension, or CORS error may be blocking Umami’s collection endpoint.');
  if(!response.ok)throw new Error(`Umami rejected the test with HTTP ${response.status}.${response.message?' '+response.message:''} Check that the website ID belongs to the selected Umami account and that the website is active.`);
  if(response.disabled)throw new Error('Umami responded but disabled tracking. Check the website status, traffic limits, and exclusions in your Umami account.');
  if(response.ignored)throw new Error('Umami responded but ignored this traffic, for example because of bot detection or an exclusion.');
  report(`Umami’s collection endpoint responded successfully (HTTP ${response.status}). Now check Realtime for analytics_check; a successful HTTP response alone does not confirm that the event appears in your dashboard.`);
 }catch(error){report(error.message||'The analytics check failed.');}
 finally{restore();button.disabled=false;if(script&&!window.umami?.track)script.remove();}
});
