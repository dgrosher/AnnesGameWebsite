const preferenceKey='annes-arcade-narration';
export function englishVoices(voices) {
 return voices.filter(v=>/^en(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>voiceScore(b)-voiceScore(a)||a.name.localeCompare(b.name));
}
function voiceScore(voice) {
 const name=voice.name.toLowerCase();
 return (/natural|neural/.test(name)?100:0)+(/enhanced|premium/.test(name)?70:0)+(/google|online/.test(name)?40:0)+(/samantha|ava|allison|susan|serena/.test(name)?20:0)+(voice.default?5:0)+(/^en[-_]us$/i.test(voice.lang)?2:0);
}
export function chooseNarrator(voices,preferred='') {
 const available=englishVoices(voices);
 return available.find(v=>v.voiceURI===preferred)||available[0]||null;
}
export function loadNarrationPreferences() {
 try {const saved=JSON.parse(localStorage.getItem(preferenceKey));return {voice:typeof saved?.voice==='string'?saved.voice:'',rate:[.85,.96,1.05].includes(saved?.rate)?saved.rate:.96};}
 catch{return {voice:'',rate:.96};}
}
export function saveNarrationPreferences(preferences) {
 try{localStorage.setItem(preferenceKey,JSON.stringify(preferences));}catch{/* Reading still works when storage is unavailable. */}
}

// Keep the utterance alive and recover when a network voice cannot start.
export function createNarrationPlayer({synth,Utterance,startTimeout=5000}) {
 let generation=0,currentUtterance=null,watchdog=null,retry=null;
 function clear(){clearTimeout(watchdog);clearTimeout(retry);watchdog=null;retry=null;}
 function stop(){generation++;clear();const busy=!!currentUtterance||synth.speaking||synth.pending;currentUtterance=null;if(busy)synth.cancel();}
 function play(text,{voice=null,rate=.96,onStart=()=>{},onEnd=()=>{},onError=()=>{},onFallback=()=>{}}={}) {
  stop();const session=generation;
  const local=englishVoices(synth.getVoices()).filter(v=>v.localService&&v.voiceURI!==voice?.voiceURI).slice(0,1);
  const candidates=voice?[voice,...local,null]:[...local,null];let index=0,attempt=0;
  function run(){
   if(session!==generation)return;const id=++attempt;const selected=candidates[index];let finished=false;
   const utterance=new Utterance(text);currentUtterance=utterance;utterance.lang=selected?.lang||'en-US';utterance.rate=rate;utterance.volume=1;if(selected)utterance.voice=selected;
   function valid(){return session===generation&&id===attempt&&!finished;}
   function fail(error){
    if(!valid())return;finished=true;clearTimeout(watchdog);watchdog=null;
    if(index<candidates.length-1){index++;onFallback();retry=setTimeout(()=>{if(session!==generation)return;synth.cancel();run();},0);}
    else{currentUtterance=null;synth.cancel();onError(error);}
   }
   utterance.onstart=()=>{if(!valid())return;clearTimeout(watchdog);watchdog=null;onStart();};
   utterance.onend=()=>{if(!valid())return;finished=true;clearTimeout(watchdog);watchdog=null;currentUtterance=null;onEnd();};
   utterance.onerror=event=>fail(event.error||'voice-unavailable');
   watchdog=setTimeout(()=>fail('voice-did-not-start'),startTimeout);
   try{if(synth.paused)synth.resume();synth.speak(utterance);}catch{fail('voice-unavailable');}
  }
  run();
 }
 return {play,stop,get utterance(){return currentUtterance;}};
}
