import { adminIdentity,assertSameOrigin,database,json,failure,HttpError,bodyOf } from "@/lib/server";
import { validateLink } from "@/lib/tracking";
export async function POST(request:Request) {
  try {
    const user=await adminIdentity(request); assertSameOrigin(request);
    let input;try{input=validateLink(await bodyOf(request),new URL(request.url).origin);}catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400,(e as Error).message);}
    const db=database();
    if(await db.prepare("SELECT id FROM links WHERE slug=?").bind(input.slug).first()) throw new HttpError(409,"Este alias ya está en uso. Prueba con otro.");
    const id=crypto.randomUUID(), now=new Date().toISOString();
    try {await db.prepare("INSERT INTO links (id,owner,slug,title,destination,channel,medium,campaign,active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,1,?,?)").bind(id,user.id,input.slug,input.title,input.destination,input.channel,input.medium,input.campaign,now,now).run();}
    catch(e){if(String(e).includes("UNIQUE"))throw new HttpError(409,"Este alias ya está en uso. Prueba con otro.");throw e;}
    return json({id,...input,active:1},201);
  } catch(e) { return failure(e); }
}
