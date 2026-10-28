import test from "node:test";
import assert from "node:assert/strict";
import { createGameEventTracker } from "./gameEventTracker.mjs";
test("restoration, repeated effects, resumed games, and retry produce one start/completion per attempt", () => {
 const events=[];const map=new Map();const options={send:(...e)=>events.push(e),app:"test",game:"grid",gameId:"day1",storage:{getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)}};
 const a=createGameEventTracker(options); a.complete(); assert.equal(events.length,0);
 a.start();a.start();assert.equal(events.length,1);
 const resumed=createGameEventTracker(options);resumed.start();resumed.complete({score:3});resumed.complete();assert.equal(events.length,2);
 const restored=createGameEventTracker(options);restored.complete();assert.equal(events.length,2);
 restored.reset();restored.start();restored.complete();assert.deepEqual(events.map(e=>e[0]),["game_start","game_complete","game_start","game_complete"]);
});
test("blocked storage and failing analytics never throw into gameplay", () => {
 const t=createGameEventTracker({send:()=>{throw Error("offline")},gameId:"1",storage:{getItem(){throw Error()},setItem(){throw Error()}}});
 assert.doesNotThrow(()=>{t.start();t.complete();t.reset();});
});
