import test from 'node:test';import assert from 'node:assert/strict';
import {createAnalytics,analyticsDisabledReason} from '../src/analytics.js';
const config={enabled:true,websiteId:'public-test-id',scriptUrl:'https://stats.example.com/script.js'};
function environment(){const records=[],scripts=[];const env={location:{hostname:'dgrosher.github.io',pathname:'/AnnesGameWebsite/'},navigator:{},document:{referrer:'https://example.com/family?private=value#section',head:{append(script){scripts.push(script);}},createElement(){return {attributes:{},listeners:{},setAttribute(key,value){this.attributes[key]=value;},addEventListener(type,handler){this.listeners[type]=handler;}};}}};return {env,records,scripts,load(){env.umami={track(fn){records.push(fn({url:'/ignored?secret=value',referrer:'ignored'}));}};scripts[0].listeners.load();}};}
test('analytics stays off without configuration and honors local testing and privacy signals',()=>{
 for(const change of [{enabled:false},{websiteId:''},{scriptUrl:'http://insecure.example/script.js'},{scriptUrl:'https://user:password@example.com/script.js'}]){const e=environment();const a=createAnalytics({...config,...change},e.env);a.game('snake','Snake');assert.equal(e.scripts.length,0);}
 for(const setup of [e=>e.location.hostname='localhost',e=>e.navigator.doNotTrack='1',e=>e.navigator.globalPrivacyControl=true]){const e=environment();setup(e.env);createAnalytics(config,e.env).game('snake','Snake');assert.equal(e.scripts.length,0);}
});
test('queued page and game events reach the collector in order after load',()=>{
 const e=environment();const a=createAnalytics(config,e.env);a.page('', 'Anne’s Arcade');a.game('snake','Snake');assert.equal(e.records.length,0);assert.equal(e.scripts[0].attributes['data-auto-track'],'false');e.load();
 assert.equal(e.records.length,3);assert.equal(e.records[0].url,'/AnnesGameWebsite/');assert.equal(e.records[1].url,'/AnnesGameWebsite/games/snake');assert.equal(e.records[2].name,'game_open');assert.deepEqual(e.records[2].data,{game_id:'snake',game_name:'Snake'});
 assert.ok(e.records.every(r=>r.referrer==='https://example.com/family'&&!r.url.includes('?')));
});
test('restarts are separate from game opens and virtual page views',()=>{
 const e=environment();const a=createAnalytics(config,e.env);e.load();a.game('uno','UNO');a.restart('uno','UNO');a.page('','Anne’s Arcade');assert.equal(e.records.filter(r=>r.name==='game_open').length,1);assert.equal(e.records.filter(r=>r.name==='game_restart').length,1);assert.equal(e.records.filter(r=>!r.name).length,2);
});
test('blocked scripts, unavailable SDKs and throwing collectors do not break games',()=>{
 const e=environment();const a=createAnalytics(config,e.env);e.scripts[0].listeners.error();assert.doesNotThrow(()=>a.game('uno','UNO'));assert.equal(e.records.length,0);
 const bad=environment();const b=createAnalytics(config,bad.env);bad.scripts[0].listeners.load();assert.doesNotThrow(()=>b.page('','Home'));
 const broken=environment();const c=createAnalytics(config,broken.env);broken.env.umami={track(){throw new Error('Offline');}};broken.scripts[0].listeners.load();assert.doesNotThrow(()=>c.restart('uno','UNO'));
});
test('index.html deployment paths resolve to the same report URLs',()=>{
 const e=environment();e.env.location.pathname='/AnnesGameWebsite/index.html';const a=createAnalytics(config,e.env);e.load();a.game('memory','Memory Match');assert.equal(e.records[0].url,'/AnnesGameWebsite/games/memory');
});

test('browser privacy and Umami opt-out settings have explicit diagnostic reasons',()=>{
 const e=environment();assert.equal(analyticsDisabledReason(config,e.env),'');e.env.navigator.doNotTrack='yes';assert.match(analyticsDisabledReason(config,e.env),/Do Not Track/);e.env.navigator.doNotTrack=null;e.env.doNotTrack=1;assert.match(analyticsDisabledReason(config,e.env),/Do Not Track/);delete e.env.doNotTrack;
 e.env.localStorage={getItem:()=> 'true'};assert.match(analyticsDisabledReason(config,e.env),/local settings/);const a=createAnalytics(config,e.env);a.game('uno','UNO');assert.equal(e.scripts.length,0);
 e.env.localStorage={getItem(){throw new Error('Storage unavailable');}};assert.equal(analyticsDisabledReason(config,e.env),'');
});
