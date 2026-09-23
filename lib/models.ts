export type Member={id:string;name:string;email:string;admin:boolean};
export type Post={id:string;title:string;excerpt:string;body:string;kind:"blog"|"photo"|"video"|"facebook"|"tiktok";category:string;source_url:string;media_url:string;status:"published"|"draft";created_at:number;updated_at:number;likes:number;comments:number;views:number;liked?:boolean};
export type Comment={id:string;post_id:string;name:string;body:string;status:string;created_at:number;title?:string};
export const categories=["समुदाय","स्थानीय सरकार","शिक्षा","कृषि","संस्कृति","खेलकुद","सूचना"];
export const kindLabels:Record<string,string>={blog:"लेख · Blog",photo:"तस्बिर · Photo",video:"भिडियो · Video",facebook:"Facebook",tiktok:"TikTok"};
export const ADMIN_EMAIL="help.justenginer@gmail.com";
export function dateLabel(n:number){return new Date(n).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Asia/Kathmandu"})}
