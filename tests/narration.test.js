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
