// Test-only entrypoint. It calls the production route handlers against an
// isolated D1 instance and is never imported by the deployed application.
import { GET as dashboard } from "../app/api/dashboard/route";
import { POST as create } from "../app/api/links/route";
import { PATCH as edit } from "../app/api/links/[id]/route";
import { GET as qr } from "../app/api/qr/[slug]/route";
import { GET as redirect,HEAD as head } from "../app/r/[slug]/route";
export default { async fetch(request:Request) {
 const path=new URL(request.url).pathname;
 if(path==="/api/dashboard"&&request.method==="GET")return dashboard(request);
 if(path==="/api/links"&&request.method==="POST")return create(request);
 if(path.startsWith("/api/links/")&&request.method==="PATCH")return edit(request,{params:Promise.resolve({id:path.split("/").pop()!})});
 if(path.startsWith("/api/qr/")&&request.method==="GET")return qr(request,{params:Promise.resolve({slug:path.split("/").pop()!})});
 if(path.startsWith("/r/"))return (request.method==="HEAD"?head:redirect)(request,{params:Promise.resolve({slug:path.split("/").pop()!})});
 return new Response("Not found",{status:404});
}};
