import { db,checked,member,signedIn,visitorId,readAccess,mutationGuard,json,ApiError,safeSource } from "@/lib/server";
import { demoPosts } from "@/lib/demo";
import { categories } from "@/lib/models";
export const dynamic="force-dynamic";
type Context={params:Promise<{path:string[]}>};
const day=()=>new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Kathmandu"});
async function handle(req:Request,ctx:Context){try{const {path}=await ctx.params;const [area,id,action]=path;const method=req.method;const now=Date.now();const sql=db();if(method!=="GET")mutationGuard(req);
if(area==="session"&&method==="POST"){
 const u=await member();const existing=await visitorId();const vid=/^[a-f0-9-]{36}$/.test(existing)?existing:crypto.randomUUID();
 if(u){checked(await sql.from("members").upsert({id:u.id,name:u.name,created_at:now},{onConflict:"id"}));checked(await sql.from("visits").upsert({visitor_id:"user:"+u.id,day:day(),created_at:now},{onConflict:"visitor_id,day",ignoreDuplicates:true}));return json({user:u,previewUntil:0,serverNow:Date.now()})}
 const v=checked(await sql.rpc("start_preview",{p_id:vid,p_day:day(),p_now:now,p_restart:false}));
 return json({user:null,previewUntil:v,serverNow:Date.now()},200,{"Set-Cookie":`pv_visitor=${vid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(req.url).protocol==="https:"?"; Secure":""}`})}
if(area==="preview"&&method==="POST"){
 const existing=await visitorId();const vid=/^[a-f0-9-]{36}$/.test(existing)?existing:crypto.randomUUID();
 checked(await sql.rpc("start_preview",{p_id:vid,p_day:day(),p_now:now,p_restart:true}));
 return new Response(null,{status:303,headers:{"Location":"/","Cache-Control":"no-store","Set-Cookie":`pv_visitor=${vid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(req.url).protocol==="https:"?"; Secure":""}`}})
}
if(area==="demo"&&method==="POST"){await signedIn(true);checked(await sql.from("posts").upsert(demoPosts,{onConflict:"id",ignoreDuplicates:true}));return json({ok:true})}
if(area==="posts"&&method==="GET"){
 const u=await readAccess();const url=new URL(req.url);const admin=url.searchParams.get("admin")==="1";if(admin)await signedIn(true);
 if(id){let query=sql.from("post_counts").select("*").eq("id",id);if(!u?.admin)query=query.eq("status","published");const p=checked(await query.maybeSingle());if(!p)throw new ApiError(404,"Post not found");
 const [comments,liked]=await Promise.all([sql.from("comments").select("id,name,body,created_at").eq("post_id",id).eq("status","visible").order("created_at",{ascending:false}).limit(100),u?sql.from("likes").select("post_id").eq("post_id",id).eq("user_id",u.id).maybeSingle():Promise.resolve({data:null,error:null})]);return json({post:{...p,liked:!!checked(liked)},comments:checked(comments)})}
 const page=Math.max(0,Math.min(100000,parseInt(url.searchParams.get("page")||"0")||0));const mode=url.searchParams.get("mode")||"all";
 let query=sql.from("post_counts").select("id,title,excerpt,kind,category,source_url,media_url,status,created_at,updated_at,likes,comments,views");if(!admin)query=query.eq("status","published");
 if(mode==="gallery")query=query.eq("kind","photo");if(mode==="videos")query=query.or("kind.in.(video,tiktok),and(kind.eq.facebook,source_url.like.%/videos/%),and(kind.eq.facebook,source_url.like.%/reel/%)");if(mode==="blog")query=query.eq("kind","blog");
 const posts=checked(await query.order("created_at",{ascending:false}).order("id").range(page*12,page*12+12));return json({posts:(posts||[]).slice(0,12),hasMore:(posts||[]).length>12})}
if(area==="posts"&&id&&["view","like","comment"].includes(action)){
 const u=action==="view"?await readAccess():await signedIn();
 const p=checked(await sql.from("posts").select("id").eq("id",id).eq("status","published").maybeSingle());if(!p)throw new ApiError(404,"Post not found");
 if(action==="view"&&method==="POST"){const vid=u?"user:"+u.id:await visitorId();checked(await sql.from("views").upsert({post_id:id,visitor_id:vid,day:day(),created_at:now},{onConflict:"post_id,visitor_id,day",ignoreDuplicates:true}));return json({ok:true})}
 if(action==="like"&&method==="PUT"){const data=await req.json() as Record<string,any>;if(typeof data.liked!=="boolean")throw new ApiError(400,"Invalid like");if(data.liked)checked(await sql.from("likes").upsert({post_id:id,user_id:u!.id,created_at:now},{onConflict:"post_id,user_id",ignoreDuplicates:true}));else checked(await sql.from("likes").delete().eq("post_id",id).eq("user_id",u!.id));const result=await sql.from("likes").select("post_id",{count:"exact",head:true}).eq("post_id",id);checked(result);return json({liked:data.liked,likes:result.count||0})}
 if(action==="comment"&&method==="POST"){const data=await req.json() as Record<string,any>;const body=typeof data.body==="string"?data.body.trim():"";if(body.length<2||body.length>1500)throw new ApiError(400,"Comment must contain 2–1,500 characters");
 const result=await sql.rpc("add_comment",{p_post:id,p_user:u!.id,p_name:u!.name,p_body:body,p_now:now});if(result.error?.message.includes("COMMENT_RATE_LIMIT"))throw new ApiError(429,"धेरै टिप्पणी भयो। Please try again later.");return json({comment:checked(result)},201)}
}
if(area==="posts"&&(method==="POST"||method==="PUT")&&!action){await signedIn(true);if(Number(req.headers.get("content-length")||0)>150000)throw new ApiError(413,"Post is too large");const data=await req.json() as Record<string,unknown>;const str=(key:string,max:number)=>{const v=typeof data[key]==="string"?(data[key] as string).trim():"";if(v.length>max)throw new ApiError(400,`${key} is too long`);return v};const title=str("title",240),excerpt=str("excerpt",500),body=str("body",40000),kind=str("kind",20),category=str("category",40),status=str("status",20),media=str("media_url",500);if(!title||!["blog","photo","video","facebook","tiktok","poll"].includes(kind)||!categories.includes(category)||!["published","draft"].includes(status))throw new ApiError(400,"Check the title, type, category and status");const source=safeSource(str("source_url",2000),kind);if(["facebook","tiktok"].includes(kind)&&!source)throw new ApiError(400,"Paste the social post link");if(kind==="poll"&&(!body||body.length<20))throw new ApiError(400,"Create a poll question and at least two options");if(media&&!/^\/api\/media\/[a-f0-9-]+\.(jpg|png|webp|gif|mp4|webm)$/.test(media)&&!['/demo/nepal-cover.jpg','/demo/nepal-preview.mp4'].includes(media))throw new ApiError(400,"Upload media using the upload button");if(["photo","video"].includes(kind)&&!media&&!source)throw new ApiError(400,"Upload a file or paste a social post link");if(kind==="photo"&&media&&!/\.(jpg|png|webp|gif)$/.test(media))throw new ApiError(400,"Photo posts need an image");if(kind==="video"&&media&&!/\.(mp4|webm)$/.test(media))throw new ApiError(400,"Video posts need a video");const pid=id||crypto.randomUUID();const record={title,excerpt,body,kind,category,source_url:source,media_url:media,status,updated_at:now};
 if(method==="PUT"){if(!id)throw new ApiError(400,"Missing post ID");const row=checked(await sql.from("posts").update(record).eq("id",id).select("id").maybeSingle());if(!row)throw new ApiError(404,"Post not found")}else checked(await sql.from("posts").insert({id:pid,...record,created_at:now}));return json({id:pid},method==="POST"?201:200)}
if(area==="posts"&&id&&method==="DELETE"){await signedIn(true);checked(await sql.from("posts").delete().eq("id",id));return json({ok:true})}
if(area==="upload"&&method==="POST"){
 await signedIn(true);const data=await req.json() as Record<string,any>;const types:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif","video/mp4":"mp4","video/webm":"webm"};
 if(typeof data.type!=="string"||!types[data.type]||!Number.isInteger(data.size)||data.size<1||data.size>20*1024*1024)throw new ApiError(400,"Choose a JPG, PNG, WebP, GIF, MP4 or WebM under 20 MB");
 const key=crypto.randomUUID()+"."+types[data.type];const signed=checked(await sql.storage.from("media").createSignedUploadUrl(key));return json({url:"/api/media/"+key,signedUrl:signed!.signedUrl},201)}
if(area==="media"&&id&&method==="GET"){
 if(!/^[a-f0-9-]+\.(jpg|png|webp|gif|mp4|webm)$/.test(id))throw new ApiError(404,"Not found");
 const {data}=sql.storage.from("media").getPublicUrl(id);return new Response(null,{status:307,headers:{Location:data.publicUrl,"Cache-Control":"public,max-age=3600","X-Content-Type-Options":"nosniff"}})}
if(area==="metrics"&&method==="GET"){await signedIn(true);return json(checked(await sql.rpc("site_metrics",{p_since:now-30*86400000})))}
if(area==="comments"&&method==="GET"){await signedIn(true);const page=Math.max(0,Math.min(100000,parseInt(new URL(req.url).searchParams.get("page")||"0")||0));const rows=checked(await sql.from("comments").select("*,posts(title)").order("created_at",{ascending:false}).order("id").range(page*50,page*50+50));return json({comments:(rows||[]).slice(0,50).map(c=>({...c,title:c.posts?.title})),hasMore:(rows||[]).length>50})}
if(area==="comments"&&id&&method==="PUT"){await signedIn(true);const data=await req.json() as Record<string,any>;if(!["visible","hidden"].includes(data.status))throw new ApiError(400,"Invalid status");checked(await sql.from("comments").update({status:data.status}).eq("id",id));return json({ok:true})}
if(area==="comments"&&id&&method==="DELETE"){await signedIn(true);checked(await sql.from("comments").delete().eq("id",id));return json({ok:true})}
throw new ApiError(404,"Not found");
}catch(e){if(e instanceof ApiError)return json({error:e.message},e.status);if(e instanceof SyntaxError)return json({error:"Invalid request"},400);console.error("Prasauni request failed",e);return json({error:"अहिले सेवा उपलब्ध छैन। Please try again shortly."},503)}}
export const GET=handle;export const POST=handle;export const PUT=handle;export const DELETE=handle;
