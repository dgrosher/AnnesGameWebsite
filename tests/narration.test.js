import test from 'node:test';
import assert from 'node:assert/strict';
import {englishVoices,chooseNarrator,loadNarrationPreferences} from '../src/narration.js';
const voice=(name,lang='en-US',localService=true)=>({name,lang,localService,voiceURI:name});
test('narration prefers natural voices over first local voice and filters other languages',()=>{
 const robot=voice('Basic');const natural=voice('Microsoft Aria Online Natural','en-US',false);
 const voices=[robot,voice('French Natural','fr-FR'),voice('Samantha Enhanced'),natural];
 assert.equal(chooseNarrator(voices),natural);assert.equal(englishVoices(voices).length,3);
 assert.equal(chooseNarrator(voices,robot.voiceURI),robot);
});
test('narration handles late, missing, and changed voices',()=>{
 assert.equal(chooseNarrator([]),null);assert.equal(chooseNarrator([voice('French','fr-FR')]),null);
 const replacement=voice('Google US English');assert.equal(chooseNarrator([replacement],'Removed voice'),replacement);
 assert.deepEqual(loadNarrationPreferences(),{voice:'',rate:.96});
});

import {createNarrationPlayer} from '../src/narration.js';
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function speechMock(){
 const synth={paused:true,spoken:[],canceled:0,resumed:0,getVoices:()=>[{name:'Device English',voiceURI:'local',lang:'en-US',localService:true}],cancel(){this.canceled++;},resume(){this.resumed++;this.paused=false;},speak(u){this.spoken.push(u);}};
 class Utterance {constructor(text){this.text=text;}}
 return {synth,Utterance};
}
test('speech retains utterance, resumes engine, and retries device voice after network failure',async()=>{
 const {synth,Utterance}=speechMock();const player=createNarrationPlayer({synth,Utterance});let ended=0,failures=0;
 player.play('Finn loves tacos.',{voice:{voiceURI:'online',lang:'en-US'},onEnd:()=>ended++,onError:()=>failures++});
 assert.equal(synth.resumed,1);assert.equal(synth.canceled,0);assert.equal(player.utterance,synth.spoken[0]);
 synth.spoken[0].onerror({error:'network'});await delay(10);assert.equal(synth.spoken[1].voice.voiceURI,'local');
 synth.spoken[0].onend();assert.equal(ended,0);synth.spoken[1].onstart();synth.spoken[1].onend();assert.equal(ended,1);assert.equal(failures,0);assert.equal(player.utterance,null);player.stop();
});
test('silent startup times out, tries fallback voices, and reports complete failure',async()=>{
 const {synth,Utterance}=speechMock();const player=createNarrationPlayer({synth,Utterance,startTimeout:10});
 const error=await new Promise(resolve=>player.play('Hello.',{voice:{voiceURI:'remote',lang:'en-US'},onError:resolve}));
 assert.equal(error,'voice-did-not-start');assert.equal(synth.spoken.length,3);assert.equal(synth.spoken[1].voice.voiceURI,'local');assert.equal(synth.spoken[2].voice,undefined);player.stop();
});
test('stopping narration cancels pending fallback and prevents stale callbacks',async()=>{
 const {synth,Utterance}=speechMock();const player=createNarrationPlayer({synth,Utterance,startTimeout:10});let callbacks=0;
 player.play('Hello.',{onEnd:()=>callbacks++,onError:()=>callbacks++});const utterance=player.utterance;player.stop();utterance.onend();utterance.onerror({error:'interrupted'});await delay(25);
 assert.equal(synth.spoken.length,1);assert.equal(callbacks,0);
});
test('a throwing speech engine fails visibly rather than crashing',async()=>{
 const {synth,Utterance}=speechMock();synth.speak=()=>{throw new Error('Unavailable');};const player=createNarrationPlayer({synth,Utterance});
 const error=await new Promise(resolve=>player.play('Hello.',{onError:resolve}));assert.equal(error,'voice-unavailable');player.stop();
});
