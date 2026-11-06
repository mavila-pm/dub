import { env } from "cloudflare:workers";

export class HttpError extends Error { constructor(public status:number,message:string){super(message);} }
export function database() {
  if(!env.DB) throw new HttpError(503,"No se pudo conectar con los datos. Inténtalo de nuevo.");
  return env.DB;
}
export async function adminIdentity(request:Request) {
  const h=request.headers;
  const id=h.get("oai-authenticated-user-id"), email=h.get("oai-authenticated-user-email");
  if(!id||!email) throw new HttpError(401,"Inicia sesión con ChatGPT para entrar a tu panel.");
  if(!env.ADMIN_EMAIL || email.toLowerCase()!==env.ADMIN_EMAIL.toLowerCase()) throw new HttpError(403,"Este panel solo está disponible para su propietario.");
  return {id,email};
}
export function assertSameOrigin(request:Request) {
  const origin=request.headers.get("origin");
  if(!origin||origin!==new URL(request.url).origin) throw new HttpError(403,"Solicitud no permitida.");
  if(!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415,"Envía los datos como JSON.");
  const len=Number(request.headers.get("content-length")||0);
  if(len>12000) throw new HttpError(413,"La solicitud es demasiado grande.");
}
export function json(data:unknown,status=200) { return Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}}); }
export function failure(error:unknown) {
  if(error instanceof HttpError) return json({error:error.message},error.status);
  console.error("Request failed",error instanceof Error?error.message:"unknown");
  return json({error:"No se pudo completar la acción. Vuelve a intentarlo."},500);
}
export async function bodyOf(request:Request) {
  const text=await request.text();
  if(text.length>12000) throw new HttpError(413,"La solicitud es demasiado grande.");
  try{return JSON.parse(text);}catch{throw new HttpError(400,"Los datos no tienen un formato válido.");}
}
