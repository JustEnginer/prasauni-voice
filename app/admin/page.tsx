import Admin from "@/components/admin";
import { member } from "@/lib/server";
import { redirect } from "next/navigation";
export const dynamic="force-dynamic";
export const metadata={title:"Admin dashboard"};
export default async function Page(){const u=await member();if(!u)redirect("/login?next=/admin");if(!u.admin)return <main className="access-page"><h1>Admin access only</h1><p>यो खाता admin होइन। Please sign in using the designated admin account.</p><form action="/auth/signout" method="post"><button className="btn">Switch Google account</button></form><a href="/">Back to home</a></main>;return <Admin/>}
