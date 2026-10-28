import test from "node:test";
import assert from "node:assert/strict";
import { createPageViewTracker } from "./pageViewTracker.mjs";
test("one view per visit, including back navigation, without StrictMode or query-only duplicates", () => {
 const events=[]; const track=createPageViewTracker((...e)=>events.push(e));
 const page=(pathname)=>({pathname,location:`https://example.com${pathname}`,title:pathname,referrer:"https://search.example/"});
 assert.equal(track(page("/")),true);
 assert.equal(track(page("/")),false);
 assert.equal(track({...page("/"), location:"https://example.com/?utm_source=test"}),false);
 track(page("/statstack")); track(page("/"));
 assert.equal(events.length,3);
 assert.equal(events[0][1].page_referrer,"https://search.example/");
 assert.equal(events[1][1].page_referrer,"https://example.com/");
 assert.equal(events[2][1].page_referrer,"https://example.com/statstack");
});
