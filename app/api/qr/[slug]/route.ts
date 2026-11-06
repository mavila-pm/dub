import { adminIdentity,database,failure,HttpError } from "@/lib/server";
import qrcodegen from "@/lib/vendor/qrcodegen";
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}) {
 try {
  const user=await adminIdentity(request),{slug}=await params;
  const link=await database().prepare("SELECT slug FROM links WHERE slug=? AND owner=?").bind(slug,user.id).first<{slug:string}>();
  if(!link)throw new HttpError(404,"No encontramos ese enlace.");
  const url=new URL(request.url),content=url.origin+"/r/"+link.slug+"?via=qr";
  const qr=qrcodegen.QrCode.encodeText(content,qrcodegen.QrCode.Ecc.MEDIUM),size=qr.size+8;
  let path="";for(let y=0;y<qr.size;y++)for(let x=0;x<qr.size;x++)if(qr.getModule(x,y))path+=`M${x+4},${y+4}h1v1h-1z`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="1024" height="1024" shape-rendering="crispEdges" role="img" aria-label="Código QR"><rect width="100%" height="100%" fill="white"/><path d="${path}" fill="#141414"/></svg>`;
  return new Response(svg,{headers:{"Content-Type":"image/svg+xml","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff",...(url.searchParams.has("download")?{"Content-Disposition":`attachment; filename="dub-${slug}.svg"`}:{})}});
 }catch(e){return failure(e);}
}
