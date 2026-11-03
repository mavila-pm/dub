export type LinkInput = { title:string; destination:string; slug:string; channel:string; medium:string; campaign:string };
export const RESERVED = new Set(["api","r","signin-with-chatgpt","signout-with-chatgpt","callback","favicon.svg","robots.txt"]);

export function validateLink(body: unknown, siteOrigin: string): LinkInput {
  if (!body || typeof body !== "object") throw new Error("Completa los datos del enlace.");
  const b = body as Record<string, unknown>;
  const field = (key:string, max:number) => {
    if (typeof b[key] !== "string") return "";
    const value=(b[key] as string).trim();
    if(value.length > max) throw new Error("El campo "+key+" es demasiado largo.");
    return value;
  };
  const title=field("title",100), destination=field("destination",2048), slug=field("slug",64).toLowerCase();
  if (!title) throw new Error("Escribe un nombre para reconocer este enlace.");
  let url:URL;
  try { url = new URL(destination); } catch { throw new Error("Escribe una URL completa que empiece por https://."); }
  if(!["https:","http:"].includes(url.protocol) || url.username || url.password) throw new Error("Usa una URL http o https sin credenciales.");
  if(url.origin===siteOrigin) throw new Error("El destino debe ser una web externa para evitar bucles.");
  if(!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(slug)||RESERVED.has(slug)) throw new Error("El alias debe tener entre 2 y 64 letras, números, guiones o guiones bajos.");
  return {title,destination:url.href,slug,channel:field("channel",80),medium:field("medium",80),campaign:field("campaign",100)};
}

export function destinationURL(link: {destination:string; channel:string;medium:string;campaign:string}, qr=false) {
  const url = new URL(link.destination);
  if(link.channel) url.searchParams.set("utm_source",link.channel);
  if(link.medium || qr) url.searchParams.set("utm_medium",qr?"qr":link.medium);
  if(link.campaign) url.searchParams.set("utm_campaign",link.campaign);
  return url.href;
}

export function limaDay(date = new Date()) {
  return new Date(date.getTime()-5*60*60*1000).toISOString().slice(0,10);
}

export function sinceRange(range:string, now = new Date()) {
  if(range==="all") return "1970-01-01T00:00:00.000Z";
  const days=["7","30","90"].includes(range)?Number(range):30;
  const midnight = new Date(limaDay(now)+"T00:00:00-05:00");
  return new Date(midnight.getTime()-(days-1)*86400000).toISOString();
}

export function classifyAgent(ua:string) {
  const bot=/bot|crawler|spider|slurp|preview|facebookexternalhit|whatsapp|linkedinbot|slackbot|discordbot|telegrambot|headless|curl|wget|python|monitor|uptime/i.test(ua);
  const device=/ipad|tablet|kindle|silk/i.test(ua)?"Tablet":/mobile|iphone|ipod|android/i.test(ua)?"Móvil":"Escritorio";
  const browser=/edg\//i.test(ua)?"Edge":/opr\/|opera/i.test(ua)?"Opera":/firefox|fxios/i.test(ua)?"Firefox":/chrome|crios/i.test(ua)?"Chrome":/safari/i.test(ua)?"Safari":"Otro";
  return {bot,device,browser};
}

export function referrerInfo(raw:string|null, ownHost:string) {
  if(!raw) return {referrer:"",source:"Directo / no disponible"};
  try {
    const u=new URL(raw); const host=u.hostname.toLowerCase().replace(/^www\./,"");
    if(!["http:","https:"].includes(u.protocol)||host===ownHost) return {referrer:"",source:"Directo / no disponible"};
    const matches=(domain:string)=>host===domain||host.endsWith("."+domain);
    const source=matches("linkedin.com")||host==="lnkd.in"?"LinkedIn":matches("instagram.com")?"Instagram":matches("facebook.com")||host==="fb.com"?"Facebook":matches("t.co")||matches("x.com")||matches("twitter.com")?"X":matches("google.com")||/^google\.[a-z.]+$/.test(host)?"Google":matches("bing.com")?"Bing":matches("whatsapp.com")||host==="wa.me"?"WhatsApp":host;
    return {referrer:host.slice(0,253),source};
  } catch { return {referrer:"",source:"Directo / no disponible"}; }
}

export function csvCell(value:unknown) {
  let s=String(value??"");
  if(/^[=+\-@\t\r]/.test(s)) s="'"+s;
  return '"'+s.replace(/"/g,'""')+'"';
}
