import { database } from "@/lib/server";
import { classifyAgent,destinationURL,limaDay,referrerInfo } from "@/lib/tracking";
type StoredLink={id:string;slug:string;destination:string;channel:string;medium:string;campaign:string;active:number};
async function redirectLink(request:Request,slug:string,track:boolean) {
 const db=database();
 const link=await db.prepare("SELECT id,slug,destination,channel,medium,campaign,active FROM links WHERE slug=?").bind(slug.toLowerCase()).first<StoredLink>();
 if(!link||!link.active) return new Response("Este enlace no está disponible.",{status:link?410:404,headers:{"Content-Type":"text/plain;charset=utf-8","Cache-Control":"no-store"}});
 const requestURL=new URL(request.url),qr=requestURL.searchParams.get("via")==="qr";
 if(track) {
  const {bot,device,browser}=classifyAgent(request.headers.get("user-agent")||"");
  const isPrefetch=/prefetch|prerender/i.test([request.headers.get("purpose"),request.headers.get("sec-purpose")].join(" "));
  const {referrer,source}=referrerInfo(request.headers.get("referer"),requestURL.hostname);
  const country=request.headers.get("x-dub-country")||"XX";
  const now=new Date();
  try {await db.prepare("INSERT INTO events (id,link_id,clicked_at,day,country,device,browser,referrer,source,channel,campaign,trigger,bot) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),link.id,now.toISOString(),limaDay(now),/^[A-Z]{2}$/.test(country)?country:"XX",device,browser,referrer,source,link.channel,link.campaign,qr?"qr":"link",bot||isPrefetch?1:0).run();}
  catch(e){console.error("Click could not be recorded",e instanceof Error?e.message:"unknown");}
 }
 return new Response(null,{status:302,headers:{Location:destinationURL(link,qr),"Cache-Control":"no-store, no-cache, must-revalidate","X-Robots-Tag":"noindex, nofollow","Referrer-Policy":"no-referrer-when-downgrade"}});
}
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}) {try{return await redirectLink(request,(await params).slug,true);}catch{return new Response("El enlace no está disponible temporalmente.",{status:503,headers:{"Cache-Control":"no-store"}});}}
export async function HEAD(request:Request,{params}:{params:Promise<{slug:string}>}) {try{return await redirectLink(request,(await params).slug,false);}catch{return new Response(null,{status:503});}}
