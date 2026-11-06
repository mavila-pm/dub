import { adminIdentity,assertSameOrigin,database,json,failure,HttpError,bodyOf } from "@/lib/server";
import { validateLink } from "@/lib/tracking";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
 try {
  const user=await adminIdentity(request); assertSameOrigin(request);
  const {id}=await params,db=database();
  const current=await db.prepare("SELECT * FROM links WHERE id=? AND owner=?").bind(id,user.id).first();
  if(!current)throw new HttpError(404,"No encontramos ese enlace.");
  const body=await bodyOf(request);
  if(Object.keys(body).length===1 && typeof body.active==="boolean") {
    await db.prepare("UPDATE links SET active=?,updated_at=? WHERE id=? AND owner=?").bind(body.active?1:0,new Date().toISOString(),id,user.id).run();
    return json({ok:true});
  }
  let input;try{input=validateLink({...body,slug:current.slug},new URL(request.url).origin);}catch(e){throw new HttpError(400,(e as Error).message);}
  await db.prepare("UPDATE links SET title=?,destination=?,channel=?,medium=?,campaign=?,updated_at=? WHERE id=? AND owner=?").bind(input.title,input.destination,input.channel,input.medium,input.campaign,new Date().toISOString(),id,user.id).run();
  return json({ok:true});
 }catch(e){return failure(e);}
}
