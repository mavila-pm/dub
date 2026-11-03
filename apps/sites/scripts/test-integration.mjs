import assert from "node:assert/strict";
import { writeFileSync,mkdirSync,readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
const {build}=require(require.resolve("esbuild",{paths:[require.resolve("wrangler/package.json")]}));
const {Miniflare}=require(require.resolve("miniflare",{paths:[require.resolve("wrangler/package.json")]}));
mkdirSync("work",{recursive:true});
await build({entryPoints:["scripts/test-worker.ts"],outfile:"work/test-worker.mjs",bundle:true,format:"esm",platform:"neutral",external:["cloudflare:workers"]});
const mf=new Miniflare({modules:true,scriptPath:"work/test-worker.mjs",compatibilityDate:"2026-05-15",compatibilityFlags:["nodejs_compat"],d1Databases:["DB"],bindings:{ADMIN_EMAIL:"qa@example.test"}});
const db=await mf.getD1Database("DB");
const migration=readFileSync("drizzle/0000_black_giant_man.sql","utf8");
for(const sql of migration.split("--> statement-breakpoint").map(s=>s.trim()).filter(Boolean)) await db.prepare(sql).run();
const transport=mf.dispatchFetch.bind(mf);
try {
const base=process.env.SITES_TEST_ORIGIN||"http://terminal.local:4173";
if(!["terminal.local","localhost","127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Integration tests may only run against the local preview.");
const auth={"oai-authenticated-user-id":"qa-owner","oai-authenticated-user-email":"qa@example.test"};
const browserUA="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1";
async function request(path,options={}) {return transport(base+path,{redirect:"manual",...options,headers:{...auth,...options.headers}});}
async function data() {const r=await request("/api/dashboard?range=30");assert.equal(r.status,200);return r.json();}
async function mutation(path,body,method="POST",extra={}) {return request(path,{method,headers:{"Content-Type":"application/json",Origin:base,...extra},body:JSON.stringify(body)});}
assert.equal((await transport(base+"/api/dashboard")).status,401,"anonymous cannot read dashboard");
assert.equal((await request("/api/dashboard",{headers:{"oai-authenticated-user-email":"other@example.test"}})).status,403,"other accounts cannot read dashboard");
assert.equal((await mutation("/api/links",{},"POST",{Origin:"https://untrusted.example"})).status,403,"cross-origin writes rejected");
const before=await data();
const input={title:"[QA] Tracking and QR",slug:"qa-"+crypto.randomUUID().slice(0,8),destination:"https://example.com/presentation?existing=1",channel:"linkedin",medium:"social",campaign:"integration-qa"};
assert.equal((await mutation("/api/links",{...input,destination:"javascript:alert(1)"})).status,400,"unsafe protocol rejected");
const created=await mutation("/api/links",input);assert.equal(created.status,201);const link=await created.json();
assert.equal((await mutation("/api/links",input)).status,409,"alias collisions rejected");
const first=await request("/r/"+input.slug,{headers:{"User-Agent":browserUA,Referer:"https://www.linkedin.com/feed/"}});
assert.equal(first.status,302);const destination=new URL(first.headers.get("location"));
assert.equal(destination.searchParams.get("utm_source"),"linkedin");assert.equal(destination.searchParams.get("existing"),"1");assert.equal(destination.searchParams.get("utm_campaign"),"integration-qa");
const scan=await request("/r/"+input.slug+"?via=qr",{headers:{"User-Agent":browserUA}});assert.equal(scan.status,302);assert.equal(new URL(scan.headers.get("location")).searchParams.get("utm_medium"),"qr");
await request("/r/"+input.slug,{headers:{"User-Agent":"LinkedInBot/1.0"}});
await request("/r/"+input.slug,{headers:{"User-Agent":browserUA,"Sec-Purpose":"prefetch"}});
assert.equal((await request("/r/"+input.slug,{method:"HEAD",headers:{"User-Agent":browserUA}})).status,302);
const after=await data();assert.equal(after.summary.clicks-before.summary.clicks,2,"two real visits counted");assert.equal(after.summary.qr-before.summary.qr,1,"QR visit separated");assert.equal(after.summary.bots-before.summary.bots,2,"preview and bot excluded");
const scoped=await request("/api/dashboard?range=30&link="+link.id);const detail=await scoped.json();assert.equal(detail.summary.clicks,2);assert(detail.sources.some(b=>b.label==="LinkedIn"&&b.value===1));assert(detail.sources.some(b=>b.label==="Directo / no disponible"&&b.value===1));assert(detail.channels.some(b=>b.label==="linkedin"&&b.value===2));assert(detail.devices.some(b=>b.label==="Móvil"));
const qr=await request("/api/qr/"+input.slug);assert.equal(qr.status,200);assert(qr.headers.get("content-type").includes("image/svg+xml"));mkdirSync("work",{recursive:true});writeFileSync("work/qr-test.svg",await qr.text());writeFileSync("work/qr-expected.txt",base+"/r/"+input.slug+"?via=qr");
const update=await mutation("/api/links/"+link.id,{...input,slug:"should-not-change",destination:"https://example.com/updated"},"PATCH");assert.equal(update.status,200);assert(new URL((await request("/r/"+input.slug,{method:"HEAD"})).headers.get("location")).pathname==="/updated");
assert.equal((await mutation("/api/links/"+link.id,{active:false},"PATCH")).status,200);assert.equal((await request("/r/"+input.slug)).status,410);assert.equal((await request("/r/no-such-qa-link")).status,404);
assert.equal((await mutation("/api/links/"+link.id,{active:true},"PATCH")).status,200);
const csv=await request("/api/dashboard?range=30&link="+link.id+"&export=csv");assert.equal(csv.status,200);assert((await csv.text()).includes("integration-qa"));
console.log("PASS: authorization, origin checks, safe destinations, alias collisions, redirects, UTMs, QR events, attribution, devices, bot/prefetch exclusion, HEAD, editing, pause/resume, scoped analytics and CSV.");
console.log("QR artifact: work/qr-test.svg (local preview only)");

} finally { await mf.dispose(); }
