import { adminIdentity,database,json,failure,HttpError } from "@/lib/server";
import { sinceRange,csvCell } from "@/lib/tracking";
export async function GET(request:Request) {
 try {
  const user=await adminIdentity(request),db=database(),url=new URL(request.url);
  const since=sinceRange(url.searchParams.get("range")||"30"),linkId=url.searchParams.get("link")||"";
  if(linkId && !await db.prepare("SELECT id FROM links WHERE id=? AND owner=?").bind(linkId,user.id).first()) throw new HttpError(404,"No encontramos ese enlace.");
  const args=[user.id,since,...(linkId?[linkId]:[])];
  const where=" FROM events e JOIN links l ON l.id=e.link_id WHERE l.owner=? AND e.clicked_at>=?"+(linkId?" AND e.link_id=?":"");
  if(url.searchParams.get("export")==="csv") {
    const result=await db.prepare("SELECT l.title,l.slug,e.clicked_at,e.channel,e.campaign,e.trigger,e.source,e.referrer,e.country,e.device,e.browser,e.bot"+where+" ORDER BY e.clicked_at DESC LIMIT 10000").bind(...args).all();
    const columns=["title","slug","clicked_at","channel","campaign","trigger","source","referrer","country","device","browser","bot"];
    const csv="\uFEFF"+[columns.join(","),...result.results.map(row=>columns.map(k=>csvCell(row[k])).join(","))].join("\r\n");
    return new Response(csv,{headers:{"Content-Type":"text/csv;charset=utf-8","Content-Disposition":"attachment; filename=dub-visitas.csv","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
  }
  const human=where+" AND e.bot=0";
  const queries=[
    db.prepare("SELECT l.*,COUNT(e.id) AS clicks,COALESCE(SUM(CASE WHEN e.trigger='qr' THEN 1 ELSE 0 END),0) AS qr_clicks,MAX(e.clicked_at) AS last_click FROM links l LEFT JOIN events e ON e.link_id=l.id AND e.bot=0 AND e.clicked_at>=? WHERE l.owner=? GROUP BY l.id ORDER BY l.created_at DESC LIMIT 1000").bind(since,user.id),
    db.prepare("SELECT COUNT(*) AS total,COALESCE(SUM(CASE WHEN e.bot=0 THEN 1 ELSE 0 END),0) AS clicks,COALESCE(SUM(CASE WHEN e.bot=0 AND e.trigger='qr' THEN 1 ELSE 0 END),0) AS qr,COALESCE(SUM(CASE WHEN e.bot=1 THEN 1 ELSE 0 END),0) AS bots,COALESCE(SUM(CASE WHEN e.bot=0 AND e.referrer='' THEN 1 ELSE 0 END),0) AS unknown,COUNT(DISTINCT CASE WHEN e.bot=0 AND e.country!='XX' THEN e.country END) AS countries"+where).bind(...args),
    db.prepare("SELECT e.day AS label,COUNT(*) AS value"+human+" GROUP BY e.day ORDER BY e.day ASC").bind(...args),
    ...["source","channel","country","device","browser"].map(field=>db.prepare("SELECT e."+field+" AS label,COUNT(*) AS value"+human+" GROUP BY e."+field+" ORDER BY value DESC LIMIT 12").bind(...args)),
    db.prepare("SELECT e.id,e.clicked_at,e.source,e.referrer,e.channel,e.campaign,e.trigger,e.country,e.device,e.browser,l.title,l.slug"+human+" ORDER BY e.clicked_at DESC LIMIT 40").bind(...args),
  ];
  const results=await db.batch(queries);
  return json({links:results[0].results,summary:results[1].results[0],daily:results[2].results,sources:results[3].results,channels:results[4].results,countries:results[5].results,devices:results[6].results,browsers:results[7].results,recent:results[8].results,since,timezone:"America/Lima",updatedAt:new Date().toISOString()});
 }catch(e){return failure(e);}
}
