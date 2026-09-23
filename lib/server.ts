import { socialPlatform } from "./media";
import { cookies } from "next/headers";
import { cache } from "react";
import { authClient, authConfigured, dataClient } from "./supabase/server";
import { ADMIN_EMAIL, type Member } from "./models";
export const db=dataClient;
export function checked<T>(result:{data:T,error:unknown}):T {if(result.error)throw result.error;return result.data}
export class ApiError extends Error {constructor(public status:number,message:string){super(message)}}
export const member=cache(async():Promise<Member|null>=>{
 if(!authConfigured())return null;
 const client=await authClient();const {data:{user},error}=await client.auth.getUser();
 if(error||!user||!user.email_confirmed_at)return null;
 const email=user.email||"";
 return {id:user.id,name:user.user_metadata?.full_name||user.user_metadata?.name||"Community member",email,admin:email.toLowerCase()===ADMIN_EMAIL};
});
export async function signedIn(admin=false){const u=await member();if(!u)throw new ApiError(401,"कृपया Login गर्नुहोस्। Please sign in.");if(admin&&!u.admin)throw new ApiError(403,"यो पृष्ठ admin का लागि मात्र हो। Admin access only.");return u}
export async function visitorId(){return (await cookies()).get("pv_visitor")?.value||""}
export async function readAccess(){const u=await member();if(u)return u;const id=await visitorId();const v=id?checked(await db().from("visitors").select("preview_until").eq("id",id).maybeSingle()):null;if(!v||v.preview_until<Date.now())throw new ApiError(401,"Your preview has ended. कृपया Login गर्नुहोस्।");return null}
export function mutationGuard(req:Request){const origin=req.headers.get("origin");if(origin!==new URL(req.url).origin)throw new ApiError(403,"Invalid request origin");}
export function json(data:unknown,status=200,headers:Record<string,string>={}){return Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...headers}})}
export function safeSource(value:string,kind:string){if(!value)return "";let u:URL;try{u=new URL(value)}catch{throw new ApiError(400,"Enter a valid post URL")};if(u.protocol!=="https:"||u.username||u.password)throw new ApiError(400,"Use an HTTPS post URL");const platform=["photo","video"].includes(kind)?socialPlatform(value):kind;if(["photo","video"].includes(kind)&&!platform)throw new ApiError(400,"Paste a full Facebook or TikTok post link, or upload a file");if(platform==="facebook"){if(!["facebook.com","www.facebook.com","m.facebook.com","web.facebook.com"].includes(u.hostname))throw new ApiError(400,"Use a facebook.com post URL");if(!(/\/(posts|videos|reel|permalink|share)\//.test(u.pathname)||/\/(story|photo|permalink)\.php/.test(u.pathname)||["/photo","/photo/","/watch","/watch/"].includes(u.pathname)))throw new ApiError(400,"Paste an individual Facebook post link, not a profile link")}else if(platform==="tiktok"){if(!["www.tiktok.com","tiktok.com"].includes(u.hostname)||!/^\/@[^/]+\/(video|photo)\/\d+(?:[/?#]|$)/.test(u.pathname))throw new ApiError(400,"Use the full TikTok video or photo URL: tiktok.com/@name/video/123…")};if(kind==="photo"&&platform==="tiktok"&&!u.pathname.includes("/photo/"))throw new ApiError(400,"Use a TikTok photo link for the gallery");if(kind==="video"&&platform==="tiktok"&&!u.pathname.includes("/video/"))throw new ApiError(400,"Use a TikTok video link for Videos");return u.toString()}
