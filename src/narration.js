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
