export type Member={id:string;name:string;email:string;admin:boolean};
export type PollOption={id:string;label:string;votes:number};
export type PollData={question:string;description:string;allowMultiple:boolean;options:PollOption[]};
export type Post={id:string;title:string;excerpt:string;body:string;kind:"blog"|"photo"|"video"|"facebook"|"tiktok"|"poll";category:string;source_url:string;media_url:string;status:"published"|"draft";created_at:number;updated_at:number;likes:number;comments:number;views:number;liked?:boolean};
export type Comment={id:string;post_id:string;name:string;body:string;status:string;created_at:number;title?:string};
export const categories=["समुदाय","स्थानीय सरकार","शिक्षा","कृषि","संस्कृति","खेलकुद","सूचना"];
export const kindLabels:Record<string,string>={blog:"लेख · Blog",photo:"तस्बिर · Photo",video:"भिडियो · Video",facebook:"Facebook",tiktok:"TikTok",poll:"मतदान · Poll"};
export const ADMIN_EMAIL="help.justengineer@gmail.com";

export function parsePollBody(body?:string | null): PollData | null {
 if(!body) return null;
 try {
  const parsed = JSON.parse(body) as Partial<PollData> & { question?: unknown; description?: unknown; allowMultiple?: unknown; options?: unknown };
  const question = typeof parsed.question === "string" ? parsed.question.trim() : "";
  const description = typeof parsed.description === "string" ? parsed.description.trim() : "";
  const allowMultiple = Boolean(parsed.allowMultiple);
  const options = Array.isArray(parsed.options) ? parsed.options.map((option, index) => {
   const candidate = typeof option === "string" ? option : typeof option === "object" && option && "label" in option ? String((option as { label?: unknown }).label ?? "") : "";
   const label = candidate.trim();
   return { id: `${index}-${label || "option"}`.replace(/\s+/g, "-").toLowerCase(), label: label || `Option ${index + 1}`, votes: typeof option === "object" && option && "votes" in option && typeof (option as { votes?: unknown }).votes === "number" ? Number((option as { votes?: unknown }).votes) : 0 };
  }).filter(option => option.label.length > 0) : [];
  if(!question || options.length < 2) return null;
  return { question, description, allowMultiple, options: options.slice(0, 8) };
 } catch {
  return null;
 }
}

export function serializePollBody(question:string, description:string, allowMultiple:boolean, options:string[]): string {
 const cleanedQuestion = question.trim();
 const cleanedDescription = description.trim();
 const cleanOptions = Array.from(new Set(options.map(option => option.trim()).filter(Boolean))).slice(0, 8);
 if(!cleanedQuestion || cleanOptions.length < 2) throw new Error("A poll needs a question and at least two options.");
 return JSON.stringify({
  question: cleanedQuestion,
  description: cleanedDescription,
  allowMultiple,
  options: cleanOptions.map((label, index) => ({ id: `${index}-${label}`.replace(/\s+/g, "-").toLowerCase(), label, votes: 0 }))
 });
}
const LEGACY_ADMIN_EMAILS=["help.justenginer@gmail.com"];
export function adminEmails(): string[] {
 const env = typeof globalThis !== "undefined" && typeof (globalThis as { process?: { env?: Record<string, string | undefined> } }).process !== "undefined"
   ? (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
   : {};
 const configured = (env.ADMIN_EMAILS || env.ADMIN_EMAIL || "").split(",").map((v: string) => v.trim().toLowerCase()).filter(Boolean);
 return Array.from(new Set([ADMIN_EMAIL, ...LEGACY_ADMIN_EMAILS, ...configured].map(v => v.toLowerCase())));
}
export function isAdminEmail(email?:string | null){
 const normalized=(email||"").trim().toLowerCase();
 return adminEmails().includes(normalized);
}
export function dateLabel(n:number){return new Date(n).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Asia/Kathmandu"})}
